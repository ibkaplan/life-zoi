"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { activitiesFor, categoryMeta, parseDifficulty } from "@/lib/brain-quiz/catalog";
import { freshFor } from "@/lib/brain-quiz/daily";
import type { CategoryId } from "@/lib/brain-quiz/progress";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { useLocalToday } from "@/components/brain-quiz/use-local-today";
import { useLocale } from "@/components/locale-provider";
import { localizeActivity, promptText, titleText } from "@/lib/brain-quiz/localize";

export function CategoryView({ category }: { category: CategoryId }) {
  const { locale, t } = useLocale();
  const params = useSearchParams();
  const level = parseDifficulty(params.get("level"));
  const meta = categoryMeta(category);
  const { progress, ready } = useBrainProgress();
  const today = useLocalToday();
  const answered = new Set([...progress.attempted, ...progress.awarded]);
  const items = activitiesFor(category, level).map((item) => localizeActivity(item, locale));
  const fresh = ready && today ? freshFor(progress, category, level, today, 6).map((item) => localizeActivity(item, locale)) : [];
  const built = category === "memory" || category === "attention";

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">{t("Back to Brain & Habit Quiz")}</Link></p>
      <section className="stack">
        <p className="kicker">{t(level)}</p>
        <h1>{t(meta.title)}</h1>
        <p className="lede">{t(meta.blurb)}</p>
      </section>
      {fresh.length > 0 ? (
        <section className="stack">
          <h2>{t("Fresh for you today")}</h2>
          <p className="hint">
            {built
              ? t("Each game builds a new layout every day.")
              : t("Questions you have not answered or seen lately come first. A new set is picked each day.")}
          </p>
          <div className="stack">
            {fresh.map((item) => (
              <Link key={item.id} className="card learn-link" href={`/brain-quiz/${category}/${item.id}?level=${level}`}>
                <h3>{titleText(item.title, t)}</h3>
                <p>{promptText(item, t)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section className="stack">
        <h2>{t("All at this level")}</h2>
        <div className="stack">
          {items.map((item) => (
            <Link key={item.id} className="card learn-link" href={`/brain-quiz/${category}/${item.id}?level=${level}`}>
              <h3>{titleText(item.title, t)}</h3>
              <p>{promptText(item, t)}</p>
              {answered.has(item.id) ? <p className="hint">{t("Played")}</p> : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
