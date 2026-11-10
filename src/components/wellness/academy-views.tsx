"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PagePhoto } from "@/components/page-photo";
import { FreeExerciseSection } from "@/components/wellness/free-exercise-views";
import { useSession } from "@/components/session-provider";
import { useLocale, useT } from "@/components/locale-provider";
import { EvidenceLine, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { BreadRecipePage, NutritionEducation } from "@/components/nutrition/education-views";
import { breadRecipe } from "@/lib/nutrition/education";
import { activities, mealModules } from "@/lib/wellness/academy";
import { FOOD_GROUPS, foods } from "@/lib/wellness/foods";
import { coachingFocus, focusReason } from "@/lib/wellness/personalize";
import type { FoodRecord } from "@/lib/wellness/types";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg, type Translate } from "@/lib/i18n/translate";

export function AcademyHome() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Nutrition & Fitness Academy")}</p>
      <h1>{t("Food, movement, and sources you can check")}</h1>
      <p className="lede">
        {t("The academy uses a small set of USDA food records and public health pages. It does not call a paid database, and it does not promise a result.")}
      </p>
      <div className="stack">
        <Link className="card learn-link" href="/academy/compare">
          <h2>{t("Food comparison")}</h2>
          <p>{t("USDA values per 100 grams, with raw and cooked foods kept distinct.")}</p>
        </Link>
        <Link className="card learn-link" href="/academy/meals">
          <h2>{t("Meal lessons")}</h2>
          <p>{t("A healthy plate, protein, sodium, fats, plants, shopping, added sugar, homemade bread, gut health, and the lesson library.")}</p>
        </Link>
        <Link className="card learn-link" href="/academy/move">
          <h2>{t("Movement library")}</h2>
          <p>{t("Movement Studio, walking, strength, balance, seated options, and free exercise resources.")}</p>
        </Link>
        <Link className="card learn-link" href="/academy/coaching">
          <h2>{t("Coaching from your assessment")}</h2>
          <p>{t("Plain rules explain why a topic is listed. Sample data stays labeled.")}</p>
        </Link>
        <Link className="card learn-link" href="/academy/sources">
          <h2>{t("Source registry")}</h2>
          <p>{t("License, access, attribution, and the date each source was checked.")}</p>
        </Link>
        <Link className="card learn-link" href="/habits">
          <h2>{t("Shared challenges")}</h2>
          <p>{t("The same check-in storage as the Everyday Wellness Coach, including the 30-day journey.")}</p>
        </Link>
      </div>
    </div>
  );
}

/** How the record describes preparation, shown in the card sentence. */
const PREPARATION_WORDS: Record<string, string> = {
  raw: msg("raw"),
  cooked: msg("cooked"),
  dried: msg("dried"),
  unspecified: msg("unspecified"),
};

/** Unit words, so each language can use its own abbreviation. */
const UNIT_WORDS: Record<string, string> = {
  kcal: msg("kcal"),
  g: msg("g"),
  mg: msg("mg"),
  ug: msg("ug"),
};

