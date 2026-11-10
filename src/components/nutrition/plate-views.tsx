"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { useWellness } from "@/components/wellness/use-wellness";
import { msg } from "@/lib/i18n/translate";
import { formatLongDate } from "@/lib/dates";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
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
  { id: "produce", label: msg("Vegetables and fruit") },
  { id: "protein", label: msg("Protein") },
  { id: "grain", label: msg("Grains and other carbohydrate foods") },
  { id: "fat", label: msg("Healthy fats, modest amount") },
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
    setStatus(msg("Saved in this browser tab with your other check-ins."));
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
    setStatus(msg("Saved in this browser tab with your other check-ins."));
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
    setStatus(msg("Cleared in this browser tab."));
  }

  return { wellness, status, marked, textOf, writeMany, toggle, clearMatching };
}

/** The week's first day, written in the chosen language. English keeps the existing long date. */
function weekDate(iso: string, locale: Locale): string {
  if (locale === "en") return formatLongDate(iso);
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(LOCALE_META[locale].htmlLang, { year: "numeric", month: "long", day: "numeric" });
}

function FoodDraw({ kind, label }: { kind: DrawKind; label: string }) {
  return (
    <svg className="nz-draw" viewBox="0 0 320 240" role="img" aria-label={label}>
      <rect width="320" height="240" rx="28" fill="#F9F7F2" />
      {kind === "egg" ? (
        <>
          <ellipse cx="160" cy="124" rx="62" ry="78" fill="#ffffff" stroke="#52288A" strokeWidth="8" />
          <ellipse cx="160" cy="132" rx="24" ry="28" fill="#EFE5FA" stroke="#6A3DA8" strokeWidth="6" />
        </>
      ) : null}
      {kind === "fish" ? (
        <>
          <ellipse cx="150" cy="120" rx="78" ry="42" fill="#F3ECFB" stroke="#23706A" strokeWidth="8" />
          <path d="M220 120 l48 -36 v72 z" fill="#23706A" />
          <circle cx="112" cy="112" r="6" fill="#172554" />
        </>
      ) : null}
      {kind === "chicken" ? (
        <path d="M118 150c40-70 90-70 90-20 0 28-20 40-20 40h-48s-8 28-36 28c-22 0-30-18-22-36 8-16 22-12 36-12z" fill="#EFE5FA" stroke="#6A3DA8" strokeWidth="8" />
      ) : null}
      {kind === "cheese" ? (
        <>
          <ellipse cx="160" cy="150" rx="78" ry="28" fill="#ffffff" stroke="#52288A" strokeWidth="8" />
          <path d="M82 150c0-40 34-70 78-70s78 30 78 70" fill="#EFE5FA" stroke="#52288A" strokeWidth="8" />
        </>
      ) : null}
      {kind === "tofu" ? (
        <>
          <rect x="78" y="78" width="70" height="54" rx="8" fill="#ffffff" stroke="#52288A" strokeWidth="7" />
          <rect x="150" y="96" width="78" height="58" rx="8" fill="#F9F7F2" stroke="#6A3DA8" strokeWidth="7" />
          <rect x="110" y="132" width="64" height="42" rx="8" fill="#F3ECFB" stroke="#23706A" strokeWidth="7" />
        </>
      ) : null}
      {kind === "oil" ? (
        <>
          <rect x="132" y="48" width="56" height="28" rx="8" fill="#52288A" />
          <path d="M118 84h84l18 112H100z" fill="#F3ECFB" stroke="#23706A" strokeWidth="8" />
        </>
      ) : null}
      {kind === "avocado" ? (
        <>
          <ellipse cx="160" cy="120" rx="70" ry="86" fill="#3d6b4f" />
          <ellipse cx="160" cy="126" rx="42" ry="58" fill="#d5e38a" />
          <circle cx="160" cy="132" r="16" fill="#52288A" />
        </>
      ) : null}
      {kind === "nuts" ? (
        <>
          <ellipse cx="120" cy="130" rx="36" ry="28" fill="#EFE5FA" stroke="#52288A" strokeWidth="7" />
          <ellipse cx="176" cy="118" rx="40" ry="30" fill="#F3ECFB" stroke="#23706A" strokeWidth="7" />
          <ellipse cx="196" cy="156" rx="32" ry="24" fill="#ffffff" stroke="#6A3DA8" strokeWidth="7" />
        </>
      ) : null}
      {kind === "seed" ? (
        <>
          <ellipse cx="110" cy="120" rx="16" ry="28" fill="#6A3DA8" />
          <ellipse cx="160" cy="132" rx="16" ry="28" fill="#52288A" />
          <ellipse cx="208" cy="116" rx="16" ry="28" fill="#23706A" />
        </>
      ) : null}
    </svg>
  );
}

