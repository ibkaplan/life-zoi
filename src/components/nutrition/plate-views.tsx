"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWellness } from "@/components/wellness/use-wellness";
import { formatLongDate } from "@/lib/dates";
import { commitWellness } from "@/lib/wellness/client-store";
import { upsertCheck } from "@/lib/wellness/storage";
import {
  amountText,
  challengeCopy,
  challengeProgress,
  challengeSteps,
  fatChoices,
  fatCopy,
  fatKinds,
  groceryCategories,
  groceryChecklist,
  groceryCopy,
  groceryNotes,
  grocerySamples,
  illustrativeBanner,
  labelById,
  parseAmount,
  planFields,
  plantCatalogIds,
  plantCheckId,
  plantGroups,
  plateExamples,
  plateFoods,
  plateIntro,
  plateSources,
  plateSummary,
  proteinCards,
  proteinCopy,
  rainbowCopy,
  relatedLinks,
  saltCopy,
  saltPlaces,
  saltTips,
  sodiumAnswer,
  sodiumPairs,
  sodiumQuestion,
  uniquePlantsMarked,
  weekStart,
  type DrawKind,
  type FoodVisual,
  type GrocerySide,
  type PlateSlot,
  type TeachingLabel,
} from "@/lib/nutrition/plate";

const slots: { id: PlateSlot; label: string }[] = [
  { id: "produce", label: "Vegetables and fruit" },
  { id: "protein", label: "Protein" },
  { id: "grain", label: "Grains and other carbohydrate foods" },
  { id: "fat", label: "Healthy fats, modest amount" },
];

type Draft = {
  mode: "sample" | "enter";
  sampleId: string;
  product: string;
  serving: string;
  calories: string;
  addedSugars: string;
  sodium: string;
  fiber: string;
  protein: string;
  ingredients: string;
};

function emptyDraft(sampleId: string): Draft {
  return {
    mode: "sample",
    sampleId,
    product: "",
    serving: "",
    calories: "",
    addedSugars: "",
    sodium: "",
    fiber: "",
    protein: "",
    ingredients: "",
  };
}

function useMarks() {
  const wellness = useWellness();
  const [status, setStatus] = useState<string | null>(null);

  function marked(id: string) {
    return wellness.log.checks.some((item) => item.id === id && item.done);
  }

  function textOf(id: string) {
    return wellness.log.checks.find((item) => item.id === id)?.reflection ?? "";
  }

  function write(id: string, done: boolean, reflection: string) {
    if (wellness.sample) {
      setStatus(wellness.readOnlyMessage);
      return;
    }
    const prior = wellness.log.checks.find((item) => item.id === id);
    commitWellness(
      upsertCheck(
        { ...wellness.log, checks: wellness.log.checks.filter((item) => item.id !== id) },
        { id, date: prior?.date ?? wellness.today, done, reflection },
      ),
    );
    setStatus("Saved in this browser tab with your other check-ins.");
  }

  function toggle(id: string) {
    const prior = wellness.log.checks.find((item) => item.id === id);
    write(id, prior ? !prior.done : true, prior?.reflection ?? "");
  }

  function writeMany(entries: { id: string; done: boolean; reflection: string }[]) {
    if (wellness.sample) {
      setStatus(wellness.readOnlyMessage);
      return;
    }
    let next = wellness.log;
    for (const entry of entries) {
      const prior = next.checks.find((item) => item.id === entry.id);
      next = upsertCheck(
        { ...next, checks: next.checks.filter((item) => item.id !== entry.id) },
        {
          id: entry.id,
          date: prior?.date ?? wellness.today,
          done: entry.done,
          reflection: entry.reflection,
        },
      );
    }
    commitWellness(next);
    setStatus("Saved in this browser tab with your other check-ins.");
  }

  function clearMatching(match: (id: string) => boolean) {
    if (wellness.sample) {
      setStatus(wellness.readOnlyMessage);
      return;
    }
    commitWellness({
      ...wellness.log,
      checks: wellness.log.checks.filter((item) => !match(item.id)),
    });
    setStatus("Cleared in this browser tab.");
  }

  return { wellness, status, marked, textOf, writeMany, toggle, clearMatching };
}

