import { formatLongDate, formatTimestamp, isRealISODate } from "@/lib/dates";
import { makeTranslate, type Translate } from "@/lib/i18n/translate";

export type { Translate };

/** English in, English out. The default for builders that can also take a page's `t`. */
export const englishT: Translate = makeTranslate(null);

type Matcher = { regex: RegExp; names: string[] };
const matchers = new Map<string, Matcher>();

function matcherFor(template: string): Matcher {
  const cached = matchers.get(template);
  if (cached) return cached;
  const parts = template.split(/\{(\w+)\}/);
  const names: string[] = [];
  const source = parts
    .map((part, index) => {
      if (index % 2 === 1) {
        names.push(part);
        return "([\\s\\S]+?)";
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
  const matcher = { regex: new RegExp(`^${source}$`), names };
  matchers.set(template, matcher);
  return matcher;
}

/**
 * Shows English text that a server route built from a template in the chosen language.
 * A fixed sentence is looked up directly. A built one is matched against its English
 * template, and each filled-in piece (an answer label, a number) is translated in turn.
 * Text that matches nothing is shown as it came.
 */
export function localizeBuilt(t: Translate, text: string, templates: readonly string[], depth = 0): string {
  if (!text) return text;
  const direct = t(text);
  if (direct !== text || depth > 3) return direct;
  for (const template of templates) {
    if (!template.includes("{")) continue;
    const { regex, names } = matcherFor(template);
    const found = regex.exec(text);
    if (!found) continue;
    const values: Record<string, string> = {};
    names.forEach((name, index) => {
      values[name] = localizeBuilt(t, found[index + 1] ?? "", templates, depth + 1);
    });
    return t(template, values);
  }
  return text;
}

/** A calendar date such as "March 2, 2026" in the page language. English keeps the existing format. */
export function longDateIn(isoDate: string, lang: string): string {
  if (lang === "en" || !isRealISODate(isoDate)) return formatLongDate(isoDate);
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(lang, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** A saved moment with date and time in the page language. English keeps the existing format. */
export function timestampIn(iso: string, lang: string, t: Translate): string {
  if (lang === "en") return formatTimestamp(iso);
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return t("Unknown date");
  return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}
