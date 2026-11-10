"use client";

import { Fragment, type ReactNode } from "react";
import { useLocale } from "@/components/locale-provider";
import { formatLongDate, formatMonth } from "@/lib/dates";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg, type Translate } from "@/lib/i18n/translate";
import type { PlanActivity } from "@/lib/companion/day-plan";

/** Dates in the chosen language. English keeps the exact US format used before. */
export function useDates() {
  const { locale } = useLocale();
  const lang = locale === "en" ? "en-US" : LOCALE_META[locale].htmlLang;
  function long(iso: string): string {
    if (locale === "en") return formatLongDate(iso);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return iso;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return new Intl.DateTimeFormat(lang, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
  }
  function weekdayShort(iso: string): string {
    return new Date(`${iso}T12:00:00`).toLocaleDateString(locale === "en" ? "en" : lang, { weekday: "short" });
  }
  return { locale, lang, long, month: (isoMonth: string) => formatMonth(isoMonth, lang), weekdayShort };
}

/** Steps that a written goal turns into. The English matches goalActivity in day-plan.ts. */
const GOAL_STEPS: Record<string, { full: string; step: string }> = {
  "a short walk": { full: msg("Toward “{goal}”: a short walk"), step: msg("a short walk") },
  "read a few pages": { full: msg("Toward “{goal}”: read a few pages"), step: msg("read a few pages") },
  "a calm evening": { full: msg("Toward “{goal}”: a calm evening"), step: msg("a calm evening") },
  "five slow breaths": { full: msg("Toward “{goal}”: five slow breaths"), step: msg("five slow breaths") },
  "a brain game": { full: msg("Toward “{goal}”: a brain game"), step: msg("a brain game") },
  "one small food step": { full: msg("Toward “{goal}”: one small food step"), step: msg("one small food step") },
  "reach out to someone": { full: msg("Toward “{goal}”: reach out to someone"), step: msg("reach out to someone") },
  "a short session": { full: msg("Toward “{goal}”: a short session"), step: msg("a short session") },
};

const GOAL_TITLE = /^Toward “([\s\S]*)”(?:: (.+))?$/;

/** An activity title in the chosen language, including titles built from a goal in the person's own words. */
export function activityTitle(title: string, t: Translate): string {
  const match = GOAL_TITLE.exec(title);
  if (!match) return t(title);
  const goal = match[1] ?? "";
  const step = match[2] ? GOAL_STEPS[match[2]] : undefined;
  if (step) return t(step.full, { goal });
  if (!match[2]) return t("Toward “{goal}”", { goal });
  return t(title);
}

/** Only the daily step of a goal, for the goals list. */
export function goalStep(activity: PlanActivity, t: Translate): string {
  const match = GOAL_TITLE.exec(activity.title);
  const step = match?.[2] ? GOAL_STEPS[match[2]] : undefined;
  if (step) return t(step.step);
  // Same rule as before: a title without a step after the colon is shown whole.
  const rest = activity.title.replace(/^Toward “.*”: ?/, "");
  if (!rest) return t("one small step");
  return rest === activity.title ? activityTitle(activity.title, t) : t(rest);
}

/**
 * A translated sentence with links or emphasis inside it. The text marks each part with
 * numbered tags, `"Open <0>My Day</0> whenever you like."`, so a translation can move it.
 */
export function Rich({ text, parts }: { text: string; parts: ((label: string) => ReactNode)[] }) {
  const out: ReactNode[] = [];
  const pattern = /<(\d)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const render = parts[Number(match[1])];
    out.push(<Fragment key={index}>{render ? render(match[2] ?? "") : match[2]}</Fragment>);
    index += 1;
    last = at + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
