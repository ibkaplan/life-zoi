"use client";

import Link from "next/link";
import { EvidenceLine, WellnessSources } from "@/components/wellness/bits";
import { ChallengePanel } from "@/components/wellness/challenge-panel";
import { EVENING_EXAMPLE, STRONGER_LINE, TOOLKITS, URGE_LESSONS, urgeLesson } from "@/lib/wellness/urges";
import { challengeById } from "@/lib/wellness/challenges";

const sections = [
  { href: "/urges/understand", title: "Understand Your Urge", text: "Record the want, the time, the feeling, what happened before, and what you chose." },
  { href: "/urges/pause", title: "Pause — Breathe — Choose", text: "Name the craving, breathe if you want, pause only when waiting is safe, then choose." },
  { href: "/urges/moment", title: "Choose Your Moment", text: "Your time is valuable. Choose something that makes your life better." },
  { href: "/urges/stronger", title: "Be Stronger Than Your Urges", text: "A choice, not a punishment. Hunger still gets food." },
  { href: "/urges/evening", title: "How to Stop Automatic Late-Night Eating", text: "An example evening. No required clock time." },
  { href: "/urges/plan", title: "My Life Improvement Plan", text: "Several habits, separate targets, and a dashboard." },
  { href: "/urges/actions", title: "My Personal Action Plan", text: "If–then lines, optional missions, and shared journeys." },
  { href: "/urges/progress", title: "Progress", text: "Your activities, cravings, triggers, and reflections. Examples stay separate." },
];

export function UrgesHome() {
  return (
    <div className="learn stack-lg">
      <header className="stack">
        <p className="kicker">Master Your Urges</p>
        <h1>Understand your cravings. Calm your mind. Choose what is good for you.</h1>
        <p className="lede">
          An urge can be physical hunger, thirst, a feeling, or a learned habit. You do not have to be perfect, and you are not in trouble if a plan is missed. If you are hungry, eat. Water does not replace food.
        </p>
      </header>
      <section className="card stack">
        <h2>How to use this section</h2>
        <p>Start with one lesson or one tool. Several habits can run together later. lifeZoi does not diagnose an eating disorder or addiction, does not recommend medication changes, and does not set a fast, a calorie limit, or a time when everyone must stop eating.</p>
        <p>Notes stay in this browser tab. They are not sent to a server.</p>
      </section>
      <div className="stack">
        {sections.map((section) => (
          <Link key={section.href} className="card learn-link" href={section.href}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </Link>
        ))}
      </div>
      <section className="stack">
        <h2>Lessons</h2>
        {URGE_LESSONS.map((lesson) => (
          <Link key={lesson.slug} className="card learn-link" href={`/urges/lessons/${lesson.slug}`}>
            <h3>{lesson.title}</h3>
            <p>{lesson.summary}</p>
          </Link>
        ))}
      </section>
      <section className="stack">
        <h2>Toolkit</h2>
        {TOOLKITS.map((item) => (
          <Link key={item.title} className="card learn-link" href={item.href}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Link>
        ))}
        <p>
          <a href="https://smokefree.gov/">Smokefree.gov</a>
          {" · "}
          <a href="https://www.niaaa.nih.gov/alcohols-effects-health">NIAAA: Alcohol&apos;s Effects on Health</a>
        </p>
      </section>
      <p>
        <Link href="/academy/sources">Source registry</Link>
      </p>
    </div>
  );
}

export function UrgeLessonView({ slug }: { slug: string }) {
  const lesson = urgeLesson(slug);
  if (!lesson) return null;
  const challenge = lesson.challengeId ? challengeById(lesson.challengeId) : null;
  const sourceIds = [...new Set(lesson.blocks.flatMap((item) => item.sourceIds))];
  return (
    <div className="learn stack-lg">
      <p className="kicker">Master Your Urges</p>
      <h1>{lesson.title}</h1>
      <p className="lede">{lesson.summary}</p>
      {lesson.blocks.map((item) => (
        <section key={item.heading} className="card stack">
          <h2>{item.heading}</h2>
          <p>{item.body}</p>
          <EvidenceLine kind={item.evidence} note={item.evidenceNote} />
          <WellnessSources ids={item.sourceIds} />
        </section>
      ))}
      <section className="card stack">
        <h2>What you can do today</h2>
        <ul>
          {lesson.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        <WellnessSources ids={sourceIds} />
      </section>
      {challenge ? (
        <section className="card stack">
          <h2>Your small challenge</h2>
          <ChallengePanel challenge={challenge} />
        </section>
      ) : null}
      <Link href="/urges">Back to Master Your Urges</Link>
    </div>
  );
}

export function StrongerView() {
  return (
    <div className="learn stack-lg">
      <p className="kicker">Master Your Urges</p>
      <h1>Be Stronger Than Your Urges</h1>
      <blockquote className="card">
        <p>{STRONGER_LINE}</p>
      </blockquote>
      <p className="lede">
        Self-control here is a choice about timing. It is not punishment, and it is not a reason to ignore hunger. If you are hungry, eat an appropriate meal or snack. A short pause does not eliminate every craving.
      </p>
      <UrgeLessonView slug="stronger" />
      <div className="actions">
        <Link className="btn btn-primary" href="/urges/pause">Open Pause — Breathe — Choose</Link>
        <Link className="btn btn-secondary" href="/urges/moment">Choose Your Moment</Link>
      </div>
    </div>
  );
}

export function EveningView() {
  return (
    <div className="learn stack-lg">
      <p className="kicker">Master Your Urges</p>
      <h1>How to Stop Automatic Late-Night Eating</h1>
      <p className="lede">
        Automatic eating follows a cue. You can change the cue, eat if you are hungry, or give the time to something you value. Nothing below is a mandatory hour.
      </p>
      <section className="card stack example-only" aria-label="Example evening, not your schedule">
        <h2>Example evening, not a required schedule</h2>
        <ol>
          {EVENING_EXAMPLE.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>This example is not saved as your record.</p>
      </section>
      <UrgeLessonView slug="late-night-automatic" />
      <Link className="btn btn-secondary" href="/urges/moment">Open Choose Your Moment</Link>
    </div>
  );
}