export function FoodLibrary() {
  const t = useT();
  const [group, setGroup] = useState("all");
  const [prep, setPrep] = useState("all");
  const shown = foods.filter((food) => (group === "all" || food.group === group) && (prep === "all" || food.preparation === prep));
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Nutrition & Fitness Academy")}</p>
      <h1>{t("Food comparison")}</h1>
      <p className="lede">
        {t("Amounts are per 100 grams from USDA FoodData Central, SR Legacy, April 2018. Values vary by cut, preparation, and brand. A blank nutrient was not in that record. This is not a meal plan.")}
      </p>
      <div className="actions">
        <label className="field">
          <span>{t("Food group")}</span>
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="all">{t("All groups")}</option>
            {FOOD_GROUPS.map((item) => (
              <option key={item.id} value={item.id}>{t(item.label)}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("Preparation")}</span>
          <select value={prep} onChange={(event) => setPrep(event.target.value)}>
            <option value="all">{t("Raw, cooked, and other")}</option>
            <option value="raw">{t("Raw")}</option>
            <option value="cooked">{t("Cooked")}</option>
            <option value="dried">{t("Dried")}</option>
            <option value="unspecified">{t("Not stated as cooked")}</option>
          </select>
        </label>
      </div>
      <div className="stack">
        {shown.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    </div>
  );
}

function amount(value: number | null, unit: string, t: Translate, lang: string) {
  if (value === null) return t("Not reported in this record");
  const text = Number.isInteger(value)
    ? String(value)
    : lang === "en"
      ? value.toFixed(2)
      : new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(value);
  return `${text} ${UNIT_WORDS[unit] ? t(UNIT_WORDS[unit]) : unit}`;
}

function FoodCard({ food }: { food: FoodRecord }) {
  const t = useT();
  const lang = LOCALE_META[useLocale().locale].htmlLang;
  const rows = [
    [t("Calories"), amount(food.per100g.caloriesKcal, "kcal", t, lang)],
    [t("Protein"), amount(food.per100g.proteinG, "g", t, lang)],
    [t("Total fat"), amount(food.per100g.totalFatG, "g", t, lang)],
    [t("Saturated fat"), amount(food.per100g.saturatedFatG, "g", t, lang)],
    [t("Carbohydrate"), amount(food.per100g.carbohydrateG, "g", t, lang)],
    [t("Fiber"), amount(food.per100g.fiberG, "g", t, lang)],
    [t("Sodium"), amount(food.per100g.sodiumMg, "mg", t, lang)],
  ];
  const preparation = PREPARATION_WORDS[food.preparation] ? t(PREPARATION_WORDS[food.preparation]) : food.preparation;
  return (
    <article className="card stack">
      <h2>{t(food.plainName)}</h2>
      <p>{t("{group}. Preparation in this record: {preparation}.", { group: t(food.groupLabel), preparation })}</p>
      <p className="hint">{food.description}</p>
      <dl className="review-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {food.micronutrients.length > 0 ? (
        <ul>
          {food.micronutrients.map((item) => (
            <li key={item.name}>
              {t(item.name)}: {amount(item.amount, item.unit.toLowerCase(), t, lang)}
            </li>
          ))}
        </ul>
      ) : null}
      <p>
        <a href={food.url} target="_blank" rel="noopener noreferrer">
          {t("USDA record {id}", { id: food.fdcId })}
        </a>
        {t(". Publication date in the file: {date}.", { date: food.publicationDate })}
      </p>
    </article>
  );
}

export function MealIndex() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <PagePhoto id="nutrition" />
      <p className="kicker">{t("Nutrition")}</p>
      <h1>{t("Nutrition")}</h1>
      <p className="lede">
        {t("Build a plate, compare labels, and keep the lessons already on this page: added sugar, homemade bread, gut health, and the meal library.")}
      </p>
      <nav className="actions" aria-label={t("Nutrition topics")}>
        <a className="btn btn-secondary" href="#healthy-plate">{t("Healthy plate")}</a>
        <a className="btn btn-secondary" href="#protein">{t("Protein")}</a>
        <a className="btn btn-secondary" href="#hidden-salt">{t("Hidden salt")}</a>
        <a className="btn btn-secondary" href="#healthy-fats">{t("Healthy fats")}</a>
        <a className="btn btn-secondary" href="#eat-the-rainbow">{t("Plants")}</a>
        <a className="btn btn-secondary" href="#grocery">{t("Grocery")}</a>
        <a className="btn btn-secondary" href="#nutrition-challenge">{t("Challenge")}</a>
        <a className="btn btn-secondary" href="#daily-choices">{t("Daily choices")}</a>
        <a className="btn btn-secondary" href="#sugar-hiding">{t("Labels and added sugar")}</a>
        <a className="btn btn-secondary" href="#bake-bread">{t("Homemade bread")}</a>
        <a className="btn btn-secondary" href="#feed-your-gut">{t("Gut health")}</a>
        <a className="btn btn-secondary" href="#lesson-library">{t("Lesson library")}</a>
      </nav>
      <NutritionEducation />
      <h2 id="lesson-library">{t("Lesson library")}</h2>
      {mealModules.map((module) => (
        <Link key={module.slug} className="card learn-link" href={`/academy/meals/${module.slug}`}>
          <h2>{t(module.title)}</h2>
          <p>{t(module.summary)}</p>
        </Link>
      ))}
    </div>
  );
}