function Visual({ item }: { item: FoodVisual }) {
  const t = useT();
  return (
    <div>
      {item.image ? (
        <div className="nz-photoFrame">
          <Image src={item.image} alt={t(item.alt)} width={1024} height={768} />
        </div>
      ) : item.draw ? (
        <FoodDraw kind={item.draw} label={t(item.alt)} />
      ) : null}
      <p className="nz-note">{t(item.caption)}</p>
    </div>
  );
}

function LabelSheet({ label }: { label: TeachingLabel }) {
  const t = useT();
  const rows = [
    ["Serving size", t(label.serving)],
    ["Calories", t("{amount} kcal", { amount: label.calories })],
    ["Added sugars", t("{amount} g", { amount: label.addedSugarsG })],
    ["Sodium", t("{amount} mg", { amount: label.sodiumMg })],
    ["Fiber", t("{amount} g", { amount: label.fiberG })],
    ["Protein", t("{amount} g", { amount: label.proteinG })],
  ];
  return (
    <figure className="nz-labelSheet" aria-label={t(label.product)}>
      <figcaption>{t(illustrativeBanner)}</figcaption>
      <p className="nz-labelProduct">{t(label.product)}</p>
      {rows.map(([name, value]) => (
        <p key={name} className={name === "Sodium" ? "nz-labelAdded" : "nz-labelRow"}>
          <span>{t(name)}</span>
          <span>{value}</span>
        </p>
      ))}
      <p>{t("Ingredients: {list}", { list: t(label.ingredients) })}</p>
    </figure>
  );
}

function Sources() {
  const t = useT();
  return (
    <ul className="nz-sources">
      {plateSources.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.publisher}: {source.name}
          </a>
          . {t("Checked {date}.", { date: source.checked })}
        </li>
      ))}
    </ul>
  );
}

