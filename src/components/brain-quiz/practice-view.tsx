"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { activityById, parseDifficulty } from "@/lib/brain-quiz/catalog";
import { QuizActivity } from "@/components/brain-quiz/quiz-activity";

export function PracticeView({ activityId }: { activityId: string }) {
  const params = useSearchParams();
  const level = parseDifficulty(params.get("level"));
  const activity = activityById(activityId);
  if (!activity) return null;

  return (
    <div className="stack-lg">
      <p>
        <Link href={`/brain-quiz/${activity.category}?level=${level}`}>Back to {activity.category}</Link>
        {" · "}
        <Link href="/brain-quiz">Brain & Habit Quiz</Link>
      </p>
      <article className="card">
        <QuizActivity activity={activity} />
      </article>
    </div>
  );
}
