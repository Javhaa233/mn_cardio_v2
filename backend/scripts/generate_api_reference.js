/**
 * Generates docs/API-WEB.md — the web backend's endpoint reference.
 *
 * Tender tracker row #142, "Сервисийн баримт бичиг (API doc)".
 *
 *   node scripts/generate_api_reference.js        (from the backend root)
 *
 * Every endpoint is DISCOVERED from source, never typed out here, so the document
 * cannot drift from the routing table: server.js supplies the mounts (the
 * `controllers` registry, `routeGroups.public` / `routeGroups.protected`,
 * `PATIENT_ALLOWED_PREFIXES`, and the app.use() sub-router mounts), and each
 * mounted file supplies its own router.<verb>() / router.route().<verb>() calls.
 *
 * Static parsing only: nothing is require()d, no server is started, no database
 * or network is touched, and no config/.env file is read.
 *
 * tests/acceptance/catalogue.js has a similar discover(), but it is not exported
 * and it reads routeGroups one line at a time, which misses the entries that
 * Prettier wrapped over several lines. This is a separate, multi-line-safe
 * implementation of the same idea.
 */
const fs = require('fs');
const path = require('path');

const BACKEND = path.resolve(__dirname, '..');
const OUT_FILE = path.join(BACKEND, 'docs', 'API-WEB.md');
const MOBILE_DOC_LINK = '../../mobile/API.md';
const VERBS = ['get', 'post', 'put', 'delete', 'patch'];

/* ------------------------------------------------------------ source I/O */

const toPosix = (p) => p.split(path.sep).join('/');
const relPath = (abs) => toPosix(path.relative(BACKEND, abs));

const sourceCache = new Map();

/**
 * Raw lines (for comments) plus a copy with whole-line comments blanked out
 * (for code). Blanking keeps every line in place, so an offset in `code` maps
 * straight back to a line number in the file.
 */
function loadSource(abs) {
  if (sourceCache.has(abs)) return sourceCache.get(abs);
  let raw = fs.readFileSync(abs, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const rawLines = raw.split(/\r?\n/);
  let inBlock = false;
  const codeLines = rawLines.map((line) => {
    const t = line.trim();
    if (inBlock) {
      if (t.includes('*/')) inBlock = false;
      return '';
    }
    if (t.startsWith('//')) return '';
    if (t.startsWith('/*')) {
      if (!t.slice(2).includes('*/')) inBlock = true;
      return '';
    }
    return line;
  });
  const code = codeLines.join('\n');
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') lineStarts.push(i + 1);
  const src = { raw, rawLines, code, lineStarts };
  sourceCache.set(abs, src);
  return src;
}

function lineOf(lineStarts, offset) {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

function resolveRequire(fromAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromAbs), spec);
  for (const candidate of [base, base + '.js', path.join(base, 'index.js')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/* --------------------------------------------------------- tiny JS lexing */

/** From an opening bracket, return its contents and the index just past the match. */
function readBalanced(code, openIdx) {
  let depth = 0;
  let quote = null;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return { inner: code.slice(openIdx + 1, i), end: i + 1 };
    }
  }
  return null;
}

/** Split an argument list on its top-level commas. */
function splitTopLevel(inner) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(inner.slice(start));
  return parts.map((s) => s.trim()).filter(Boolean);
}

