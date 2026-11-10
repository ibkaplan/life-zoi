"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";

const SUGAR_QUESTIONS = [
  ["when", msg("When do cravings show up most?"), ["morning", msg("Morning")], ["afternoon", msg("Afternoon")], ["evening", msg("Evening")], ["unsure", msg("It varies")]],
  ["drink", msg("How often are sugary drinks part of the day?"), ["often", msg("Most days")], ["sometimes", msg("Some days")], ["rarely", msg("Rarely")]],
  ["sleep", msg("How was sleep this week?"), ["short", msg("Often short")], ["mixed", msg("Mixed")], ["steady", msg("Mostly steady")]],
] as const;

export function SugarDetectiveView() {
  const t = useT();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const evening = answers.when === "evening";
  const shortSleep = answers.sleep === "short";
  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">{t("Sugar Detective")}</p>
        <h1>{t("Notice the pattern around sweet cravings")}</h1>
        <p className="lede">
          {t("This is a reflection, not a diagnosis. Answers stay in this tab and are not sent to an AI provider.")}
        </p>
      </div>
      {SUGAR_QUESTIONS.map(([id, legend, ...options]) => (
        <fieldset className="card field" key={id}>
          <legend>{t(legend)}</legend>
          <div className="choices">
            {options.map(([value, label]) => (
              <label className="choice" key={value}>
                <input type="radio" name={id} checked={answers[id] === value} onChange={() => setAnswers({ ...answers, [id]: value })} />
                <span>{t(label)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <section className="card stack">
        <h2>{t("What the answers suggest looking at")}</h2>
        <ul>
          <li>{t("Regular meals and water are common starting points in general nutrition education.")}</li>
          {evening ? <li>{t("You marked evening cravings. A planned snack you already like can be easier than waiting until you are very hungry.")}</li> : null}
          {shortSleep ? <li>{t("You marked short sleep. Sleep and appetite are often discussed together. This page cannot say your cravings are caused by sleep.")}</li> : null}
          {!evening && !shortSleep ? <li>{t("Choose the options that fit if you want a more specific note.")}</li> : null}
        </ul>
        <p>{t("A registered dietitian or clinician can help with personal food decisions. lifeZoi does not prescribe a diet.")}</p>
      </section>
    </div>
  );
}

const LABELS = [
  {
    name: msg("Sample sparkling water"),
    sugar: msg("0 g added sugars"),
    fiber: msg("0 g fiber"),
    protein: msg("0 g protein"),
    note: msg("A fictional label. Water with no added sugar is a common swap for a sugary drink."),
  },
  {
    name: msg("Sample fruit yogurt"),
    sugar: msg("14 g added sugars"),
    fiber: msg("0 g fiber"),
    protein: msg("8 g protein"),
    note: msg("A fictional label. Added sugars and protein can both be listed. The grams are made up for practice."),
  },
  {
    name: msg("Sample bean soup"),
    sugar: msg("1 g added sugars"),
    fiber: msg("7 g fiber"),
    protein: msg("9 g protein"),
    note: msg("A fictional label. Beans are one food people use when they want more fiber."),
  },
];

export function FoodIntelligenceView() {
  const t = useT();
  const [index, setIndex] = useState(0);
  const label = LABELS[index];
  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">{t("Food Intelligence")}</p>
        <h1>{t("Practice reading a fictional food label")}</h1>
        <p className="lede">
          {t("These packages are invented. The U.S. Food and Drug Administration publishes the real rules for Nutrition Facts labels. This page does not scan a package.")}
        </p>
      </div>
      <div className="choices">
        {LABELS.map((item, itemIndex) => (
          <button key={item.name} className="btn btn-secondary" type="button" aria-pressed={index === itemIndex} onClick={() => setIndex(itemIndex)}>
            {t(item.name)}
          </button>
        ))}
      </div>
      <article className="card stack">
        <h2>{t(label.name)}</h2>
        <ul>
          <li>{t(label.sugar)}</li>
          <li>{t(label.fiber)}</li>
          <li>{t(label.protein)}</li>
        </ul>
        <p>{t(label.note)}</p>
        <p>
          {t("On a real label, compare the serving size with what you actually eat, then look at added sugars, fiber, and protein. A larger portion means those amounts scale with the servings you eat.")}
        </p>
        <a href="https://medlineplus.gov/nutrition.html">MedlinePlus: {t("Nutrition")}</a>
      </article>
    </div>
  );
}

const MOVES = [
  {
    title: msg("Sit to stand"),
    text: msg("From a sturdy chair, stand up and sit down slowly up to five times. Use your hands if you need them. Stop if you feel pain or dizziness."),
  },
  {
    title: msg("Balance near a counter"),
    text: msg("Stand at a kitchen counter. Hold on, then lighten your grip only if you feel steady. Keep both feet down if one-foot standing feels unsafe."),
  },
  {
    title: msg("Notice three things"),
    text: msg("While seated, name three things you can see and three sounds you can hear. This is an attention exercise, not a memory test."),
  },
];

export function BalanceChallengeView() {
  const t = useT();
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">{t("Balance and Brain Challenge")}</p>
        <h1>{t("Optional practice, with a safety stop")}</h1>
        <p className="lede">
          {t("Skip any movement that does not feel safe. This is not a fall-prevention prescription and it does not replace physical therapy.")}
        </p>
      </div>
      {MOVES.map((move) => (
        <article className="card stack" key={move.title}>
          <h2>{t(move.title)}</h2>
          <p>{t(move.text)}</p>
          <label className="choice">
            <input
              type="checkbox"
              checked={done.includes(move.title)}
              onChange={(event) =>
                setDone(event.target.checked ? [...done, move.title] : done.filter((item) => item !== move.title))
              }
            />
            <span>{t("I practiced this, or I chose to skip it after reading the caution")}</span>
          </label>
        </article>
      ))}
      <p role="status">
        {t("{done} of {total} items marked in this tab. The marks are cleared when you close the tab.", { done: done.length, total: MOVES.length })}
      </p>
    </div>
  );
}
