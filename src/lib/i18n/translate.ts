import { fmt, type Locale } from "./config";

/** English text in, the text for the current language out. Unknown text is shown in English. */
export type Translate = (english: string, values?: Record<string, string | number>) => string;

export type Catalog = Record<string, string>;

export function makeTranslate(catalog: Catalog | null | undefined): Translate {
  return (english, values) => {
    const text = (catalog && catalog[english]) || english;
    return values ? fmt(text, values) : text;
  };
}

/** English needs no catalog. The other three load on demand so a page only downloads one language. */
export const CATALOG_LOADERS: Record<Exclude<Locale, "en">, () => Promise<Catalog>> = {
  uk: () => import("./catalog/uk").then((mod) => mod.default as Catalog),
  ru: () => import("./catalog/ru").then((mod) => mod.default as Catalog),
  el: () => import("./catalog/el").then((mod) => mod.default as Catalog),
};

/**
 * Marks English text that is stored in a constant and translated later with `t`.
 * It returns the text unchanged; the catalog check looks for it in the source.
 */
export function msg(english: string): string {
  return english;
}
