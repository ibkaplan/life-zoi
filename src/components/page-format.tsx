"use client";

import { useLocale } from "@/components/locale-provider";
import { formatMonth } from "@/lib/dates";
import { LOCALE_META } from "@/lib/i18n/config";
import { longDateIn, timestampIn } from "@/lib/page-format";

/** The page's `t` plus dates and months written in the chosen language. */
export function usePageFormat() {
  const { locale, t } = useLocale();
  const lang = LOCALE_META[locale].htmlLang;
  return {
    t,
    locale,
    lang,
    longDate: (isoDate: string) => longDateIn(isoDate, lang),
    timestamp: (iso: string) => timestampIn(iso, lang, t),
    month: (isoMonth: string) => (locale === "en" ? formatMonth(isoMonth) : formatMonth(isoMonth, lang)),
  };
}

/**
 * Places a link inside a translated sentence: `withLink(t("Read {link} first."), <Link …>the guide</Link>)`.
 * The sentence keeps its own word order in every language.
 */
export function withLink(sentence: string, link: React.ReactNode): React.ReactNode {
  const [before, ...rest] = sentence.split("{link}");
  if (rest.length === 0) return sentence;
  return (
    <>
      {before}
      {link}
      {rest.join("")}
    </>
  );
}
