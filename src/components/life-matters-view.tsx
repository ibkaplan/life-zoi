"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { PagePhoto } from "@/components/page-photo";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { useLocale, useT } from "@/components/locale-provider";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import {
  BRAND_LINE,
  BRAND_SUPPORT,
  CENTRAL_MESSAGE,
  DIGNITY_NOTE,
  DIRECTION_LINES,
  ENCOURAGEMENT,
  FOUNDATIONS,
  HEALTH_BRIDGE,
  JOURNEY_STEPS,
  KARMA_NOTE,
  LEGACY_QUESTIONS,
  MILESTONE_KINDS,
  PROMISE_BOUNDARY,
  RIPPLE_KINDS,
  SUPPORTING_MESSAGE,
  getPurpose,
  getPurposeServer,
  healthSupports,
  kindLabel,
  purposeLines,
  purposeReflection,
  subscribePurpose,
  weeklyActions,
  writePurpose,
  type MilestoneKind,
  type PurposeState,
  type RippleKind,
} from "@/lib/purpose";

const SECTIONS = [
  ["#philosophy", msg("Philosophy")],
  ["#legacy", msg("My Positive Legacy")],
  ["#connect", msg("Health connection")],
  ["#impact", msg("My Future Impact")],
  ["#journey", msg("Purpose journey")],
  ["#ripple", msg("My Positive Ripple")],
] as const;

function MatterArt() {
  const t = useT();
  return (
    <svg
      className="matter-art"
      viewBox="0 0 640 360"
      role="img"
      aria-label={t("Sunrise over the Earth, with trees and three people of different ages")}
    >
      <defs>
        <linearGradient id="matter-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFE5FA" />
          <stop offset="55%" stopColor="#F3ECFB" />
          <stop offset="100%" stopColor="#F9F7F2" />
        </linearGradient>
        <linearGradient id="matter-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9F7F2" />
          <stop offset="100%" stopColor="#23706A" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#matter-sky)" />
      <circle className="matter-sun" cx="470" cy="118" r="54" fill="url(#matter-sun)" />
      <circle cx="250" cy="210" r="78" fill="#F3ECFB" />
      <circle cx="228" cy="198" r="22" fill="#23706A" />
      <circle cx="276" cy="214" r="16" fill="#0E7490" opacity="0.35" />
      <path d="M86 250c18-46 28-46 46 0" fill="#0E7490" />
      <rect x="104" y="250" width="10" height="36" fill="#52288A" />
      <path d="M150 236c22-58 34-58 56 0" fill="#23706A" />
      <rect x="172" y="236" width="12" height="50" fill="#52288A" />
      <circle cx="392" cy="214" r="16" fill="#6A3DA8" />
      <rect x="382" y="230" width="20" height="42" rx="8" fill="#52288A" />
      <circle cx="440" cy="228" r="13" fill="#23706A" />
      <rect x="431" y="242" width="18" height="34" rx="8" fill="#0E7490" />
      <circle cx="486" cy="206" r="18" fill="#172554" />
      <rect x="474" y="224" width="24" height="48" rx="8" fill="#6A3DA8" />
    </svg>
  );
}

function formatWhen(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : LOCALE_META[locale].htmlLang, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  }).format(date);
}

