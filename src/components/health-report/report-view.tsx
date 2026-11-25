"use client";

import "./health-report.css";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { useCompanion } from "@/lib/companion/store";
import { addIsoDays, localISODate } from "@/lib/dates";
import { CONTEXT_LABELS, localTime } from "@/lib/health-diary/csv";
import type { Summary } from "@/lib/health-diary/series";
import { useHealthDiary, type DiaryStatus } from "@/lib/health-diary/store";
import type { CholesterolReading, GlucoseUnit } from "@/lib/health-diary/types";
import { glucoseFromMgdl, lipidFromMgdl } from "@/lib/health-diary/units";
import { buildWeeklyReport, FEELING_LABELS, LIPID_NAMES, reportToCsv, reportWindow, sampleDays, type WeeklyReport } from "@/lib/health-report/report";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";

/** The same remembered unit as the health diary, so both pages show numbers the same way. */
const UNIT_KEY = "lifezoi.health-diary.unit.v1";
const NOTES_MAX = 600;

const noSubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

function useFormats() {
  const { locale, t } = useLocale();
  const lang = LOCALE_META[locale].htmlLang;
  return useMemo(() => {
    const long = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const weekday = new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    const local = new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "short" });
    const numbers = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });
    const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
    return {
      t,
      locale,
      longDate: (iso: string) => long.format(utc(iso)),
      dayLabel: (iso: string) => weekday.format(utc(iso)),
      readingDay: (iso: string) => `${local.format(new Date(iso))}, ${localTime(iso)}`,
      number: (value: number) => numbers.format(value),
    };
  }, [lang, locale, t]);
}

const STATUS_TEXT: Record<DiaryStatus, string> = {
  loading: msg("Loading your diary…"),
  account: msg("Made from your own account on this device. Nothing is sent to LifeZoi staff, an AI, or any other service."),
  "not-ready": msg("Your account is signed in, but the diary storage is not set up yet, so blood pressure, sugar, and cholesterol cannot be shown."),
  offline: msg("Your diary could not be reached just now. The report shows only sleep and mood."),
  sample: msg("You are looking at the Sample visitor. Every number on this report is made up."),
  "signed-out": msg("Sign in to make a report from your own diary."),
};

