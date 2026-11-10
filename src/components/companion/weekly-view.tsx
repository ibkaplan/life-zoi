"use client";

import Link from "next/link";
import { useState } from "react";
import { Art } from "@/components/companion/art";
import { activityLabel } from "@/components/companion/movement-finder";
import { SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { useSession } from "@/components/session-provider";
import { commitCompanion } from "@/lib/companion/store";
import { ACTIVITY_KINDS, upsertPlan, upsertReview, type ActivityKind, type CompanionState, type PlanSuggestion, type SuggestionStatus, type WeeklyReview } from "@/lib/companion/state";
import { checkInDue, compare, logsBetween, monthTotals, NOT_PROOF, oftenSkipped, planFor, progressNotes, recentWeeks, weekTotals, type Totals } from "@/lib/companion/weekly";
import { addIsoDays, daysBetween, localISODate, mondayOf, monthKey } from "@/lib/dates";
import { useT } from "@/components/locale-provider";
import { Rich, useDates } from "@/components/companion/i18n";
import { msg, type Translate } from "@/lib/i18n/translate";

const NUTRITION_TEXT: Record<Exclude<WeeklyReview["nutrition"], "">, string> = {
  mostly: msg("Mostly"),
  sometimes: msg("Sometimes"),
  rarely: msg("Rarely"),
  "not-tried": msg("I did not try this week"),
};

/** A recorded number with its unit, as a whole phrase in each language. */
const UNIT_TEXT: Record<string, string> = {
  days: msg("{value} days"),
  min: msg("{value} min"),
  pages: msg("{value} pages"),
  games: msg("{value} games"),
  times: msg("{value} times"),
  h: msg("{value} h"),
};

function withUnit(t: Translate, value: number, unit: string): string {
  return UNIT_TEXT[unit] ? t(UNIT_TEXT[unit], { value }) : `${value} ${unit}`.trim();
}

/** The progress notes from progressNotes(), one whole sentence per row. */
const MORE_TEXT: Record<string, string> = {
  "More days with an activity than the week before.": msg("More days with an activity than the week before."),
  "More walking than the week before.": msg("More walking than the week before."),
  "More exercise than the week before.": msg("More exercise than the week before."),
  "More pages read than the week before.": msg("More pages read than the week before."),
  "More listening than the week before.": msg("More listening than the week before."),
  "More brain games than the week before.": msg("More brain games than the week before."),
  "More meals and food habits than the week before.": msg("More meals and food habits than the week before."),
};

/** Suggestions are saved in English. Ones built around a number or the person's words are rebuilt here. */
function suggestionText(text: string, t: Translate): string {
  const keep = /^Keep about (\d+) active days, and try one new activity\.$/.exec(text);
  if (keep) return t("Keep about {count} active days, and try one new activity.", { count: Number(keep[1]) });
  const leave = /^Leave out (.+) next week\.$/.exec(text);
  if (leave) {
    const list = (leave[1] ?? "")
      .split(", ")
      .map((kind) => ((ACTIVITY_KINDS as readonly string[]).includes(kind) ? t(activityLabel(kind as ActivityKind)) : kind))
      .join(", ");
    return t("Leave out {list} next week.", { list });
  }
  const easier = /^Make this easier: ([\s\S]+)$/.exec(text);
  if (easier) return t("Make this easier: {text}", { text: easier[1] ?? "" });
  return t(text);
}

function numberOrNull(value: string, min: number, max: number): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function emptyReview(weekStart: string, totals: Totals): WeeklyReview {
  return {
    id: `w${weekStart.replace(/-/g, "")}`,
    weekStart,
    savedAt: "",
    feeling: null,
    energy: totals.energy === null ? null : Math.round(totals.energy),
    exerciseDays: totals.activeDays || null,
    walkingMinutes: totals.walkingMinutes || null,
    booksRead: null,
    pagesRead: totals.readingPages || null,
    brainGames: totals.brainGames || null,
    nutrition: "",
    weightKg: null,
    bloodSugar: "",
    bloodPressure: "",
    cholesterol: "",
    difficult: "",
    improveNext: "",
    disliked: [],
    goalsChanged: null,
  };
}

function Scale({ legend, value, onChange }: { legend: string; value: number | null; onChange: (next: number | null) => void }) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="lz-tabs">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" className="lz-tab" aria-pressed={value === n} onClick={() => onChange(value === n ? null : n)}>
            {n}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number | null; min: number; max: number; step?: number; onChange: (next: number | null) => void }) {
  const [text, setText] = useState(value === null ? "" : String(value));
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(numberOrNull(event.target.value, min, max));
        }}
      />
    </label>
  );
}

