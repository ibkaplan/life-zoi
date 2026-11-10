"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { activityById, parseDifficulty } from "@/lib/brain-quiz/catalog";
import { QuizActivity } from "@/components/brain-quiz/quiz-activity";
import { useT } from "@/components/locale-provider";

export function PracticeView({ activityId }: { activityId: string }) {
  const t = useT();
  const params = useSearchParams();
  const level = parseDifficulty(params.get("level"));
  const activity = activityById(activityId);
  if (!activity) return null;

  return (
    <div className="stack-lg">
      <p>
        <Link href={`/brain-quiz/${activity.category}?level=${level}`}>{t("Back to {category}", { category: t(activity.category) })}</Link>
        {" · "}
        <Link href="/brain-quiz">{t("Brain & Habit Quiz")}</Link>
      </p>
      <article className="card">
        <QuizActivity activity={activity} />
      </article>
    </div>
  );
}
