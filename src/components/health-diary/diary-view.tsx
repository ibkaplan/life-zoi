"use client";

import "./health-diary.css";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useAccount } from "@/lib/account-store";
import { useLocale } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { CONTEXT_LABELS, KIND_LABELS, localTime, readingsToCsv } from "@/lib/health-diary/csv";
import { compareBloodPressure, compareCholesterol, compareGlucose, safetyNoteFor, SOURCES, type Comparison, type Source } from "@/lib/health-diary/ranges";
import { dueReminders, readReminders, REMINDER_CHOICES, writeReminders, type ReminderChoice, type ReminderPrefs } from "@/lib/health-diary/reminders";
import {
  bloodPressureSeries,
  cholesterolSeries,
  glucoseSeries,
  groupForChart,
  inPeriod,
  latest,
  localDay,
  PERIODS,
  summarize,
  type Period,
} from "@/lib/health-diary/series";
import { useHealthDiary, type DiaryApi } from "@/lib/health-diary/store";
import {
  GLUCOSE_CONTEXTS,
  READING_KINDS,
  type BloodPressureReading,
  type CholesterolReading,
  type GlucoseReading,
  type GlucoseUnit,
  type HealthReading,
  type ReadingKind,
} from "@/lib/health-diary/types";
import { glucoseFromMgdl, lipidFromMgdl, type LipidPart } from "@/lib/health-diary/units";
import { validateReading, type FieldErrors, type ReadingForm } from "@/lib/health-diary/validate";
import { msg, type Translate } from "@/lib/i18n/translate";
import { ChartKey, TrendChart, type ChartLine } from "./trend-chart";

const UNIT_KEY = "lifezoi.health-diary.unit.v1";

const PERIOD_LABELS: Record<Period, string> = {
  "30d": msg("30 days"),
  "90d": msg("3 months"),
  "1y": msg("12 months"),
  all: msg("All"),
};

const REMINDER_LABELS: Record<ReminderChoice, string> = {
  off: msg("Off"),
  daily: msg("Every day"),
  weekly: msg("Every week"),
  monthly: msg("Every month"),
  quarterly: msg("Every 3 months"),
};

const LIPID_LABELS: Record<LipidPart, string> = {
  total: msg("Total cholesterol"),
  ldl: msg("LDL"),
  hdl: msg("HDL"),
  triglycerides: msg("Triglycerides"),
};

const SERIES_LABELS: Record<string, string> = {
  systolic: msg("Systolic (upper)"),
  diastolic: msg("Diastolic (lower)"),
  pulse: msg("Pulse"),
  ...LIPID_LABELS,
  ...CONTEXT_LABELS,
};

const TONE_WORD: Record<Comparison["tone"], string> = {
  ok: msg("General range"),
  watch: msg("Worth watching"),
  high: msg("Above range"),
  urgent: msg("Needs attention"),
  low: msg("Below range"),
};

function safeStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

const noSubscribe = () => () => {};

/** False on the server and the first browser render, so nothing that reads the clock is prerendered. */
function useMounted(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia("(max-width: 600px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribeNarrow, () => window.matchMedia("(max-width: 600px)").matches, () => false);
}

function nowParts() {
  const now = new Date();
  return { date: localDay(now.toISOString()), time: localTime(now.toISOString()) };
}

/** Translates a message and any {values} that are themselves English words. */
function errorText(t: Translate, errors: FieldErrors, field: string): string | null {
  const error = errors[field];
  if (!error) return null;
  const values = error.values
    ? Object.fromEntries(Object.entries(error.values).map(([key, value]) => [key, typeof value === "string" ? t(value) : value]))
    : undefined;
  return t(error.text, values);
}

function useFormats() {
  const { locale, t } = useLocale();
  const lang = LOCALE_META[locale].htmlLang;
  return useMemo(() => {
    const day = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" });
    const full = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const longDay = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
    const numbers = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });
    return {
      t,
      locale,
      chartDate: (at: number) => day.format(new Date(at)),
      when: (iso: string) => full.format(new Date(iso)),
      longDay: (date: Date) => longDay.format(date),
      number: (value: number) => numbers.format(value),
    };
  }, [lang, locale, t]);
}