function stringLiteral(arg) {
  const m = arg && arg.match(/^(['"`])([^'"`$]*)\1$/);
  return m ? m[2] : null;
}

/* ------------------------------------------------------- router parsing */

/**
 * Every router.<verb>('/x', ...), router.route('/x').<verb>(...)... and
 * router.use('/x', require('...')) in one file. Anything else called on the
 * router — or a route whose path is not a plain string — is returned as
 * `unclassified` rather than guessed at.
 */
function parseRouterFile(abs) {
  const src = loadSource(abs);
  const { code, rawLines, lineStarts } = src;
  const routes = [];
  const mounts = [];
  const unclassified = [];
  const re = /\b(router|Router)\s*\.\s*(\w+)\s*\(/g;
  const skip = (line, why) =>
    unclassified.push({ file: relPath(abs), line, text: rawLines[line - 1].trim(), why });

  let m;
  while ((m = re.exec(code))) {
    const verb = m[2].toLowerCase();
    const line = lineOf(lineStarts, m.index);
    const call = readBalanced(code, m.index + m[0].length - 1);
    if (!call) {
      skip(line, 'unbalanced call');
      continue;
    }
    re.lastIndex = call.end;
    const args = splitTopLevel(call.inner);
    const sub = stringLiteral(args[0]);

    if (VERBS.includes(verb)) {
      if (sub === null) skip(line, 'path is not a string literal');
      else routes.push(makeRoute(verb, sub, args.slice(1), line));
    } else if (verb === 'route') {
      if (sub === null) {
        skip(line, 'path is not a string literal');
        continue;
      }
      let pos = call.end;
      let found = 0;
      for (;;) {
        const cm = code.slice(pos).match(/^\s*\.\s*(\w+)\s*\(/);
        if (!cm || !VERBS.includes(cm[1].toLowerCase())) break;
        const chained = readBalanced(code, pos + cm[0].length - 1);
        if (!chained) break;
        routes.push(makeRoute(cm[1].toLowerCase(), sub, splitTopLevel(chained.inner), line));
        found++;
        pos = chained.end;
      }
      re.lastIndex = pos;
      if (!found) skip(line, 'route() with no verb chained');
    } else if (verb === 'use') {
      const req = args[1] && args[1].match(/^require\(\s*['"]([^'"]+)['"]\s*\)$/);
      const target = req ? resolveRequire(abs, req[1]) : null;
      if (sub !== null && target) mounts.push({ sub, target, line });
      else skip(line, 'router.use() that is not a sub-router mount');
    } else {
      skip(line, `router.${m[2]}() is not a recognised route declaration`);
    }
  }
  return { routes, mounts, unclassified };
}

function makeRoute(method, sub, rest, line) {
  const handler = rest.length ? rest[rest.length - 1] : '';
  return {
    method: method.toUpperCase(),
    sub,
    line,
    middleware: rest.slice(0, -1),
    handler: /^[\w$]+(\.[\w$]+)?$/.test(handler) ? handler : null,
  };
}

const joinPath = (prefix, sub) => (sub === '/' ? prefix + '/' : prefix.replace(/\/$/, '') + sub);

/* ---------------------------------------------------- purpose (comments) */

// Never let a comment carry a certificate name or anything shaped like a credential
// into the document.
const SENSITIVE =
  /config[\\/](xyp|ssl)|\.(pfx|p12|pem|key|crt|cer)\b|passw(or)?d\s*[:=]\s*\S|secret\s*[:=]\s*\S|token\s*[:=]\s*['"][^'"]{8,}/i;
const TRIVIAL =
  /^(routes?|router|helpers?|details?|lists?|files?|crud|todo|fixme|models?|services?|main|api)$/i;

/** The comment block ending on the line directly above `lineNo`, or null. */
function commentAbove(rawLines, lineNo) {
  let i = lineNo - 2;
  if (i < 0) return null;
  const t = rawLines[i].trim();
  const out = [];
  if (t.startsWith('//')) {
    while (i >= 0 && rawLines[i].trim().startsWith('//')) {
      out.unshift(rawLines[i].trim().replace(/^\/\/+\s?/, ''));
      i--;
    }
    return out;
  }
  if (t.endsWith('*/')) {
    for (; i >= 0; i--) {
      const l = rawLines[i].trim();
      out.unshift(l);
      if (l.startsWith('/*')) break;
    }
    if (i < 0) return null;
    return out.map((l) =>
      l
        .replace(/^\/\*+\s?/, '')
        .replace(/\s*\*+\/$/, '')
        .replace(/^\*+\s?/, '')
    );
  }
  return null;
}

function firstSentence(text) {
  const re = /[.!?](?=\s|$)/g;
  let m;
  while ((m = re.exec(text))) {
    if (/\b(e\.g|i\.e|etc|vs|cf|approx|No)$/i.test(text.slice(0, m.index))) continue;
    return text.slice(0, m.index + 1);
  }
  return text;
}

function clip(s, max) {
  if (s.length <= max) return s;
  let cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  if (space > max * 0.6) cut = cut.slice(0, space);
  return cut.replace(/[\s,;:(—-]+$/, '') + '…';
}

/** First sentence of the comment's first paragraph, or '' when it is not prose. */
function summarize(lines) {
  if (!lines) return '';
  const para = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) {
      if (para.length) break;
      continue;
    }
    if (l.startsWith('@')) break;
    para.push(l);
    // A short unpunctuated first line followed by a capitalised one is a label
    // ("2.7 Сэргээн засах, ...") sitting on top of a separate note.
    const next = (lines[i + 1] || '').trim();
    const isLabel = para.length === 1 && l.length < 50 && !/[.!?:;,(—-]$/.test(l);
    if (isLabel && /^[A-ZА-ЯЁӨҮ]/.test(next)) break;
  }
  const text = para.join(' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (/#\s*(end)?region|eslint|prettier-ignore|istanbul/i.test(text)) return '';
  // commented-out code, not a description
  if (/(^|\s)(router|app)\s*\.\s*\w+\s*\(|require\(|;\s*$|^[\w.]+\s*\(.*\)\s*;?$|^\w[\w.]*\s*=\s*/.test(text))
    return '';
  if (SENSITIVE.test(text)) return '';
  const sentence = firstSentence(text);
  if (sentence.length < 8 || TRIVIAL.test(sentence.replace(/[.:]$/, ''))) return '';
  let out = clip(sentence, 100);
  if ((out.match(/`/g) || []).length % 2) out = out.replace(/`/g, '');
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function findDefinitionLine(abs, name) {
  const { rawLines } = loadSource(abs);
  const n = escapeRe(name);
  const patterns = [
    new RegExp(`^\\s*(?:async\\s+)?function\\s*\\*?\\s*${n}\\s*\\(`),
    new RegExp(`^\\s*(?:const|let|var)\\s+${n}\\s*=`),
    new RegExp(`^\\s*(?:module\\.)?exports\\.${n}\\s*=`),
    new RegExp(`^\\s*${n}\\s*[:=]\\s*(?:async\\b|function\\b|\\()`),
  ];
  for (let i = 0; i < rawLines.length; i++) {
    if (patterns.some((p) => p.test(rawLines[i]))) return i + 1;
  }
  return null;
}

/** Where the handler is defined: the same file, a `x.y` module, or a destructured import. */
function resolveHandler(abs, handler) {
  if (!handler) return null;
  const { raw } = loadSource(abs);
  const requireOf = (spec) => resolveRequire(abs, spec);

  if (handler.includes('.')) {
    const [obj, prop] = handler.split('.');
    const rm = raw.match(
      new RegExp(`(?:const|let|var)\\s+${escapeRe(obj)}\\s*=\\s*require\\(\\s*['"]([^'"]+)['"]`)
    );
    const file = rm && requireOf(rm[1]);
    const line = file && findDefinitionLine(file, prop);
    return line ? { file, line } : null;
  }

  const local = findDefinitionLine(abs, handler);
  if (local) return { file: abs, line: local };

  for (const dm of raw.matchAll(
    /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*require\(\s*['"]([^'"]+)['"]\s*\)/g
  )) {
    for (const part of dm[1].split(',')) {
      const [orig, alias] = part.split(':').map((s) => s && s.trim());
      if ((alias || orig) === handler) {
        const file = requireOf(dm[2]);
        const line = file && findDefinitionLine(file, orig);
        if (line) return { file, line };
      }
    }
  }
  return null;
}

/** A comment on the route line wins; otherwise the handler's own comment; otherwise ''. */
function purposeOf(abs, route) {
  // A comment that only restates the handler name or the path adds nothing.
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^0-9a-zа-яёөү]/g, '');
  const handlerName = route.handler ? route.handler.split('.').pop() : '';
  const useful = (p) =>
    p &&
    norm(p) !== norm(handlerName) &&
    norm(p) !== norm(route.sub) &&
    !/^(GET|POST|PUT|DELETE|PATCH)\s+\//.test(p);

  const onRoute = summarize(commentAbove(loadSource(abs).rawLines, route.line));
  if (useful(onRoute)) return onRoute;
  const def = resolveHandler(abs, route.handler);
  const onHandler = def ? summarize(commentAbove(loadSource(def.file).rawLines, def.line)) : '';
  return useful(onHandler) ? onHandler : '';
}

/* ------------------------------------------------------- server.js model */

function parseServer() {
  const abs = path.join(BACKEND, 'server.js');
  const { code, lineStarts } = loadSource(abs);

  // controllers registry — insertion order also gives the domain order
  const fileByName = new Map();
  for (const m of code.matchAll(
    /(\w+)\s*:\s*require\(\s*['"](\.\/controllers\/[^'"]+)['"]\s*\)/g
  )) {
    fileByName.set(m[1], resolveRequire(abs, m[2]));
  }

  // routeGroups — parsed as a whole so wrapped entries are not lost
  const groups = { public: [], protected: [] };
  const problems = [];
  const gAt = code.indexOf('const routeGroups');
  const gBlock = gAt >= 0 && readBalanced(code, code.indexOf('{', gAt));
  if (!gBlock) throw new Error('routeGroups not found in server.js');
  const gBase = code.indexOf('{', gAt) + 1;
  for (const lm of gBlock.inner.matchAll(/(\w+)\s*:\s*\[/g)) {
    const group = lm[1];
    const arr = readBalanced(gBlock.inner, lm.index + lm[0].length - 1);
    if (!arr) continue;
    const declared = (arr.inner.match(/\bpath\s*:/g) || []).length;
    let matched = 0;
    for (const em of arr.inner.matchAll(
      /\{\s*path\s*:\s*['"]([^'"]+)['"]\s*,\s*controller\s*:\s*([\w.]+)\s*,?\s*\}/g
    )) {
      matched++;
      const ctrlName = em[2].split('.').pop();
      const file = fileByName.get(ctrlName) || null;
      const offset = gBase + lm.index + lm[0].length + em.index;
      const entry = { path: em[1], full: '/api' + em[1], ctrlName, file, group };
      entry.line = lineOf(lineStarts, offset);
      if (!file) problems.push(`routeGroups.${group} ${em[1]}: controller ${em[2]} not resolved`);
      (groups[group] = groups[group] || []).push(entry);
    }
    if (matched !== declared) {
      problems.push(`routeGroups.${group}: ${declared} entries declared, ${matched} parsed`);
    }
  }

  // PATIENT_ALLOWED_PREFIXES
  const patientAllowed = new Set();
  const pm = code.match(/PATIENT_ALLOWED_PREFIXES\s*=\s*new\s+Set\(\s*\[/);
  if (pm) {
    const set = readBalanced(code, pm.index + pm[0].length - 1);
    const body = set ? set.inner.replace(/\/\/[^\n]*/g, '') : '';
    for (const sm of body.matchAll(/['"]([^'"]+)['"]/g)) patientAllowed.add(sm[1]);
  } else {
    problems.push('PATIENT_ALLOWED_PREFIXES not found');
  }

  // registration order: legacy table vs the app.use() sub-router mounts
  const legacyAt = code.search(/registerRoutes\(\s*routeGroups\.public/);
  const appMounts = [];
  for (const am of code.matchAll(
    /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*require\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g
  )) {
    appMounts.push({
      mount: am[1],
      file: resolveRequire(abs, am[2]),
      offset: am.index,
      beforeLegacy: legacyAt >= 0 && am.index < legacyAt,
    });
  }

  // endpoints declared directly on the app
  const appRoutes = [];
  for (const rm of code.matchAll(/app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g)) {
    appRoutes.push({ method: rm[1].toUpperCase(), path: rm[2], line: lineOf(lineStarts, rm.index) });
  }

  return { fileByName, groups, patientAllowed, appMounts, appRoutes, problems };
}

/* ------------------------------------------------------------ discovery */

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

function collectRouter(prefix, abs, acc, unclassified, depth = 0) {
  if (depth > 5) return;
  const parsed = parseRouterFile(abs);
  unclassified.push(...parsed.unclassified);
  for (const r of parsed.routes) {
    acc.push(Object.assign({}, r, { path: joinPath(prefix, r.sub), abs, file: relPath(abs) }));
  }
  for (const u of parsed.mounts) {
    collectRouter(joinPath(prefix, u.sub), u.target, acc, unclassified, depth + 1);
  }
}

function discover() {
  const server = parseServer();
  const unclassified = [];
  const legacy = [];
  const legacyMounts = [...server.groups.public, ...server.groups.protected];

  for (const mount of legacyMounts) {
    if (!mount.file) continue;
    const parsed = parseRouterFile(mount.file);
    unclassified.push(...parsed.unclassified);
    if (parsed.mounts.length) {
      server.problems.push(`${relPath(mount.file)} mounts sub-routers; not expanded`);
    }
    for (const r of parsed.routes) {
      const perRouteToken = r.middleware.some((mw) => /verifyToken$/.test(mw));
      const extra = r.middleware.filter((mw) => !/verifyToken$/.test(mw));
      let access;
      if (mount.group === 'public') access = perRouteToken ? 'token (route-level)' : 'public';
      else access = server.patientAllowed.has(mount.path) ? 'token + patient allowed' : 'token';
      if (extra.length) access += ' + ' + extra.map((x) => '`' + x + '`').join(', ');
      legacy.push(
        Object.assign({}, r, {
          path: joinPath(mount.full, r.sub),
          prefix: mount.full,
          group: mount.group,
          patientAllowed: mount.group === 'protected' && server.patientAllowed.has(mount.path),
          perRouteToken,
          access,
          abs: mount.file,
          file: relPath(mount.file),
          domain: relPath(mount.file).split('/')[1],
          purpose: purposeOf(mount.file, r),
        })
      );
    }
  }

  // sub-router mounts: /api/patient, /api/doctor, /api/auth, and /api -> base, report
  const apiLayer = [];
  for (const am of server.appMounts) {
    if (!am.file) continue;
    const found = [];
    collectRouter(am.mount, am.file, found, unclassified);
    for (const r of found) {
      const surface = '/' + r.path.split('/').slice(1, 3).join('/');
      // A legacy PROTECTED prefix registered earlier that matches case-insensitively
      // runs its mount-level verifyToken first.
      const shadow = am.beforeLegacy
        ? null
        : server.groups.protected.find((g) => {
            const a = r.path.toLowerCase();
            const b = g.full.toLowerCase();
            return a === b || a.startsWith(b + '/');
          });
      apiLayer.push(
        Object.assign({}, r, {
          surface,
          shadow: shadow ? shadow.full : null,
          purpose: purposeOf(r.abs, r),
        })
      );
    }
  }

  // controller files that no mount reaches
  const mountedFiles = new Set(legacyMounts.map((m) => m.file));
  const requiredFiles = new Set(server.fileByName.values());
  const unmounted = [];
  for (const abs of walk(path.join(BACKEND, 'controllers'))) {
    if (mountedFiles.has(abs)) continue;
    const parsed = parseRouterFile(abs);
    unmounted.push({
      file: relPath(abs),
      routes: parsed.routes.length,
      required: requiredFiles.has(abs),
    });
  }

  return { server, legacy, apiLayer, unmounted, unclassified };
}

/* ------------------------------------------------------------- markdown */

const DOMAIN_TITLES = {
  system: 'Систем ба ерөнхий CRUD',
  auth: 'Нэвтрэлт, хэрэглэгчийн бүртгэл',
  organization: 'Байгууллага, эмч, баг, зөвлөгөө (асуумж), хяналтын самбар',
  'patient-care': 'Өвчтөний тусламж үйлчилгээ',
  communication: 'Чат ба мэдэгдэл',
  integrations: 'Гадаад интеграц (ХУР, ЭМД)',
  reporting: 'Тайлан',
  'heart-failure': 'Зүрхний дутагдал',
  cvd: 'Зүрх судасны өвчний (ЗСӨ) хяналт, шинжилгээ, тайлан',
  devices: 'Зүрхний төхөөрөмж (пейсмейкер, ICD)',
  rhythm: 'Зүрхний хэм алдагдал',
  diagnostics: 'Оношилгоо (катетержуулалт, ЭХО, лаборатори, мэс заслын төлөвлөгөө)',
  vascular: 'Судас, хавхлага, төрөлхийн гажиг',
};

// /api/BaseObject — written from BaseController.js and BaseControllerHelper.js.
const ENGINE_NOTES = {
  '/getData':
    'Маягтын талбарын тохиргоо (`Fields`, `NewObject`, `TitleObject`, `PK`, `AttachFiles`); `OptionType` сонголтууд аль хэдийн дүүргэгдсэн байна.',
  '/':
    'Жагсаалт: хуудаслалт (`PageSize`, `PageNumber`), хайлт (`SearchText`, `SearchField`), эрэмбэ (`OrderByField`, `OrderByType`). Хуудаслалтын мэдээлэл `Option`-д ирнэ.',
  '/getListInfo': '`/`-тэй ижил параметртэй жагсаалт (`BaseGetListInfo`).',
  '/getDetail': 'Нэг бичлэг; `SearchField`-ээр шүүнэ.',
  '/getDetailInfo': 'Нэг бичлэг (`BaseDetailInfo`).',
  '/create': 'Шинэ бичлэг. `Data` нь JSON мөр (string); амжилттай бол `Data.DataId` буцна.',
  '/update': 'Бичлэг засах. `Data` нь PK талбартай JSON мөр.',
  '/destroy':
    'Устгах. `DeleteOption` шүүлтүүр; эрхгүй эсвэл тохирох мөр олдоогүй бол `Success: false`.',
  '/uploadFile':
    '`multipart/form-data`, `LinkedObjectInfo` (`LinkedObjectName`, `LinkedObjectId`, `FieldName`). Дээд хэмжээ 10 МБ (чатад 50 МБ), зөвшөөрөгдсөн өргөтгөлийн жагсаалттай.',
  '/downloadFile':
    '`FileInfo.generated_name`-ээр файл татна; эрхийг хадгалагдсан `File` мөрөөр шалгана. Жинхэнэ 400 / 403 / 404 / 500 статус буцаадаг.',
  '/deleteFile': '`FileId`-аар файлыг зөөлөн устгана (`rec_status = 2`).',
  '/ExportExcel': 'Жагсаалтын шүүлтүүрээр `.xlsx` файл үүсгэж татуулна.',
  '/ExportText': 'Ижил экспорт, таб-аар тусгаарласан `.txt` файлаар.',
};

const SURFACE_ACCESS = {
  '/api/patient': 'token (RoleId 4 only)',
  '/api/doctor': 'token (staff only)',
  '/api/auth': 'self-authenticating',
  '/api/base': 'public (no token)',
  '/api/report': 'public (no token)',
};

const code = (s) => '`' + s + '`';
const mdCell = (s) =>
  String(s == null ? '' : s)
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|');

function table(headers, rows) {
  const out = [
    '| ' + headers.join(' | ') + ' |',
    '|' + headers.map(() => '---').join('|') + '|',
  ];
  for (const r of rows) out.push('| ' + r.map(mdCell).join(' | ') + ' |');
  return out.join('\n');
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function accessOfApi(r) {
  if (r.shadow) return `token — ${code(r.shadow)} угтвар барьдаг (§9)`;
  return SURFACE_ACCESS[r.surface] || 'see source';
}

function render(model) {
  const { server, legacy, apiLayer, unmounted } = model;
  const L = [];
  const push = (...lines) => L.push(...lines);

  const pub = legacy.filter((r) => r.group === 'public');
  const prot = legacy.filter((r) => r.group === 'protected');
  const pubToken = pub.filter((r) => r.perRouteToken);
  const patient = prot.filter((r) => r.patientAllowed);
  const bySurface = (s) => apiLayer.filter((r) => r.surface === s);
  const mobile = ['/api/patient', '/api/doctor', '/api/auth'];
  const newer = ['/api/base', '/api/report'];
  const system = server.appRoutes;
  const total = legacy.length + apiLayer.length + system.length;
  const nonPost = legacy.filter((r) => r.method !== 'POST');
  const allowedList = [...server.patientAllowed].map((p) => code('/api' + p)).join(', ');

  /* header + intro */
  push(
    '# МнКардио — вэб системийн API лавлах',
    '',
    '> Тендерийн ажлын жагсаалтын №142 «Сервисийн баримт бичиг (API doc)». Энэ файлыг',
    '> `scripts/generate_api_reference.js` эх кодоос автоматаар үүсгэдэг. Гараар бүү засаарай —',
    '> код өөрчлөгдвөл backend хавтсанд `node scripts/generate_api_reference.js`-г дахин ажиллуулна.',
    '',
    '## 1. Ерөнхий мэдээлэл',
    '',
    'Энэхүү баримт бичиг нь МнКардио вэб системийн сервер талын (Node.js + Express) бүх HTTP',
    'endpoint-ийг жагсаана: зам, HTTP арга, хандах эрх, хариуцах controller файл. Жагсаалтыг',
    '`server.js` дахь маршрутын хүснэгт болон controller файлуудаас шууд уншиж гаргадаг тул кодтой',
    'зөрөхгүй.',
    '',
    '- **Үндсэн зам (base URL):** `/api`. Локал орчинд `http://localhost:5001/api` (порт нь `PORT`',
    '  орчны хувьсагч, анхдагч 5001); ажлын орчинд frontend-ийн домэйн дээрх reverse proxy-оор',
    '  дамжина. Серверийн ажиллагааг `GET /health`-ээр шалгана.',
    '- **Нэвтрэлт:** JWT bearer токен, `Authorization: Bearer <token>` толгойгоор. Токеныг',
    '  `POST /api/User/Login` (эмч, ажилтан; биед `UserName`, `Password`) олгож, хариуны',
    '  `Data.token`-д буцаана; иргэн `POST /api/PatientUser/Login`-ээр нэвтэрнэ. Токен **10 цаг**',
    '  (36 000 секунд) хүчинтэй.',
    '- **Legacy хариуны бүтэц:** `{ Success, Message, Data }`, жагсаалтад нэмэлт `Option`',
    '  (хуудаслалт). **Алдааг HTTP 200 статустайгаар** `Success: false` гэж буцаана. Токен байхгүй',
    '  эсвэл хүчингүй бол `{ Success: false, Message, AuthError: true }` мөн HTTP 200. Клиент статус',
    '  кодыг биш, `Success` талбарыг шалгах ёстой. Цөөн файл татах endpoint (жишээ нь',
    '  `/api/BaseObject/downloadFile`) жинхэнэ 4xx/5xx статус буцаадаг.',
    '- **Шинэ давхарга `/api/base`, `/api/report`:** жижиг үсгийн `{ success, message, data }`',
    '  бүтэц, бодит HTTP арга (GET / POST / PUT / DELETE).',
    '- **HTTP арга:** legacy давхаргын бараг бүх маршрут **`POST`** — унших үйлдэл ч гэсэн;',
    '  параметрийг JSON биед (body) дамжуулна. POST биш legacy маршрут ердөө ' +
      nonPost.length +
      ': ' +
      nonPost.map((r) => code(r.method + ' ' + r.path)).join(', ') +
      '.',
    '- **Иргэний токен (`RoleId 4`):** хамгаалагдсан угтваруудаас зөвхөн ' +
      allowedList +
      '-аар нэвтэрнэ. Бусад дээр `{ Success: false, Message: \'Хандах эрхгүй байна\' }` буцна.',
    ''
  );

  /* summary */
  const pubPrefixes = server.groups.public.length;
  const protPrefixes = server.groups.protected.length;
  push(
    '## 2. Тоон үзүүлэлт',
    '',
    table(
      ['Бүлэг', 'Тайлбар', 'Угтвар', 'Endpoint'],
      [
        [
          'public',
          'Legacy нийтийн угтвар (`routeGroups.public`) — mount түвшинд токенгүй',
          pubPrefixes,
          pub.length,
        ],
        [
          '— үүнээс маршрут түвшинд токентой',
          '`Auth.verifyToken`-г маршрут дээрээ шаарддаг',
          '',
          pubToken.length,
        ],
        [
          'protected',
          'Legacy хамгаалагдсан угтвар (`routeGroups.protected`) — `Auth.verifyToken`',
          protPrefixes,
          prot.length,
        ],
        [
          '— үүнээс patient-allowed',
          'Иргэний токенд мөн нээлттэй (`PATIENT_ALLOWED_PREFIXES`)',
          server.patientAllowed.size,
          patient.length,
        ],
        [
          'api-layer',
          [...mobile, ...newer].map(code).join(', '),
          mobile.length + newer.length,
          apiLayer.length,
        ],
        ['system', system.map((s) => code(s.method + ' ' + s.path)).join(', '), '', system.length],
        ['**Нийт**', '', '', '**' + total + '**'],
      ]
    ),
    '',
    'api-layer задаргаа: ' +
      [...mobile, ...newer].map((s) => `${code(s)} ${bySurface(s).length}`).join(' · ') +
      '.',
    ''
  );

  /* access legend */
  push(
    '## 3. Хандах эрхийн тэмдэглэгээ',
    '',
    table(
      ['Тэмдэглэгээ', 'Утга'],
      [
        ['`public`', 'Токен шаардахгүй.'],
        [
          '`token (route-level)`',
          'Нийтийн угтвар доторх маршрут боловч маршрут дээрээ `verifyToken` шаарддаг. Иргэний угтварын хязгаарлалт үйлчлэхгүй.',
        ],
        [
          '`token`',
          'Хүчинтэй токен шаардана; иргэний (`RoleId 4`) токеныг угтвар түвшинд татгалзана.',
        ],
        [
          '`token + patient allowed`',
          'Хүчинтэй токен шаардана; иргэний токенд мөн нээлттэй — мөр бүрийн хамрах хүрээг controller дотор шалгана.',
        ],
        [
          '`+ <middleware>`',
          'Маршрут дээрх нэмэлт middleware (жишээ нь `RequireAdmin` — зөвхөн админ).',
        ],
        [
          '`token (RoleId 4 only)` / `token (staff only)`',
          'Гар утасны гадаргуу: токеныг маршрут бүр дээр шалгаж, 401/403 бодит статус буцаана.',
        ],
        ['`self-authenticating`', '`/api/auth/*` — refresh эсвэл access токеноо өөрөө шалгана.'],
        ['`public (no token)`', 'Токен шалгалтгүйгээр холбогдсон (§9-ийг үз).'],
      ]
    ),
    ''
  );

  /* legacy by domain */
  push(
    '## 4. Legacy controller-ууд — домэйн тус бүрээр',
    '',
    'Controller файл бүр нь Express Router бөгөөд `server.js`-д `/api/<Угтвар>` дээр холбогдоно.',
    '«Зорилго» баганыг кодын тайлбараас (маршрутын мөрийн дээрх эсвэл handler функцийн дээрх',
    'comment-ын эхний өгүүлбэр) авсан; тайлбаргүй маршрутад хоосон үлдээсэн.',
    ''
  );
  const domainOrder = [];
  for (const abs of server.fileByName.values()) {
    const d = abs && relPath(abs).split('/')[1];
    if (d && !domainOrder.includes(d)) domainOrder.push(d);
  }
  for (const d of new Set(legacy.map((r) => r.domain))) if (!domainOrder.includes(d)) domainOrder.push(d);
  const prefixOrder = [...server.groups.public, ...server.groups.protected].map((g) => g.full);
  let n = 0;
  for (const d of domainOrder) {
    const rows = legacy
      .filter((r) => r.domain === d)
      .sort(
        (a, b) =>
          prefixOrder.indexOf(a.prefix) - prefixOrder.indexOf(b.prefix) || a.line - b.line
      );
    if (!rows.length) continue;
    n++;
    const prefixes = [...new Set(rows.map((r) => r.prefix))];
    push(
      `### 4.${n}. ${DOMAIN_TITLES[d] || d} — ${code('controllers/' + d + '/')}`,
      '',
      `Угтвар: ${prefixes.map(code).join(', ')} · ${rows.length} endpoint.`,
      '',
      table(
        ['Method', 'Path', 'Access', 'Controller файл', 'Зорилго (кодын тайлбараас)'],
        rows.map((r) => [
          code(r.method),
          code(r.path),
          r.access,
          code(path.basename(r.file) + ':' + r.line),
          r.purpose,
        ])
      ),
      ''
    );
  }

  /* generic engine */
  const engine = legacy.filter((r) => r.prefix === '/api/BaseObject');
  push(
    '## 5. Ерөнхий CRUD хөдөлгүүр — `/api/BaseObject`',
    '',
    '`ModelConfigs/mainConfig.js`-д бүртгэгдсэн `ObjectName` бүр (ModelConfig + Sequelize model)',
    'доорх endpoint-уудыг **шинэ код бичихгүйгээр** авна: маягтын тохиргоо, жагсаалт (хуудаслалт,',
    'хайлт, эрэмбэ), нэг бичлэг, үүсгэх / засах / устгах, файл хавсаргах, Excel ба текст экспорт.',
    'Хүсэлт бүрт `ObjectName` заавал байна. Controller: `controllers/system/BaseController.js`.',
    '',
    '- Иргэний токенд мөр бүрийн хамрах хүрээг `helper/PatientScope.js` хязгаарлана.',
    '- Чатын хүснэгтүүд энд бүртгэгдээгүй — чатад зөвхөн `/api/Chat/*`-аар хандана.',
    '- Жагсаалтын `.xlsx` экспорт нь тендерийн «цэсэнд жагсаах, хайх, экспортлох» шаардлагыг',
    '  бүртгэлтэй маягт бүрт хангана.',
    '',
    table(
      ['Method', 'Path', 'Access', 'Тайлбар'],
      engine.map((r) => [code(r.method), code(r.path), r.access, ENGINE_NOTES[r.sub] || ''])
    ),
    ''
  );

  /* mobile surfaces */
  const mobileRows = apiLayer.filter((r) => mobile.includes(r.surface));
  push(
    '## 6. Гар утасны API — `/api/patient`, `/api/doctor`, `/api/auth`',
    '',
    `Эдгээрийн дэлгэрэнгүй гэрээ (хүсэлт, хариу, алдааны код) [mobile/API.md](${MOBILE_DOC_LINK})-д`,
    'байгаа тул энд давтахгүй. Эдгээр нь legacy хүснэгтээс **өмнө** холбогдсон, токеныг маршрут',
    'бүр дээр шалгадаг, жижиг үсгийн `{ success, message, data, code }` бүтэцтэй, бодит HTTP статус',
    '(400 / 401 / 403 / 404 / 500) буцаадаг.',
    '',
    table(
      ['Method', 'Path', 'Access', 'Эх файл', 'Зорилго (кодын тайлбараас)'],
      mobileRows.map((r) => [
        code(r.method),
        code(r.path),
        accessOfApi(r),
        code(r.file + ':' + r.line),
        r.purpose,
      ])
    ),
    ''
  );

  /* newer generic layer */
  const newerRows = apiLayer.filter((r) => newer.includes(r.surface));
  const cfgDir = path.join(BACKEND, 'api', 'base', 'config');
  const targets = fs.existsSync(cfgDir)
    ? fs
        .readdirSync(cfgDir)
        .filter((f) => f.endsWith('.js') && f !== 'index.js' && !f.startsWith('.'))
        .map((f) => {
          const m = fs.readFileSync(path.join(cfgDir, f), 'utf8').match(/\btarget\s*:\s*['"](\w+)['"]/);
          return m ? m[1] : f.replace(/\.js$/, '');
        })
    : [];
  push(
    '## 7. Шинэ давхарга — `/api/base`, `/api/report`',
    '',
    '`app.use(\'/api\', require(\'./api\'))`-ээр холбогдсон ерөнхий REST нөөц. Бодит HTTP арга, жижиг',
    'үсгийн `{ success, message, data }` бүтэц. `:target` нь `api/base/config/` дахь тохиргооны нэг:',
    targets.map(code).join(', ') + '.',
    'Тохиргоонд тухайн үйлдэл тодорхойлогдоогүй бол `{ success: false, message: \'Идвэхигүй үйлдэл\' }`',
    'буцна.',
    '',
    table(
      ['Method', 'Path', 'Access', 'Эх файл', 'Зорилго (кодын тайлбараас)'],
      newerRows.map((r) => [
        code(r.method),
        code(r.path),
        accessOfApi(r),
        code(r.file + ':' + r.line),
        r.purpose,
      ])
    ),
    ''
  );

  /* system */
  push(
    '## 8. Системийн endpoint',
    '',
    table(
      ['Method', 'Path', 'Access', 'Эх файл'],
      system.map((s) => [code(s.method), code(s.path), 'public', code('server.js:' + s.line)])
    ),
    ''
  );

  /* security note */
  const testRows = legacy.filter((r) => r.prefix.toLowerCase() === '/api/test');
  const baseRows = bySurface('/api/base');
  const reportRows = bySurface('/api/report');
  const shadowed = reportRows.filter((r) => r.shadow);
  const otherPublic = server.groups.public
    .map((g) => g.full)
    .filter((p) => p.toLowerCase() !== '/api/test');
  push(
    '## 9. Аюулгүй байдлын тэмдэглэл',
    '',
    '> **Аюулгүй байдлын тэмдэглэл.** Дараах угтварууд `Auth.verifyToken`-оос гадуур холбогдсон:',
    '>',
    `> - ${code('/api/base/*')} — ${baseRows.length} endpoint, токенгүй хүсэлтэд хариулдаг`,
    '>   (`server.js` дахь `app.use(\'/api\', require(\'./api\'))`).',
    `> - ${code('/api/Test/*')} — ${testRows.length} endpoint, ${code('routeGroups.public')}-д`,
    '>   (`controllers/system/TestController.js`): ' +
      testRows.map((r) => code(r.method + ' ' + r.path)).join(', ') +
      '.',
    `> - ${code('/api/report/*')} — ${reportRows.length} endpoint, мөн токен шалгалтгүйгээр холбогдсон.`
  );
  if (shadowed.length) {
    push(
      '>   Гэхдээ Express холбох замыг том жижиг үсэг ялгахгүйгээр тааруулдаг тул өмнө бүртгэгдсэн',
      `>   хамгаалагдсан ${code(shadowed[0].shadow)} угтвар түрүүлж барьж, токенгүй хүсэлтэд`,
      '>   `AuthError` хариу (HTTP 200) буцаадаг. Энэ нь санаатай хамгаалалт биш — бүртгэлийн',
      '>   дарааллын дагавар бөгөөд тэр угтварыг өөрчилбөл алга болно.'
    );
  }
  push(
    '>',
    '> 2026-09-10-ны шийдвэрээр эдгээрийг кодын хувьд одоогийн байдлаар нь үлдээж, тендерт заасан',
    '> мэдээллийн аюулгүй байдлын аудитад шилжүүлсэн (ажлын жагсаалтын №136, №138). Энэ баримт',
    '> бичиг зөвхөн бодит байдлыг тэмдэглэнэ; код өөрчлөөгүй.',
    '>',
    '> Нийтийн бүлгийн бусад угтвар — ' +
      otherPublic.map(code).join(', ') +
      ' — нэвтрэх, бүртгүүлэх, нууц үг сэргээх, ХУР-ын сервер хоорондын дуудлага зэрэг токен',
    '> авахаас өмнөх урсгалд зориулагдсан;',
    '> тэдгээрийн зарим маршрут маршрут түвшинд токен шаарддаг (§4-ийн `token (route-level)`).',
    ''
  );

  /* unmounted */
  if (unmounted.length) {
    push(
      '## 10. Холбогдоогүй controller файлууд',
      '',
      '`controllers/` доторх боловч `routeGroups`-д холбогдоогүй тул HTTP-ээр хандах боломжгүй',
      'файлууд. Дээрх тоонд ороогүй.',
      '',
      table(
        ['Файл', 'Маршрутын зарлалт', 'Тайлбар'],
        unmounted.map((u) => [
          code(u.file),
          u.routes,
          u.routes
            ? 'Router зарласан боловч хаана ч холбогдоогүй — хүрэх боломжгүй.'
            : u.required
              ? '`server.js`-д require хийсэн, router биш (жишээ нь хуваарьт ажил).'
              : 'Маршрутгүй туслах файл.',
        ])
      ),
      ''
    );
  }

  push(
    '---',
    '',
    `_Энэ файлыг ${code('scripts/generate_api_reference.js')} автоматаар үүсгэв. ` +
      `Үүсгэсэн огноо: ${today()}. Нийт endpoint: ${total}._`,
    ''
  );
  return { text: L.join('\n'), total, counts: { pub, pubToken, prot, patient, apiLayer, system } };
}

/* ------------------------------------------------------------------ main */

function main() {
  const model = discover();
  const { text, total, counts } = render(model);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, text, 'utf8');

  const surfaces = {};
  for (const r of counts.apiLayer) surfaces[r.surface] = (surfaces[r.surface] || 0) + 1;
  console.log(`Wrote ${relPath(OUT_FILE)} — ${total} endpoints`);
  console.log(
    `  public ${counts.pub.length} (route-level token ${counts.pubToken.length}) · ` +
      `protected ${counts.prot.length} (patient-allowed ${counts.patient.length}) · ` +
      `api-layer ${counts.apiLayer.length} · system ${counts.system.length}`
  );
  console.log('  api-layer: ' + JSON.stringify(surfaces));
  const withPurpose = model.legacy.filter((r) => r.purpose).length;
  console.log(`  legacy routes with a purpose from comments: ${withPurpose}/${model.legacy.length}`);
  for (const p of model.server.problems) console.log('  PROBLEM: ' + p);
  for (const u of model.unclassified) {
    console.log(`  UNCLASSIFIED ${u.file}:${u.line} (${u.why}) ${u.text}`);
  }
  for (const u of model.unmounted) {
    console.log(`  NOT MOUNTED ${u.file} (${u.routes} route declarations)`);
  }
}

main();
