const fs = require('fs');
const path = require('path');

const { newPage } = require('./BrowserPool');
const { Models } = require('../config/DB');

// -----------------------------------------------------------------------------
// Shared PDF plumbing.
//
// Every print endpoint in this codebase repeats the same ~110 lines: make sure
// REPORT_DIR exists, pick a filename, drive puppeteer, send the file, delete it.
// This is that block, once. New print endpoints require this rather than
// copying OutPatientInfoController again.
//
// Two things it deliberately does differently from the older handlers:
//
//   * It goes through helper/BrowserPool. Eighteen controllers call
//     puppeteer.launch() per request, each starting and tearing down its own
//     Chrome; BrowserPool keeps one. New code must not add a nineteenth.
//   * It passes page size to page.pdf() rather than relying on CSS @page.
//     Chrome ignores @page unless preferCSSPageSize is set, which is exactly
//     why reports/Ambulatori.js declares `@page {size: landscape}` and still
//     comes out portrait.
// -----------------------------------------------------------------------------

/**
 * REPORT_DIR, created if missing.
 *
 * server.js already exits at boot if it cannot create this, but a print request
 * can arrive after someone has deleted the directory underneath a running
 * server, so it is re-checked here rather than assumed.
 */
function EnsureReportDir() {
  const ReportDir = process.env.REPORT_DIR;
  if (!ReportDir) throw new Error('REPORT_DIR is not configured');

  if (!fs.existsSync(ReportDir)) {
    fs.mkdirSync(ReportDir, { recursive: true });
  }
  return path.isAbsolute(ReportDir) ? ReportDir : path.resolve(process.cwd(), ReportDir);
}

/** A filename no concurrent request can collide with. */
function UniqueFileName(Prefix, Extension) {
  const Stamp = Date.now() + '_' + Math.random().toString(36).slice(2, 10);
  return `${Prefix}_${Stamp}.${Extension || 'pdf'}`;
}

/**
 * The organization's logo as a data URI, or null.
 *
 * Moved here from OutPatientInfoController, which was the only place it lived
 * and the only report that could show a logo.
 */
async function GetOrganizationLogo(OrganizationId) {
  if (!OrganizationId) return null;
  try {
    const Organization = await Models.Organization.findByPk(OrganizationId, {
      attributes: ['Id', 'Logo'],
      raw: true,
    });
    if (Organization && Organization.Logo) {
      const Header = Organization.Logo.slice(0, 8);
      let MimeType = 'image/png';
      if (Header[0] === 0xff && Header[1] === 0xd8) {
        MimeType = 'image/jpeg';
      } else if (
        Header[0] === 0x89 &&
        Header[1] === 0x50 &&
        Header[2] === 0x4e &&
        Header[3] === 0x47
      ) {
        MimeType = 'image/png';
      } else if (Header[0] === 0x47 && Header[1] === 0x49 && Header[2] === 0x46) {
        MimeType = 'image/gif';
      }
      return `data:${MimeType};base64,${Buffer.from(Organization.Logo).toString('base64')}`;
    }
  } catch (ex) {
    console.error('[PrintHelper] failed to read organization logo:', ex);
  }
  return null;
}