export function LifeMattersView() {
  const { ready, session } = useSession();
  const t = useT();
  const { locale } = useLocale();
  const state = useSyncExternalStore(subscribePurpose, getPurpose, getPurposeServer);
  const [status, setStatus] = useState("");
  const [milestone, setMilestone] = useState({ title: "", kind: "goal" as MilestoneKind, note: "" });
  const [ripple, setRipple] = useState({ kind: "help" as RippleKind, note: "" });
  const [formError, setFormError] = useState("");

  if (!ready) return <LoadingState label={t("Loading Your Life Matters…")} />;

  const hope = session.history[0]?.answers.purposeHope || session.draft.purposeHope;
  const corpus = [...purposeLines(state.legacy), hope].join(" ");
  const supports = healthSupports(corpus);
  const lines = LEGACY_QUESTIONS.flatMap((question) => {
    const text = state.legacy[question.id]?.trim();
    return text ? [`${t(question.prompt)} ${text}`] : [];
  });
  const reflection = purposeReflection(hope, t);
  const when = (iso: string) => t("{when} Eastern", { when: formatWhen(iso, locale) });

  function save(next: PurposeState, message: string) {
    writePurpose(next);
    setStatus(message);
    setFormError("");
  }

  function addMilestone() {
    const title = milestone.title.trim();
    if (!title) {
      setFormError(msg("Add a short title for the milestone."));
      return;
    }
    save(
      {
        ...state,
        milestones: [
          ...state.milestones,
          {
            id: crypto.randomUUID(),
            title,
            kind: milestone.kind,
            note: milestone.note.trim(),
            done: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      msg("Milestone saved in this browser tab."),
    );
    setMilestone({ title: "", kind: milestone.kind, note: "" });
  }

  function addRipple() {
    save(
      {
        ...state,
        ripples: [
          ...state.ripples,
          {
            id: crypto.randomUUID(),
            kind: ripple.kind,
            note: ripple.note.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
      msg("Positive action saved in this browser tab."),
    );
    setRipple({ kind: ripple.kind, note: "" });
  }

  return (
    <div className="life-matters stack-lg">
      <PagePhoto id="life-matters" />
      <div className="stack">
        <p className="kicker">{t("Your Life Matters")}</p>
        <h1>{t(CENTRAL_MESSAGE)}</h1>
        <p className="lede">{t(SUPPORTING_MESSAGE)}</p>
      </div>
      <MatterArt />
      <nav className="matter-nav" aria-label={t("On this page")}>
        {SECTIONS.map(([href, label]) => (
          <a key={href} href={href}>
            {t(label)}
          </a>
        ))}
      </nav>
      <p className="banner" role="status">
        {t("Working reflection in this browser tab. It is not a medical assessment, and lifeZoi does not calculate a contribution to humanity.")}
        {status ? ` ${t(status)}` : ""}
      </p>

      <section className="card stack" id="philosophy" aria-labelledby="philosophy-title">
        <h2 id="philosophy-title">{t("Science, psychology, and philosophy")}</h2>
        <p>
          {t("LifeZoi brings these three foundations together. This is practical life philosophy beside health education. It is not a religious service and it does not offer a miracle.")}
        </p>
        <ul className="matter-lines">
          {DIRECTION_LINES.map((line) => (
            <li key={line}>{t(line)}</li>
          ))}
        </ul>
        <div className="matter-foundations">
          {FOUNDATIONS.map((item) => (
            <article key={item.id}>
              <h3>{t(item.title)}</h3>
              <p>{t(item.text)}</p>
            </article>
          ))}
        </div>
        <p className="matter-brand">{t(BRAND_LINE)}</p>
        <p>{t(BRAND_SUPPORT)}</p>
        <p>{t(PROMISE_BOUNDARY)}</p>
        <p>
          {t("Every healthy choice can be an investment in the days ahead. Every act of kindness can create a ripple. You cannot control everything life brings you. You can influence how you live, how you grow, and what you give.")}
        </p>
        <p>{t("Live consciously. Live compassionately. Live fully. Make your life matter.")}</p>
      </section>

      <section className="card stack" id="legacy" aria-labelledby="legacy-title">
        <h2 id="legacy-title">{t("My Positive Legacy")}</h2>
        <p>{t(ENCOURAGEMENT)}</p>
        {LEGACY_QUESTIONS.map((question) => (
          <label className="field" key={question.id} htmlFor={`legacy-${question.id}`}>
            <span>{t(question.prompt)}</span>
            <textarea
              id={`legacy-${question.id}`}
              maxLength={400}
              value={state.legacy[question.id] ?? ""}
              onChange={(event) =>
                save(
                  { ...state, legacy: { ...state.legacy, [question.id]: event.target.value } },
                  msg("Answers saved in this browser tab. You can edit them any time."),
                )
              }
            />
          </label>
        ))}
        <h3>{t("Your purpose statement")}</h3>
        {lines.length === 0 ? (
          <p>{t("Your purpose statement will appear here from your own words. Waiting is welcome.")}</p>
        ) : (
          <ul className="matter-lines">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack" id="connect" aria-labelledby="connect-title">
        <h2 id="connect-title">{t("Connect purpose with health")}</h2>
        <p className="matter-brand">{t(HEALTH_BRIDGE)}</p>
        <p>{t(DIGNITY_NOTE)}</p>
        {reflection ? (
          <p>
            {reflection} {t("This hope is separate from medical information and is not a judgment of worth.")}
          </p>
        ) : supports.length > 0 ? (
          <p>
            {t("These ideas come from the words you wrote above. You can also add a hope at the end of the lifestyle assessment. That hope stays separate from the health answers.")}
          </p>
        ) : (
          <p>
            {t("The lifestyle assessment can hold an optional hope at the end: what you would like your health to help you experience or accomplish.")}
          </p>
        )}
        {supports.length === 0 ? (
          <p>{t("When you write a hope above, lifeZoi will suggest a few ordinary habits that can support it.")}</p>
        ) : (
          supports.map((support) => (
            <article key={support.id} className="stack">
              <h3>{t(support.title)}</h3>
              <p>{t(support.why)}</p>
              <ul>
                {support.actions.map((action) => (
                  <li key={action}>{t(action)}</li>
                ))}
              </ul>
            </article>
          ))
        )}
        <p>{t("A few actions for this week:")}</p>
        {weeklyActions(supports).length === 0 ? (
          <p>{t("No weekly action yet. One sentence above is enough to begin.")}</p>
        ) : (
          <ul>
            {weeklyActions(supports).map((action) => (
              <li key={action}>{t(action)}</li>
            ))}
          </ul>
        )}
        <div className="actions">
          <Link className="btn btn-primary" href="/change-lab">
            {t("Plan it in Change Lab")}
          </Link>
          <Link className="btn btn-secondary" href="/assessment">
            {t("Add a hope to the assessment")}
          </Link>
        </div>
      </section>

      <section className="card stack" id="impact" aria-labelledby="impact-title">
        <h2 id="impact-title">{t("My Future Impact")}</h2>
        <p>
          {t("This is a personal journey of goals, habits, skills, kindness, time with people, and contributions you choose to record. lifeZoi does not measure social impact or calculate what you give to humanity.")}
        </p>
        <div className="field">
          <label htmlFor="milestone-title">{t("Milestone title")}</label>
          <input
            id="milestone-title"
            value={milestone.title}
            maxLength={80}
            onChange={(event) => setMilestone({ ...milestone, title: event.target.value })}
          />
        </div>
        <label className="field" htmlFor="milestone-kind">
          <span>{t("What kind of milestone is this?")}</span>
          <select
            id="milestone-kind"
            value={milestone.kind}
            onChange={(event) => setMilestone({ ...milestone, kind: event.target.value as MilestoneKind })}
          >
            {MILESTONE_KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>
        </label>
        <label className="field" htmlFor="milestone-note">
          <span>{t("A note, if you want one")}</span>
          <textarea
            id="milestone-note"
            maxLength={400}
            value={milestone.note}
            onChange={(event) => setMilestone({ ...milestone, note: event.target.value })}
          />
        </label>
        {formError ? (
          <p className="field-error" role="alert">
            {t(formError)}
          </p>
        ) : null}
        <button className="btn btn-primary" type="button" onClick={addMilestone}>
          {t("Save milestone")}
        </button>
        {state.milestones.length === 0 ? (
          <p>{t("No milestones yet. Add one when you are ready.")}</p>
        ) : (
          <ul className="matter-list">
            {state.milestones.map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{item.title}</strong> · {t(kindLabel(item.kind, MILESTONE_KINDS))}
                  {item.done ? ` · ${t("Marked done")}` : ""}
                </p>
                {item.note ? <p>{item.note}</p> : null}
                <p className="hint">{when(item.createdAt)}</p>
                <div className="actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() =>
                      save(
                        {
                          ...state,
                          milestones: state.milestones.map((row) =>
                            row.id === item.id ? { ...row, done: !row.done } : row,
                          ),
                        },
                        item.done ? msg("Milestone marked open again.") : msg("Milestone marked done."),
                      )
                    }
                  >
                    {item.done ? t("Mark not done") : t("Mark done")}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() =>
                      save(
                        { ...state, milestones: state.milestones.filter((row) => row.id !== item.id) },
                        msg("Milestone removed from this browser tab."),
                      )
                    }
                  >
                    {t("Remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack" id="journey" aria-labelledby="journey-title">
        <h2 id="journey-title">{t("My Life Purpose Journey")}</h2>
        <p>{t("Six steps join your values with the habits you practice in Change Lab, Progress, and WHAT IF?.")}</p>
        <ol className="matter-journey">
          {JOURNEY_STEPS.map((step, index) => (
            <li key={step.id}>
              <h3>
                {t("Step {number} — {title}", { number: index + 1, title: t(step.title) })}
              </h3>
              <p>{t(step.text)}</p>
              <Link href={step.href}>{t(step.linkLabel)}</Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="card stack" id="ripple" aria-labelledby="ripple-title">
        <h2 id="ripple-title">{t("My Positive Ripple")}</h2>
        <p>{t(KARMA_NOTE)}</p>
        <p>
          {t("Taking care of yourself can help you be more present for people and causes you care about. Record only what you want to remember. This collection is not a score.")}
        </p>
        <label className="field" htmlFor="ripple-kind">
          <span>{t("What kind of action was it?")}</span>
          <select
            id="ripple-kind"
            value={ripple.kind}
            onChange={(event) => setRipple({ ...ripple, kind: event.target.value as RippleKind })}
          >
            {RIPPLE_KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>
        </label>
        <label className="field" htmlFor="ripple-note">
          <span>{t("What happened? Optional.")}</span>
          <textarea
            id="ripple-note"
            maxLength={400}
            value={ripple.note}
            onChange={(event) => setRipple({ ...ripple, note: event.target.value })}
          />
        </label>
        <button className="btn btn-primary" type="button" onClick={addRipple}>
          {t("Save positive action")}
        </button>
        {state.ripples.length === 0 ? (
          <p>{t("No actions recorded yet. A small kindness counts, and so does choosing not to write one down.")}</p>
        ) : (
          <ul className="matter-list">
            {[...state.ripples].reverse().map((item) => (
              <li key={item.id}>
                <p>
                  <strong>{t(kindLabel(item.kind, RIPPLE_KINDS))}</strong>
                </p>
                {item.note ? <p>{item.note}</p> : null}
                <p className="hint">{when(item.createdAt)}</p>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() =>
                    save(
                      { ...state, ripples: state.ripples.filter((row) => row.id !== item.id) },
                      msg("Action removed from this browser tab."),
                    )
                  }
                >
                  {t("Remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">
          {t("The wellness assistant offers prepared educational answers. It does not see these private notes.")}
        </p>
        <Link className="btn btn-secondary" href="/ai-assistant">
          {t("Open the wellness assistant")}
        </Link>
      </section>
    </div>
  );
}
