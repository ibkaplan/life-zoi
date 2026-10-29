"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { formatTimestamp } from "@/lib/dates";
import {
  ageLabels,
  alcoholLabels,
  assessmentHasAnswers,
  goalLabels,
  hydrationLabels,
  moodLabels,
  sleepQualityLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
import { LoadingState } from "@/components/sources";
import type { Assessment } from "@/lib/types";

function Row({ term, value }: { term: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function rows(answers: Assessment) {
  return (
    <dl className="review-list">
      <Row term="Name" value={answers.displayName} />
      <Row term="Age range" value={answers.ageRange ? ageLabels[answers.ageRange] : ""} />
      <Row
        term="Sleep"
        value={
          answers.sleepHours
            ? `About ${answers.sleepHours} hours${answers.sleepQuality ? `, ${sleepQualityLabels[answers.sleepQuality]}` : ""}`
            : ""
        }
      />
      <Row
        term="Activity"
        value={
          answers.activityDays
            ? `${answers.activityDays} days a week${answers.activityMinutes ? `, about ${answers.activityMinutes} minutes on those days` : ""}`
            : ""
        }
      />
      <Row
        term="Sitting or reclining"
        value={answers.sedentaryHours ? `About ${answers.sedentaryHours} hours` : ""}
      />
      <Row term="Vegetables and fruit" value={answers.vegetables ? vegetableLabels[answers.vegetables] : ""} />
      <Row term="Water" value={answers.hydration ? hydrationLabels[answers.hydration] : ""} />
      <Row term="Tobacco" value={answers.smoking ? smokingLabels[answers.smoking] : ""} />
      <Row term="Alcohol" value={answers.alcohol ? alcoholLabels[answers.alcohol] : ""} />
      <Row term="Stress" value={answers.stress ? stressLabels[answers.stress] : ""} />
      <Row term="Mood" value={answers.mood ? moodLabels[answers.mood] : ""} />
      <Row term="Social connection" value={answers.social ? socialLabels[answers.social] : ""} />
      <Row term="Focus" value={answers.goals.map((goal) => goalLabels[goal]).join(", ")} />
      <Row term="Note" value={answers.habitNote} />
    </dl>
  );
}

export function ProfileView() {
  const { ready, session } = useSession();
  if (!ready) return <LoadingState label="Loading your session…" />;
  const latest = session.history[0] ?? null;
  const draftStarted = assessmentHasAnswers(session.draft);

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">My Profile</p>
        <h1>Only what you provided</h1>
        <p className="lede">lifeZoi does not add age, diagnoses, or habits you did not enter.</p>
      </div>
      {latest ? (
        <section className="card stack">
          <p className="hint">Latest completed assessment, {formatTimestamp(latest.completedAt)}</p>
          {rows(latest.answers)}
          <Link className="btn btn-secondary" href="/assessment">Update answers</Link>
        </section>
      ) : draftStarted ? (
        <section className="card stack">
          <p className="hint">In progress. This is not a completed assessment yet.</p>
          {rows(session.draft)}
          <Link className="btn btn-primary" href="/assessment">Continue assessment</Link>
        </section>
      ) : (
        <section className="card empty">
          <h2>Your profile is empty</h2>
          <p>It fills in from the lifestyle assessment. Nothing is assumed.</p>
          <Link className="btn btn-primary" href="/assessment">Start assessment</Link>
        </section>
      )}
    </div>
  );
}
