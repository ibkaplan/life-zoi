"use client";

import { useId, useState } from "react";
import { useT } from "@/components/locale-provider";
import { BP_TABLE, bpCategory, parseReading, type BpCategory } from "@/lib/free/calculators";
import { FREE_SOURCES } from "@/lib/free/sources";
import { safetyNoteFor } from "@/lib/health-diary/ranges";
import { msg } from "@/lib/i18n/translate";
import { FreeFrame } from "./free-frame";

const RESULT: Record<BpCategory, string> = {
  low: msg("Lower than the usual range"),
  normal: msg("In the normal range"),
  elevated: msg("In the elevated range"),
  stage1: msg("In the stage 1 high blood pressure range"),
  stage2: msg("In the stage 2 high blood pressure range"),
  severe: msg("In the hypertensive crisis range"),
};

const NEXT: Record<BpCategory, string> = {
  low: msg("Many people have readings like this without any problem."),
  normal: msg("Keep up the habits that help: moving every day, less salt, and not smoking."),
  elevated: msg("One reading is not enough to know. Measure on a few different days and show the results to your doctor at your next visit."),
  stage1: msg("One reading is not enough to know. Measure on a few different days and talk with your doctor about the results."),
  stage2: msg("Measure again after a few minutes of rest. If your readings stay in this range, contact your doctor soon."),
  severe: msg("Follow the safety note above."),
};

export function BloodPressureCheck() {
  const t = useT();
  const id = useId();
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [shown, setShown] = useState(false);
  const reading = parseReading(systolic, diastolic);
  const category = reading ? bpCategory(reading.systolic, reading.diastolic) : null;
  const safety = reading ? safetyNoteFor({ id: "free", kind: "blood_pressure", measuredAt: "", pulse: null, note: "", ...reading }) : null;

  return (
    <FreeFrame
      href="/free/blood-pressure"
      kicker={msg("Free reference")}
      title={msg("Blood pressure ranges")}
      lead={msg("Type a reading to see which general range of the American Heart Association it falls in. Ranges are for adults.")}
      sources={[FREE_SOURCES.ahaBp, FREE_SOURCES.ahaBpHome]}
    >
      <form
        className="card free-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setShown(true);
        }}
      >
        <div className="free-fields">
          <label className="field" htmlFor={`${id}-sys`}>
            <span>{t("Top number (systolic), mmHg")}</span>
            <input id={`${id}-sys`} inputMode="numeric" autoComplete="off" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
          </label>
          <label className="field" htmlFor={`${id}-dia`}>
            <span>{t("Bottom number (diastolic), mmHg")}</span>
            <input id={`${id}-dia`} inputMode="numeric" autoComplete="off" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button className="btn btn-primary" type="submit">
            {t("Show the range")}
          </button>
        </div>
        {shown && !reading ? (
          <p className="field-error" role="alert">
            {t("Enter both numbers from your monitor, for example 120 and 80. The top number is the larger one.")}
          </p>
        ) : null}
      </form>
      {shown && reading && category ? (
        <section className={`free-result${safety?.emergency ? " free-tone-urgent" : ""}`} aria-live="polite">
          <h2>
            {reading.systolic}/{reading.diastolic} mmHg
          </h2>
          <p className="free-big">{t(RESULT[category])}</p>
          {safety ? (
            <div className={`alert ${safety.emergency ? "alert-error" : ""}`} role={safety.emergency ? "alert" : "note"}>
              <strong>{t(safety.title)}</strong>
              <p>{t(safety.body)}</p>
            </div>
          ) : null}
          <p>{t(NEXT[category])}</p>
        </section>
      ) : null}
      <section className="card stack">
        <h2>{t("Blood pressure categories for adults")}</h2>
        <div className="free-table-wrap">
          <table className="free-table">
            <thead>
              <tr>
                <th scope="col">{t("Category")}</th>
                <th scope="col">{t("Top number")}</th>
                <th scope="col" />
                <th scope="col">{t("Bottom number")}</th>
              </tr>
            </thead>
            <tbody>
              {BP_TABLE.map((row) => (
                <tr key={row.key} data-current={shown && category === row.key ? "true" : undefined}>
                  <th scope="row">{t(row.label)}</th>
                  <td>{t(row.systolic)}</td>
                  <td>{t(row.join)}</td>
                  <td>{t(row.diastolic)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">{t("When the two numbers fall in different categories, the higher category counts. A diagnosis needs several readings and a doctor.")}</p>
      </section>
      <section className="card stack">
        <h2>{t("How to measure at home")}</h2>
        <ul>
          <li>{t("For 30 minutes before, do not smoke, exercise, or drink coffee or other drinks with caffeine. Empty your bladder.")}</li>
          <li>{t("Sit quietly for at least five minutes, with your back supported and your feet flat on the floor. Do not cross your legs, talk, or use your phone.")}</li>
          <li>{t("Rest your arm on a table with the middle of the cuff at heart level, on bare skin.")}</li>
          <li>{t("Take two readings one minute apart, and measure at the same time each day.")}</li>
        </ul>
      </section>
    </FreeFrame>
  );
}
