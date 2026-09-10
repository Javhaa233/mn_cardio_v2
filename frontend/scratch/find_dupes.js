const fs = require("fs");
const lines = fs
  .readFileSync("public/locales/mn/translation.json", "utf8")
  .split("\n");
const keys = {};
lines.forEach((line, index) => {
  const match = line.match(/^\s*"([^"]+)":/);
  if (match) {
    const key = match[1];
    if (keys[key]) {
      console.log(
        `Duplicate key "${key}" found on line ${index + 1} (previous occurrence on line ${keys[key]})`,
      );
    }
    keys[key] = index + 1;
  }
});
