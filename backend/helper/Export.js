/**
 * Turning a table of rows into a downloadable file — xlsx, csv or txt.
 *
 * Tender §1.8 asks for reports downloadable as XLS and TXT, and §1.8 again for
 * the source stamp on every one of them. Both requirements are satisfied here
 * rather than per endpoint, so a new export is a column list and nothing else.
 *
 * THE STAMP IS PART OF THE FILE, not a separate sheet or a footer the format
 * might drop. helper/Provenance.js produces it and it is written above the
 * header row in every format - a spreadsheet that gets emailed onwards still
 * says which database and which organisation it came from.
 *
 * CSV IS WRITTEN WITH A BOM, and that is not optional here. Excel on a Mongolian
 * Windows install reads a BOM-less UTF-8 CSV in the system ANSI codepage and
 * renders every Cyrillic name as mojibake - the same failure mode CLAUDE.md
 * records for sqlcmd input files. Three bytes make the difference between a
 * usable export and a support call.
 *
 * TXT is tab-separated for the same audience: it opens in Excel as columns and
 * stays readable in Notepad, which is what "TXT-ээр татах" means in practice.
 */

const { ExcelJS } = require('./excel');

const FORMATS = ['xlsx', 'csv', 'txt'];

const IsFormat = (f) => FORMATS.indexOf(String(f || '').toLowerCase()) !== -1;

/** Normalise, defaulting to xlsx - the format the tender names first. */
const ReadFormat = (f) => {
  const v = String(f || '').toLowerCase();
  return IsFormat(v) ? v : 'xlsx';
};

/** A value as a cell string. null and undefined become empty, never "null". */
const Cell = (v) => {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 19).replace('T', ' ');
  return String(v);
};

/**
 * RFC 4180 quoting: double the quotes, wrap anything containing a delimiter,
 * a quote or a newline.
 *
 * A clinical free-text field routinely contains commas and line breaks, so
 * skipping this does not produce a slightly untidy file - it produces one with
 * the columns shifted from that row onwards.
 */
const Quote = (v, delimiter) => {
  const s = Cell(v);
  if (s.indexOf(delimiter) === -1 && s.indexOf('"') === -1 && !/[\r\n]/.test(s)) return s;
  return '"' + s.replace(/"/g, '""') + '"';
};

function Delimited({ headers, rows, provenance, delimiter }) {
  const lines = [];
  (provenance || []).forEach((l) => lines.push(Quote(l, delimiter)));
  if (provenance && provenance.length) lines.push('');
  lines.push(headers.map((h) => Quote(h, delimiter)).join(delimiter));
  rows.forEach((r) => lines.push(r.map((c) => Quote(c, delimiter)).join(delimiter)));
  // \r\n, because these files are opened in Excel and Notepad on Windows.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

async function Workbook({ headers, rows, provenance, sheetName }) {
  const wb = new ExcelJS.Workbook();
  // Sheet names are capped at 31 characters by the format and cannot contain
  // : \ / ? * [ ]. A name that breaks either rule makes the file unopenable.
  const safe = String(sheetName || 'Export')
    .replace(/[:\\/?*[\]]/g, ' ')
    .slice(0, 31);
  const ws = wb.addWorksheet(safe);

  (provenance || []).forEach((l) => {
    const row = ws.addRow([l]);
    row.font = { size: 9, color: { argb: 'FF666666' } };
  });
  if (provenance && provenance.length) ws.addRow([]);

  const head = ws.addRow(headers);
  head.font = { bold: true };

  rows.forEach((r) => ws.addRow(r.map(Cell)));

  // Width from content, bounded. Unbounded, one long free-text comment makes a
  // column hundreds of characters wide and the sheet unreadable.
  headers.forEach((h, i) => {
    let max = String(h).length;
    rows.forEach((r) => {
      const len = Cell(r[i]).length;
      if (len > max) max = len;
    });
    ws.getColumn(i + 1).width = Math.min(Math.max(max + 2, 10), 50);
  });

  return wb;
}

/**
 * Write the file to the response.
 *
 * Sets Content-Disposition: attachment, so this returns a FILE and not the
 * JSON envelope the rest of the surface uses. A caller must therefore not have
 * sent anything before calling this.
 *
 * The mobile client downloads these with its bearer token on a GET, which is
 * why they are GET endpoints rather than the legacy POST-for-everything.
 */
async function Send({ res, format, fileName, headers, rows, provenance, sheetName }) {
  const fmt = ReadFormat(format);
  const base = (fileName || 'export').replace(/[^\w\-.]+/g, '_');

  if (fmt === 'xlsx') {
    const wb = await Workbook({ headers, rows, provenance, sheetName });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="' + base + '.xlsx"');
    await wb.xlsx.write(res);
    return res.end();
  }

  const delimiter = fmt === 'csv' ? ',' : '\t';
  const body = Delimited({ headers, rows, provenance, delimiter });

  res.setHeader(
    'Content-Type',
    fmt === 'csv' ? 'text/csv; charset=utf-8' : 'text/plain; charset=utf-8'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="' + base + '.' + fmt + '"');
  return res.end(body);
}

module.exports = { FORMATS, IsFormat, ReadFormat, Send, Cell };