export function HealthDiaryView() {
  const { t, locale } = useFormats();
  const account = useAccount();
  const { sample } = useSession();
  const userId = account.phase === "ready" ? account.userId : null;
  const diary = useHealthDiary(userId, sample);
  const [kind, setKind] = useState<ReadingKind>("blood_pressure");
  const [unit, setUnitState] = useState<GlucoseUnit>(locale === "en" ? "mg/dL" : "mmol/L");
  const [reminders, setRemindersState] = useState<ReminderPrefs | null>(null);

  useEffect(() => {
    const storage = safeStorage();
    let stored: string | null = null;
    try {
      stored = storage?.getItem(UNIT_KEY) ?? null;
    } catch {
      stored = null;
    }
    queueMicrotask(() => {
      if (stored === "mg/dL" || stored === "mmol/L") setUnitState(stored);
      setRemindersState(readReminders(storage, userId));
    });
  }, [userId]);

  const setUnit = (next: GlucoseUnit) => {
    setUnitState(next);
    try {
      safeStorage()?.setItem(UNIT_KEY, next);
    } catch {
      // Only means the unit is not remembered.
    }
  };
  const setReminders = (next: ReminderPrefs) => {
    setRemindersState(next);
    writeReminders(safeStorage(), userId, next);
  };

  const mounted = useMounted();
  if (!mounted) return <p className="hint">{t("Loading your diary…")}</p>;

  const due = reminders && (diary.status === "account" || diary.status === "sample") ? dueReminders(reminders, diary.readings) : [];
  const canSave = diary.status === "account";

  return (
    <div className="stack-lg hd-page">
      <section className="stack no-print">
        <p className="kicker">{t("My Health")}</p>
        <h1>{t("Blood pressure, sugar & cholesterol diary")}</h1>
        <p className="lede">
          {t("Write down the numbers you measured at home or got from a lab, see how they change over weeks and months, and take a summary to your doctor. The diary explains and records. It does not diagnose.")}
        </p>
      </section>

      <StatusNote diary={diary} />

      {due.length > 0 ? (
        <section className="alert alert-ok no-print" role="status">
          <strong>{t("Reminder")}</strong>{" "}
          {t("It is time for a new reading: {kinds}.", { kinds: due.map((item) => t(KIND_LABELS[item])).join(", ") })}
        </section>
      ) : null}

      <MeasureHelp />

      <div className="hd-tabs no-print" role="group" aria-label={t("Choose what to record")}>
        {READING_KINDS.map((item) => (
          <button key={item} type="button" className={`hd-tab${kind === item ? " is-on" : ""}`} aria-pressed={kind === item} onClick={() => setKind(item)}>
            {t(KIND_LABELS[item])}
          </button>
        ))}
      </div>

      <EntryForm key={kind} kind={kind} unit={unit} setUnit={setUnit} canSave={canSave} sample={diary.status === "sample"} onSave={diary.add} />

      <KindOverview key={kind} kind={kind} readings={diary.readings} unit={unit} canDelete={canSave} onDelete={diary.remove} />

      <References kind={kind} />

      <SafetyCard />

      {reminders ? <ReminderSettings prefs={reminders} onChange={setReminders} /> : null}

      <ExportAndDelete diary={diary} />

      <PrintSummary readings={diary.readings} unit={unit} />

      <section className="card stack no-print">
        <h2>{t("Later: connecting a device")}</h2>
        <p>
          {t("Some blood pressure monitors and glucose meters can share readings with a phone app. LifeZoi cannot connect to them yet, and nothing is set up for it. For now, type the numbers in by hand. If device connections are added later, they will be optional and described here first.")}
        </p>
      </section>

      <p className="hint no-print">
        {t("General information only, not a diagnosis or treatment advice. Individual targets differ; ask your doctor what numbers are right for you.")}{" "}
        <Link href="/my-health">{t("Back to My Health")}</Link>
      </p>
    </div>
  );
}

