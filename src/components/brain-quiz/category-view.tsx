"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { activitiesFor, categoryMeta, parseDifficulty } from "@/lib/brain-quiz/catalog";
import type { CategoryId } from "@/lib/brain-quiz/progress";

export function CategoryView({ category }: { category: CategoryId }) {
  const params = useSearchParams();
  const level = parseDifficulty(params.get("level"));
  const meta = categoryMeta(category);
  const items = activitiesFor(category, level);

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">Back to Brain & Habit Quiz</Link></p>
      <section className="stack">
        <p className="kicker">{level}</p>
        <h1>{meta.title}</h1>
        <p className="lede">{meta.blurb}</p>
      </section>
      <div className="stack">
        {items.map((item) => (
          <Link key={item.id} className="card learn-link" href={`/brain-quiz/${category}/${item.id}?level=${level}`}>
            <h2>{item.title}</h2>
            <p>{item.prompt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