function FoodDraw({ kind, label }: { kind: DrawKind; label: string }) {
  return (
    <svg className="nz-draw" viewBox="0 0 320 240" role="img" aria-label={label}>
      <rect width="320" height="240" rx="28" fill="#F7F8FF" />
      {kind === "egg" ? (
        <>
          <ellipse cx="160" cy="124" rx="62" ry="78" fill="#ffffff" stroke="#5725A8" strokeWidth="8" />
          <ellipse cx="160" cy="132" rx="24" ry="28" fill="#E9DDFB" stroke="#7136C8" strokeWidth="6" />
        </>
      ) : null}
      {kind === "fish" ? (
        <>
          <ellipse cx="150" cy="120" rx="78" ry="42" fill="#DCEEFF" stroke="#4295E8" strokeWidth="8" />
          <path d="M220 120 l48 -36 v72 z" fill="#4295E8" />
          <circle cx="112" cy="112" r="6" fill="#172554" />
        </>
      ) : null}
      {kind === "chicken" ? (
        <path d="M118 150c40-70 90-70 90-20 0 28-20 40-20 40h-48s-8 28-36 28c-22 0-30-18-22-36 8-16 22-12 36-12z" fill="#E9DDFB" stroke="#7136C8" strokeWidth="8" />
      ) : null}
      {kind === "cheese" ? (
        <>
          <ellipse cx="160" cy="150" rx="78" ry="28" fill="#ffffff" stroke="#5725A8" strokeWidth="8" />
          <path d="M82 150c0-40 34-70 78-70s78 30 78 70" fill="#E9DDFB" stroke="#5725A8" strokeWidth="8" />
        </>
      ) : null}
      {kind === "tofu" ? (
        <>
          <rect x="78" y="78" width="70" height="54" rx="8" fill="#ffffff" stroke="#5725A8" strokeWidth="7" />
          <rect x="150" y="96" width="78" height="58" rx="8" fill="#F7F8FF" stroke="#7136C8" strokeWidth="7" />
          <rect x="110" y="132" width="64" height="42" rx="8" fill="#DCEEFF" stroke="#4295E8" strokeWidth="7" />
        </>
      ) : null}
      {kind === "oil" ? (
        <>
          <rect x="132" y="48" width="56" height="28" rx="8" fill="#5725A8" />
          <path d="M118 84h84l18 112H100z" fill="#DCEEFF" stroke="#4295E8" strokeWidth="8" />
        </>
      ) : null}
      {kind === "avocado" ? (
        <>
          <ellipse cx="160" cy="120" rx="70" ry="86" fill="#3d6b4f" />
          <ellipse cx="160" cy="126" rx="42" ry="58" fill="#d5e38a" />
          <circle cx="160" cy="132" r="16" fill="#5725A8" />
        </>
      ) : null}
      {kind === "nuts" ? (
        <>
          <ellipse cx="120" cy="130" rx="36" ry="28" fill="#E9DDFB" stroke="#5725A8" strokeWidth="7" />
          <ellipse cx="176" cy="118" rx="40" ry="30" fill="#DCEEFF" stroke="#4295E8" strokeWidth="7" />
          <ellipse cx="196" cy="156" rx="32" ry="24" fill="#ffffff" stroke="#7136C8" strokeWidth="7" />
        </>
      ) : null}
      {kind === "seed" ? (
        <>
          <ellipse cx="110" cy="120" rx="16" ry="28" fill="#7136C8" />
          <ellipse cx="160" cy="132" rx="16" ry="28" fill="#5725A8" />
          <ellipse cx="208" cy="116" rx="16" ry="28" fill="#4295E8" />
        </>
      ) : null}
    </svg>
  );
}

function Visual({ item }: { item: FoodVisual }) {
  return (
    <div>
      {item.image ? (
        <div className="nz-photoFrame">
          <Image src={item.image} alt={item.alt} width={1024} height={768} />
        </div>
      ) : item.draw ? (
        <FoodDraw kind={item.draw} label={item.alt} />
      ) : null}
      <p className="nz-note">{item.caption}</p>
    </div>
  );
}