function StatusNote({ diary }: { diary: DiaryApi }) {
  const { t } = useFormats();
  const text: Record<DiaryApi["status"], string> = {
    loading: msg("Loading your diary…"),
    account: msg("Saved only in your own account. It is not kept in this browser, not shared, and not sent to any AI or other service."),
    "not-ready": msg("Your account is signed in, but the diary storage is not set up yet, so readings cannot be saved. Nothing has been lost. Please try again later."),
    offline: msg("Your diary could not be reached just now. Nothing was saved."),
    sample: msg("You are looking at sample readings for the Sample visitor. They are made up, and nothing you type is saved while the sample is on."),
    "signed-out": msg("Sign in to keep a diary in your own account."),
  };
  const isError = diary.status === "not-ready" || diary.status === "offline";
  return (
    <p className={`no-print ${isError ? "alert alert-error" : "hint"}`} role={isError ? "alert" : "status"}>
      {t(text[diary.status])}{" "}
      {diary.status === "offline" ? (
        <button type="button" className="btn btn-secondary btn-small" onClick={diary.retry}>
          {t("Try again")}
        </button>
      ) : null}
    </p>
  );
}

function MeasureHelp() {
  const { t } = useFormats();
  return (
    <details className="card stack no-print hd-help">
      <summary>
        <strong>{t("Can LifeZoi measure these for me?")}</strong>
      </summary>
      <p>
        {t("No. A website or a phone screen cannot measure blood pressure, blood sugar, or cholesterol. Apps that promise to read them from a camera or a fingertip on the screen are not reliable, and LifeZoi does not offer or recommend them. Measure with a proper device or a lab test, then type the numbers here.")}
      </p>
      <ul className="hd-list">
        <li>
          <strong>{t("Blood pressure:")}</strong>{" "}
          {t("an automatic monitor with a cuff on the upper arm, checked (validated) for accuracy. Wrist and finger monitors are not recommended. Some pharmacies can measure it too.")}{" "}
          <SourceLink source={SOURCES.bpHome} />
        </li>
        <li>
          <strong>{t("Blood sugar:")}</strong>{" "}
          {t("a home glucose meter with a finger-prick test strip, or a continuous glucose monitor that your doctor suggests (a small sensor worn on the skin). A lab test is used for diagnosis.")}
        </li>
        <li>
          <strong>{t("Cholesterol:")}</strong>{" "}
          {t("a blood test at a lab or clinic. Home finger-prick kits exist, but there is no reliable way to measure cholesterol without a blood sample.")}
        </li>
      </ul>
      <p className="hint">{t("LifeZoi does not sell devices or apps and gets nothing from any brand.")}</p>
    </details>
  );
}

function SourceLink({ source }: { source: Source }) {
  const { t } = useFormats();
  return (
    <a href={source.href} target="_blank" rel="noopener noreferrer">
      {t(source.title)} ({source.publisher})
    </a>
  );
}

