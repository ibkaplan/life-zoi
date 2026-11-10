"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { EvidenceLine, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { useWellness } from "@/components/wellness/use-wellness";
import { LOCALE_META } from "@/lib/i18n/config";
import type { Translate } from "@/lib/i18n/translate";
import { challengeDayKey, daysSinceStart } from "@/lib/wellness/challenges";
import type { Challenge } from "@/lib/wellness/types";

/** Day titles of the 30-day nature challenge carry their own "Day N: " prefix. */
function stepTitle(title: string, t: Translate) {
  const match = /^Day (\d+): (.+)$/.exec(title);
  return match ? t("Day {day}: {title}", { day: match[1], title: t(match[2]) }) : t(title);
}

/** English keeps the stored ISO date; other languages read it as a written date. */
function shownDate(iso: string, locale: string) {
  if (locale === "en") return iso;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ChallengePanel({ challenge }: { challenge: Challenge }) {
  const wellness = useWellness();
  const t = useT();
  const { locale } = useLocale();
  const [message, setMessage] = useState<string | null>(null);
  const start = wellness.log.challengeStarts.find((item) => item.challengeId === challenge.id);
  const offset = start ? daysSinceStart(start.startedOn, wellness.today) : -1;
  const finished = start ? wellness.log.checks.filter((item) => item.done && item.id.startsWith(`${challenge.id}-day-`)) : [];
  const uniqueDone = new Set(finished.map((item) => item.id)).size;

  return (
    <div className="stack">
      <p>{t(challenge.summary)}</p>
      <p>
        {start
          ? t("Started {date}. {done} of {total} days have a completion mark.", {
              date: shownDate(start.startedOn, LOCALE_META[locale].htmlLang),
              done: uniqueDone,
              total: challenge.plan.length,
            })
          : t("Start when you want. The days stay in this browser tab until you close it.")}
      </p>
      <p>
        {t(
          "A missed day can be followed by the next small step. NIH describes setbacks as part of changing a habit. Nothing here is a score, and your worth does not depend on a streak.",
        )}
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{t(message)}</p> : null}
      {!start ? (
        <button className="btn btn-primary" type="button" onClick={() => setMessage(wellness.startChallenge(challenge.id))}>
          {t("Start this challenge")}
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
        <Link href="/habits">{t("All challenges")}</Link>
      </p>
      <EvidenceLine
        kind="established"
        note={t(
          "The daily actions point at the public pages linked on each day. Encouragement to continue after a miss comes from NIH’s habit guidance. It is not a promise of a health result.",
        )}
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
  const t = useT();
  const [note, setNote] = useState(wellness.reflection(id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.log.checks.some((item) => item.id === id && item.done);

  return (
    <li className="card stack">
      <h3>{t("Day {day}: {title}", { day: index + 1, title: stepTitle(step.title, t) })}</h3>
      <p>{t(step.what)}</p>
      <p><strong>{t("When.")}</strong> {t(step.when)}</p>
      <p><strong>{t("An easier option.")}</strong> {t(step.alternative)}</p>
      <WellnessSources ids={step.sourceIds} />
      {open ? (
        <>
          {message ? <p role="status">{t(message)}</p> : null}
          <button
            className="btn btn-primary"
            type="button"
            aria-pressed={done}
            onClick={() => setMessage(wellness.toggleCheck(id, note))}
          >
            {done ? t("Completed") : t("Mark this day complete")}
          </button>
          <label className="field">
            <span>{t("Reflection")}</span>
            <textarea value={note} maxLength={280} rows={3} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="btn btn-secondary" type="button" onClick={() => setMessage(wellness.saveReflection(id, note))}>
            {t("Save reflection")}
          </button>
        </>
      ) : (
        <p className="hint">{index === 0 && !done ? t("Start the challenge to check off days.") : t("This day opens on its calendar day.")}</p>
      )}
    </li>
  );
}
