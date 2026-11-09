"use client";

import Link from "next/link";
import { useState } from "react";
import { Reader } from "@/components/companion/books-view";
import { MealCard } from "@/components/companion/food-view";
import { IndoorAlternative, MovementFinder } from "@/components/companion/movement-finder";
import { MusicPlayer } from "@/components/companion/music-view";
import { ActivityActions } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { useSession } from "@/components/session-provider";
import { bookById } from "@/lib/companion/books";
import type { PlanActivity } from "@/lib/companion/day-plan";
import { trackById } from "@/lib/companion/music";
import { mealsForDay, nutritionGoalFor } from "@/lib/companion/nutrition";
import { commitCompanion } from "@/lib/companion/store";
import { withDay } from "@/lib/companion/state";
import { localISODate } from "@/lib/dates";

function TodayMeal({ slot }: { slot: "breakfast" | "lunch" | "dinner" | "snack" }) {
  const { answers, companion } = useProfile();
  const { session } = useSession();
  const today = localISODate();
  const goal = nutritionGoalFor(answers?.primaryGoal ?? "", answers?.wellnessGoals ?? []);
  const day = mealsForDay(answers, companion.food, goal, today, session.foodPlan.profile);
  const pick = day.slots[slot][0];
  if (!pick) return <p className="hint">No idea passes all of your exclusions for this meal. <Link href="/food-plan/preferences">Check your food choices</Link>.</p>;
  return (
    <>
      <MealCard suggestion={pick} showKcal={companion.food.calorieTracking && !session.foodPlan.profile.eatingDisorder} />
      <p>
        <Link href="/food-plan/today">See other ideas and the shopping list</Link>
      </p>
    </>
  );
}

function WalkContent({ activityId }: { activityId: string }) {
  const { companion, sample } = useProfile();
  const today = localISODate();
  const inside = companion.days[today]?.stayInside ?? false;
  if (inside) {
    return (
      <>
        <IndoorAlternative activityId={`${activityId}-indoor`} />
        {!sample ? (
          <button className="btn btn-ghost" type="button" onClick={() => commitCompanion((state) => withDay(state, today, (day) => ({ ...day, stayInside: false })))}>
            I would like to walk after all
          </button>
        ) : null}
      </>
    );
  }
  return (
    <div className="stack">
      <p>Would you like to go for a walk today?</p>
      <div className="lz-buttons">
        <button className="btn btn-ghost" type="button" disabled={sample} onClick={() => commitCompanion((state) => withDay(state, today, (day) => ({ ...day, stayInside: true })))}>
          Not today, I&apos;ll stay inside
        </button>
      </div>
    </div>
  );
}

/** One plan or My Day activity. Its content opens right here: no new page. */
export function ActivityCard({ activity, activityId, onReplace, time }: { activity: PlanActivity; activityId: string; onReplace?: () => void; time?: string }) {
  const { companion, sample } = useProfile();
  const [open, setOpen] = useState(false);
  const entry = companion.days[localISODate()]?.entries[activityId];
  const view = activity.view;
  const startLabel = view.type === "music" ? "Play" : view.type === "book" ? "Read" : view.type === "meal" ? "Show the meal" : "Start";
  // Players and games count their own minutes, pages, and games, so they are not counted twice here.
  const counted = activity.counts === "walkingMinutes" || activity.counts === "exerciseMinutes" || activity.counts === "nutritionHabits" ? activity.counts : null;
  const track = view.type === "music" ? trackById(view.trackId) : null;
  const book = view.type === "book" ? bookById(view.bookId) : null;
  return (
    <div className="lz-activity" data-status={entry?.status}>
      <div>
        {time ? <p className="kicker">{time}</p> : null}
        <h3>{activity.title}</h3>
        <p className="hint">About {activity.minutes} minutes</p>
      </div>
      <button className="btn btn-primary" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Close" : startLabel}
      </button>
      {open ? (
        <div className="stack">
          {view.type !== "meal" ? (
            <ol>
              {activity.instructions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          ) : null}
          {view.type === "movement" ? <MovementFinder activityId={activityId} initialCategory={view.category} choices={[view.category]} compact /> : null}
          {view.type === "walk" ? <WalkContent activityId={activityId} /> : null}
          {view.type === "meal" ? <TodayMeal slot={view.slot} /> : null}
          {track ? <MusicPlayer track={track} /> : null}
          {book ? <Reader book={book} /> : null}
          {view.type === "game" ? (
            <Link className="btn btn-secondary" href={view.href}>
              Open the games
            </Link>
          ) : null}
          {view.type === "link" ? (
            <Link className="btn btn-secondary" href={view.href}>
              {view.label}
            </Link>
          ) : null}
        </div>
      ) : null}
      {view.type !== "movement" || !open ? (
        sample ? (
          <p className="hint">Sample data is on, so nothing is recorded.</p>
        ) : (
          <ActivityActions
            activityId={activityId}
            minutes={activity.minutes}
            counts={counted ? (status) => ({ [counted]: status === "skipped" ? 0 : counted === "nutritionHabits" ? 1 : status === "partial" ? Math.round(activity.minutes / 2) : activity.minutes }) : undefined}
            onReplace={onReplace}
          />
        )
      ) : null}
    </div>
  );
}
