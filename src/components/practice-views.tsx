"use client";

import { useState } from "react";

const SUGAR_QUESTIONS = [
  ["when", "When do cravings show up most?", ["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"], ["unsure", "It varies"]],
  ["drink", "How often are sugary drinks part of the day?", ["often", "Most days"], ["sometimes", "Some days"], ["rarely", "Rarely"]],
  ["sleep", "How was sleep this week?", ["short", "Often short"], ["mixed", "Mixed"], ["steady", "Mostly steady"]],
] as const;

export function SugarDetectiveView() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const evening = answers.when === "evening";
  const shortSleep = answers.sleep === "short";
  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">Sugar Detective</p>
        <h1>Notice the pattern around sweet cravings</h1>
        <p className="lede">
          This is a reflection, not a diagnosis. Answers stay in this tab and are not sent to an AI provider.
        </p>
      </div>
      {SUGAR_QUESTIONS.map(([id, legend, ...options]) => (
        <fieldset className="card field" key={id}>
          <legend>{legend}</legend>
          <div className="choices">
            {options.map(([value, label]) => (
              <label className="choice" key={value}>
                <input type="radio" name={id} checked={answers[id] === value} onChange={() => setAnswers({ ...answers, [id]: value })} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <section className="card stack">
        <h2>What the answers suggest looking at</h2>
        <ul>
          <li>Regular meals and water are common starting points in general nutrition education.</li>
          {evening ? <li>You marked evening cravings. A planned snack you already like can be easier than waiting until you are very hungry.</li> : null}
          {shortSleep ? <li>You marked short sleep. Sleep and appetite are often discussed together. This page cannot say your cravings are caused by sleep.</li> : null}
          {!evening && !shortSleep ? <li>Choose the options that fit if you want a more specific note.</li> : null}
        </ul>
        <p>A registered dietitian or clinician can help with personal food decisions. lifeZoi does not prescribe a diet.</p>
      </section>
    </div>
  );
}

const LABELS = [
  {
    name: "Sample sparkling water",
    sugar: "0 g added sugars",
    fiber: "0 g fiber",
    protein: "0 g protein",
    note: "A fictional label. Water with no added sugar is a common swap for a sugary drink.",
  },
  {
    name: "Sample fruit yogurt",
    sugar: "14 g added sugars",
    fiber: "0 g fiber",
    protein: "8 g protein",
    note: "A fictional label. Added sugars and protein can both be listed. The grams are made up for practice.",
  },
  {
    name: "Sample bean soup",
    sugar: "1 g added sugars",
    fiber: "7 g fiber",
    protein: "9 g protein",
    note: "A fictional label. Beans are one food people use when they want more fiber.",
  },
];

export function FoodIntelligenceView() {
  const [index, setIndex] = useState(0);
  const label = LABELS[index];
  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">Food Intelligence</p>
        <h1>Practice reading a fictional food label</h1>
        <p className="lede">
          These packages are invented. The U.S. Food and Drug Administration publishes the real rules for Nutrition Facts labels. This page does not scan a package.
        </p>
      </div>
      <div className="choices">
        {LABELS.map((item, itemIndex) => (
          <button key={item.name} className="btn btn-secondary" type="button" aria-pressed={index === itemIndex} onClick={() => setIndex(itemIndex)}>
            {item.name}
          </button>
        ))}
      </div>
      <article className="card stack">
        <h2>{label.name}</h2>
        <ul>
          <li>{label.sugar}</li>
          <li>{label.fiber}</li>
          <li>{label.protein}</li>
        </ul>
        <p>{label.note}</p>
        <p>
          On a real label, compare the serving size with what you actually eat, then look at added sugars, fiber, and protein. A larger portion means those amounts scale with the servings you eat.
        </p>
        <a href="https://medlineplus.gov/nutrition.html">MedlinePlus: Nutrition</a>
      </article>
    </div>
  );
}

const MOVES = [
  {
    title: "Sit to stand",
    text: "From a sturdy chair, stand up and sit down slowly up to five times. Use your hands if you need them. Stop if you feel pain or dizziness.",
  },
  {
    title: "Balance near a counter",
    text: "Stand at a kitchen counter. Hold on, then lighten your grip only if you feel steady. Keep both feet down if one-foot standing feels unsafe.",
  },
  {
    title: "Notice three things",
    text: "While seated, name three things you can see and three sounds you can hear. This is an attention exercise, not a memory test.",
  },
];

export function BalanceChallengeView() {
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">Balance and Brain Challenge</p>
        <h1>Optional practice, with a safety stop</h1>
        <p className="lede">
          Skip any movement that does not feel safe. This is not a fall-prevention prescription and it does not replace physical therapy.
        </p>
      </div>
      {MOVES.map((move) => (
        <article className="card stack" key={move.title}>
          <h2>{move.title}</h2>
          <p>{move.text}</p>
          <label className="choice">
            <input
              type="checkbox"
              checked={done.includes(move.title)}
              onChange={(event) =>
                setDone(event.target.checked ? [...done, move.title] : done.filter((item) => item !== move.title))
              }
            />
            <span>I practiced this, or I chose to skip it after reading the caution</span>
          </label>
        </article>
      ))}
      <p role="status">{done.length} of {MOVES.length} items marked in this tab. The marks are cleared when you close the tab.</p>
    </div>
  );
}
