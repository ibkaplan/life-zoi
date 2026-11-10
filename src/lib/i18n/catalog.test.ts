import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import uk from "./catalog/uk";
import ru from "./catalog/ru";
import el from "./catalog/el";
import { CATALOG_TEXT } from "./catalog-sources";

const CATALOGS: Record<string, Record<string, string>> = { uk, ru, el };
const SRC = join(__dirname, "..", "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

/**
 * Every English text in the app's source that is passed to `t("…")`, marked with
 * `msg("…")`, or placed with `<T text="…" />`.
 */
function sourceText(): Map<string, string> {
  const found = new Map<string, string>();
  const patterns = [/(?<![\w.])(?:t|msg)\(\s*("(?:[^"\\\n]|\\.)*")/g, /<T\s+text=("(?:[^"\\\n]|\\.)*")/g];
  for (const file of sourceFiles(SRC)) {
    const code = readFileSync(file, "utf8");
    for (const pattern of patterns)
      for (const match of code.matchAll(pattern)) found.set(JSON.parse(match[1]) as string, file.slice(SRC.length + 1));
  }
  // Tab titles from page metadata. TitleSync translates them in the browser.
  for (const file of sourceFiles(join(SRC, "app"))) {
    const code = readFileSync(file, "utf8");
    if (!code.includes("metadata")) continue;
    for (const match of code.matchAll(/\btitle:\s*("(?:[^"\\\n]|\\.)*")/g)) {
      const title = JSON.parse(match[1]) as string;
      if (title.includes("%s")) continue;
      for (const part of title.split(" · ")) if (part !== "lifeZoi") found.set(part, file.slice(SRC.length + 1));
    }
  }
  return found;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("translation catalogs", () => {
  const english = sourceText();
  for (const text of CATALOG_TEXT()) english.set(text, "catalog-sources");

  it("finds the text to check", () => {
    expect(english.size).toBeGreaterThan(200);
    // `I18N_MISSING=path npx vitest run src/lib/i18n/catalog.test.ts` writes the untranslated text to a file.
    const out = process.env.I18N_MISSING;
    if (out) {
      const missing = [...english.keys()].filter((text) => Object.values(CATALOGS).some((catalog) => !catalog[text]?.trim()));
      writeFileSync(out, JSON.stringify(missing, null, 1));
    }
  });

  for (const [locale, catalog] of Object.entries(CATALOGS)) {
    it(`has ${locale} text for every English text the app shows`, () => {
      const missing = [...english.keys()].filter((text) => !catalog[text]?.trim());
      expect(missing.map((text) => `${english.get(text)}: ${text}`)).toEqual([]);
    });

    it(`keeps the same {placeholders} in ${locale}`, () => {
      for (const [text, translated] of Object.entries(catalog)) {
        expect(placeholders(translated), text).toEqual(placeholders(text));
      }
    });
  }
});