export function WeeklyReportView() {
  const { t, longDate, locale } = useFormats();
  const account = useAccount();
  const { sample } = useSession();
  const userId = account.phase === "ready" ? account.userId : null;
  const diary = useHealthDiary(userId, sample);
  const companion = useCompanion();
  const mounted = useMounted();
  const [unit, setUnit] = useState<GlucoseUnit>(locale === "en" ? "mg/dL" : "mmol/L");
  const [endDay, setEndDay] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(UNIT_KEY);
    } catch {
      stored = null;
    }
    queueMicrotask(() => {
      if (stored === "mg/dL" || stored === "mmol/L") setUnit(stored);
    });
  }, []);

  if (!mounted || !companion.ready) return <p className="hint">{t("Loading your report…")}</p>;

  const today = localISODate();
  const window_ = reportWindow(endDay || today, today);
  const days = sample ? sampleDays(today) : companion.state;
  const report = buildWeeklyReport(diary.readings, days, window_);
  const isError = diary.status === "not-ready" || diary.status === "offline";

  const chooseUnit = (next: GlucoseUnit) => {
    setUnit(next);
    try {
      window.localStorage.setItem(UNIT_KEY, next);
    } catch {
      // Only means the unit is not remembered.
    }
  };

  const download = () => {
    const blob = new Blob([reportToCsv(report, unit, t)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifezoi-weekly-report-${report.from}-to-${report.to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack-lg wr-page">
      <section className="stack no-print">
        <p className="kicker">{t("My Health")}</p>
        <h1>{t("Weekly report for my doctor")}</h1>
        <p className="lede">
          {t("One page with your blood pressure, blood sugar, and cholesterol from the health diary, and the sleep, mood, and energy you noted in My Day. Print it, save it as a PDF, or download it to take to an appointment. It lists your own numbers. It is not a diagnosis.")}
        </p>
        <p className={isError ? "alert alert-error" : "hint"} role={isError ? "alert" : "status"}>
          {t(STATUS_TEXT[diary.status])}{" "}
          {diary.status === "offline" ? (
            <button type="button" className="btn btn-secondary btn-small" onClick={diary.retry}>
              {t("Try again")}
            </button>
          ) : null}
        </p>
      </section>

      <section className="card stack no-print" aria-labelledby="wr-setup">
        <h2 id="wr-setup">{t("Choose the week")}</h2>
        <div className="wr-week">
          <button type="button" className="btn btn-secondary" onClick={() => setEndDay(addIsoDays(window_.to, -7))}>
            {t("Previous week")}
          </button>
          <label className="field wr-date">
            <span>{t("Last day of the report")}</span>
            <input type="date" max={today} value={window_.to} onChange={(event) => setEndDay(event.target.value)} />
          </label>
          <button type="button" className="btn btn-secondary" disabled={window_.to >= today} onClick={() => setEndDay(addIsoDays(window_.to, 7))}>
            {t("Next week")}
          </button>
        </div>
        <p className="hint">{t("From {from} to {to}.", { from: longDate(window_.from), to: longDate(window_.to) })}</p>

        <fieldset className="wr-unit">
          <legend>{t("Unit for blood sugar and cholesterol")}</legend>
          {(["mg/dL", "mmol/L"] as const).map((choice) => (
            <label key={choice} className="check-row">
              <input type="radio" name="wr-unit" checked={unit === choice} onChange={() => chooseUnit(choice)} />
              <span>{choice}</span>
            </label>
          ))}
        </fieldset>

        <div className="wr-fields">
          <label className="field">
            <span>{t("Name to print on the report (optional)")}</span>
            <input type="text" maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("Questions or notes for my doctor (optional)")}</span>
            <textarea rows={3} maxLength={NOTES_MAX} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
        <p className="hint">{t("The name and notes are not saved anywhere. They only appear on this page and on the printout.")}</p>

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            {t("Print or save as PDF")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={download} disabled={report.empty}>
            {t("Download CSV")}
          </button>
        </div>
        <p className="hint">{t("Both are made on this device. The file is not sent anywhere.")}</p>
      </section>

      <ReportSheet report={report} unit={unit} name={name.trim()} notes={notes.trim()} sample={sample} />

      <p className="hint no-print">
        <Link href="/my-health/diary">{t("Add readings in the health diary")}</Link> · <Link href="/my-day">{t("Note sleep and mood in My Day")}</Link> ·{" "}
        <Link href="/my-health">{t("Back to My Health")}</Link>
      </p>
    </div>
  );
}

function SummaryLine({ label, summary, unit, convert }: { label: string; summary: Summary | null; unit: string; convert?: (value: number) => number }) {
  const { t, number } = useFormats();
  if (!summary) return null;
  const show = (value: number) => number(convert ? convert(value) : value);
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{summary.count}</td>
      <td>
        {show(summary.average)} {unit}
      </td>
      <td>
        {show(summary.lowest)}–{show(summary.highest)} {unit}
      </td>
      <td className="wr-hide-narrow">{t("{first} → {last}", { first: show(summary.first), last: show(summary.last) })}</td>
    </tr>
  );
}

function SummaryHead() {
  const { t } = useFormats();
  return (
    <thead>
      <tr>
        <th scope="col">{t("Measure")}</th>
        <th scope="col">{t("Readings")}</th>
        <th scope="col">{t("Average")}</th>
        <th scope="col">{t("Lowest–highest")}</th>
        <th scope="col" className="wr-hide-narrow">
          {t("First → latest")}
        </th>
      </tr>
    </thead>
  );
}

function cholesterolText(reading: CholesterolReading, unit: GlucoseUnit, t: (text: string) => string, number: (value: number) => string) {
  return (["total", "ldl", "hdl", "triglycerides"] as const)
    .filter((part) => reading[part] !== null)
    .map((part) => `${t(LIPID_NAMES[part])} ${number(lipidFromMgdl(reading[part] as number, unit, part))}`)
    .join(" · ")
    .concat(` ${unit}`);
}

function ReportSheet({ report, unit, name, notes, sample }: { report: WeeklyReport; unit: GlucoseUnit; name: string; notes: string; sample: boolean }) {
  const { t, longDate, dayLabel, readingDay, number } = useFormats();
  const bp = report.bloodPressure;
  const glucose = (value: number) => glucoseFromMgdl(value, unit);
  const noted = report.days.filter((day) => day.sleepHours !== null || day.mood !== null || day.energy !== null || day.feeling !== null);

  return (
    <article className="card wr-sheet" aria-labelledby="wr-title">
      <header className="wr-sheetHead">
        <div>
          <p className="wr-brand">LifeZoi</p>
          <h2 id="wr-title">{t("Weekly health report")}</h2>
          <p className="wr-period">{t("From {from} to {to}.", { from: longDate(report.from), to: longDate(report.to) })}</p>
        </div>
        <dl className="wr-meta">
          {name ? (
            <>
              <dt>{t("Name")}</dt>
              <dd>{name}</dd>
            </>
          ) : null}
          <dt>{t("Made on")}</dt>
          <dd>{longDate(localISODate())}</dd>
        </dl>
      </header>

      {sample ? <p className="wr-sampleTag">{t("Sample visitor: made-up numbers, not a real person.")}</p> : null}

      <p className="wr-notice">
        <strong>{t("Not a diagnosis.")}</strong>{" "}
        {t("Every number here was measured elsewhere and typed in by the person. LifeZoi did not measure, check, or interpret them, and gives no medical advice. Please read them alongside your own measurements and tests.")}
      </p>

      {report.empty ? (
        <p className="wr-empty">{t("Nothing was recorded in these seven days. Add readings in the health diary, or note sleep and mood in My Day, and they will appear here.")}</p>
      ) : null}

      <section className="wr-block" aria-labelledby="wr-bp">
        <h3 id="wr-bp">{t("Blood pressure")}</h3>
        {bp.readings.length === 0 ? (
          <p className="wr-none">{t("No readings this week.")}</p>
        ) : (
          <>
            <div className="wr-scroll">
              <table className="data-table wr-table">
                <SummaryHead />
                <tbody>
                  <SummaryLine label={t("Systolic (upper)")} summary={bp.systolic} unit="mmHg" />
                  <SummaryLine label={t("Diastolic (lower)")} summary={bp.diastolic} unit="mmHg" />
                  <SummaryLine label={t("Pulse")} summary={bp.pulse} unit={t("per min")} />
                </tbody>
              </table>
            </div>
            <ReadingList
              rows={bp.readings.map((reading) => ({
                id: reading.id,
                when: readingDay(reading.measuredAt),
                value: `${reading.systolic}/${reading.diastolic} mmHg${reading.pulse ? ` · ${t("pulse {pulse}", { pulse: reading.pulse })}` : ""}`,
                note: reading.note,
              }))}
            />
          </>
        )}
      </section>

      <section className="wr-block" aria-labelledby="wr-glucose">
        <h3 id="wr-glucose">{t("Blood sugar")}</h3>
        {report.glucose.length === 0 ? (
          <p className="wr-none">{t("No readings this week.")}</p>
        ) : (
          <>
            <div className="wr-scroll">
              <table className="data-table wr-table">
                <SummaryHead />
                <tbody>
                  {report.glucose.map((group) => (
                    <SummaryLine key={group.context} label={t(CONTEXT_LABELS[group.context] as string)} summary={group.summary} unit={unit} convert={glucose} />
                  ))}
                </tbody>
              </table>
            </div>
            <ReadingList
              rows={report.glucose
                .flatMap((group) => group.readings)
                .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
                .map((reading) => ({
                  id: reading.id,
                  when: readingDay(reading.measuredAt),
                  value: `${number(glucose(reading.glucose))} ${unit} · ${t(CONTEXT_LABELS[reading.context] as string)}`,
                  note: reading.note,
                }))}
            />
          </>
        )}
      </section>

      <section className="wr-block" aria-labelledby="wr-chol">
        <h3 id="wr-chol">{t("Cholesterol")}</h3>
        {report.cholesterol.length > 0 ? (
          <ReadingList rows={report.cholesterol.map((reading) => ({ id: reading.id, when: readingDay(reading.measuredAt), value: cholesterolText(reading, unit, t, number), note: reading.note }))} />
        ) : report.earlierCholesterol ? (
          <p>
            {t("No new result this week. Latest result, from {date}:", { date: readingDay(report.earlierCholesterol.measuredAt) })} {cholesterolText(report.earlierCholesterol, unit, t, number)}
          </p>
        ) : (
          <p className="wr-none">{t("No results in the diary.")}</p>
        )}
      </section>

      <section className="wr-block" aria-labelledby="wr-sleep">
        <h3 id="wr-sleep">{t("Sleep, mood, and energy")}</h3>
        {noted.length === 0 ? (
          <p className="wr-none">{t("Nothing noted this week.")}</p>
        ) : (
          <>
            <ul className="wr-facts">
              {report.sleep ? (
                <li>
                  {t("Sleep: about {hours} hours a night on average, {low} to {high} hours, {nights} nights noted.", {
                    hours: number(report.sleep.average),
                    low: number(report.sleep.lowest),
                    high: number(report.sleep.highest),
                    nights: report.sleep.count,
                  })}
                </li>
              ) : null}
              {report.mood ? <li>{t("Mood: {average} on average (1 low, 5 high), {days} days noted.", { average: number(report.mood.average), days: report.mood.count })}</li> : null}
              {report.energy ? <li>{t("Energy: {average} on average (1 low, 5 high), {days} days noted.", { average: number(report.energy.average), days: report.energy.count })}</li> : null}
              {report.feelings.great + report.feelings.okay + report.feelings.low > 0 ? (
                <li>
                  {t("How I felt: great {great}, okay {okay}, low energy {low} days.", { great: report.feelings.great, okay: report.feelings.okay, low: report.feelings.low })}
                </li>
              ) : null}
            </ul>
            <div className="wr-scroll">
              <table className="data-table wr-table wr-days">
                <thead>
                  <tr>
                    <th scope="col">{t("Day")}</th>
                    <th scope="col">{t("Sleep (hours)")}</th>
                    <th scope="col">{t("Mood")}</th>
                    <th scope="col">{t("Energy")}</th>
                    <th scope="col">{t("How I felt")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.days.map((day) => (
                    <tr key={day.date}>
                      <th scope="row">{dayLabel(day.date)}</th>
                      <td>{day.sleepHours === null ? "–" : number(day.sleepHours)}</td>
                      <td>{day.mood ?? "–"}</td>
                      <td>{day.energy ?? "–"}</td>
                      <td>{day.feeling ? t(FEELING_LABELS[day.feeling]) : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {notes ? (
        <section className="wr-block" aria-labelledby="wr-notes">
          <h3 id="wr-notes">{t("Questions and notes for the doctor")}</h3>
          <p className="wr-notes">{notes}</p>
        </section>
      ) : null}

      <footer className="wr-foot">
        <p>
          {t("Sources: blood pressure, blood sugar, and cholesterol from the LifeZoi health diary; sleep, mood, and energy from My Day; how I felt from LifeZoi Daily. A dash means nothing was noted that day, not a zero.")}
        </p>
        <p>
          {t("General information only, not a diagnosis or treatment advice. Individual targets differ; ask your doctor what numbers are right for you. Do not change any medicine because of this report.")}
        </p>
      </footer>
    </article>
  );
}

function ReadingList({ rows }: { rows: { id: string; when: string; value: string; note: string }[] }) {
  const { t } = useFormats();
  return (
    <div className="wr-scroll">
      <table className="data-table wr-table wr-readings">
        <thead>
          <tr>
            <th scope="col">{t("Date and time")}</th>
            <th scope="col">{t("Reading")}</th>
            <th scope="col">{t("Note")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.when}</td>
              <td>{row.value}</td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
