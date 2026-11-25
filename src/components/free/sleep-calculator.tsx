"use client";

import { useId, useState } from "react";
import { useT } from "@/components/locale-provider";
import { bedtimes, LIMITS, parseNumber, SLEEP_HOURS, type SleepAge } from "@/lib/free/calculators";
import { FREE_SOURCES } from "@/lib/free/sources";
import { msg } from "@/lib/i18n/translate";
import { FreeFrame } from "./free-frame";

const AGES = Object.keys(SLEEP_HOURS) as SleepAge[];

export function SleepCalculator() {
  const t = useT();
  const id = useId();
  const [age, setAge] = useState<SleepAge>("adult");
  const [wake, setWake] = useState("07:00");
  const [fall, setFall] = useState("15");
  const fallN = parseNumber(fall, LIMITS.fallAsleep);
  const rows = fallN === null ? null : bedtimes(wake, age, Math.round(fallN));
  const range = SLEEP_HOURS[age];

  return (
    <FreeFrame
      href="/free/sleep-calculator"
      kicker={msg("Free calculator")}
      title={msg("Sleep and bedtime calculator")}
      lead={msg("See how many hours of sleep the U.S. CDC recommends for your age, and what time to go to bed to get them.")}
      sources={[FREE_SOURCES.cdcSleep, FREE_SOURCES.nhlbiSleep]}
    >
      <div className="card free-form">
        <div className="free-fields">
          <label className="field" htmlFor={`${id}-age`}>
            <span>{t("Your age")}</span>
            <select id={`${id}-age`} value={age} onChange={(e) => setAge(e.target.value as SleepAge)}>
              {AGES.map((key) => (
                <option key={key} value={key}>
                  {t(SLEEP_HOURS[key].label)}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor={`${id}-wake`}>
            <span>{t("I want to wake up at")}</span>
            <input id={`${id}-wake`} type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
          </label>
          <label className="field" htmlFor={`${id}-fall`}>
            <span>{t("Minutes I usually need to fall asleep")}</span>
            <input id={`${id}-fall`} inputMode="numeric" value={fall} onChange={(e) => setFall(e.target.value)} />
          </label>
        </div>
        {fallN === null ? (
          <p className="field-error" role="alert">
            {t("Enter a number of minutes from 0 to 90.")}
          </p>
        ) : null}
      </div>
      <section className="free-result" aria-live="polite">
        <h2>{t("Recommended for your age")}</h2>
        <p className="free-big">
          {range.orMore ? t("{hours} hours or more", { hours: range.min }) : t("{min} to {max} hours", { min: range.min, max: range.max })}
        </p>
        {rows ? (
          <div className="free-table-wrap">
            <table className="free-table">
              <thead>
                <tr>
                  <th scope="col">{t("Sleep")}</th>
                  <th scope="col">{t("Go to bed at")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.hours}>
                    <td>{t("{hours} hours", { hours: row.hours })}</td>
                    <td>
                      <strong>{row.bedtime}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      <section className="card stack">
        <h2>{t("Habits that help sleep")}</h2>
        <ul>
          <li>{t("Go to bed and get up at about the same time every day, including weekends.")}</li>
          <li>{t("Keep the bedroom dark, quiet, and cool, and put screens away before bed.")}</li>
          <li>{t("Avoid caffeine late in the day, and large meals and alcohol close to bedtime.")}</li>
          <li>{t("Get daylight and some physical activity during the day.")}</li>
          <li>{t("If you often feel sleepy during the day, snore loudly, or have trouble sleeping for weeks, talk with a doctor.")}</li>
        </ul>
      </section>
    </FreeFrame>
  );
}