export function MealDetail({ slug }: { slug: string }) {
  const t = useT();
  if (breadRecipe(slug)) return <BreadRecipePage slug={slug} />;
  const lesson = mealModules.find((item) => item.slug === slug);
  if (!lesson) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Meal lesson")}</p>
      <h1>{t(lesson.title)}</h1>
      <p className="lede">{t(lesson.summary)}</p>
      {lesson.blocks.map((block) => (
        <section key={block.heading} className="card stack">
          <h2>{t(block.heading)}</h2>
          <p>{t(block.body)}</p>
          <EvidenceLine kind={block.evidence} note={block.evidenceNote} />
          <WellnessSources ids={block.sourceIds} />
        </section>
      ))}
      {lesson.challengeId ? (
        <Link className="btn btn-primary" href={`/habits/${lesson.challengeId}`}>
          {t("Open the related challenge")}
        </Link>
      ) : null}
      <Link href="/academy/meals">{t("All meal lessons")}</Link>
    </div>
  );
}

export function MoveIndex() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <PagePhoto id="movement" />
      <p className="kicker">{t("Nutrition & Fitness Academy")}</p>
      <h2>{t("Movement library")}</h2>
      <p className="lede">
        {t("Drawings on these pages were made for lifeZoi. They are not photographs or copied videos. Stop any move that hurts or does not fit your condition.")}
      </p>
      <FreeExerciseSection />
      {activities.map((item) => (
        <Link key={item.slug} className="card learn-link" href={`/academy/move/${item.slug}`}>
          <h2>{t(item.title)}</h2>
          <p>{t("{category}. {duration}", { category: t(item.category), duration: t(item.duration) })}</p>
        </Link>
      ))}
    </div>
  );
}

export function MoveDetail({ slug }: { slug: string }) {
  const t = useT();
  const item = activities.find((activity) => activity.slug === slug);
  if (!item) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t(item.category)}</p>
      <h1>{t(item.title)}</h1>
      <ActivitySketch kind={item.sketch} />
      <p><strong>{t("Time or repetitions.")}</strong> {t(item.duration)}</p>
      <ol>
        {item.steps.map((step) => (
          <li key={step}>{t(step)}</li>
        ))}
      </ol>
      <p><strong>{t("Beginner change.")}</strong> {t(item.beginner)}</p>
      <p><strong>{t("Another way.")}</strong> {t(item.accessible)}</p>
      <p><strong>{t("Safety.")}</strong> {t(item.safety)}</p>
      <EvidenceLine kind={item.evidence} note={item.evidenceNote} />
      <WellnessSources ids={item.sourceIds} />
      <Link href="/academy/move">{t("All activities")}</Link>
    </div>
  );
}

function ActivitySketch({ kind }: { kind: "walk" | "chair" | "balance" | "band" | "stretch" }) {
  const t = useT();
  return (
    <svg className="learn-sketch" viewBox="0 0 240 140" role="img" aria-label={t("Simple original sketch of the movement")}>
      <rect width="240" height="140" rx="18" fill="#EFE5FA" />
      <circle cx="78" cy="36" r="12" fill="#6A3DA8" />
      <path d="M78 48 v34" stroke="#52288A" strokeWidth="4" strokeLinecap="round" />
      {kind === "walk" ? <path d="M78 82 l-16 28 M78 82 l18 26 M78 62 l20 10" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "chair" ? <path d="M70 110 h40 M78 82 v28 M60 70 h28" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "balance" ? <path d="M78 82 l-8 30 M70 112 l22 0 M120 20 v100" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "band" ? <path d="M58 70 h40 M150 78 h40" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "stretch" ? <path d="M78 60 l24 -16 M78 82 v28" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
    </svg>
  );
}

export function CoachingView() {
  const t = useT();
  const { ready, sample, session } = useSession();
  const answers = session.history[0]?.answers ?? null;
  const cards = useMemo(() => coachingFocus(ready && answers ? answers : null), [ready, answers]);
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Nutrition & Fitness Academy")}</p>
      <h1>{t("Coaching from your assessment")}</h1>
      <p className="lede">
        {t("The order below uses plain rules and the answers in this tab. It is education. It does not diagnose heart disease, diabetes, or any other condition.")}
      </p>
      {sample ? (
        <p className="banner banner-sample" role="status">
          {t("Sample data. These prompts use the example visitor. They are not saved as your record.")}
        </p>
      ) : null}
      <ReadOnlyNote message={sample ? msg("Turn off the sample before you save your own check-ins.") : null} />
      {cards.map((card) => (
        <Link key={card.id} className="card learn-link" href={card.href}>
          <h2>{t(card.title)}</h2>
          <p>{focusReason(card, t)}</p>
        </Link>
      ))}
    </div>
  );
}
