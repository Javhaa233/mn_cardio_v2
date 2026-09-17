/**
 * Duplicate-key check for the i18n catalogues.
 *
 * Run from the frontend root:  node scratch/find_dupes.js
 *
 * Why it exists: keySeparator is false, so the source string IS the key, and a
 * duplicated key is invisible - JSON.parse silently keeps the last one, so the
 * file parses fine and one of the two translations simply never appears. It is a
 * recurring problem here because both catalogues are edited by hand.
 *
 * Checks BOTH files. It used to check only mn/, so an en/ duplicate could never
 * have been caught. It also compares the two catalogues against each other now,
 * because a key present in one and missing from the other is the other half of
 * the same class of mistake.
 *
 * Exits non-zero if anything is wrong, so it can gate a commit.
 */
const fs = require("fs");

const FILES = {
  en: "public/locales/en/translation.json",
  mn: "public/locales/mn/translation.json",
};

// Tolerates escaped quotes inside a key, which several clinical strings have.
const KEYLINE = /^\s*"((?:[^"\\]|\\.)*)"\s*:/;

let problems = 0;
const parsed = {};

for (const [name, file] of Object.entries(FILES)) {
  const text = fs.readFileSync(file, "utf8");
  const seen = new Map();
  // split on \n and strip \r: these files are CRLF
  text.split("\n").forEach((raw, i) => {
    const m = raw.replace(/\r$/, "").match(KEYLINE);
    if (!m) return;
    const key = m[1];
    if (seen.has(key)) {
      console.log(
        "[" +
          name +
          "] duplicate key " +
          JSON.stringify(key) +
          " on line " +
          (i + 1) +
          " (first seen on line " +
          seen.get(key) +
          ")",
      );
      problems++;
    }
    seen.set(key, i + 1);
  });
  parsed[name] = JSON.parse(text);
  console.log("[" + name + "] " + Object.keys(parsed[name]).length + " keys");
}

for (const [a, b] of [
  ["en", "mn"],
  ["mn", "en"],
]) {
  const only = Object.keys(parsed[a]).filter((k) => !(k in parsed[b]));
  if (only.length) {
    console.log("\n" + only.length + " key(s) in " + a + " but not " + b + ":");
    only.slice(0, 20).forEach((k) => console.log("  " + JSON.stringify(k)));
    if (only.length > 20)
      console.log("  ...and " + (only.length - 20) + " more");
    problems += only.length;
  }
}

console.log(
  problems
    ? "\n" + problems + " problem(s)."
    : "\nOK - no duplicates, both catalogues match.",
);
process.exit(problems ? 1 : 0);
