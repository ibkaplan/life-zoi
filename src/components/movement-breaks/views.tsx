"use client";

import Link from "next/link";
import { useProfile } from "@/components/companion/use-profile";
import { BodySystemsArt, CalfPumpArt, DeskSitterArt, StepArt } from "@/components/movement-breaks/illustrations";
import { MovementBreakRoutine } from "@/components/movement-breaks/routine";
import { MovementTracker, ReminderSettingsCard } from "@/components/movement-breaks/tracker";
import { MB, REFERENCES, referenceById, type ReferenceId } from "@/lib/movement-breaks/content";
import { sittingProfile, type LifeLine, type SittingReason } from "@/lib/movement-breaks/personal";
import { useT } from "@/components/locale-provider";
import { Rich } from "@/components/companion/i18n";
import { msg, type Translate } from "@/lib/i18n/translate";

const REASON_TEXT: Record<SittingReason, string> = {
  office: msg("you work in an office"),
  computer: msg("you work at a computer"),
  "long-sitting": msg("you sit for many hours at a time"),
  television: msg("you watch television for long periods"),
  driving: msg("you travel seated for long periods"),
  "many-hours": msg("you sit for six hours or more on a usual day"),
  "low-activity": msg("you are active on one day a week or less"),
};

function reasonList(reasons: SittingReason[], t: Translate): string {
  const parts = reasons.map((reason) => t(REASON_TEXT[reason]));
  if (parts.length <= 1) return parts.join("");
  return t("{list} and {last}", { list: parts.slice(0, -1).join(", "), last: parts[parts.length - 1] ?? "" });
}

/** "My current life" lines with a number are rebuilt here; the rest are translated as saved. */
function lineText(line: LifeLine, t: Translate): string {
  const desk = /^I sit at a desk or computer, and sit for about (\d+(?:\.\d+)?) hours a day\.$/.exec(line.text);
  if (desk) return t("I sit at a desk or computer, and sit for about {hours} hours a day.", { hours: desk[1] ?? "" });
  const hours = /^I sit or recline for about (\d+(?:\.\d+)?) hours a day\.$/.exec(line.text);
  if (hours) return t("I sit or recline for about {hours} hours a day.", { hours: hours[1] ?? "" });
  return t(line.text);
}

function SourceLinks({ ids }: { ids: readonly ReferenceId[] }) {
  const t = useT();
  if (ids.length === 0) return null;
  return (
    <p className="hint mb-cite">
      {ids.length > 1 ? t("Sources:") : t("Source:")}{" "}
      {ids.map((id, index) => {
        const ref = referenceById(id);
        return (
          <span key={id}>
            {index > 0 ? "; " : ""}
            <a href={ref.url} target="_blank" rel="noopener noreferrer">
              {ref.title}
            </a>
          </span>
        );
      })}
    </p>
  );
}

function FluidCaution() {
  const t = useT();
  return <p className="alert">{t(MB.water.fluidCaution)}</p>;
}

export function WaterMovementSection() {
  const t = useT();
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-water-title">
      <h2 id="mb-water-title" className="mb-heading">
        {t(MB.water.heading)}
      </h2>
      <p className="mb-key">{t(MB.water.key)}</p>
      <div className="mb-split">
        <ul className="mb-points">
          {MB.water.points.map((point) => (
            <li key={point}>{t(point)}</li>
          ))}
        </ul>
        <figure className="mb-figure-box">
          <BodySystemsArt />
          <figcaption className="hint">{t(MB.diagram.caption)}</figcaption>
        </figure>
      </div>
      <p>{t(MB.water.notMore)}</p>
      <FluidCaution />
      <SourceLinks ids={["lymph-physiology", "lymph-biomechanics", "calf-pump"]} />
    </section>
  );
}