function LabelSheet({ label }: { label: TeachingLabel }) {
  const rows = [
    ["Serving size", label.serving],
    ["Calories", `${label.calories} kcal`],
    ["Added sugars", `${label.addedSugarsG} g`],
    ["Sodium", `${label.sodiumMg} mg`],
    ["Fiber", `${label.fiberG} g`],
    ["Protein", `${label.proteinG} g`],
  ];
  return (
    <figure className="nz-labelSheet" aria-label={label.product}>
      <figcaption>{illustrativeBanner}</figcaption>
      <p className="nz-labelProduct">{label.product}</p>
      {rows.map(([name, value]) => (
        <p key={name} className={name === "Sodium" ? "nz-labelAdded" : "nz-labelRow"}>
          <span>{name}</span>
          <span>{value}</span>
        </p>
      ))}
      <p>Ingredients: {label.ingredients}</p>
    </figure>
  );
}

function Sources() {
  return (
    <ul className="nz-sources">
      {plateSources.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.publisher}: {source.name}
          </a>
          . Checked {source.checked}.
        </li>
      ))}
    </ul>
  );
}

function PlateSection() {
  const breakfast = plateExamples[0].foodIds;
  const [picked, setPicked] = useState<string[]>([...breakfast]);
  const summary = plateSummary(picked);

  function toggleFood(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section className="nz-panel" id="healthy-plate">
      <p className="nz-kicker">Plate</p>
      <h2>{plateIntro.title}</h2>
      <p>{plateIntro.lead}</p>
      <p>{plateIntro.vary}</p>
      <div className="nz-actions" aria-label="Example meals">
        {plateExamples.map((example) => (
          <button
            key={example.id}
            className="btn btn-secondary"
            type="button"
            onClick={() => setPicked([...example.foodIds])}
          >
            {example.name}
          </button>
        ))}
      </div>
      <div className="nz-split">
        <figure className="nz-plate" aria-label="Plate divided into vegetables and fruit, protein, and grains">
          <div className="nz-wedge nz-wedgeProduce">
            <h3>Vegetables and fruit</h3>
            <ul>
              {summary.produce.map((food) => (
                <li key={food.id}>{food.name}</li>
              ))}
            </ul>
          </div>
          <div className="nz-wedge nz-wedgeProtein">
            <h3>Protein</h3>
            <ul>
              {summary.protein.map((food) => (
                <li key={food.id}>{food.name}</li>
              ))}
            </ul>
          </div>
          <div className="nz-wedge nz-wedgeGrain">
            <h3>Grains</h3>
            <ul>
              {summary.grain.map((food) => (
                <li key={food.id}>{food.name}</li>
              ))}
            </ul>
          </div>
        </figure>
        <div className="nz-panel">
          <h3>Modest fat</h3>
          <ul>
            {summary.fat.length > 0 ? summary.fat.map((food) => <li key={food.id}>{food.name}</li>) : <li>None picked yet.</li>}
          </ul>
          <p role="status">{summary.message}</p>
        </div>
      </div>
      {slots.map((slot) => (
        <div key={slot.id}>
          <h3>{slot.label}</h3>
          <div className="nz-actions">
            {plateFoods.filter((food) => food.slot === slot.id).map((food) => {
              const on = picked.includes(food.id);
              return (
                <button key={food.id} className="nz-pick" type="button" aria-pressed={on} onClick={() => toggleFood(food.id)}>
                  <strong>{food.name}</strong>
                  <span>{food.note}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="nz-grid nz-two">
        {plateExamples.map((example) => (
          <article key={example.id} className="nz-panel">
            <h3>{example.name}</h3>
            <p>{example.blurb}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProteinSection() {
  return (
    <section className="nz-panel" id="protein">
      <p className="nz-kicker">Protein</p>
      <h2>{proteinCopy.title}</h2>
      <p>{proteinCopy.lead}</p>
      <p>{proteinCopy.aging}</p>
      <p>{proteinCopy.recovery}</p>
      <p>
        {proteinCopy.movement}{" "}
        <Link href="/academy/move">Open Movement</Link>
        {" · "}
        <Link href="/academy/move/chair-stand">Stand from a chair</Link>
        {" · "}
        <Link href="/academy/move/heel-to-toe">Heel-to-toe steps</Link>
      </p>
      <div className="nz-grid nz-three">
        {proteinCards.map((card) => (
          <article key={card.id} className="nz-panel">
            <Visual item={card} />
            <h3>{card.name}</h3>
            {card.vegetarian ? <p className="nz-pill">Vegetarian option</p> : null}
            <p>{card.note}</p>
            <p>
              <strong>Meal idea. </strong>
              {card.meal}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SaltSection() {
  const [pairId, setPairId] = useState<(typeof sodiumPairs)[number]["id"]>("soups");
  const [choice, setChoice] = useState("");
  const [shown, setShown] = useState(false);
  const pair = sodiumPairs.find((item) => item.id === pairId) ?? sodiumPairs[0];
  const left = labelById(pair.leftId);
  const right = labelById(pair.rightId);
  const answer = left && right ? sodiumAnswer(left, right) : null;

  return (
    <section className="nz-panel" id="hidden-salt">
      <p className="nz-kicker">Sodium</p>
      <h2>{saltCopy.title}</h2>
      <p>{saltCopy.titleNote}</p>
      <p>{saltCopy.saltVersusSodium}</p>
      <p>{saltCopy.pressure}</p>
      <div className="nz-grid nz-two">
        {saltPlaces.map((place) => (
          <article key={place.id} className="nz-panel">
            <h3>{place.title}</h3>
            <p>{place.text}</p>
          </article>
        ))}
      </div>
      <h3>Label reading</h3>
      <p>{saltCopy.label}</p>
      <div className="nz-actions">
        {sodiumPairs.map((item) => (
          <button
            key={item.id}
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setPairId(item.id);
              setChoice("");
              setShown(false);
            }}
          >
            {item.id === "soups" ? "Compare two soups" : "Compare two breads"}
          </button>
        ))}
      </div>
      {left && right && answer ? (
        <div className="nz-panel" id="sodium-quiz">
          <h3>{sodiumQuestion}</h3>
          <div className="nz-split">
            <LabelSheet label={left} />
            <LabelSheet label={right} />
          </div>
          <fieldset className="field">
            <legend>Choose the label with less sodium</legend>
            <div className="nz-choices">
              {[left, right].map((label) => (
                <label key={label.id} className="nz-choice">
                  <input
                    type="radio"
                    name="sodium-less"
                    value={label.id}
                    checked={choice === label.id}
                    onChange={() => setChoice(label.id)}
                  />
                  <span>{label.product}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="nz-actions">
            <button className="btn btn-primary" type="button" onClick={() => setShown(true)}>
              Check the sodium line
            </button>
          </div>
          {shown ? (
            <p role="status">
              {!choice
                ? "Choose a label first. "
                : choice === answer.winnerId
                  ? "That label lists less sodium. "
                  : "Look again at the sodium lines. "}
              {answer.sentence}
            </p>
          ) : null}
        </div>
      ) : null}
      <h3>Kitchen steps</h3>
      <ul>
        {saltTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

function FatSection() {
  const [fatId, setFatId] = useState(fatChoices[0]?.id ?? "olive-oil");
  const chosen = fatChoices.find((item) => item.id === fatId) ?? fatChoices[0];

  return (
    <section className="nz-panel" id="healthy-fats">
      <p className="nz-kicker">Fats</p>
      <h2>{fatCopy.title}</h2>
      <p>{fatCopy.lead}</p>
      <p>{fatCopy.modest}</p>
      <div className="nz-grid nz-three">
        {fatKinds.map((kind) => (
          <article key={kind.id} className="nz-panel">
            <h3>{kind.title}</h3>
            <p>{kind.text}</p>
          </article>
        ))}
      </div>
      <h3>Choose your healthy fat</h3>
      <div className="nz-actions">
        {fatChoices.map((choice) => (
          <button
            key={choice.id}
            className="nz-pick"
            type="button"
            aria-pressed={choice.id === fatId}
            onClick={() => setFatId(choice.id)}
          >
            <strong>{choice.name}</strong>
          </button>
        ))}
      </div>
      {chosen ? (
        <article className="nz-panel">
          <Visual item={chosen} />
          <h3>{chosen.name}</h3>
          <p>
            <strong>A swap. </strong>
            {chosen.swap}
          </p>
          <p>
            <strong>Meal idea. </strong>
            {chosen.meal}
          </p>
        </article>
      ) : null}
    </section>
  );
}

function RainbowSection() {
  const marks = useMarks();
  const catalog = plantCatalogIds();
  const week = weekStart(marks.wellness.today);
  const prefix = week ? `pw-${week}-` : "";
  const markedIds = prefix
    ? marks.wellness.log.checks
        .filter((item) => item.done && item.id.startsWith(prefix))
        .map((item) => item.id.slice(prefix.length))
    : [];
  const count = uniquePlantsMarked(markedIds, catalog);

  return (
    <section className="nz-panel" id="eat-the-rainbow">
      <p className="nz-kicker">Variety</p>
      <h2>{rainbowCopy.title}</h2>
      <p>{rainbowCopy.lead}</p>
      <p>{rainbowCopy.count}</p>
      {week ? <p>This week begins {formatLongDate(week)}.</p> : null}
      {marks.wellness.readOnlyMessage ? <p role="status">{marks.wellness.readOnlyMessage}</p> : null}
      {plantGroups.map((group) => (
        <div key={group.id}>
          <h3>{group.title}</h3>
          <div className="nz-actions">
            {group.foods.map((food) => {
              const id = week ? plantCheckId(week, food.id) : food.id;
              const on = marks.marked(id);
              return (
                <button
                  key={food.id}
                  className="nz-pick"
                  type="button"
                  aria-pressed={on}
                  disabled={!week}
                  onClick={() => marks.toggle(id)}
                >
                  <strong>{food.name}</strong>
                  <span>{on ? "Counted this week" : "Count once"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p role="status">
        {count} different plants marked this week. Thirty is not required.
        {count >= 30 ? " You have marked 30 or more. That is variety, not a finish line." : ""}
      </p>
      <button className="btn btn-secondary" type="button" onClick={() => marks.clearMatching((id) => prefix !== "" && id.startsWith(prefix))}>
        Reset this week
      </button>
      {marks.status ? <p role="status">{marks.status}</p> : null}
    </section>
  );
}

function sideFromDraft(draft: Draft): GrocerySide {
  if (draft.mode === "sample") {
    const sample = labelById(draft.sampleId);
    if (sample) return { ...sample, illustrative: true };
  }
  return {
    product: draft.product,
    serving: draft.serving,
    calories: parseAmount(draft.calories),
    addedSugarsG: parseAmount(draft.addedSugars),
    sodiumMg: parseAmount(draft.sodium),
    fiberG: parseAmount(draft.fiber),
    proteinG: parseAmount(draft.protein),
    ingredients: draft.ingredients,
    illustrative: false,
  };
}

function AmountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const invalid = value.trim() !== "" && parseAmount(value) === null;
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} inputMode="decimal" onChange={(event) => onChange(event.target.value)} />
      {invalid ? <span className="field-error">Use a plain number, zero or greater.</span> : null}
    </label>
  );
}

function SideEditor({ title, draft, onChange }: { title: string; draft: Draft; onChange: (next: Draft) => void }) {
  const sample = labelById(draft.sampleId);
  const category = sample?.category ?? "yogurt";

  function setCategory(next: string) {
    const first = grocerySamples.find((item) => item.category === next);
    if (first) onChange(emptyDraft(first.id));
  }

  function setProduct(value: string) {
    if (value !== "enter") {
      onChange(emptyDraft(value));
      return;
    }
    onChange({
      mode: "enter",
      sampleId: draft.sampleId,
      product: "",
      serving: "",
      calories: "",
      addedSugars: "",
      sodium: "",
      fiber: "",
      protein: "",
      ingredients: "",
    });
  }

  return (
    <div className="nz-panel">
      <h3>{title}</h3>
      <label className="field">
        <span>Food group</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {groceryCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sample or your own label</span>
        <select value={draft.mode === "enter" ? "enter" : draft.sampleId} onChange={(event) => setProduct(event.target.value)}>
          {grocerySamples
            .filter((item) => item.category === category)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.product}
              </option>
            ))}
          <option value="enter">Enter a label I am reading</option>
        </select>
      </label>
      {draft.mode === "sample" && sample ? <LabelSheet label={sample} /> : null}
      {draft.mode === "enter" ? (
        <div className="nz-grid">
          <p>Type only the numbers on the package in front of you. Leave a line blank if you do not see it. lifeZoi will not fill it in.</p>
          <label className="field">
            <span>Product name, optional</span>
            <input value={draft.product} maxLength={80} onChange={(event) => onChange({ ...draft, product: event.target.value })} />
          </label>
          <label className="field">
            <span>Serving size</span>
            <input value={draft.serving} maxLength={80} onChange={(event) => onChange({ ...draft, serving: event.target.value })} />
          </label>
          <AmountField label="Calories" value={draft.calories} onChange={(calories) => onChange({ ...draft, calories })} />
          <AmountField label="Added sugars, in grams" value={draft.addedSugars} onChange={(addedSugars) => onChange({ ...draft, addedSugars })} />
          <AmountField label="Sodium, in milligrams" value={draft.sodium} onChange={(sodium) => onChange({ ...draft, sodium })} />
          <AmountField label="Fiber, in grams" value={draft.fiber} onChange={(fiber) => onChange({ ...draft, fiber })} />
          <AmountField label="Protein, in grams" value={draft.protein} onChange={(protein) => onChange({ ...draft, protein })} />
          <label className="field">
            <span>Ingredients</span>
            <textarea value={draft.ingredients} maxLength={280} rows={3} onChange={(event) => onChange({ ...draft, ingredients: event.target.value })} />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function GrocerySection({ activePrint, onPrint }: { activePrint: boolean; onPrint: () => void }) {
  const marks = useMarks();
  const [left, setLeft] = useState<Draft>(emptyDraft("yogurt-plain"));
  const [right, setRight] = useState<Draft>(emptyDraft("yogurt-vanilla"));
  const leftSide = sideFromDraft(left);
  const rightSide = sideFromDraft(right);
  const notes = groceryNotes(leftSide, rightSide);
  const rows = [
    ["Serving size", leftSide.serving || "Not entered", rightSide.serving || "Not entered"],
    ["Calories", amountText(leftSide.calories, "kcal"), amountText(rightSide.calories, "kcal")],
    ["Added sugars", amountText(leftSide.addedSugarsG, "g"), amountText(rightSide.addedSugarsG, "g")],
    ["Sodium", amountText(leftSide.sodiumMg, "mg"), amountText(rightSide.sodiumMg, "mg")],
    ["Fiber", amountText(leftSide.fiberG, "g"), amountText(rightSide.fiberG, "g")],
    ["Protein", amountText(leftSide.proteinG, "g"), amountText(rightSide.proteinG, "g")],
    ["Ingredients", leftSide.ingredients || "Not entered", rightSide.ingredients || "Not entered"],
  ];

  return (
    <section className={activePrint ? "nz-panel nz-printing" : "nz-panel"} id="grocery">
      <p className="nz-kicker">Shopping</p>
      <h2>{groceryCopy.title}</h2>
      <p>{groceryCopy.lead}</p>
      <div className="nz-split nz-noPrint">
        <SideEditor title="First package" draft={left} onChange={setLeft} />
        <SideEditor title="Second package" draft={right} onChange={setRight} />
      </div>
      <div className="nz-panel nz-noPrint">
        <h3>Side by side</h3>
        <table className="nz-table">
          <caption>Amounts are per labeled serving. Illustrative samples are marked on their sheets.</caption>
          <thead>
            <tr>
              <th scope="col">Line</th>
              <th scope="col">{leftSide.product || "First label"}</th>
              <th scope="col">{rightSide.product || "Second label"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <div className="nz-panel" id="grocery-checklist">
        <h3>{groceryCopy.checklistTitle}</h3>
        <p>{groceryCopy.checklistNote}</p>
        {marks.wellness.readOnlyMessage ? <p role="status">{marks.wellness.readOnlyMessage}</p> : null}
        <ul className="nz-checkList">
          {groceryChecklist.map((item) => (
            <li key={item.id}>
              <label className="nz-choice">
                <input type="checkbox" checked={marks.marked(item.id)} onChange={() => marks.toggle(item.id)} />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="nz-actions nz-noPrint">
          <button className="btn btn-primary" type="button" onClick={onPrint}>
            Print checklist
          </button>
        </div>
        {marks.status ? <p role="status">{marks.status}</p> : null}
      </div>
    </section>
  );
}

function ChallengeSection({ activePrint, onPrint }: { activePrint: boolean; onPrint: () => void }) {
  const marks = useMarks();
  const [drafts, setDrafts] = useState<Record<string, string | null>>({});
  const doneIds = challengeSteps.filter((step) => marks.marked(step.id)).map((step) => step.id);
  const progress = challengeProgress(doneIds);

  function savePlan() {
    marks.writeMany(
      planFields.map((field) => {
        const text = drafts[field.id] ?? marks.textOf(field.id);
        return { id: field.id, done: text.trim().length > 0, reflection: text };
      }),
    );
  }

  return (
    <section className={activePrint ? "nz-panel nz-printing" : "nz-panel"} id="nutrition-challenge">
      <p className="nz-kicker">Challenge</p>
      <h2>{challengeCopy.title}</h2>
      <p>
        <strong>{challengeCopy.motto}</strong>
      </p>
      <p>{challengeCopy.lead}</p>
      {marks.wellness.readOnlyMessage ? <p role="status">{marks.wellness.readOnlyMessage}</p> : null}
      <p role="status">
        {progress.done} of {progress.total} steps marked in this browser tab.
      </p>
      {progress.complete ? <p role="status">{challengeCopy.done}</p> : null}
      <ol className="nz-steps">
        {challengeSteps.map((step) => (
          <li key={step.id}>
            <label className="nz-choice">
              <input type="checkbox" checked={marks.marked(step.id)} onChange={() => marks.toggle(step.id)} />
              <span>
                <strong>{step.title}. </strong>
                {step.body}
              </span>
            </label>
          </li>
        ))}
      </ol>
      <div className="nz-panel">
        <h3>Meal sketch</h3>
        <p>One breakfast, one lunch, one dinner, and two snacks.</p>
        {planFields.map((field) => {
          const value = drafts[field.id] ?? marks.textOf(field.id);
          return (
            <label key={field.id} className="field">
              <span>{field.label}</span>
              <input
                value={value}
                maxLength={280}
                onChange={(event) => setDrafts((current) => ({ ...current, [field.id]: event.target.value }))}
              />
            </label>
          );
        })}
        <div className="nz-actions nz-noPrint">
          <button className="btn btn-primary" type="button" onClick={savePlan} disabled={marks.wellness.sample}>
            Save the meal sketch
          </button>
          <button className="btn btn-secondary" type="button" onClick={onPrint}>
            Print summary
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => marks.clearMatching((id) => id.startsWith("nstep-"))}>
            Restart
          </button>
        </div>
        <p className="nz-note">{challengeCopy.restart}</p>
      </div>
      {marks.status ? <p role="status">{marks.status}</p> : null}
    </section>
  );
}

export function NutritionStudio() {
  const [printId, setPrintId] = useState<string | null>(null);

  useEffect(() => {
    if (!printId) return;
    document.body.classList.add("nutrition-printing");
    const finish = () => {
      document.body.classList.remove("nutrition-printing");
      window.removeEventListener("afterprint", finish);
      setPrintId(null);
    };
    window.addEventListener("afterprint", finish);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", finish);
    };
  }, [printId]);

  return (
    <div className="nz-studio">
      <PlateSection />
      <ProteinSection />
      <SaltSection />
      <FatSection />
      <RainbowSection />
      <GrocerySection activePrint={printId === "grocery"} onPrint={() => setPrintId("grocery")} />
      <ChallengeSection activePrint={printId === "challenge"} onPrint={() => setPrintId("challenge")} />
      <section className="nz-panel" id="nutrition-links">
        <h2>Elsewhere in lifeZoi</h2>
        <p>These pages are already part of lifeZoi. This Nutrition page does not invent a result for them.</p>
        <div className="nz-actions">
          {relatedLinks.map((link) => (
            <Link key={link.href} className="btn btn-secondary" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <h3>Sources you can open</h3>
        <Sources />
        <p className="nz-note">lifeZoi did not copy those articles or their images. The words on this plate are written for lifeZoi.</p>
      </section>
    </div>
  );
}
