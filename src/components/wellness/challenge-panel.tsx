"use client";

import Link from "next/link";
import { useState } from "react";
import { EvidenceLine, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { useWellness } from "@/components/wellness/use-wellness";
import { challengeDayKey, daysSinceStart } from "@/lib/wellness/challenges";
import type { Challenge } from "@/lib/wellness/types";

export function ChallengePanel({ challenge }: { challenge: Challenge }) {
  const wellness = useWellness();
  const [message, setMessage] = useState<string | null>(null);
  const start = wellness.log.challengeStarts.find((item) => item.challengeId === challenge.id);
  const offset = start ? daysSinceStart(start.startedOn, wellness.today) : -1;
  const finished = start ? wellness.log.checks.filter((item) => item.done && item.id.startsWith(`${challenge.id}-day-`)) : [];
  const uniqueDone = new Set(finished.map((item) => item.id)).size;

  return (
    <div className="stack">
      <p>{challenge.summary}</p>
      <p>
        {start
          ? `Started ${start.startedOn}. ${uniqueDone} of ${challenge.plan.length} days have a completion mark.`
          : "Start when you want. The days stay in this browser tab until you close it."}
      </p>
      <p>A missed day can be followed by the next small step. NIH describes setbacks as part of changing a habit. Nothing here is a score, and your worth does not depend on a streak.</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{message}</p> : null}
      {!start ? (
        <button className="btn btn-primary" type="button" onClick={() => setMessage(wellness.startChallenge(challenge.id))}>
          Start this challenge
        </button>
      ) : null}
      <ol className="stack">
        {challenge.plan.map((step, index) => {
          const id = challengeDayKey(challenge.id, index);
          const open = start ? offset >= index : false;
          return <ChallengeDayRow key={id} id={id} index={index} open={open} step={step} />;
        })}
      </ol>
      <p>
        <Link href="/habits">All challenges</Link>
      </p>
      <EvidenceLine
        kind="established"
        note="The daily actions point at the public pages linked on each day. Encouragement to continue after a miss comes from NIH’s habit guidance. It is not a promise of a health result."
      />
      <WellnessSources ids={["nih-habits"]} />
    </div>
  );
}

function ChallengeDayRow({
  id,
  index,
  open,
  step,
}: {
  id: string;
  index: number;
  open: boolean;
  step: { title: string; what: string; when: string; alternative: string; sourceIds: string[] };
}) {
  const wellness = useWellness();
  const [note, setNote] = useState(wellness.reflection(id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.log.checks.some((item) => item.id === id && item.done);

  return (
    <li className="card stack">
      <h3>
        Day {index + 1}: {step.title}
      </h3>
      <p>{step.what}</p>
      <p><strong>When.</strong> {step.when}</p>
      <p><strong>An easier option.</strong> {step.alternative}</p>
      <WellnessSources ids={step.sourceIds} />
      {open ? (
        <>
          {message ? <p role="status">{message}</p> : null}
          <button
            className="btn btn-primary"
            type="button"
            aria-pressed={done}
            onClick={() => setMessage(wellness.toggleCheck(id, note))}
          >
            {done ? "Completed" : "Mark this day complete"}
          </button>
          <label className="field">
            <span>Reflection</span>
            <textarea value={note} maxLength={280} rows={3} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="btn btn-secondary" type="button" onClick={() => setMessage(wellness.saveReflection(id, note))}>
            Save reflection
          </button>
        </>
      ) : (
        <p className="hint">{index === 0 && !done ? "Start the challenge to check off days." : "This day opens on its calendar day."}</p>
      )}
    </li>
  );
}
