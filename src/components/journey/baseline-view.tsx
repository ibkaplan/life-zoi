"use client";

import Link from "next/link";
import "@/components/journey/journey.css";
import { PlanItems } from "@/components/journey/plan-items";
import { usePageFormat } from "@/components/page-format";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { wellnessGoalLabels } from "@/lib/health-profile";
import { bodySummary, journeyPlan } from "@/lib/journey";
import { personalProfile, type ProfileItem } from "@/lib/outlook";
import { validateComplete } from "@/lib/validation";

function Group({ title, tone, items, empty }: { title: string; tone: "good" | "focus" | "talk"; items: ProfileItem[]; empty?: string }) {
  const { t } = usePageFormat();
  if (items.length === 0 && !empty) return null;
  return (
    <section className="jr-group" data-tone={tone}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p>{empty}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.topic}>
              <strong>{item.topic}.</strong> {item.note}
            </li>
          ))}
        </ul>
      )}
      {tone === "talk" && items.length > 0 ? (
        <p className="hint">{t("This is not a diagnosis. It means a conversation with a doctor, nurse, or pharmacist could help.")}</p>
      ) : null}
    </section>
  );
}

/** Step 3 and 4 of the guided start: the starting health profile and the personal plan. */
export function BaselineView() {
  const { ready, session, sample } = useSession();
  const { t, timestamp } = usePageFormat();
  if (!ready) return <LoadingState label={t("Loading your session…")} />;

  const history = session.history;
  const latest = history[0] ?? null;
  const first = history[history.length - 1] ?? null;
  const parsed = latest ? validateComplete(latest.answers) : null;
  const answers = parsed && parsed.ok ? parsed.value : null;

  if (!latest || !answers) {
    return (
      <div className="stack-lg jr">
        <section className="stack">
          <p className="kicker">{t("My Health")}</p>
          <h1>{t("Your starting health profile")}</h1>
          <p className="lede">{t("Your profile appears here after you save the health questionnaire. Nothing is guessed before that.")}</p>
        </section>
        <div className="actions">
          <Link className="btn btn-primary" href="/assessment">
            {t("Start the questionnaire")}
          </Link>
          <Link className="btn btn-secondary" href="/start">
            {t("How it works")}
          </Link>
        </div>
      </div>
    );
  }

  const profile = personalProfile(answers, t);
  const good = profile.items.filter((item) => item.label === "potentially protective");
  const focus = profile.items.filter((item) => item.label === "worth improving" || item.label === "monitor");
  const talk = profile.items.filter((item) => item.label === "discuss with a professional");
  const body = bodySummary(answers);
  const plan = journeyPlan(answers);
  const name = answers.displayName.trim();
  const notes = [
    { label: t("Conditions you mentioned"), value: answers.conditionsNote },
    { label: t("Medicines or supplements you listed"), value: answers.medicationsNote },
    { label: t("Family history you mentioned"), value: answers.familyNote },
  ].filter((note) => note.value.trim());

  return (
    <div className="stack-lg jr">
      <section className="stack">
        <p className="kicker">{t("My Health")}</p>
        <h1>{name ? t("{name}, here is your starting health profile", { name }) : t("Your starting health profile")}</h1>
        <p className="lede">
          {t("This explains what you told us, in plain words. It is not a diagnosis, not a score, and not a prediction of how long you will live.")}
        </p>
        <p className="hint">
          {first && first.id !== latest.id
            ? t("Your journey started on {start}. These answers are from {date}.", { start: timestamp(first.completedAt), date: timestamp(latest.completedAt) })
            : t("Your journey started on {date}.", { date: timestamp(latest.completedAt) })}
          {sample ? ` ${t("Sample data. This is an example, not your information.")}` : ""}
        </p>
      </section>

      <section className="card stack jr-body" aria-labelledby="jr-body-title">
        <h2 id="jr-body-title">{t("Your starting point")}</h2>
        <dl className="jr-facts">
          <div>
            <dt>{t("Height")}</dt>
            <dd>{body.heightCm !== null ? t("{value} cm", { value: body.heightCm }) : t("Not given")}</dd>
          </div>
          <div>
            <dt>{t("Weight on day 1")}</dt>
            <dd>{body.weightKg !== null ? t("{value} kg", { value: body.weightKg }) : t("Not given")}</dd>
          </div>
          <div>
            <dt>{t("Target weight")}</dt>
            <dd>{body.targetKg !== null ? t("{value} kg", { value: body.targetKg }) : t("Not given")}</dd>
          </div>
        </dl>
        {body.changeKg !== null && body.changeKg !== 0 ? (
          <p>
            {body.changeKg < 0
              ? t("Your target is about {value} kg below your current weight.", { value: Math.abs(body.changeKg) })
              : t("Your target is about {value} kg above your current weight.", { value: body.changeKg })}{" "}
            {t("A slow, steady pace is usually the safest. Your clinician can tell you what pace suits you, and one weighing never decides the plan.")}
          </p>
        ) : body.weightKg === null ? (
          <p className="hint">{t("You did not add your weight. That is fine. You can add it later if you want to follow it on the Progress page.")}</p>
        ) : null}
      </section>

      <section className="card stack" aria-labelledby="jr-reading-title">
        <h2 id="jr-reading-title">{t("What your answers show")}</h2>
        <Group title={t("Going well")} tone="good" items={good} empty={t("Every small habit counts. Your plan below starts with easy steps.")} />
        <Group title={t("Worth focusing on")} tone="focus" items={focus} />
        <Group title={t("Worth talking about with a professional")} tone="talk" items={talk} />
      </section>

      {answers.wellnessGoals.length > 0 ? (
        <section className="card stack" aria-labelledby="jr-goals-title">
          <h2 id="jr-goals-title">{t("Your goals")}</h2>
          <ul className="jr-chips">
            {answers.wellnessGoals.map((goal) => (
              <li key={goal} data-primary={goal === answers.primaryGoal || undefined}>
                {t(wellnessGoalLabels[goal])}
                {goal === answers.primaryGoal && answers.wellnessGoals.length > 1 ? ` · ${t("most important")}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section className="card stack" aria-labelledby="jr-notes-title">
          <h2 id="jr-notes-title">{t("Notes for your next appointment")}</h2>
          <dl className="jr-notes">
            {notes.map((note) => (
              <div key={note.label}>
                <dt>{note.label}</dt>
                <dd>{note.value}</dd>
              </div>
            ))}
          </dl>
          <p className="hint">{t("LifeZoi keeps these as your own reminders. It does not diagnose from them and never suggests starting, stopping, or changing a medicine.")}</p>
        </section>
      ) : null}

      <section className="stack" id="plan" aria-labelledby="jr-plan-title">
        <p className="kicker">{t("Step 4")}</p>
        <h2 id="jr-plan-title">{t("Your personal plan")}</h2>
        <p>{t("Start with one or two of these. Each button opens the page where you can do it.")}</p>
        <PlanItems items={plan} />
        <div className="actions">
          <Link className="btn btn-teal" href="/dashboard">
            {t("Go to my Dashboard")}
          </Link>
          <Link className="btn btn-secondary" href="/plan">
            {t("Open My Life Improvement Plan")}
          </Link>
          <Link className="btn btn-secondary" href="/assessment">
            {t("Update my answers")}
          </Link>
        </div>
      </section>
    </div>
  );
}