/** Minimal escaping for values interpolated into report HTML. */
function Esc(Value) {
  if (Value === null || Value === undefined) return '';
  return String(Value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * The page-margin footer: page numbers plus the provenance marking the mobile
 * tender asks for (para 123 - which organization, which database, and when).
 *
 * It lives in the PDF page margin rather than in the document body on purpose.
 * The acceptance criterion for the tender forms is that the sheet is
 * structurally identical to the approved paper form, and the paper forms carry
 * no page numbers and no source line - putting them in the body would work
 * against the very criterion this exists to satisfy.
 *
 * Chrome renders header/footer templates at font-size 0 unless the template
 * sets one itself, so the explicit font-size below is load-bearing.
 */
function BuildFooter({ OrganizationName, PrintedBy, GeneratedAt } = {}) {
  const Source = [
    OrganizationName ? Esc(OrganizationName) : null,
    process.env.SQL_DB ? Esc(process.env.SQL_DB) : null,
    GeneratedAt ? Esc(GeneratedAt) : null,
    PrintedBy ? Esc(PrintedBy) : null,
  ]
    .filter(Boolean)
    .join(' &middot; ');

  return `
    <div style="width:100%; font-family:'Times New Roman', Georgia, serif; font-size:7pt;
                color:#444; padding:0 10mm; display:flex; justify-content:space-between;">
      <span>Эх сурвалж: ${Source}</span>
      <span>Хуудас <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;
}

/**
 * The standard footer for a report printed by a logged-in user.
 *
 * Looks the organisation up so callers do not each repeat it - three of them
 * had grown their own copy of this query.
 */
async function FooterFor(LogedUser, OrganizationId) {
  const OrgId =
    OrganizationId ||
    (LogedUser && LogedUser.Doctor && LogedUser.Doctor.OrganizationId) ||
    (LogedUser && LogedUser.OrganizationId);

  let OrganizationName = null;
  if (OrgId) {
    try {
      const Org = await Models.Organization.findByPk(OrgId, {
        attributes: ['Id', 'Name'],
        raw: true,
      });
      OrganizationName = Org ? Org.Name : null;
    } catch (ex) {
      console.error('[PrintHelper] failed to read organization:', ex);
    }
  }

  return BuildFooter({
    OrganizationName,
    PrintedBy: LogedUser ? LogedUser.UserName || LogedUser.Name || null : null,
    GeneratedAt: new Date().toLocaleString('mn-MN'),
  });
}

/**
 * Render HTML to a PDF and send it.
 *
 * The file is written to REPORT_DIR, streamed, then deleted - the same
 * lifecycle the existing handlers use. Errors are re-thrown for the caller's
 * catch to turn into the house error envelope; nothing is sent from here on
 * failure, because a half-sent response cannot carry one.
 */
async function SendPdf({
  res,
  html,
  namePrefix,
  downloadName,
  footer,
  landscape = false,
  margin,
  scale,
}) {
  const ReportDir = EnsureReportDir();
  const FilePath = path.join(ReportDir, UniqueFileName(namePrefix || 'Report'));

  const ShowFooter = footer !== false;
  const Margin = margin || {
    top: '10mm',
    bottom: ShowFooter ? '14mm' : '10mm',
    left: '8mm',
    right: '8mm',
  };

  let page = null;
  try {
    page = await newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    await page.pdf({
      path: FilePath,
      format: 'A4',
      landscape: !!landscape,
      // A fixed-width layout wider than the page needs scaling, or Chrome simply
      // clips the overflow off the right-hand edge with no warning.
      ...(scale ? { scale } : {}),
      printBackground: true,
      displayHeaderFooter: ShowFooter,
      headerTemplate: '<span></span>',
      footerTemplate: ShowFooter ? footer || BuildFooter() : '<span></span>',
      margin: Margin,
    });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (ex) {
        console.error('[PrintHelper] failed to close page:', ex);
      }
    }
  }

  if (!fs.existsSync(FilePath)) throw new Error('PDF file was not created');

  res.setHeader('Content-Type', 'application/pdf');
  return res.download(FilePath, downloadName || path.basename(FilePath), (err) => {
    if (err) console.error('[PrintHelper] failed to send PDF:', err);
    try {
      if (fs.existsSync(FilePath)) fs.unlinkSync(FilePath);
    } catch (ex) {
      console.error('[PrintHelper] failed to clean up PDF:', ex);
    }
  });
}

module.exports = {
  FooterFor,
  EnsureReportDir,
  UniqueFileName,
  GetOrganizationLogo,
  BuildFooter,
  SendPdf,
  Esc,
};
