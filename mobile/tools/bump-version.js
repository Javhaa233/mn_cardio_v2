/**
 * Raise the app's version, in both repos at once, before a deploy.
 *
 *   node mobile/tools/bump-version.js minor    # a big change  2.0.0 -> 2.1.0
 *   node mobile/tools/bump-version.js patch    # a small one   2.0.0 -> 2.0.1
 *   node mobile/tools/bump-version.js --show   # print, change nothing
 *
 * WHY BOTH FILES MOVE TOGETHER. `backend/` and `frontend/` are separate git
 * repos but one deployment: the server pulls a single snapshot and restarts the
 * API alongside the SPA it serves. Two numbers would describe one thing, so the
 * question "what is on test?" would need two answers. backend/package.json is
 * the source of truth - it is what PM2 reports - and the frontend follows it.
 *
 * WHERE THE NUMBER SURFACES. `frontend/vite.config.js` bakes `__APP_VERSION__`
 * into the bundle at build time, and `BuildStamp.jsx` renders it; the backend
 * answers it on `GET /`. So the bump must happen BEFORE the export and the
 * server-side rebuild, or the running app keeps announcing the old number.
 *
 * NOT TOUCHED: `frontend-ui/package.json`. It is a stale scratch fork sitting at
 * 1.8.0, outside the export allowlist, and never deployed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FILES = [
  path.join(ROOT, 'backend', 'package.json'),
  path.join(ROOT, 'frontend', 'package.json'),
];

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

function ReadVersion(File) {
  if (!fs.existsSync(File)) {
    console.error('missing: ' + File);
    process.exit(1);
  }
  const Raw = fs.readFileSync(File, 'utf8');
  const Parsed = JSON.parse(Raw);
  if (!SEMVER.test(String(Parsed.version || ''))) {
    console.error('not a plain x.y.z version in ' + File + ': ' + Parsed.version);
    process.exit(1);
  }
  return { Raw, Version: Parsed.version };
}

/**
 * Rewrite only the version line.
 *
 * Re-serialising the whole object would reformat a file nobody asked us to
 * touch - key order and indentation included - and bury a one-word change in a
 * diff of hundreds of lines. The first "version" key in a package.json is the
 * package's own, so anchoring on it is safe.
 */
function WriteVersion(File, Raw, Next) {
  const Updated = Raw.replace(/("version"\s*:\s*")\d+\.\d+\.\d+(")/, '$1' + Next + '$2');
  if (Updated === Raw) {
    console.error('could not find the version line in ' + File);
    process.exit(1);
  }
  fs.writeFileSync(File, Updated, 'utf8');
}

const Mode = process.argv[2];
const Current = FILES.map(ReadVersion);

// Drift is a fact worth failing on: if the two repos already disagree, bumping
// would quietly pick one and hide how they parted.
const Versions = [...new Set(Current.map((c) => c.Version))];
if (Versions.length > 1) {
  console.error('the two package.json files disagree, fix that first:');
  FILES.forEach((File, i) => console.error('  ' + Current[i].Version + '  ' + File));
  process.exit(1);
}

const Version = Versions[0];

if (Mode === '--show') {
  console.log(Version);
  process.exit(0);
}

if (Mode !== 'minor' && Mode !== 'patch') {
  console.error('usage: node mobile/tools/bump-version.js <minor|patch|--show>');
  console.error('');
  console.error('  minor  a new screen or feature, a new endpoint, a schema change,');
  console.error('         or a change to who may see or do something');
  console.error('  patch  fixes, wording, styling, refactors, docs, tooling');
  console.error('');
  console.error('current: ' + Version);
  process.exit(2);
}

const [, Major, Minor, Patch] = Version.match(SEMVER);
const Next =
  Mode === 'minor'
    ? `${Major}.${Number(Minor) + 1}.0`
    : `${Major}.${Minor}.${Number(Patch) + 1}`;

FILES.forEach((File, i) => WriteVersion(File, Current[i].Raw, Next));

console.log(Version + ' -> ' + Next + '  (' + Mode + ')');
FILES.forEach((File) => console.log('  ' + path.relative(ROOT, File)));
console.log('');
console.log('Next: export, verify-no-secrets, push, then pull + rebuild on the server.');
console.log('The SPA bakes the version in at build time, so the rebuild is what publishes it.');
