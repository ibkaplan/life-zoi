"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { storageLine, useFoodPlan } from "@/components/food-plan/use-food-plan";
import { msg } from "@/lib/i18n/translate";

const LINKS = [
  ["/food-plan", msg("Overview")],
  ["/food-plan/today", msg("Today's meals")],
  ["/food-plan/preferences", msg("My food choices")],
  ["/food-plan/seasonal", msg("Seasonal")],
  ["/food-plan/modern", msg("Modern")],
  ["/food-plan/ayurveda", msg("Ayurveda")],
  ["/food-plan/profile", msg("Profile")],
  ["/food-plan/week", msg("Week")],
  ["/food-plan/favorites", msg("Favorites")],
  ["/food-plan/shopping", msg("Shopping")],
  ["/food-plan/progress", msg("Progress")],
  ["/food-plan/spices", msg("Spices")],
  ["/food-plan/science", msg("Science")],
  ["/food-plan/protein", msg("Protein")],
  ["/food-plan/simple", msg("Simple meals")],
] as const;

/** Translation plus numbers written the way the chosen language writes them (1.5 in English, 1,5 in Ukrainian). */
export function useFoodFormat() {
  const { t, locale } = useLocale();
  const n = (value: number, digits = 1) =>
    value.toLocaleString(LOCALE_META[locale].htmlLang, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
  const plain = (value: number) => value.toLocaleString(LOCALE_META[locale].htmlLang, { maximumFractionDigits: 3, useGrouping: false });
  return { t, n, plain, locale };
}

export function FoodMark({ label }: { label: string }) {
  return (
    <svg className="food-mark" viewBox="0 0 64 64" role="img" aria-hidden={label ? undefined : true} aria-label={label || undefined}>
      <rect width="64" height="64" rx="16" fill="#f4efe4" />
      <circle cx="32" cy="34" r="14" fill="#d7ebdd" stroke="#2f6b4f" strokeWidth="2" />
      <path d="M32 14c2 6 2 10 0 16" fill="none" stroke="#2f6b4f" strokeWidth="2" />
      <path d="M24 28c6 2 10 2 16 0" fill="none" stroke="#6A3DA8" strokeWidth="2" />
    </svg>
  );
}

export function FoodFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { phase, sample } = useFoodPlan();
  const { t } = useFoodFormat();
  return (
    <div className="stack-lg">
      <nav className="food-nav" aria-label={t("Food and wellness")}>
        {LINKS.map(([href, label]) => {
          const current = href === "/food-plan" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={current ? "page" : undefined}>
              {t(label)}
            </Link>
          );
        })}
      </nav>
      <p className="hint">{t(storageLine(phase))}</p>
      {sample ? <p className="hint">{t("Sample data is read-only.")}</p> : null}
      {children}
    </div>
  );
}

export function FoodNumbers({
  kcal,
  protein,
  fiber,
  sat,
  sodium,
}: {
  kcal: number;
  protein: number;
  fiber: number | null;
  sat: number | null;
  sodium?: number | null;
}) {
  const { t, n } = useFoodFormat();
  const grams = (value: number) => t("{amount} g", { amount: n(value) });
  return (
    <dl className="food-numbers">
      <div>
        <dt>{t("Protein")}</dt>
        <dd>{grams(protein)}</dd>
      </div>
      <div>
        <dt>{t("Calories")}</dt>
        <dd>{t("{amount} kcal", { amount: n(kcal) })}</dd>
      </div>
      <div>
        <dt>{t("Saturated fat")}</dt>
        <dd>{sat === null ? t("Not reported") : grams(sat)}</dd>
      </div>
      <div>
        <dt>{t("Fiber")}</dt>
        <dd>{fiber === null ? t("Not reported") : grams(fiber)}</dd>
      </div>
      {sodium !== undefined ? (
        <div>
          <dt>{t("Sodium")}</dt>
          <dd>{sodium === null ? t("Not reported") : t("{amount} mg", { amount: n(sodium, 0) })}</dd>
        </div>
      ) : null}
    </dl>
  );
}