export function WhyBreakSection() {
  const t = useT();
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-why-title">
      <h2 id="mb-why-title" className="mb-heading">
        {t(MB.why.heading)}
      </h2>
      <p className="mb-key">{t(MB.why.key)}</p>
      <div className="mb-split">
        <p className="lede">{t(MB.why.intro)}</p>
        <DeskSitterArt />
      </div>
      <div className="mb-topics">
        {MB.why.topics.map((topic, index) => (
          <article key={topic.id} className="mb-topic">
            <h3>
              <span className="mb-topic-letter" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>{" "}
              {t(topic.title)}
            </h3>
            {topic.id === "circulation" ? <CalfPumpArt animate /> : null}
            {topic.id === "lymph" ? <BodySystemsArt /> : null}
            {topic.id === "blood-sugar" ? <StepArt step="walk" seated={false} animate /> : null}
            {topic.id === "vessels" ? <DeskSitterArt /> : null}
            {topic.id === "joints" ? <StepArt step="ankles" seated animate /> : null}
            {topic.body.map((line) => (
              <p key={line}>{t(line)}</p>
            ))}
            <SourceLinks ids={topic.sources} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function SecondHeartSection() {
  const t = useT();
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-calf-heading">
      <h2 id="mb-calf-heading" className="mb-heading">
        {t(MB.calves.heading)}
      </h2>
      <p className="mb-key">{t(MB.calves.key)}</p>
      <div className="mb-split">
        <ol className="mb-points mb-big-text">
          {MB.calves.points.map((point) => (
            <li key={point}>{t(point)}</li>
          ))}
        </ol>
        <div className="mb-pair">
          <figure className="mb-figure-box">
            <CalfPumpArt />
            <figcaption className="hint">{t(MB.calves.labels.relaxed)}</figcaption>
          </figure>
          <figure className="mb-figure-box">
            <CalfPumpArt squeeze />
            <figcaption className="hint">{t(MB.calves.labels.squeeze)}</figcaption>
          </figure>
        </div>
      </div>
      <p className="hint">{t(MB.calves.nickname)}</p>
      <div className="mb-pair">
        <figure className="mb-figure-box">
          <StepArt step="walk" seated={false} animate />
          <figcaption className="hint">{t("Walking: the calves tighten with every step.")}</figcaption>
        </figure>
        <figure className="mb-figure-box">
          <StepArt step="heels" seated={false} animate />
          <figcaption className="hint">{t("Heel raises, holding something sturdy.")}</figcaption>
        </figure>
      </div>
      <SourceLinks ids={["calf-pump"]} />
    </section>
  );
}

export function ThirtyMinuteSection() {
  const t = useT();
  return (
    <section className="card stack mb-rule" aria-labelledby="mb-rule-title">
      <h2 id="mb-rule-title" className="mb-rule-title">
        {t(MB.rule.heading)}
      </h2>
      <p className="mb-key">{t(MB.rule.explain)}</p>
      <p>{t(MB.rule.notDeadline)}</p>
      <p>
        <strong>{t(MB.rule.suggestion)}</strong> {t(MB.rule.walkBetter)}
      </p>
      <SourceLinks ids={["ada-activity", "sedentary-physiology", "break-frequency"]} />
    </section>
  );
}

export function BreathingSection() {
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="mb-breath-title">
      <h2 id="mb-breath-title">{t(MB.breathing.heading)}</h2>
      <p>{t(MB.breathing.intro)}</p>
      <div className="mb-topics">
        {MB.breathing.practices.map((item) => (
          <article key={item.title} className="mb-topic">
            <h3>{t(item.title)}</h3>
            <p>{t(item.text)}</p>
          </article>
        ))}
      </div>
      <p className="alert">{t(MB.breathing.safety)}</p>
      <p className="hint">
        <Rich
          text={t("For a guided tone to breathe with, open the breathing sounds in <0>Relaxing music</0>.")}
          parts={[(label) => <Link href="/library/music">{label}</Link>]}
        />{" "}
        {t(MB.breathing.followUp)}
      </p>
    </section>
  );
}

export function PrinciplesSection() {
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="mb-principles-title">
      <h2 id="mb-principles-title" className="mb-heading">
        {t(MB.principles.heading)}
      </h2>
      <p>{t(MB.principles.intro)}</p>
      <ol className="mb-principles">
        {MB.principles.items.map((item) => (
          <li key={item.word}>
            <strong>{t(item.word)}</strong>
            <span>{t(item.text)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SafetySection() {
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="mb-safety-title">
      <h2 id="mb-safety-title">{t(MB.safety.heading)}</h2>
      <ul>
        {MB.safety.points.map((point) => (
          <li key={point}>{t(point)}</li>
        ))}
        <li>{t(MB.water.fluidCaution)}</li>
      </ul>
      <p className="alert alert-error">
        <strong>{t(MB.safety.dvt)}</strong>
      </p>
    </section>
  );
}

function EvidenceSection() {
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="mb-evidence-title">
      <h2 id="mb-evidence-title">{t(MB.evidence.heading)}</h2>
      <p>{t(MB.evidence.physiology)}</p>
      <p>{t(MB.evidence.suggestions)}</p>
      <h3>{t("Sources")}</h3>
      <ul className="source-list">
        {REFERENCES.map((ref) => (
          <li key={ref.id}>
            <a href={ref.url} target="_blank" rel="noopener noreferrer">
              {ref.title}
            </a>{" "}
            <span className="hint">
              {t("{publisher}. Used for: {use}", { publisher: t(ref.publisher), use: t(ref.usedFor) })}
              {ref.readDuringBuild ? "" : t(" (Not opened during the build: still to be read by a person.)")}
            </span>
          </li>
        ))}
      </ul>
      <p className="hint">{t(MB.evidence.unread)}</p>
      <p className="hint">{t("This page is general education. It is not a diagnosis or a treatment plan. Ask your healthcare professional what is right for you.")}</p>
    </section>
  );
}

/** A note at the top of the page when the person's own answers point to long sitting. */
function PersonalNote() {
  const { answers } = useProfile();
  const t = useT();
  const profile = sittingProfile(answers);
  if (!profile.highlight) return null;
  return (
    <p className="alert mb-personal">
      <Rich
        text={t("<0>This section is highlighted for you</0> because your assessment says {reasons}.", { reasons: reasonList(profile.reasons, t) })}
        parts={[(label) => <strong>{label}</strong>]}
      />
    </p>
  );
}

/** The full education page inside Movement. */
export function MovementBreaksPage() {
  const t = useT();
  return (
    <div className="stack-lg mb-page">
      <section className="stack">
        <p className="kicker">{t(MB.page.kicker)}</p>
        <h1>{t(MB.page.title)}</h1>
        <p className="lede">{t(MB.page.lede)}</p>
        <PersonalNote />
        <nav className="chip-list" aria-label={t("On this page")}>
          <a className="chip" href="#mb-why-title">{t("Why move")}</a>
          <a className="chip" href="#mb-water-title">{t("Water + movement")}</a>
          <a className="chip" href="#mb-calf-heading">{t("The second heart")}</a>
          <a className="chip" href="#break">{t("The movement break")}</a>
          <a className="chip" href="#mb-tracker-title">{t("Today's tracker")}</a>
          <a className="chip" href="#mb-evidence-title">{t("Sources")}</a>
        </nav>
      </section>
      <WhyBreakSection />
      <WaterMovementSection />
      <SecondHeartSection />
      <ThirtyMinuteSection />
      <MovementBreakRoutine />
      <BreathingSection />
      <MovementTracker />
      <ReminderSettingsCard />
      <PrinciplesSection />
      <SafetySection />
      <EvidenceSection />
    </div>
  );
}

/** My Day: the prompt (prominent when answers point to long sitting), the tracker, and the reminder. */
export function MovementBreakDayCard() {
  const { answers } = useProfile();
  const t = useT();
  const profile = sittingProfile(answers);
  return (
    <section className="stack" aria-labelledby="mb-day-title">
      <div className={profile.highlight ? "card stack mb-rule" : "card stack"}>
        <h2 id="mb-day-title" className={profile.highlight ? "mb-rule-title" : undefined}>
          {profile.highlight ? t(MB.rule.prompt) : t("Drink, breathe, move: short breaks through the day")}
        </h2>
        {profile.highlight ? (
          <p>
            {t("Suggested for you because your assessment says {reasons}.", { reasons: reasonList(profile.reasons, t) })} {t(MB.rule.explain)}
          </p>
        ) : (
          <p>{t(MB.why.intro)}</p>
        )}
        <p className="hint">{t(MB.rule.notDeadline)}</p>
        <div className="lz-buttons">
          <Link className="btn btn-primary mb-big" href="/academy/move/breaks#break">
            {t("Start a 2-minute movement break")}
          </Link>
          <Link className="btn btn-secondary mb-big" href="/academy/move/breaks">
            {t("Why movement breaks matter")}
          </Link>
        </div>
      </div>
      <MovementTracker />
      {profile.highlight ? <ReminderSettingsCard /> : null}
    </section>
  );
}

/** My Life Improvement Plan: My Current Life and My New Life, from the person's own answers. */
export function CurrentNewLife() {
  const { answers } = useProfile();
  const t = useT();
  const profile = sittingProfile(answers);
  if (!answers) {
    return (
      <section className="card stack" aria-labelledby="mb-life-title">
        <h2 id="mb-life-title">{t("Movement breaks and hydration")}</h2>
        <p>
          <Rich
            text={t("<0>Fill out your assessment</0>, including work and daily activity, to see a personal “My Current Life” and “My New Life” for sitting, water, and movement.")}
            parts={[(label) => <Link href="/assessment">{label}</Link>]}
          />
        </p>
      </section>
    );
  }
  return (
    <section className="card stack" aria-labelledby="mb-life-title">
      <h2 id="mb-life-title">{t("Sitting, water, and movement")}</h2>
      {profile.current.length > 0 ? (
        <div className="mb-life">
          <div>
            <h3>{t("My Current Life")}</h3>
            <ul>
              {profile.current.map((line) => (
                <li key={line.id}>{lineText(line, t)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t("My New Life")}</h3>
            <ul className="mb-why-list">
              {profile.next.map((line) => (
                <li key={line.id}>
                  <strong>{t(line.text)}</strong>
                  {line.why ? <span className="hint">{t("Why it matters: {why}", { why: t(line.why) })}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <p>{t("Your answers do not point to long sitting. These everyday habits still help:")}</p>
          <ul className="mb-why-list">
            {profile.next.map((line) => (
              <li key={line.id}>
                <strong>{t(line.text)}</strong>
                {line.why ? <span className="hint">{t("Why it matters: {why}", { why: t(line.why) })}</span> : null}
              </li>
            ))}
          </ul>
        </>
      )}
      <FluidCaution />
      <p>
        <Link href="/academy/move/breaks">{t("Learn why movement breaks matter, and try the 2-minute break")}</Link>
      </p>
    </section>
  );
}

/** Nutrition: a short hydration note that links water with movement. */
export function HydrationNote() {
  const t = useT();
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-hydration-title">
      <h2 id="mb-hydration-title" className="mb-heading">
        {t(MB.water.heading)}
      </h2>
      <p className="mb-key">{t(MB.water.key)}</p>
      <p>{t(MB.water.notMore)}</p>
      <FluidCaution />
      <p>
        <Link href="/academy/move/breaks">{t("How water, movement, breathing, and circulation work together")}</Link>
      </p>
    </section>
  );
}

/** Movement: a link card into the movement-break page. */
export function MovementBreakTeaser() {
  const t = useT();
  return (
    <section className="card stack mb-rule" aria-labelledby="mb-teaser-title">
      <h2 id="mb-teaser-title" className="mb-rule-title">
        {t(MB.rule.heading)}
      </h2>
      <p>
        {t(MB.why.key)} {t("Learn about your calves, the “second heart” of your legs, and follow a 2 to 3 minute break you can do at a desk or in a chair.")}
      </p>
      <Link className="btn btn-primary mb-big" href="/academy/move/breaks">
        {t("Open the movement break")}
      </Link>
    </section>
  );
}