function EntryForm({
  kind,
  unit,
  setUnit,
  canSave,
  sample,
  onSave,
}: {
  kind: ReadingKind;
  unit: GlucoseUnit;
  setUnit: (unit: GlucoseUnit) => void;
  canSave: boolean;
  sample: boolean;
  onSave: DiaryApi["add"];
}) {
  const { t } = useFormats();
  const [form, setForm] = useState<ReadingForm>(() => ({ kind, ...nowParts(), context: "fasting" }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<HealthReading | null>(null);
  const set = (field: keyof ReadingForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const id = (field: string) => `hd-${kind}-${field}`;

  const field = (name: keyof ReadingForm, label: string, hint?: string) => {
    const error = errorText(t, errors, name);
    return (
      <label className="field" htmlFor={id(name)}>
        <span>{label}</span>
        {hint ? <span className="hint">{hint}</span> : null}
        <input
          id={id(name)}
          inputMode="decimal"
          autoComplete="off"
          value={(form[name] as string | undefined) ?? ""}
          onChange={set(name)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id(name)}-error` : undefined}
        />
        {error ? (
          <span className="field-error" id={`${id(name)}-error`}>
            {error}
          </span>
        ) : null}
      </label>
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setSaved(null);
    const result = validateReading({ ...form, kind, unit });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    if (!canSave) {
      setMessage(sample ? t("The sample is on, so nothing is saved.") : t("This reading was not saved."));
      return;
    }
    setBusy(true);
    const ok = await onSave(result.reading);
    setBusy(false);
    if (!ok) {
      setMessage(t("This reading was not saved. Please try again."));
      return;
    }
    setSaved({ ...result.reading, id: "just-saved" } as HealthReading);
    setMessage(t("Reading saved to your diary."));
    setForm((current) => ({ kind, ...nowParts(), context: current.context, note: "" }));
  };

  const note = saved ? safetyNoteFor(saved) : null;

  return (
    <section className="card stack no-print">
      <h2>{t("Add a {kind} reading", { kind: t(KIND_LABELS[kind]).toLowerCase() })}</h2>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="grid-2">
          <label className="field" htmlFor={id("date")}>
            <span>{t("Date")}</span>
            <input id={id("date")} type="date" value={form.date} max={nowParts().date} onChange={set("date")} aria-invalid={errors.date ? true : undefined} />
          </label>
          <label className="field" htmlFor={id("time")}>
            <span>{t("Time")}</span>
            <input id={id("time")} type="time" value={form.time} onChange={set("time")} />
          </label>
        </div>
        {errors.date ? <p className="field-error">{errorText(t, errors, "date")}</p> : null}

        {kind === "blood_pressure" ? (
          <div className="hd-fields">
            {field("systolic", t("Systolic, the upper number (mmHg)"))}
            {field("diastolic", t("Diastolic, the lower number (mmHg)"))}
            {field("pulse", t("Pulse (beats per minute)"), t("Optional."))}
          </div>
        ) : (
          <fieldset className="hd-unit">
            <legend>{t("Unit")}</legend>
            {(["mmol/L", "mg/dL"] as const).map((choice) => (
              <label key={choice} className="check-row">
                <input type="radio" name={id("unit")} value={choice} checked={unit === choice} onChange={() => setUnit(choice)} />
                <span>{choice}</span>
              </label>
            ))}
            <span className="hint">{t("Use the unit printed on your meter or lab report. The diary converts between them.")}</span>
          </fieldset>
        )}

        {kind === "glucose" ? (
          <div className="hd-fields">
            {field("glucose", t("Blood sugar ({unit})", { unit }))}
            <label className="field" htmlFor={id("context")}>
              <span>{t("When was it measured?")}</span>
              <select id={id("context")} value={form.context} onChange={set("context")}>
                {GLUCOSE_CONTEXTS.map((context) => (
                  <option key={context} value={context}>
                    {t(CONTEXT_LABELS[context] as string)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {kind === "cholesterol" ? (
          <>
            <p className="hint">{t("Copy the numbers from your lab report. Fill in the ones you have.")}</p>
            <div className="hd-fields">
              {(["total", "ldl", "hdl", "triglycerides"] as const).map((part) => (
                <div key={part}>{field(part, `${t(LIPID_LABELS[part])} (${unit})`)}</div>
              ))}
            </div>
          </>
        ) : null}

        <label className="field" htmlFor={id("note")}>
          <span>{t("Note")}</span>
          <span className="hint">{t("Optional. For example: after a walk, new monitor, felt dizzy.")}</span>
          <input id={id("note")} type="text" maxLength={300} value={form.note ?? ""} onChange={set("note")} />
          {errors.note ? <span className="field-error">{errorText(t, errors, "note")}</span> : null}
        </label>

        <p>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? t("Saving…") : t("Save reading")}
          </button>
        </p>
        <p role="status" aria-live="polite">
          {message}
        </p>
      </form>
      {note ? <SafetyNoteBox note={note} /> : null}
    </section>
  );
}

function SafetyNoteBox({ note }: { note: NonNullable<ReturnType<typeof safetyNoteFor>> }) {
  const { t } = useFormats();
  return (
    <div className={`hd-safety${note.emergency ? " is-emergency" : ""}`} role="alert">
      <strong>{t(note.title)}</strong>
      <p>{t(note.body)}</p>
    </div>
  );
}

function ComparisonBadge({ comparison }: { comparison: Comparison | null }) {
  const { t } = useFormats();
  if (!comparison) return null;
  return (
    <span className={`hd-badge hd-badge-${comparison.tone}`}>
      <span className="sr-only">{t(TONE_WORD[comparison.tone])}: </span>
      {t(comparison.label)}
    </span>
  );
}

function shownValue(reading: HealthReading, unit: GlucoseUnit, t: Translate, n: (value: number) => string): string {
  if (reading.kind === "blood_pressure") return `${reading.systolic}/${reading.diastolic} mmHg${reading.pulse ? ` · ${t("pulse {pulse}", { pulse: reading.pulse })}` : ""}`;
  if (reading.kind === "glucose") return `${n(glucoseFromMgdl(reading.glucose, unit))} ${unit}`;
  return (["total", "ldl", "hdl", "triglycerides"] as const)
    .filter((part) => reading[part] !== null)
    .map((part) => `${t(LIPID_LABELS[part])} ${n(lipidFromMgdl(reading[part] as number, unit, part))}`)
    .join(" · ")
    .concat(` ${unit}`);
}

function KindOverview({
  kind,
  readings,
  unit,
  canDelete,
  onDelete,
}: {
  kind: ReadingKind;
  readings: HealthReading[];
  unit: GlucoseUnit;
  canDelete: boolean;
  onDelete: DiaryApi["remove"];
}) {
  const { t, chartDate, when, number } = useFormats();
  const [period, setPeriod] = useState<Period>(kind === "cholesterol" ? "all" : "90d");
  const [confirm, setConfirm] = useState<string | null>(null);
  const narrow = useNarrow();
  const ofKind = readings.filter((reading) => reading.kind === kind);
  const shown = inPeriod(ofKind, period);
  const last = latest(ofKind);

  const convert = (value: number, key: string) => {
    if (kind === "blood_pressure") return value;
    if (kind === "glucose") return glucoseFromMgdl(value, unit);
    return lipidFromMgdl(value, unit, key as LipidPart);
  };
  const rawSeries =
    kind === "blood_pressure"
      ? bloodPressureSeries(shown as BloodPressureReading[])
      : kind === "glucose"
        ? glucoseSeries(shown as GlucoseReading[])
        : cholesterolSeries(shown as CholesterolReading[]);
  const series = rawSeries.map((line) => ({ ...line, points: line.points.map((point) => ({ ...point, value: convert(point.value, line.key) })) }));
  const chartLines: ChartLine[] = series.map((line, index) => ({
    key: line.key,
    name: t(SERIES_LABELS[line.key] ?? line.name),
    points: groupForChart(line.points, period),
    tone: index,
  }));
  const chartUnit = kind === "blood_pressure" ? "mmHg" : unit;
  const guides =
    kind === "blood_pressure"
      ? [
          { value: 120, label: "120" },
          { value: 80, label: "80" },
        ]
      : kind === "glucose"
        ? [
            { value: glucoseFromMgdl(70, unit), label: t("{value}: low", { value: glucoseFromMgdl(70, unit) }) },
            { value: glucoseFromMgdl(100, unit), label: t("{value}: fasting", { value: glucoseFromMgdl(100, unit) }) },
          ]
        : [];
  const summaries = series.map((line) => ({ name: t(SERIES_LABELS[line.key] ?? line.name), summary: summarize(line.points) }));

  return (
    <section className="card stack hd-overview no-print">
      <div className="hd-head">
        <h2>{t("Your {kind} readings", { kind: t(KIND_LABELS[kind]).toLowerCase() })}</h2>
        <label className="field" htmlFor={`hd-period-${kind}`}>
          <span>{t("Show")}</span>
          <select id={`hd-period-${kind}`} value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
            {PERIODS.map((item) => (
              <option key={item} value={item}>
                {t(PERIOD_LABELS[item])}
              </option>
            ))}
          </select>
        </label>
      </div>

      {last ? (
        <div className="hd-latest">
          <span className="hint">{t("Latest reading, {when}", { when: when(last.measuredAt) })}</span>
          <strong className="hd-latestValue">{shownValue(last, unit, t, number)}</strong>
          <LatestComparison reading={last} />
          {(() => {
            const note = safetyNoteFor(last);
            return note ? <SafetyNoteBox note={note} /> : null;
          })()}
        </div>
      ) : (
        <p>{t("No readings yet. Add your first one above.")}</p>
      )}

      {shown.length > 0 ? (
        <figure className="stack hd-figure">
          <figcaption className="hint">
            {period === "1y" || period === "all"
              ? t("Each point is the average of one week. The table lists every reading.")
              : t("Each point is one reading. The table lists every reading.")}
          </figcaption>
          <TrendChart lines={chartLines} guides={guides} unit={chartUnit} title={t("Chart of your {kind} readings", { kind: t(KIND_LABELS[kind]).toLowerCase() })} format={chartDate} compact={narrow} />
          <ChartKey lines={chartLines} unit={chartUnit} />
        </figure>
      ) : last ? (
        <p>{t("No readings in this period. Choose a longer period.")}</p>
      ) : null}

      {summaries.some((item) => item.summary && item.summary.count > 1) ? (
        <section className="stack">
          <h3>{t("Summary for the period")}</h3>
          <ul className="hd-summary">
            {summaries.map(({ name, summary }) =>
              summary ? (
                <li key={name}>
                  <strong>{name}</strong>
                  <dl>
                    <dt>{t("Readings")}</dt>
                    <dd>{summary.count}</dd>
                    <dt>{t("Average")}</dt>
                    <dd>{number(summary.average)}</dd>
                    <dt>{t("Lowest")}</dt>
                    <dd>{number(summary.lowest)}</dd>
                    <dt>{t("Highest")}</dt>
                    <dd>{number(summary.highest)}</dd>
                    <dt>{t("First → latest")}</dt>
                    <dd>
                      {number(summary.first)} → {number(summary.last)}
                    </dd>
                  </dl>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {shown.length > 0 ? (
        <details>
          <summary>{t("All readings in this period ({count})", { count: shown.length })}</summary>
          <div className="table-wrap">
            <table className="data-table hd-history">
              <thead>
                <tr>
                  <th scope="col">{t("Date and time")}</th>
                  <th scope="col">{t("Reading")}</th>
                  <th scope="col">{t("Note")}</th>
                  <th scope="col">
                    <span className="sr-only">{t("Delete")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...shown].reverse().map((reading) => (
                  <tr key={reading.id}>
                    <td>{when(reading.measuredAt)}</td>
                    <td>
                      {shownValue(reading, unit, t, number)}
                      {reading.kind === "glucose" ? <span className="hint"> · {t(CONTEXT_LABELS[reading.context] as string)}</span> : null}
                    </td>
                    <td>{reading.note}</td>
                    <td>
                      {canDelete ? (
                        confirm === reading.id ? (
                          <span className="hd-confirm">
                            <button
                              type="button"
                              className="btn btn-danger btn-small"
                              onClick={() => {
                                setConfirm(null);
                                void onDelete(reading.id);
                              }}
                            >
                              {t("Yes, delete")}
                            </button>
                            <button type="button" className="btn btn-secondary btn-small" onClick={() => setConfirm(null)}>
                              {t("Keep")}
                            </button>
                          </span>
                        ) : (
                          <button type="button" className="btn btn-secondary btn-small" onClick={() => setConfirm(reading.id)}>
                            {t("Delete")}
                          </button>
                        )
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </section>
  );
}

function LatestComparison({ reading }: { reading: HealthReading }) {
  const { t } = useFormats();
  if (reading.kind === "blood_pressure") return <ComparisonBadge comparison={compareBloodPressure(reading)} />;
  if (reading.kind === "glucose") {
    const comparison = compareGlucose(reading);
    return comparison ? (
      <ComparisonBadge comparison={comparison} />
    ) : (
      <span className="hint">{t("Compare it with the target your doctor gave you, or with the general ranges below.")}</span>
    );
  }
  return (
    <ul className="hd-badges">
      {compareCholesterol(reading).map(({ part, comparison }) => (
        <li key={part}>
          {t(LIPID_LABELS[part])}: <ComparisonBadge comparison={comparison} />
        </li>
      ))}
    </ul>
  );
}

function References({ kind }: { kind: ReadingKind }) {
  const { t } = useFormats();
  return (
    <section className="card stack no-print">
      <h2>{t("General reference ranges")}</h2>
      <p className="hint">
        {t("These are general numbers for adults from public health organizations, for comparison only. They are not a diagnosis and not your personal target. Your doctor may set different targets for you, for example during pregnancy, for older adults, or with diabetes, kidney, or heart conditions.")}
      </p>
      {kind === "blood_pressure" ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <caption>{t("Blood pressure categories for adults (mmHg)")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("Category")}</th>
                  <th scope="col">{t("Systolic (upper)")}</th>
                  <th scope="col">{t("Diastolic (lower)")}</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">{t("Normal range")}</th><td>{t("below 120")}</td><td>{t("and below 80")}</td></tr>
                <tr><th scope="row">{t("Elevated range")}</th><td>120–129</td><td>{t("and below 80")}</td></tr>
                <tr><th scope="row">{t("Stage 1 high blood pressure range")}</th><td>130–139</td><td>{t("or 80–89")}</td></tr>
                <tr><th scope="row">{t("Stage 2 high blood pressure range")}</th><td>{t("140 or higher")}</td><td>{t("or 90 or higher")}</td></tr>
                <tr><th scope="row">{t("Severely high")}</th><td>{t("higher than 180")}</td><td>{t("and/or higher than 120")}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="hint">{t("Doctors look at the average of several readings on different days, not one number. Sit quietly for five minutes before measuring.")}</p>
          <p><SourceLink source={SOURCES.bp} /></p>
        </>
      ) : null}
      {kind === "glucose" ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <caption>{t("Blood sugar (mg/dL, with mmol/L in brackets)")}</caption>
              <tbody>
                <tr><th scope="row">{t("Low blood sugar")}</th><td>{t("below 70 (3.9)")}</td></tr>
                <tr><th scope="row">{t("Fasting lab test: usual range")}</th><td>{t("below 100 (5.6)")}</td></tr>
                <tr><th scope="row">{t("Fasting lab test: prediabetes range")}</th><td>{t("100–125 (5.6–6.9)")}</td></tr>
                <tr><th scope="row">{t("Fasting lab test: diabetes range")}</th><td>{t("126 or higher (7.0 or higher)")}</td></tr>
                <tr><th scope="row">{t("Common target before meals for many adults with diabetes")}</th><td>{t("80–130 (4.4–7.2)")}</td></tr>
                <tr><th scope="row">{t("Common target 1–2 hours after a meal starts, for many adults with diabetes")}</th><td>{t("below 180 (10.0)")}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="hint">{t("A home meter reading is not a diagnosis. Diabetes is diagnosed by a doctor with lab tests.")}</p>
          <p className="hd-sources">
            <SourceLink source={SOURCES.glucoseDiagnosis} /> <SourceLink source={SOURCES.glucoseTesting} /> <SourceLink source={SOURCES.glucoseTargets} />{" "}
            <SourceLink source={SOURCES.glucoseLow} />
          </p>
        </>
      ) : null}
      {kind === "cholesterol" ? (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <caption>{t("Cholesterol for adults 20 and older (mg/dL)")}</caption>
              <tbody>
                <tr><th scope="row">{t("Total cholesterol")}</th><td>{t("below 200")}</td></tr>
                <tr><th scope="row">{t("LDL")}</th><td>{t("below 100")}</td></tr>
                <tr><th scope="row">{t("HDL")}</th><td>{t("60 or higher is best; low is below 40 for men and below 50 for women")}</td></tr>
                <tr><th scope="row">{t("Triglycerides")}</th><td>{t("below 150 normal; 150–199 borderline high; 200 or higher high")}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="hint">{t("To compare mmol/L, divide cholesterol in mg/dL by 38.67 and triglycerides by 88.57. The diary does this for you.")}</p>
          <p><SourceLink source={SOURCES.cholesterol} /></p>
        </>
      ) : null}
    </section>
  );
}

function SafetyCard() {
  const { t } = useFormats();
  return (
    <section className="card stack hd-safetyCard no-print">
      <h2>{t("When to get help")}</h2>
      <ul className="hd-list">
        <li>{t("Call your local emergency number if a very high blood pressure reading comes with chest pain, shortness of breath, back pain, numbness, weakness, a change in vision, or trouble speaking.")}</li>
        <li>{t("Call your local emergency number if someone with low blood sugar cannot eat or drink safely, has a seizure, or passes out.")}</li>
        <li>{t("Contact your doctor if your readings are often outside the targets they gave you, or if you feel unwell, whatever the numbers say.")}</li>
        <li>{t("Do not start, stop, or change any medicine because of a number in this diary. Talk to your doctor first.")}</li>
      </ul>
    </section>
  );
}

function ReminderSettings({ prefs, onChange }: { prefs: ReminderPrefs; onChange: (prefs: ReminderPrefs) => void }) {
  const { t } = useFormats();
  return (
    <section className="card stack no-print">
      <h2>{t("Reminders")}</h2>
      <p className="hint">{t("Optional. When a reading is due, a reminder appears at the top of this page. LifeZoi does not send notifications, e-mails, or texts. Your choice is remembered in this browser.")}</p>
      <div className="hd-fields">
        {READING_KINDS.map((kind) => (
          <label key={kind} className="field" htmlFor={`hd-remind-${kind}`}>
            <span>{t(KIND_LABELS[kind])}</span>
            <select id={`hd-remind-${kind}`} value={prefs[kind]} onChange={(event) => onChange({ ...prefs, [kind]: event.target.value as ReminderChoice })}>
              {REMINDER_CHOICES.map((choice) => (
                <option key={choice} value={choice}>
                  {t(REMINDER_LABELS[choice])}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

function ExportAndDelete({ diary }: { diary: DiaryApi }) {
  const { t } = useFormats();
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const has = diary.readings.length > 0;

  const download = () => {
    const blob = new Blob([readingsToCsv(diary.readings, t)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifezoi-health-diary-${localDay(new Date().toISOString())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card stack no-print">
      <h2>{t("Show your doctor, or delete")}</h2>
      <p>{t("Download every reading as a spreadsheet file (CSV), or print a summary or save it as a PDF from the print window. The file is made on this device and is not sent anywhere.")}</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={download} disabled={!has}>
          {t("Download CSV")}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()} disabled={!has}>
          {t("Print summary")}
        </button>
        <Link className="btn btn-secondary" href="/my-health/report">
          {t("Weekly report for my doctor")}
        </Link>
      </div>
      {diary.status === "account" ? (
        <div className="stack">
          {confirm ? (
            <div className="hd-safety" role="alert">
              <p>{t("Delete all {count} readings from your account? This cannot be undone.", { count: diary.readings.length })}</p>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    setConfirm(false);
                    const ok = await diary.removeAll();
                    setMessage(ok ? t("All readings were deleted.") : t("The readings were not deleted. Please try again."));
                  }}
                >
                  {t("Yes, delete all readings")}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirm(false)}>
                  {t("Keep my readings")}
                </button>
              </div>
            </div>
          ) : (
            <p>
              <button type="button" className="btn btn-secondary" onClick={() => setConfirm(true)} disabled={!has}>
                {t("Delete all readings")}
              </button>
            </p>
          )}
          <p role="status">{message}</p>
          <p className="hint">{t("Deleting your account also deletes the diary. “Clear my data” in Settings deletes it too.")}</p>
        </div>
      ) : null}
    </section>
  );
}

function PrintSummary({ readings, unit }: { readings: HealthReading[]; unit: GlucoseUnit }) {
  const { t, when, longDay, number } = useFormats();
  const sorted = [...readings].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
  return (
    <section className="hd-print-only">
      <h1>{t("Blood pressure, sugar & cholesterol diary")}</h1>
      <p>{t("Printed on {date}. Readings typed in by the person; LifeZoi did not measure them.", { date: longDay(new Date()) })}</p>
      {READING_KINDS.map((kind) => {
        const rows = sorted.filter((reading) => reading.kind === kind);
        if (rows.length === 0) return null;
        return (
          <section key={kind}>
            <h2>{t(KIND_LABELS[kind])}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">{t("Date and time")}</th>
                  <th scope="col">{t("Reading")}</th>
                  <th scope="col">{t("Note")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((reading) => (
                  <tr key={reading.id}>
                    <td>{when(reading.measuredAt)}</td>
                    <td>
                      {shownValue(reading, unit, t, number)}
                      {reading.kind === "glucose" ? ` · ${t(CONTEXT_LABELS[reading.context] as string)}` : ""}
                    </td>
                    <td>{reading.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
      <p>{t("General information only, not a diagnosis or treatment advice. Individual targets differ; ask your doctor what numbers are right for you.")}</p>
    </section>
  );
}
