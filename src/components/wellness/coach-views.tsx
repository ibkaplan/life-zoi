"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { EvidenceLine, PracticeCard, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { useSession } from "@/components/session-provider";
import { useWellness } from "@/components/wellness/use-wellness";
import { challengeById } from "@/lib/wellness/challenges";
import { ORGANIC_LABELS, coachModules, coachPractices, habitLesson } from "@/lib/wellness/coach";
import type { ReminderSlot } from "@/lib/wellness/types";

const REMINDERS: { id: ReminderSlot; label: string }[] = [
  { id: "morning", label: msg("Morning") },
  { id: "midday", label: msg("Midday") },
  { id: "evening", label: msg("Evening") },
];

/** One sentence per slot, so each language can use its own word order. */
const SLOT_REMINDER: Record<ReminderSlot, string> = {
  morning: msg("This is your morning reminder to notice the bottle or glass."),
  midday: msg("This is your midday reminder to notice the bottle or glass."),
  evening: msg("This is your evening reminder to notice the bottle or glass."),
};

export function CoachHome() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <header className="stack">
        <p className="kicker">{t("Everyday Wellness Coach")}</p>
        <h1>{t("Learn how a habit is built")}</h1>
        <p className="lede">
          {t("This coach teaches cues, small actions, and check-ins. It is educational. It does not diagnose, change medication, or predict a lifespan.")}
        </p>
      </header>
      {habitLesson.map((block) => (
        <section key={block.heading} className="card stack">
          <h2>{t(block.heading)}</h2>
          <p>{t(block.body)}</p>
          <EvidenceLine kind={block.evidence} note={block.evidenceNote} />
          <WellnessSources ids={block.sourceIds} />
        </section>
      ))}
      <div className="stack">
        {coachModules.map((module) => (
          <Link key={module.slug} className="card learn-link" href={`/wellness-coach/${module.slug}`}>
            <h2>{t(module.title)}</h2>
            <p>{t(module.summary)}</p>
          </Link>
        ))}
        <Link className="card learn-link" href="/wellness-coach/practice">
          <h2>{t("Practical daily coaching")}</h2>
          <p>{t("Each card tells you why, what, when, supplies, an easier option, and a check-in.")}</p>
        </Link>
        <Link className="card learn-link" href="/habits">
          <h2>{t("Challenges")}</h2>
          <p>{t("The same 7-day challenges and the 30-day journey used across lifeZoi.")}</p>
        </Link>
      </div>
    </div>
  );
}

export function CoachModuleView({ slug }: { slug: string }) {
  const t = useT();
  const topic = coachModules.find((item) => item.slug === slug);
  if (!topic) return null;
  const challenge = topic.challengeId ? challengeById(topic.challengeId) : null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Everyday Wellness Coach")}</p>
      <h1>{t(topic.title)}</h1>
      <p className="lede">{t(topic.summary)}</p>
      {slug === "hydration" ? <HydrationReminder /> : null}
      {slug === "organic" ? (
        <section className="card stack">
          <h2>{t("The labels")}</h2>
          {ORGANIC_LABELS.map((label) => (
            <p key={label.officialName}>
              <strong>{label.officialName}.</strong> {t(label.text)}
            </p>
          ))}
          <WellnessSources ids={["usda-organic-labels"]} />
        </section>
      ) : null}
      {topic.blocks.map((block) => (
        <section key={block.heading} className="card stack">
          <h2>{t(block.heading)}</h2>
          <p>{t(block.body)}</p>
          <EvidenceLine kind={block.evidence} note={block.evidenceNote} />
          <WellnessSources ids={block.sourceIds} />
        </section>
      ))}
      {topic.practices.map((item) => (
        <PracticeCard key={item.id} item={item} />
      ))}
      {challenge ? (
        <p>
          <Link className="btn btn-secondary" href={`/habits/${challenge.id}`}>
            {t("Open the {title}", { title: t(challenge.title) })}
          </Link>
        </p>
      ) : null}
      {slug === "food" ? (
        <p>
          <Link className="btn btn-secondary" href="/habits/fruit">
            {t("Open the 7-day fruit routine")}
          </Link>
        </p>
      ) : null}
      <Link href="/wellness-coach">{t("Back to the coach")}</Link>
    </div>
  );
}

export function PracticeList() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Everyday Wellness Coach")}</p>
      <h1>{t("Practical daily coaching")}</h1>
      <p className="lede">
        {t("Use one card today. The check-in stays in this browser tab. Sample data cannot be written into your saved notes.")}
      </p>
      {coachPractices.map((item) => (
        <PracticeCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function HydrationReminder() {
  const t = useT();
  const wellness = useWellness();
  const { sample } = useSession();
  const hour = new Date().getHours();
  const slot: ReminderSlot = hour < 11 ? "morning" : hour < 17 ? "midday" : "evening";
  const show = wellness.log.reminders.includes(slot) && wellness.log.reminderSeenOn !== wellness.today;

  return (
    <section className="card stack">
      <h2>{t("A gentle reminder in this tab")}</h2>
      <p>
        {t("Choose the parts of the day when you want this page to mention your bottle. It is not a phone alert, and it is not a target for how much to drink.")}
      </p>
      <ReadOnlyNote message={sample ? wellness.readOnlyMessage : null} />
      <div className="actions">
        {REMINDERS.map((item) => (
          <button
            key={item.id}
            className="btn btn-secondary"
            type="button"
            aria-pressed={wellness.log.reminders.includes(item.id)}
            onClick={() => wellness.toggleReminder(item.id)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>
      {show ? (
        <p role="status">
          {t(SLOT_REMINDER[slot])}{" "}
          <button className="btn btn-ghost" type="button" onClick={() => wellness.dismissReminder()}>
            {t("Hide for today")}
          </button>
        </p>
      ) : null}
    </section>
  );
}
