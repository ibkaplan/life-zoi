// usage: node merge.mjs <repo> <area> <translations.json>
// translations: {"English": {"uk": "...", "ru": "...", "el": "..."}} or [{en, uk, ru, el}]
import { readFileSync, writeFileSync } from "node:fs";
const [repo, area, file] = process.argv.slice(2);
if (!file) throw new Error("usage: node merge.mjs <repo> <area> <translations.json>");
let data = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(data)) data = Object.entries(data).map(([en, v]) => ({ en, ...v }));
for (const loc of ["uk", "ru", "el"]) {
  const path = `${repo}/src/lib/i18n/catalog/${loc}/${area}.json`;
  const cat = JSON.parse(readFileSync(path, "utf8"));
  let n = 0;
  for (const row of data) if (row[loc]) { cat[row.en] = row[loc]; n++; }
  const sorted = Object.fromEntries(Object.entries(cat).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  writeFileSync(path, JSON.stringify(sorted, null, 1) + "\n");
  console.log(loc, area, "+" + n, "=", Object.keys(sorted).length);
}