function PlateSection() {
  const breakfast = plateExamples[0].foodIds;
  const [picked, setPicked] = useState<string[]>([...breakfast]);
  const summary = plateSummary(picked);
  const t = useT();

  function toggleFood(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section className="nz-panel" id="healthy-plate">
      <p className="nz-kicker">{t("Plate")}</p>
      <h2>{t(plateIntro.title)}</h2>
      <p>{t(plateIntro.lead)}</p>
      <p>{t(plateIntro.vary)}</p>
      <div className="nz-actions" aria-label={t("Example meals")}>
        {plateExamples.map((example) => (
          <button
            key={example.id}
            className="btn btn-secondary"
            type="button"
            onClick={() => setPicked([...example.foodIds])}
          >
            {t(example.name)}
          </button>
        ))}
      </div>
      <div className="nz-split">
        <figure className="nz-plate" aria-label={t("Plate divided into vegetables and fruit, protein, and grains")}>
          <div className="nz-wedge nz-wedgeProduce">
            <h3>{t("Vegetables and fruit")}</h3>
            <ul>
              {summary.produce.map((food) => (
                <li key={food.id}>{t(food.name)}</li>
              ))}
            </ul>
          </div>
          <div className="nz-wedge nz-wedgeProtein">
            <h3>{t("Protein")}</h3>
            <ul>
              {summary.protein.map((food) => (
                <li key={food.id}>{t(food.name)}</li>
              ))}
            </ul>
          </div>
          <div className="nz-wedge nz-wedgeGrain">
            <h3>{t("Grains")}</h3>
            <ul>
              {summary.grain.map((food) => (
                <li key={food.id}>{t(food.name)}</li>
              ))}
            </ul>
          </div>
        </figure>
        <div className="nz-panel">
          <h3>{t("Modest fat")}</h3>
          <ul>
            {summary.fat.length > 0 ? summary.fat.map((food) => <li key={food.id}>{t(food.name)}</li>) : <li>{t("None picked yet.")}</li>}
          </ul>
          <p role="status">{t(summary.message)}</p>
        </div>
      </div>
      {slots.map((slot) => (
        <div key={slot.id}>
          <h3>{t(slot.label)}</h3>
          <div className="nz-actions">
            {plateFoods.filter((food) => food.slot === slot.id).map((food) => {
              const on = picked.includes(food.id);
              return (
                <button key={food.id} className="nz-pick" type="button" aria-pressed={on} onClick={() => toggleFood(food.id)}>
                  <strong>{t(food.name)}</strong>
                  <span>{t(food.note)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="nz-grid nz-two">
        {plateExamples.map((example) => (
          <article key={example.id} className="nz-panel">
            <h3>{t(example.name)}</h3>
            <p>{t(example.blurb)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProteinSection() {
  const t = useT();
  return (
    <section className="nz-panel" id="protein">
      <p className="nz-kicker">{t("Protein")}</p>
      <h2>{t(proteinCopy.title)}</h2>
      <p>{t(proteinCopy.lead)}</p>
      <p>{t(proteinCopy.aging)}</p>
      <p>{t(proteinCopy.recovery)}</p>
      <p>
        {t(proteinCopy.movement)}{" "}
        <Link href="/academy/move">{t("Open Movement")}</Link>
        {" · "}
        <Link href="/academy/move/chair-stand">{t("Stand from a chair")}</Link>
        {" · "}
        <Link href="/academy/move/heel-to-toe">{t("Heel-to-toe steps")}</Link>
      </p>
      <div className="nz-grid nz-three">
        {proteinCards.map((card) => (
          <article key={card.id} className="nz-panel">
            <Visual item={card} />
            <h3>{t(card.name)}</h3>
            {card.vegetarian ? <p className="nz-pill">{t("Vegetarian option")}</p> : null}
            <p>{t(card.note)}</p>
            <p>
              <strong>{t("Meal idea.")} </strong>
              {t(card.meal)}
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
  const t = useT();
  const answer = left && right ? sodiumAnswer(left, right, t) : null;

  return (
    <section className="nz-panel" id="hidden-salt">
      <p className="nz-kicker">{t("Sodium")}</p>
      <h2>{t(saltCopy.title)}</h2>
      <p>{t(saltCopy.titleNote)}</p>
      <p>{t(saltCopy.saltVersusSodium)}</p>
      <p>{t(saltCopy.pressure)}</p>
      <div className="nz-grid nz-two">
        {saltPlaces.map((place) => (
          <article key={place.id} className="nz-panel">
            <h3>{t(place.title)}</h3>
            <p>{t(place.text)}</p>
          </article>
        ))}
      </div>
      <h3>{t("Label reading")}</h3>
      <p>{t(saltCopy.label)}</p>
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
            {item.id === "soups" ? t("Compare two soups") : t("Compare two breads")}
          </button>
        ))}
      </div>
      {left && right && answer ? (
        <div className="nz-panel" id="sodium-quiz">
          <h3>{t(sodiumQuestion)}</h3>
          <div className="nz-split">
            <LabelSheet label={left} />
            <LabelSheet label={right} />
          </div>
          <fieldset className="field">
            <legend>{t("Choose the label with less sodium")}</legend>
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
                  <span>{t(label.product)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="nz-actions">
            <button className="btn btn-primary" type="button" onClick={() => setShown(true)}>
              {t("Check the sodium line")}
            </button>
          </div>
          {shown ? (
            <p role="status">
              {!choice
                ? t("Choose a label first.")
                : choice === answer.winnerId
                  ? t("That label lists less sodium.")
                  : t("Look again at the sodium lines.")}{" "}
              {answer.sentence}
            </p>
          ) : null}
        </div>
      ) : null}
      <h3>{t("Kitchen steps")}</h3>
      <ul>
        {saltTips.map((tip) => (
          <li key={tip}>{t(tip)}</li>
        ))}
      </ul>
    </section>
  );
}

function FatSection() {
  const [fatId, setFatId] = useState(fatChoices[0]?.id ?? "olive-oil");
  const chosen = fatChoices.find((item) => item.id === fatId) ?? fatChoices[0];
  const t = useT();

  return (
    <section className="nz-panel" id="healthy-fats">
      <p className="nz-kicker">{t("Fats")}</p>
      <h2>{t(fatCopy.title)}</h2>
      <p>{t(fatCopy.lead)}</p>
      <p>{t(fatCopy.modest)}</p>
      <div className="nz-grid nz-three">
        {fatKinds.map((kind) => (
          <article key={kind.id} className="nz-panel">
            <h3>{t(kind.title)}</h3>
            <p>{t(kind.text)}</p>
          </article>
        ))}
      </div>
      <h3>{t("Choose your healthy fat")}</h3>
      <div className="nz-actions">
        {fatChoices.map((choice) => (
          <button
            key={choice.id}
            className="nz-pick"
            type="button"
            aria-pressed={choice.id === fatId}
            onClick={() => setFatId(choice.id)}
          >
            <strong>{t(choice.name)}</strong>
          </button>
        ))}
      </div>
      {chosen ? (
        <article className="nz-panel">
          <Visual item={chosen} />
          <h3>{t(chosen.name)}</h3>
          <p>
            <strong>{t("A swap.")} </strong>
            {t(chosen.swap)}
          </p>
          <p>
            <strong>{t("Meal idea.")} </strong>
            {t(chosen.meal)}
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
  const t = useT();
  const { locale } = useLocale();

  return (
    <section className="nz-panel" id="eat-the-rainbow">
      <p className="nz-kicker">{t("Variety")}</p>
      <h2>{t(rainbowCopy.title)}</h2>
      <p>{t(rainbowCopy.lead)}</p>
      <p>{t(rainbowCopy.count)}</p>
      {week ? <p>{t("This week begins {date}.", { date: weekDate(week, locale) })}</p> : null}
      {marks.wellness.readOnlyMessage ? <p role="status">{t(marks.wellness.readOnlyMessage)}</p> : null}
      {plantGroups.map((group) => (
        <div key={group.id}>
          <h3>{t(group.title)}</h3>
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
                  <strong>{t(food.name)}</strong>
                  <span>{on ? t("Counted this week") : t("Count once")}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p role="status">
        {t("{count} different plants marked this week. Thirty is not required.", { count })}
        {count >= 30 ? ` ${t("You have marked 30 or more. That is variety, not a finish line.")}` : ""}
      </p>
      <button className="btn btn-secondary" type="button" onClick={() => marks.clearMatching((id) => prefix !== "" && id.startsWith(prefix))}>
        {t("Reset this week")}
      </button>
      {marks.status ? <p role="status">{t(marks.status)}</p> : null}
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
  const t = useT();
  return (
    <label className="field">
      <span>{t(label)}</span>
      <input value={value} inputMode="decimal" onChange={(event) => onChange(event.target.value)} />
      {invalid ? <span className="field-error">{t("Use a plain number, zero or greater.")}</span> : null}
    </label>
  );
}

function SideEditor({ title, draft, onChange }: { title: string; draft: Draft; onChange: (next: Draft) => void }) {
  const sample = labelById(draft.sampleId);
  const category = sample?.category ?? "yogurt";
  const t = useT();

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
      <h3>{t(title)}</h3>
      <label className="field">
        <span>{t("Food group")}</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {groceryCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {t(item.label)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{t("Sample or your own label")}</span>
        <select value={draft.mode === "enter" ? "enter" : draft.sampleId} onChange={(event) => setProduct(event.target.value)}>
          {grocerySamples
            .filter((item) => item.category === category)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {t(item.product)}
              </option>
            ))}
          <option value="enter">{t("Enter a label I am reading")}</option>
        </select>
      </label>
      {draft.mode === "sample" && sample ? <LabelSheet label={sample} /> : null}
      {draft.mode === "enter" ? (
        <div className="nz-grid">
          <p>{t("Type only the numbers on the package in front of you. Leave a line blank if you do not see it. lifeZoi will not fill it in.")}</p>
          <label className="field">
            <span>{t("Product name, optional")}</span>
            <input value={draft.product} maxLength={80} onChange={(event) => onChange({ ...draft, product: event.target.value })} />
          </label>
          <label className="field">
            <span>{t("Serving size")}</span>
            <input value={draft.serving} maxLength={80} onChange={(event) => onChange({ ...draft, serving: event.target.value })} />
          </label>
          <AmountField label={msg("Calories")} value={draft.calories} onChange={(calories) => onChange({ ...draft, calories })} />
          <AmountField label={msg("Added sugars, in grams")} value={draft.addedSugars} onChange={(addedSugars) => onChange({ ...draft, addedSugars })} />
          <AmountField label={msg("Sodium, in milligrams")} value={draft.sodium} onChange={(sodium) => onChange({ ...draft, sodium })} />
          <AmountField label={msg("Fiber, in grams")} value={draft.fiber} onChange={(fiber) => onChange({ ...draft, fiber })} />
          <AmountField label={msg("Protein, in grams")} value={draft.protein} onChange={(protein) => onChange({ ...draft, protein })} />
          <label className="field">
            <span>{t("Ingredients")}</span>
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
  const t = useT();
  const notes = groceryNotes(leftSide, rightSide, t);
  // Sample text is translated; text the person typed is shown as typed.
  const shown = (side: GrocerySide, text: string) => (text ? (side.illustrative ? t(text) : text) : t("Not entered"));
  const rows = [
    ["Serving size", shown(leftSide, leftSide.serving), shown(rightSide, rightSide.serving)],
    ["Calories", amountText(leftSide.calories, "kcal", t), amountText(rightSide.calories, "kcal", t)],
    ["Added sugars", amountText(leftSide.addedSugarsG, "g", t), amountText(rightSide.addedSugarsG, "g", t)],
    ["Sodium", amountText(leftSide.sodiumMg, "mg", t), amountText(rightSide.sodiumMg, "mg", t)],
    ["Fiber", amountText(leftSide.fiberG, "g", t), amountText(rightSide.fiberG, "g", t)],
    ["Protein", amountText(leftSide.proteinG, "g", t), amountText(rightSide.proteinG, "g", t)],
    ["Ingredients", shown(leftSide, leftSide.ingredients), shown(rightSide, rightSide.ingredients)],
  ];

  return (
    <section className={activePrint ? "nz-panel nz-printing" : "nz-panel"} id="grocery">
      <p className="nz-kicker">{t("Shopping")}</p>
      <h2>{t(groceryCopy.title)}</h2>
      <p>{t(groceryCopy.lead)}</p>
      <div className="nz-split nz-noPrint">
        <SideEditor title={msg("First package")} draft={left} onChange={setLeft} />
        <SideEditor title={msg("Second package")} draft={right} onChange={setRight} />
      </div>
      <div className="nz-panel nz-noPrint">
        <h3>{t("Side by side")}</h3>
        <table className="nz-table">
          <caption>{t("Amounts are per labeled serving. Illustrative samples are marked on their sheets.")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("Line")}</th>
              <th scope="col">{leftSide.product ? (leftSide.illustrative ? t(leftSide.product) : leftSide.product) : t("First label")}</th>
              <th scope="col">{rightSide.product ? (rightSide.illustrative ? t(rightSide.product) : rightSide.product) : t("Second label")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <th scope="row">{t(row[0])}</th>
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
        <h3>{t(groceryCopy.checklistTitle)}</h3>
        <p>{t(groceryCopy.checklistNote)}</p>
        {marks.wellness.readOnlyMessage ? <p role="status">{t(marks.wellness.readOnlyMessage)}</p> : null}
        <ul className="nz-checkList">
          {groceryChecklist.map((item) => (
            <li key={item.id}>
              <label className="nz-choice">
                <input type="checkbox" checked={marks.marked(item.id)} onChange={() => marks.toggle(item.id)} />
                <span>{t(item.label)}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="nz-actions nz-noPrint">
          <button className="btn btn-primary" type="button" onClick={onPrint}>
            {t("Print checklist")}
          </button>
        </div>
        {marks.status ? <p role="status">{t(marks.status)}</p> : null}
      </div>
    </section>
  );
}

function ChallengeSection({ activePrint, onPrint }: { activePrint: boolean; onPrint: () => void }) {
  const marks = useMarks();
  const [drafts, setDrafts] = useState<Record<string, string | null>>({});
  const doneIds = challengeSteps.filter((step) => marks.marked(step.id)).map((step) => step.id);
  const progress = challengeProgress(doneIds);
  const t = useT();

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
      <p className="nz-kicker">{t("Challenge")}</p>
      <h2>{t(challengeCopy.title)}</h2>
      <p>
        <strong>{t(challengeCopy.motto)}</strong>
      </p>
      <p>{t(challengeCopy.lead)}</p>
      {marks.wellness.readOnlyMessage ? <p role="status">{t(marks.wellness.readOnlyMessage)}</p> : null}
      <p role="status">{t("{done} of {total} steps marked in this browser tab.", { done: progress.done, total: progress.total })}</p>
      {progress.complete ? <p role="status">{t(challengeCopy.done)}</p> : null}
      <ol className="nz-steps">
        {challengeSteps.map((step) => (
          <li key={step.id}>
            <label className="nz-choice">
              <input type="checkbox" checked={marks.marked(step.id)} onChange={() => marks.toggle(step.id)} />
              <span>
                <strong>{t(step.title)}. </strong>
                {t(step.body)}
              </span>
            </label>
          </li>
        ))}
      </ol>
      <div className="nz-panel">
        <h3>{t("Meal sketch")}</h3>
        <p>{t("One breakfast, one lunch, one dinner, and two snacks.")}</p>
        {planFields.map((field) => {
          const value = drafts[field.id] ?? marks.textOf(field.id);
          return (
            <label key={field.id} className="field">
              <span>{t(field.label)}</span>
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
            {t("Save the meal sketch")}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onPrint}>
            {t("Print summary")}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => marks.clearMatching((id) => id.startsWith("nstep-"))}>
            {t("Restart")}
          </button>
        </div>
        <p className="nz-note">{t(challengeCopy.restart)}</p>
      </div>
      {marks.status ? <p role="status">{t(marks.status)}</p> : null}
    </section>
  );
}

export function NutritionStudio() {
  const [printId, setPrintId] = useState<string | null>(null);
  const t = useT();

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
        <h2>{t("Elsewhere in lifeZoi")}</h2>
        <p>{t("These pages are already part of lifeZoi. This Nutrition page does not invent a result for them.")}</p>
        <div className="nz-actions">
          {relatedLinks.map((link) => (
            <Link key={link.href} className="btn btn-secondary" href={link.href}>
              {t(link.label)}
            </Link>
          ))}
        </div>
        <h3>{t("Sources you can open")}</h3>
        <Sources />
        <p className="nz-note">{t("lifeZoi did not copy those articles or their images. The words on this plate are written for lifeZoi.")}</p>
      </section>
    </div>
  );
}
