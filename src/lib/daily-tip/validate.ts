import { isLocale } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { isTimeZone } from "./schedule";
import { SEND_HOURS, type TipPrefs } from "./types";

export type PrefsCheck = { ok: true; value: TipPrefs } | { ok: false; error: string };

/** Server check for saved choices. The page runs the same rules before sending. */
export function validatePrefs(input: unknown): PrefsCheck {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: msg("The request could not be read.") };
  const raw = input as Record<string, unknown>;
  if (typeof raw.email !== "boolean" || typeof raw.telegram !== "boolean") {
    return { ok: false, error: msg("Choose email, Telegram, or both.") };
  }
  if (!isLocale(raw.locale)) return { ok: false, error: msg("Choose a language for the tip.") };
  if (typeof raw.sendHour !== "number" || !(SEND_HOURS as readonly number[]).includes(raw.sendHour)) {
    return { ok: false, error: msg("Choose a time between 6:00 and 21:00.") };
  }
  if (!isTimeZone(raw.timeZone)) return { ok: false, error: msg("The time zone could not be read. Reload the page and try again.") };
  return { ok: true, value: { email: raw.email, telegram: raw.telegram, locale: raw.locale, sendHour: raw.sendHour, timeZone: raw.timeZone } };
}
