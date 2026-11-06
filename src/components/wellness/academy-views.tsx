"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PagePhoto } from "@/components/page-photo";
import { FreeExerciseSection } from "@/components/wellness/free-exercise-views";
import { useSession } from "@/components/session-provider";
import { EvidenceLine, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { BreadRecipePage, NutritionEducation } from "@/components/nutrition/education-views";
import { breadRecipe } from "@/lib/nutrition/education";
import { activities, mealModules } from "@/lib/wellness/academy";
import { FOOD_GROUPS, foods } from "@/lib/wellness/foods";
import { coachingFocus } from "@/lib/wellness/personalize";
import type { FoodRecord } from "@/lib/wellness/types";

export function AcademyHome() {
  return (
    <div className="learn stack-lg">
      <p className="kicker">Nutrition & Fitness Academy</p>
      <h1>Food, movement, and sources you can check</h1>
      <p className="lede">
        The academy uses a small set of USDA food records and public health pages. It does not call a paid database, and it does not promise a result.
      </p>
      <div className="stack">
        <Link className="card learn-link" href="/academy/compare">
          <h2>Food comparison</h2>
          <p>USDA values per 100 grams, with raw and cooked foods kept distinct.</p>
        </Link>
        <Link className="card learn-link" href="/academy/meals">
          <h2>Meal lessons</h2>
          <p>A healthy plate, protein, sodium, fats, plants, shopping, added sugar, homemade bread, gut health, and the lesson library.</p>
        </Link>
        <Link className="card learn-link" href="/academy/move">
          <h2>Movement library</h2>
          <p>Walking, strength, balance, seated options, and free exercise resources.</p>
        </Link>
        <Link className="card learn-link" href="/academy/coaching">
          <h2>Coaching from your assessment</h2>
          <p>Plain rules explain why a topic is listed. Sample data stays labeled.</p>
        </Link>
        <Link className="card learn-link" href="/academy/sources">
          <h2>Source registry</h2>
          <p>License, access, attribution, and the date each source was checked.</p>
        </Link>
        <Link className="card learn-link" href="/habits">
          <h2>Shared challenges</h2>
          <p>The same check-in storage as the Everyday Wellness Coach, including the 30-day journey.</p>
        </Link>
      </div>
    </div>
  );
}

export function FoodLibrary() {
  const [group, setGroup] = useState("all");
  const [prep, setPrep] = useState("all");
  const shown = foods.filter((food) => (group === "all" || food.group === group) && (prep === "all" || food.preparation === prep));
  return (
    <div className="learn stack-lg">
      <p className="kicker">Nutrition & Fitness Academy</p>
      <h1>Food comparison</h1>
      <p className="lede">
        Amounts are per 100 grams from USDA FoodData Central, SR Legacy, April 2018. Values vary by cut, preparation, and brand. A blank nutrient was not in that record. This is not a meal plan.
      </p>
      <div className="actions">
        <label className="field">
          <span>Food group</span>
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="all">All groups</option>
            {FOOD_GROUPS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Preparation</span>
          <select value={prep} onChange={(event) => setPrep(event.target.value)}>
            <option value="all">Raw, cooked, and other</option>
            <option value="raw">Raw</option>
            <option value="cooked">Cooked</option>
            <option value="dried">Dried</option>
            <option value="unspecified">Not stated as cooked</option>
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

function amount(value: number | null, unit: string) {
  if (value === null) return "Not reported in this record";
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return `${text} ${unit}`;
}

function FoodCard({ food }: { food: FoodRecord }) {
  const rows = [
    ["Calories", amount(food.per100g.caloriesKcal, "kcal")],
    ["Protein", amount(food.per100g.proteinG, "g")],
    ["Total fat", amount(food.per100g.totalFatG, "g")],
    ["Saturated fat", amount(food.per100g.saturatedFatG, "g")],
    ["Carbohydrate", amount(food.per100g.carbohydrateG, "g")],
    ["Fiber", amount(food.per100g.fiberG, "g")],
    ["Sodium", amount(food.per100g.sodiumMg, "mg")],
  ];
  return (
    <article className="card stack">
      <h2>{food.plainName}</h2>
      <p>{food.groupLabel}. Preparation in this record: {food.preparation}.</p>
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
              {item.name}: {amount(item.amount, item.unit.toLowerCase())}
            </li>
          ))}
        </ul>
      ) : null}
      <p>
        <a href={food.url} target="_blank" rel="noopener noreferrer">
          USDA record {food.fdcId}
        </a>
        . Publication date in the file: {food.publicationDate}.
      </p>
    </article>
  );
}

