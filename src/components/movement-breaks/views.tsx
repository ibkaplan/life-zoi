"use client";

import Link from "next/link";
import { useProfile } from "@/components/companion/use-profile";
import { BodySystemsArt, CalfPumpArt, DeskSitterArt, StepArt } from "@/components/movement-breaks/illustrations";
import { MovementBreakRoutine } from "@/components/movement-breaks/routine";
import { MovementTracker, ReminderSettingsCard } from "@/components/movement-breaks/tracker";
import { MB, REFERENCES, referenceById, type ReferenceId } from "@/lib/movement-breaks/content";
import { sittingProfile, type SittingReason } from "@/lib/movement-breaks/personal";

const REASON_TEXT: Record<SittingReason, string> = {
  office: "you work in an office",
  computer: "you work at a computer",
  "long-sitting": "you sit for many hours at a time",
  television: "you watch television for long periods",
  driving: "you travel seated for long periods",
  "many-hours": "you sit for six hours or more on a usual day",
  "low-activity": "you are active on one day a week or less",
};

function reasonList(reasons: SittingReason[]): string {
  const parts = reasons.map((reason) => REASON_TEXT[reason]);
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function SourceLinks({ ids }: { ids: readonly ReferenceId[] }) {
  if (ids.length === 0) return null;
  return (
    <p className="hint mb-cite">
      Source{ids.length > 1 ? "s" : ""}:{" "}
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
  return <p className="alert">{MB.water.fluidCaution}</p>;
}

export function WaterMovementSection() {
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-water-title">
      <h2 id="mb-water-title" className="mb-heading">
        {MB.water.heading}
      </h2>
      <p className="mb-key">{MB.water.key}</p>
      <div className="mb-split">
        <ul className="mb-points">
          {MB.water.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <figure className="mb-figure-box">
          <BodySystemsArt />
          <figcaption className="hint">{MB.diagram.caption}</figcaption>
        </figure>
      </div>
      <p>{MB.water.notMore}</p>
      <FluidCaution />
      <SourceLinks ids={["lymph-physiology", "lymph-biomechanics", "calf-pump"]} />
    </section>
  );
}

export function WhyBreakSection() {
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-why-title">
      <h2 id="mb-why-title" className="mb-heading">
        {MB.why.heading}
      </h2>
      <p className="mb-key">{MB.why.key}</p>
      <div className="mb-split">
        <p className="lede">{MB.why.intro}</p>
        <DeskSitterArt />
      </div>
      <div className="mb-topics">
        {MB.why.topics.map((topic, index) => (
          <article key={topic.id} className="mb-topic">
            <h3>
              <span className="mb-topic-letter" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>{" "}
              {topic.title}
            </h3>
            {topic.id === "circulation" ? <CalfPumpArt animate /> : null}
            {topic.id === "lymph" ? <BodySystemsArt /> : null}
            {topic.id === "blood-sugar" ? <StepArt step="walk" seated={false} animate /> : null}
            {topic.id === "vessels" ? <DeskSitterArt /> : null}
            {topic.id === "joints" ? <StepArt step="ankles" seated animate /> : null}
            {topic.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <SourceLinks ids={topic.sources} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function SecondHeartSection() {
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-calf-heading">
      <h2 id="mb-calf-heading" className="mb-heading">
        {MB.calves.heading}
      </h2>
      <p className="mb-key">{MB.calves.key}</p>
      <div className="mb-split">
        <ol className="mb-points mb-big-text">
          {MB.calves.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ol>
        <div className="mb-pair">
          <figure className="mb-figure-box">
            <CalfPumpArt />
            <figcaption className="hint">{MB.calves.labels.relaxed}</figcaption>
          </figure>
          <figure className="mb-figure-box">
            <CalfPumpArt squeeze />
            <figcaption className="hint">{MB.calves.labels.squeeze}</figcaption>
          </figure>
        </div>
      </div>
      <p className="hint">{MB.calves.nickname}</p>
      <div className="mb-pair">
        <figure className="mb-figure-box">
          <StepArt step="walk" seated={false} animate />
          <figcaption className="hint">Walking: the calves tighten with every step.</figcaption>
        </figure>
        <figure className="mb-figure-box">
          <StepArt step="heels" seated={false} animate />
          <figcaption className="hint">Heel raises, holding something sturdy.</figcaption>
        </figure>
      </div>
      <SourceLinks ids={["calf-pump"]} />
    </section>
  );
}

export function ThirtyMinuteSection() {
  return (
    <section className="card stack mb-rule" aria-labelledby="mb-rule-title">
      <h2 id="mb-rule-title" className="mb-rule-title">
        {MB.rule.heading}
      </h2>
      <p className="mb-key">{MB.rule.explain}</p>
      <p>{MB.rule.notDeadline}</p>
      <p>
        <strong>{MB.rule.suggestion}</strong> {MB.rule.walkBetter}
      </p>
      <SourceLinks ids={["ada-activity", "sedentary-physiology", "break-frequency"]} />
    </section>
  );
}

export function BreathingSection() {
  return (
    <section className="card stack" aria-labelledby="mb-breath-title">
      <h2 id="mb-breath-title">{MB.breathing.heading}</h2>
      <p>{MB.breathing.intro}</p>
      <div className="mb-topics">
        {MB.breathing.practices.map((item) => (
          <article key={item.title} className="mb-topic">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="alert">{MB.breathing.safety}</p>
      <p className="hint">
        For a guided tone to breathe with, open the breathing sounds in <Link href="/library/music">Relaxing music</Link>. {MB.breathing.followUp}
      </p>
    </section>
  );
}

export function PrinciplesSection() {
  return (
    <section className="card stack" aria-labelledby="mb-principles-title">
      <h2 id="mb-principles-title" className="mb-heading">
        {MB.principles.heading}
      </h2>
      <p>{MB.principles.intro}</p>
      <ol className="mb-principles">
        {MB.principles.items.map((item) => (
          <li key={item.word}>
            <strong>{item.word}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SafetySection() {
  return (
    <section className="card stack" aria-labelledby="mb-safety-title">
      <h2 id="mb-safety-title">{MB.safety.heading}</h2>
      <ul>
        {MB.safety.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
        <li>{MB.water.fluidCaution}</li>
      </ul>
      <p className="alert alert-error">
        <strong>{MB.safety.dvt}</strong>
      </p>
    </section>
  );
}

function EvidenceSection() {
  return (
    <section className="card stack" aria-labelledby="mb-evidence-title">
      <h2 id="mb-evidence-title">{MB.evidence.heading}</h2>
      <p>{MB.evidence.physiology}</p>
      <p>{MB.evidence.suggestions}</p>
      <h3>Sources</h3>
      <ul className="source-list">
        {REFERENCES.map((ref) => (
          <li key={ref.id}>
            <a href={ref.url} target="_blank" rel="noopener noreferrer">
              {ref.title}
            </a>{" "}
            <span className="hint">
              {ref.publisher}. Used for: {ref.usedFor}
              {ref.readDuringBuild ? "" : " (Not opened during the build: still to be read by a person.)"}
            </span>
          </li>
        ))}
      </ul>
      <p className="hint">{MB.evidence.unread}</p>
      <p className="hint">This page is general education. It is not a diagnosis or a treatment plan. Ask your healthcare professional what is right for you.</p>
    </section>
  );
}

/** A note at the top of the page when the person's own answers point to long sitting. */
function PersonalNote() {
  const { answers } = useProfile();
  const profile = sittingProfile(answers);
  if (!profile.highlight) return null;
  return (
    <p className="alert mb-personal">
      <strong>This section is highlighted for you</strong> because your assessment says {reasonList(profile.reasons)}.
    </p>
  );
}

/** The full education page inside Movement. */
export function MovementBreaksPage() {
  return (
    <div className="stack-lg mb-page">
      <section className="stack">
        <p className="kicker">{MB.page.kicker}</p>
        <h1>{MB.page.title}</h1>
        <p className="lede">{MB.page.lede}</p>
        <PersonalNote />
        <nav className="chip-list" aria-label="On this page">
          <a className="chip" href="#mb-why-title">Why move</a>
          <a className="chip" href="#mb-water-title">Water + movement</a>
          <a className="chip" href="#mb-calf-heading">The second heart</a>
          <a className="chip" href="#break">The movement break</a>
          <a className="chip" href="#mb-tracker-title">Today&apos;s tracker</a>
          <a className="chip" href="#mb-evidence-title">Sources</a>
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
  const profile = sittingProfile(answers);
  return (
    <section className="stack" aria-labelledby="mb-day-title">
      <div className={profile.highlight ? "card stack mb-rule" : "card stack"}>
        <h2 id="mb-day-title" className={profile.highlight ? "mb-rule-title" : undefined}>
          {profile.highlight ? MB.rule.prompt : "Drink, breathe, move: short breaks through the day"}
        </h2>
        {profile.highlight ? (
          <p>
            Suggested for you because your assessment says {reasonList(profile.reasons)}. {MB.rule.explain}
          </p>
        ) : (
          <p>{MB.why.intro}</p>
        )}
        <p className="hint">{MB.rule.notDeadline}</p>
        <div className="lz-buttons">
          <Link className="btn btn-primary mb-big" href="/academy/move/breaks#break">
            Start a 2-minute movement break
          </Link>
          <Link className="btn btn-secondary mb-big" href="/academy/move/breaks">
            Why movement breaks matter
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
  const profile = sittingProfile(answers);
  if (!answers) {
    return (
      <section className="card stack" aria-labelledby="mb-life-title">
        <h2 id="mb-life-title">Movement breaks and hydration</h2>
        <p>
          <Link href="/assessment">Fill out your assessment</Link>, including work and daily activity, to see a personal “My Current Life” and “My New Life” for sitting, water, and
          movement.
        </p>
      </section>
    );
  }
  return (
    <section className="card stack" aria-labelledby="mb-life-title">
      <h2 id="mb-life-title">Sitting, water, and movement</h2>
      {profile.current.length > 0 ? (
        <div className="mb-life">
          <div>
            <h3>My Current Life</h3>
            <ul>
              {profile.current.map((line) => (
                <li key={line.id}>{line.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>My New Life</h3>
            <ul className="mb-why-list">
              {profile.next.map((line) => (
                <li key={line.id}>
                  <strong>{line.text}</strong>
                  {line.why ? <span className="hint">Why it matters: {line.why}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <p>Your answers do not point to long sitting. These everyday habits still help:</p>
          <ul className="mb-why-list">
            {profile.next.map((line) => (
              <li key={line.id}>
                <strong>{line.text}</strong>
                {line.why ? <span className="hint">Why it matters: {line.why}</span> : null}
              </li>
            ))}
          </ul>
        </>
      )}
      <FluidCaution />
      <p>
        <Link href="/academy/move/breaks">Learn why movement breaks matter, and try the 2-minute break</Link>
      </p>
    </section>
  );
}

/** Nutrition: a short hydration note that links water with movement. */
export function HydrationNote() {
  return (
    <section className="card stack mb-key-card" aria-labelledby="mb-hydration-title">
      <h2 id="mb-hydration-title" className="mb-heading">
        {MB.water.heading}
      </h2>
      <p className="mb-key">{MB.water.key}</p>
      <p>{MB.water.notMore}</p>
      <FluidCaution />
      <p>
        <Link href="/academy/move/breaks">How water, movement, breathing, and circulation work together</Link>
      </p>
    </section>
  );
}

/** Movement: a link card into the movement-break page. */
export function MovementBreakTeaser() {
  return (
    <section className="card stack mb-rule" aria-labelledby="mb-teaser-title">
      <h2 id="mb-teaser-title" className="mb-rule-title">
        {MB.rule.heading}
      </h2>
      <p>
        {MB.why.key} Learn about your calves, the “second heart” of your legs, and follow a 2 to 3 minute break you can do at a desk or in a chair.
      </p>
      <Link className="btn btn-primary mb-big" href="/academy/move/breaks">
        Open the movement break
      </Link>
    </section>
  );
}
