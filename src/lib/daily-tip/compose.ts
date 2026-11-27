import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import { CATALOG_LOADERS, makeTranslate, msg, type Translate } from "@/lib/i18n/translate";
import { AREA_LABELS, type DailyTip } from "./tips";

const SUBJECT = msg("Your LifeZoi tip for today: {area}");
const FOOTER = msg("A general wellness idea from LifeZoi, not medical advice. Change the time or language, or stop these tips, at {link}");
const TELEGRAM_HEAD = msg("LifeZoi tip for today");

export const SETTINGS_PATH = "/daily/tip";

export async function translatorFor(locale: Locale): Promise<Translate> {
  if (locale === "en") return makeTranslate(null);
  try {
    return makeTranslate(await CATALOG_LOADERS[locale]());
  } catch {
    return makeTranslate(null);
  }
}

/** The email and Telegram text for one tip. Only the tip and a settings link: nothing about the person. */
export function composeTip(tip: DailyTip, t: Translate, siteUrl: string, locale: Locale) {
  const link = `${siteUrl.replace(/\/$/, "")}${SETTINGS_PATH}`;
  const area = t(AREA_LABELS[tip.area]);
  const body = t(tip.text);
  const footer = t(FOOTER, { link });
  return {
    subject: t(SUBJECT, { area }),
    emailText: `${body}\n\n—\n${footer}`,
    telegramText: `🌿 ${t(TELEGRAM_HEAD)} · ${area}\n\n${body}\n\n${footer}`,
    headers: { "List-Unsubscribe": `<${link}>`, "Content-Language": LOCALE_META[locale].htmlLang },
  };
}
