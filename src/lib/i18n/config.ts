/**
 * Languages lifeZoi can show. English is the default and the source text.
 * Translations live in `messages/` as typed TypeScript files, so a missing key
 * fails the typecheck and the parity test. No translation service is called.
 */
export const LOCALES = ["en", "uk", "ru", "el"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Saved in this browser only. It holds a language code, never health information. */
export const LOCALE_STORAGE_KEY = "lifezoi.locale.v1";

export const LOCALE_META: Record<Locale, { flag: string; nativeName: string; short: string; htmlLang: string }> = {
  en: { flag: "🇺🇸", nativeName: "English", short: "EN", htmlLang: "en" },
  uk: { flag: "🇺🇦", nativeName: "Українська", short: "UK", htmlLang: "uk" },
  ru: { flag: "🇷🇺", nativeName: "Русский", short: "RU", htmlLang: "ru" },
  el: { flag: "🇬🇷", nativeName: "Ελληνικά", short: "EL", htmlLang: "el" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the first supported language from the browser's preference list,
 * for example `["uk-UA", "en-US"]` gives `uk`. Anything else gives English.
 */
export function detectLocale(languages: readonly string[] | undefined | null): Locale {
  for (const tag of languages ?? []) {
    if (typeof tag !== "string") continue;
    const base = tag.trim().toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Fills `{name}` placeholders. Unknown placeholders are left as they are. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}