function CheckInForm({ weekStart, totals, initial, onSaved }: { weekStart: string; totals: Totals; initial: WeeklyReview | null; onSaved: () => void }) {
  const { sample } = useProfile();
  const [review, setReview] = useState<WeeklyReview>(initial ?? emptyReview(weekStart, totals));
  const set = (patch: Partial<WeeklyReview>) => setReview({ ...review, ...patch });
  const t = useT();
  function save() {
    const today = localISODate();
    const saved = { ...review, savedAt: new Date().toISOString() };
    commitCompanion((state: CompanionState) => {
      const skipped = oftenSkipped(logsBetween(state, weekStart, 7));
      return upsertPlan(upsertReview(state, saved), planFor(saved, totals, skipped, today));
    });
    onSaved();
  }
  return (
    <section className="card stack">
      <h2>{t("This week's check-in")}</h2>
      <p>{t("Answer as many questions as you like. Every question can be skipped. Numbers LifeZoi already recorded are filled in, and you can change them.")}</p>
      <Scale legend={t("How did you feel this week? (1 low, 5 very good)")} value={review.feeling} onChange={(feeling) => set({ feeling })} />
      <Scale legend={t("Your energy this week (1 low, 5 high)")} value={review.energy} onChange={(energy) => set({ energy })} />
      <div className="check-grid">
        <NumberField label={t("Days you exercised")} value={review.exerciseDays} min={0} max={7} onChange={(exerciseDays) => set({ exerciseDays })} />
        <NumberField label={t("Minutes of walking")} value={review.walkingMinutes} min={0} max={5000} onChange={(walkingMinutes) => set({ walkingMinutes })} />
        <NumberField label={t("Books finished")} value={review.booksRead} min={0} max={50} onChange={(booksRead) => set({ booksRead })} />
        <NumberField label={t("Pages read")} value={review.pagesRead} min={0} max={5000} onChange={(pagesRead) => set({ pagesRead })} />
        <NumberField label={t("Brain games played")} value={review.brainGames} min={0} max={500} onChange={(brainGames) => set({ brainGames })} />
      </div>
      <label className="field">
        <span>{t("Did you follow your nutrition ideas?")}</span>
        <select value={review.nutrition} onChange={(event) => set({ nutrition: event.target.value as WeeklyReview["nutrition"] })}>
          <option value="">{t("Prefer not to say")}</option>
          {(Object.keys(NUTRITION_TEXT) as (keyof typeof NUTRITION_TEXT)[]).map((key) => (
            <option key={key} value={key}>
              {t(NUTRITION_TEXT[key])}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="field">
        <legend>{t("Optional measurements")}</legend>
        <p className="hint">{t("Only if you measured them or a clinician told you. Leave blank otherwise. LifeZoi labels these as values you reported.")}</p>
        <div className="check-grid">
          <NumberField label={t("Weight (kg)")} value={review.weightKg} min={30} max={300} step={0.1} onChange={(weightKg) => set({ weightKg })} />
          <label className="field">
            <span>{t("Blood sugar")}</span>
            <input value={review.bloodSugar} maxLength={60} onChange={(event) => set({ bloodSugar: event.target.value })} placeholder={t("for example 5.6 mmol/L fasting")} />
          </label>
          <label className="field">
            <span>{t("Blood pressure")}</span>
            <input value={review.bloodPressure} maxLength={60} onChange={(event) => set({ bloodPressure: event.target.value })} placeholder={t("for example 128/82")} />
          </label>
          <label className="field">
            <span>{t("Cholesterol")}</span>
            <input value={review.cholesterol} maxLength={60} onChange={(event) => set({ cholesterol: event.target.value })} />
          </label>
        </div>
      </fieldset>
      <label className="field">
        <span>{t("What was difficult this week?")}</span>
        <textarea rows={2} maxLength={280} value={review.difficult} onChange={(event) => set({ difficult: event.target.value })} />
      </label>
      <label className="field">
        <span>{t("What would you like to improve next week?")}</span>
        <textarea rows={2} maxLength={280} value={review.improveNext} onChange={(event) => set({ improveNext: event.target.value })} />
      </label>
      <fieldset className="field">
        <legend>{t("Any activities you did not enjoy?")}</legend>
        <div className="check-grid">
          {ACTIVITY_KINDS.map((kind) => (
            <label key={kind} className="check-row">
              <input
                type="checkbox"
                checked={review.disliked.includes(kind)}
                onChange={(event) => set({ disliked: event.target.checked ? [...review.disliked, kind] : review.disliked.filter((item) => item !== kind) })}
              />
              <span>{t(activityLabel(kind as ActivityKind))}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="field">
        <legend>{t("Have your goals changed?")}</legend>
        <div className="lz-tabs">
          {([true, false] as const).map((value) => (
            <button key={String(value)} type="button" className="lz-tab" aria-pressed={review.goalsChanged === value} onClick={() => set({ goalsChanged: review.goalsChanged === value ? null : value })}>
              {value ? t("Yes") : t("No")}
            </button>
          ))}
        </div>
        {review.goalsChanged ? (
          <p className="hint">
            <Rich
              text={t("You can change them in <0>My Life Improvement Plan</0> under Personal Goals, or <1>update your assessment</1>.")}
              parts={[(label) => <Link href="/plan">{label}</Link>, (label) => <Link href="/assessment">{label}</Link>]}
            />
          </p>
        ) : null}
      </fieldset>
      {sample ? (
        <p className="hint">{t("Sample data is on, so the check-in is not saved.")}</p>
      ) : (
        <button className="btn btn-primary" type="button" onClick={save}>
          {t("Save my check-in and plan next week")}
        </button>
      )}
    </section>
  );
}

const STATUS_LABEL: Record<SuggestionStatus, string> = { proposed: msg("Waiting for you"), accepted: msg("Accepted"), modified: msg("Changed by you"), rejected: msg("Not this week") };

function Suggestions({ weekStart }: { weekStart: string }) {
  const { companion, sample } = useProfile();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const t = useT();
  const dates = useDates();
  const plan = companion.plans.find((item) => item.weekStart === weekStart);
  if (!plan) return null;
  function setStatus(item: PlanSuggestion, status: SuggestionStatus, edited = item.edited) {
    if (!plan) return;
    commitCompanion((state) => upsertPlan(state, { ...plan, suggestions: plan.suggestions.map((s) => (s.id === item.id ? { ...s, status, edited } : s)) }));
  }
  return (
    <section className="card stack">
      <h2>{t("Your plan for the week of {date}", { date: dates.long(weekStart) })}</h2>
      <p>{t("Accept, change, or reject each suggestion. Nothing is added to your days until you accept or change it.")}</p>
      <ul className="record-list">
        {plan.suggestions.map((item) => (
          <li key={item.id} className="stack">
            <p>
              <strong>{t(item.area)}:</strong> {item.edited || suggestionText(item.text, t)}
            </p>
            <p className="hint">
              {t(item.reason)} · {t(STATUS_LABEL[item.status])}
            </p>
            {editing === item.id ? (
              <div className="inline-form">
                <input aria-label={t("Your version")} value={draft} maxLength={280} onChange={(event) => setDraft(event.target.value)} />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    setStatus(item, "modified", draft.trim().slice(0, 280));
                    setEditing(null);
                  }}
                  disabled={!draft.trim()}
                >
                  {t("Save")}
                </button>
              </div>
            ) : sample ? null : (
              <div className="lz-buttons">
                <button className="btn btn-teal" type="button" aria-pressed={item.status === "accepted"} onClick={() => setStatus(item, "accepted")}>
                  {t("Accept")}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setEditing(item.id);
                    setDraft(item.edited || item.text);
                  }}
                >
                  {t("Change")}
                </button>
                <button className="btn btn-ghost" type="button" aria-pressed={item.status === "rejected"} onClick={() => setStatus(item, "rejected")}>
                  {t("Reject")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Bars({ title, rows, tone }: { title: string; rows: { label: string; value: number }[]; tone?: "teal" | "gold" }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <figure className="lz-chart">
      <figcaption>
        <strong>{title}</strong>
      </figcaption>
      {rows.map((row) => (
        <div key={row.label} className="lz-chart-row">
          <span>{row.label}</span>
          <span className={`lz-chart-bar${tone ? ` ${tone}` : ""}`} aria-hidden="true">
            <span style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <span>{row.value}</span>
        </div>
      ))}
    </figure>
  );
}

function Comparison({ current, previous, labels }: { current: Totals; previous: Totals; labels: [string, string] }) {
  const t = useT();
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("What you recorded")}</th>
            <th>{labels[0]}</th>
            <th>{labels[1]}</th>
          </tr>
        </thead>
        <tbody>
          {compare(current, previous).map((row) => (
            <tr key={row.label}>
              <td>{t(row.label)}</td>
              <td>{row.before === null ? t("Not recorded") : withUnit(t, row.before, row.unit)}</td>
              <td>{row.after === null ? t("Not recorded") : withUnit(t, row.after, row.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reports({ today }: { today: string }) {
  const { companion } = useProfile();
  const { session } = useSession();
  const t = useT();
  const dates = useDates();
  const weeks = recentWeeks(companion, today, 8);
  const label = (weekStart: string) => weekStart.slice(5).replace("-", "/");
  const thisMonth = monthKey(today);
  const lastMonth = monthKey(addIsoDays(`${thisMonth}-01`, -1));
  const lastAssessment = session.history[0]?.completedAt?.slice(0, 10) ?? "";
  const sinceAssessment = lastAssessment ? daysBetween(lastAssessment, today) : null;
  return (
    <section className="card stack">
      <h2>{t("Your reports")}</h2>
      <p className="hint">{t(NOT_PROOF)}</p>
      <h3>{t("Weekly report: the last 8 weeks")}</h3>
      <div className="lz-grid">
        <Bars title={t("Walking and exercise (minutes)")} rows={weeks.map((w) => ({ label: label(w.weekStart), value: w.totals.walkingMinutes + w.totals.exerciseMinutes }))} />
        <Bars title={t("Pages read")} tone="teal" rows={weeks.map((w) => ({ label: label(w.weekStart), value: w.totals.readingPages }))} />
        <Bars title={t("Brain games")} tone="gold" rows={weeks.map((w) => ({ label: label(w.weekStart), value: w.totals.brainGames }))} />
        <Bars title={t("Listening (minutes)")} tone="teal" rows={weeks.map((w) => ({ label: label(w.weekStart), value: w.totals.listeningMinutes }))} />
      </div>
      <h3>{t("Monthly comparison")}</h3>
      <Comparison current={monthTotals(companion, thisMonth)} previous={monthTotals(companion, lastMonth)} labels={[dates.month(lastMonth), dates.month(thisMonth)]} />
      <h3>{t("90-day reassessment")}</h3>
      {sinceAssessment === null ? (
        <p>
          <Rich
            text={t("No saved assessment yet. <0>Fill out your assessment</0> to start a history you can compare later.")}
            parts={[(label) => <Link href="/assessment">{label}</Link>]}
          />
        </p>
      ) : sinceAssessment >= 90 ? (
        <p className="alert">
          <Rich
            text={t("It has been {days} days since your last assessment. <0>Take it again</0> to compare. Your earlier answers are kept.", { days: sinceAssessment })}
            parts={[(label) => <Link href="/assessment">{label}</Link>]}
          />
        </p>
      ) : (
        <p>
          <Rich
            text={t("Your last assessment was {days} days ago. A new one is suggested after 90 days, and earlier answers are always kept. See the comparison in <0>My Life Improvement Plan</0>.", { days: sinceAssessment })}
            parts={[(label) => <Link href="/plan">{label}</Link>]}
          />
        </p>
      )}
      {companion.reviews.length > 0 ? (
        <>
          <h3>{t("Check-in history")}</h3>
          <ul className="record-list">
            {companion.reviews.slice(0, 12).map((review) => (
              <li key={review.id}>
                {t("Week of {date}: feeling {feeling}, energy {energy}", {
                  date: dates.long(review.weekStart),
                  feeling: review.feeling ?? t("not given"),
                  energy: review.energy ?? t("not given"),
                })}
                {review.weightKg !== null ? t(", weight you reported {value} kg", { value: review.weightKg }) : ""}
                {review.bloodPressure ? t(", blood pressure you reported {value}", { value: review.bloodPressure }) : ""}
                {review.bloodSugar ? t(", blood sugar you reported {value}", { value: review.bloodSugar }) : ""}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

export function WeeklyCheckInView() {
  const { ready, companion } = useProfile();
  const [justSaved, setJustSaved] = useState(false);
  const t = useT();
  if (!ready) return <p className="hint">{t("Loading your week…")}</p>;
  const today = localISODate();
  const weekStart = mondayOf(today);
  const lastWeek = addIsoDays(weekStart, -7);
  const current = weekTotals(companion, weekStart);
  const previous = weekTotals(companion, lastWeek);
  const existing = companion.reviews.find((review) => review.weekStart === weekStart) ?? null;
  const notes = progressNotes(current, previous);
  const skipped = oftenSkipped(logsBetween(companion, weekStart, 7));
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">{t("Progress · Weekly check-in")}</p>
          <h1>{t("Your week")}</h1>
          <p className="script brand-line">{t("New Beginnings. More Energy.")}</p>
          <p>{t("Every 7 days, look back, notice what went well, and choose next week's plan.")}</p>
        </div>
        <Art name="checkin" />
      </div>
      <SaveNote />
      {checkInDue(companion, today) && !existing ? <p className="alert">{t("Your weekly check-in is ready.")}</p> : null}
      <section className="card stack">
        <h2>{t("This week compared with last week")}</h2>
        {notes.length > 0 ? (
          <ul>
            {notes.map((note) => (
              <li key={note}>{t(MORE_TEXT[note] ?? note)}</li>
            ))}
          </ul>
        ) : (
          <p>
            <Rich text={t("Nothing recorded yet this week. That is fine. Open <0>My Day</0> whenever you are ready.")} parts={[(label) => <Link href="/my-day">{label}</Link>]} />
          </p>
        )}
        {skipped.length > 0 ? <p className="hint">{t("Some activities were skipped more than once. Next week's suggestions offer something different.")}</p> : null}
        <Comparison current={current} previous={previous} labels={[t("Last week"), t("This week")]} />
        <p className="hint">{t(NOT_PROOF)}</p>
      </section>
      {justSaved ? <p className="alert alert-ok" role="status">{t("Check-in saved. Your suggestions for next week are below.")}</p> : null}
      <CheckInForm key={existing?.savedAt ?? "new"} weekStart={weekStart} totals={current} initial={existing} onSaved={() => setJustSaved(true)} />
      <Suggestions weekStart={addIsoDays(weekStart, 7)} />
      <Reports today={today} />
    </div>
  );
}
