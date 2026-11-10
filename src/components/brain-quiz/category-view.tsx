"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { activitiesFor, categoryMeta, parseDifficulty } from "@/lib/brain-quiz/catalog";
import type { CategoryId } from "@/lib/brain-quiz/progress";
import { useLocale } from "@/components/locale-provider";
import { localizeActivity, titleText } from "@/lib/brain-quiz/localize";

export function CategoryView({ category }: { category: CategoryId }) {
  const { locale, t } = useLocale();
  const params = useSearchParams();
  const level = parseDifficulty(params.get("level"));
  const meta = categoryMeta(category);
  const items = activitiesFor(category, level).map((item) => localizeActivity(item, locale));

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">{t("Back to Brain & Habit Quiz")}</Link></p>
      <section className="stack">
        <p className="kicker">{t(level)}</p>
        <h1>{t(meta.title)}</h1>
        <p className="lede">{t(meta.blurb)}</p>
      </section>
      <div className="stack">
        {items.map((item) => (
          <Link key={item.id} className="card learn-link" href={`/brain-quiz/${category}/${item.id}?level=${level}`}>
            <h2>{titleText(item.title, t)}</h2>
            <p>{t(item.prompt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