export function MealIndex() {
  return (
    <div className="learn stack-lg">
      <PagePhoto id="nutrition" />
      <p className="kicker">Nutrition</p>
      <h1>Nutrition</h1>
      <p className="lede">
        Build a plate, compare labels, and keep the lessons already on this page: added sugar, homemade bread, gut health, and the meal library.
      </p>
      <nav className="actions" aria-label="Nutrition topics">
        <a className="btn btn-secondary" href="#healthy-plate">Healthy plate</a>
        <a className="btn btn-secondary" href="#protein">Protein</a>
        <a className="btn btn-secondary" href="#hidden-salt">Hidden salt</a>
        <a className="btn btn-secondary" href="#healthy-fats">Healthy fats</a>
        <a className="btn btn-secondary" href="#eat-the-rainbow">Plants</a>
        <a className="btn btn-secondary" href="#grocery">Grocery</a>
        <a className="btn btn-secondary" href="#nutrition-challenge">Challenge</a>
        <a className="btn btn-secondary" href="#daily-choices">Daily choices</a>
        <a className="btn btn-secondary" href="#sugar-hiding">Labels and added sugar</a>
        <a className="btn btn-secondary" href="#bake-bread">Homemade bread</a>
        <a className="btn btn-secondary" href="#feed-your-gut">Gut health</a>
        <a className="btn btn-secondary" href="#lesson-library">Lesson library</a>
      </nav>
      <NutritionEducation />
      <h2 id="lesson-library">Lesson library</h2>
      {mealModules.map((module) => (
        <Link key={module.slug} className="card learn-link" href={`/academy/meals/${module.slug}`}>
          <h2>{module.title}</h2>
          <p>{module.summary}</p>
        </Link>
      ))}
    </div>
  );
}

export function MealDetail({ slug }: { slug: string }) {
  if (breadRecipe(slug)) return <BreadRecipePage slug={slug} />;
  const lesson = mealModules.find((item) => item.slug === slug);
  if (!lesson) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">Meal lesson</p>
      <h1>{lesson.title}</h1>
      <p className="lede">{lesson.summary}</p>
      {lesson.blocks.map((block) => (
        <section key={block.heading} className="card stack">
          <h2>{block.heading}</h2>
          <p>{block.body}</p>
          <EvidenceLine kind={block.evidence} note={block.evidenceNote} />
          <WellnessSources ids={block.sourceIds} />
        </section>
      ))}
      {lesson.challengeId ? (
        <Link className="btn btn-primary" href={`/habits/${lesson.challengeId}`}>
          Open the related challenge
        </Link>
      ) : null}
      <Link href="/academy/meals">All meal lessons</Link>
    </div>
  );
}

export function MoveIndex() {
  return (
    <div className="learn stack-lg">
      <PagePhoto id="movement" />
      <p className="kicker">Nutrition & Fitness Academy</p>
      <h1>Movement library</h1>
      <p className="lede">
        Drawings on these pages were made for lifeZoi. They are not photographs or copied videos. Stop any move that hurts or does not fit your condition.
      </p>
      <FreeExerciseSection />
      {activities.map((item) => (
        <Link key={item.slug} className="card learn-link" href={`/academy/move/${item.slug}`}>
          <h2>{item.title}</h2>
          <p>{item.category}. {item.duration}</p>
        </Link>
      ))}
    </div>
  );
}

export function MoveDetail({ slug }: { slug: string }) {
  const item = activities.find((activity) => activity.slug === slug);
  if (!item) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">{item.category}</p>
      <h1>{item.title}</h1>
      <ActivitySketch kind={item.sketch} />
      <p><strong>Time or repetitions.</strong> {item.duration}</p>
      <ol>
        {item.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p><strong>Beginner change.</strong> {item.beginner}</p>
      <p><strong>Another way.</strong> {item.accessible}</p>
      <p><strong>Safety.</strong> {item.safety}</p>
      <EvidenceLine kind={item.evidence} note={item.evidenceNote} />
      <WellnessSources ids={item.sourceIds} />
      <Link href="/academy/move">All activities</Link>
    </div>
  );
}

function ActivitySketch({ kind }: { kind: "walk" | "chair" | "balance" | "band" | "stretch" }) {
  return (
    <svg className="learn-sketch" viewBox="0 0 240 140" role="img" aria-label="Simple original sketch of the movement">
      <rect width="240" height="140" rx="18" fill="#E9DDFB" />
      <circle cx="78" cy="36" r="12" fill="#7136C8" />
      <path d="M78 48 v34" stroke="#5725A8" strokeWidth="4" strokeLinecap="round" />
      {kind === "walk" ? <path d="M78 82 l-16 28 M78 82 l18 26 M78 62 l20 10" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "chair" ? <path d="M70 110 h40 M78 82 v28 M60 70 h28" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "balance" ? <path d="M78 82 l-8 30 M70 112 l22 0 M120 20 v100" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "band" ? <path d="M58 70 h40 M150 78 h40" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
      {kind === "stretch" ? <path d="M78 60 l24 -16 M78 82 v28" stroke="#0E7490" strokeWidth="4" strokeLinecap="round" /> : null}
    </svg>
  );
}

export function CoachingView() {
  const { ready, sample, session } = useSession();
  const answers = session.history[0]?.answers ?? null;
  const cards = useMemo(() => coachingFocus(ready && answers ? answers : null), [ready, answers]);
  return (
    <div className="learn stack-lg">
      <p className="kicker">Nutrition & Fitness Academy</p>
      <h1>Coaching from your assessment</h1>
      <p className="lede">
        The order below uses plain rules and the answers in this tab. It is education. It does not diagnose heart disease, diabetes, or any other condition.
      </p>
      {sample ? (
        <p className="banner banner-sample" role="status">
          Sample data. These prompts use the example visitor. They are not saved as your record.
        </p>
      ) : null}
      <ReadOnlyNote message={sample ? "Turn off the sample before you save your own check-ins." : null} />
      {cards.map((card) => (
        <Link key={card.id} className="card learn-link" href={card.href}>
          <h2>{card.title}</h2>
          <p>{card.reason}</p>
        </Link>
      ))}
    </div>
  );
}
