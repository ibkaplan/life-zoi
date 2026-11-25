"use client";

import { useId, useState } from "react";
import { useT } from "@/components/locale-provider";
import {
  ACTIVITY,
  estimateCalories,
  feetInchesToCm,
  LIMITS,
  parseNumber,
  poundsToKg,
  type ActivityLevel,
  type Sex,
} from "@/lib/free/calculators";
import { FREE_SOURCES } from "@/lib/free/sources";
import { msg } from "@/lib/i18n/translate";
import { FreeFrame } from "./free-frame";

type Units = "metric" | "us";

export function CalorieCalculator() {
  const t = useT();
  const id = useId();
  const [units, setUnits] = useState<Units>("metric");
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("light");
  const [shown, setShown] = useState(false);

  const ageN = parseNumber(age, LIMITS.age);
  const heightCm =
    units === "metric"
      ? parseNumber(height, LIMITS.heightCm)
      : (() => {
          const f = parseNumber(feet, { min: 3, max: 7 });
          const i = inches.trim() === "" ? 0 : parseNumber(inches, { min: 0, max: 11.9 });
          if (f === null || i === null) return null;
          return parseNumber(feetInchesToCm(f, i).toFixed(1), LIMITS.heightCm);
        })();
  const weightKg =
    units === "metric"
      ? parseNumber(weight, LIMITS.weightKg)
      : (() => {
          const lb = parseNumber(weight, { min: 77, max: 660 });
          return lb === null ? null : poundsToKg(lb);
        })();
  const ready = ageN !== null && heightCm !== null && weightKg !== null;
  const result = ready ? estimateCalories({ sex, age: ageN, heightCm, weightKg, activity }) : null;

  return (
    <FreeFrame
      href="/free/calorie-calculator"
      kicker={msg("Free calculator")}
      title={msg("Daily calorie calculator")}
      lead={msg("See about how much energy your body uses in a day, from your age, height, weight, and how active you are.")}
      sources={[FREE_SOURCES.mifflin]}
    >
      <form
        className="card free-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setShown(true);
        }}
      >
        <fieldset className="free-segment">
          <legend>{t("Units")}</legend>
          {(["metric", "us"] as const).map((key) => (
            <label key={key}>
              <input type="radio" name={`${id}-units`} checked={units === key} onChange={() => setUnits(key)} />
              {key === "metric" ? t("Kilograms and centimetres") : t("Pounds, feet, and inches")}
            </label>
          ))}
        </fieldset>
        <fieldset className="free-segment">
          <legend>{t("The formula is different for")}</legend>
          {(["female", "male"] as const).map((key) => (
            <label key={key}>
              <input type="radio" name={`${id}-sex`} checked={sex === key} onChange={() => setSex(key)} />
              {key === "female" ? t("Women") : t("Men")}
            </label>
          ))}
        </fieldset>
        <div className="free-fields">
          <label className="field" htmlFor={`${id}-age`}>
            <span>{t("Age, years")}</span>
            <input id={`${id}-age`} inputMode="numeric" autoComplete="off" value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
          {units === "metric" ? (
            <label className="field" htmlFor={`${id}-height`}>
              <span>{t("Height, cm")}</span>
              <input id={`${id}-height`} inputMode="decimal" autoComplete="off" value={height} onChange={(e) => setHeight(e.target.value)} />
            </label>
          ) : (
            <>
              <label className="field" htmlFor={`${id}-feet`}>
                <span>{t("Height, feet")}</span>
                <input id={`${id}-feet`} inputMode="numeric" autoComplete="off" value={feet} onChange={(e) => setFeet(e.target.value)} />
              </label>
              <label className="field" htmlFor={`${id}-inches`}>
                <span>{t("and inches")}</span>
                <input id={`${id}-inches`} inputMode="decimal" autoComplete="off" value={inches} onChange={(e) => setInches(e.target.value)} />
              </label>
            </>
          )}
          <label className="field" htmlFor={`${id}-weight`}>
            <span>{units === "metric" ? t("Weight, kg") : t("Weight, pounds")}</span>
            <input id={`${id}-weight`} inputMode="decimal" autoComplete="off" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </label>
        </div>
        <label className="field" htmlFor={`${id}-activity`}>
          <span>{t("How active are you on a usual week?")}</span>
          <select id={`${id}-activity`} value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
            {ACTIVITY.map((level) => (
              <option key={level.key} value={level.key}>
                {t(level.label)}: {t(level.detail)}
              </option>
            ))}
          </select>
        </label>
        <div className="actions">
          <button className="btn btn-primary" type="submit">
            {t("Calculate")}
          </button>
        </div>
        {shown && !ready ? (
          <p className="field-error" role="alert">
            {t("Enter an age from 18 to 100, a height from 120 to 230 cm (4 ft 0 in to 7 ft 6 in), and a weight from 35 to 300 kg (77 to 660 lb).")}
          </p>
        ) : null}
      </form>
      {shown && result ? (
        <section className="free-result" aria-live="polite">
          <h2>{t("Your estimate")}</h2>
          <p className="free-big">
            {t("about {kcal} kcal", { kcal: result.daily.toLocaleString() })} <small>{t("a day to keep your weight about the same")}</small>
          </p>
          <p>{t("Resting energy (what your body uses at complete rest): about {kcal} kcal a day.", { kcal: result.resting.toLocaleString() })}</p>
          <p className="hint">
            {t(
              "This is a starting estimate. Real needs differ from person to person by a few hundred kcal. The formula is for adults and is not meant for pregnancy, breastfeeding, or people under 18. If you want to change your weight, a doctor or registered dietitian can help you choose a safe plan.",
            )}
          </p>
        </section>
      ) : null}
      <section className="card stack">
        <h2>{t("How it works")}</h2>
        <p>
          {t(
            "Resting energy comes from the Mifflin–St Jeor equation: 10 × weight in kg + 6.25 × height in cm − 5 × age in years, then + 5 for men or − 161 for women. It is multiplied by a common activity factor, from 1.2 for mostly sitting to 1.9 for a physical job with hard exercise.",
          )}
        </p>
      </section>
    </FreeFrame>
  );
}
