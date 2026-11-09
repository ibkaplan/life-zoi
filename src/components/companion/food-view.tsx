"use client";

import Link from "next/link";
import { useState } from "react";
import { Art } from "@/components/companion/art";
import { ActivityActions, SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { useSession } from "@/components/session-provider";
import { commitCompanion } from "@/lib/companion/store";
import { cleanFoodWords, MEAL_STYLES, YES_NO, type FoodPrefs, type MealStyle, type YesNo } from "@/lib/companion/state";
import { mealsForDay, nutritionGoalFor, nutritionGoalLabels, NUTRITION_GOALS, shoppingList, type MealSuggestion, type NutritionGoal } from "@/lib/companion/nutrition";
import { localISODate } from "@/lib/dates";
import { CUISINES, FOOD_WORDS } from "@/lib/food-words";
import { allergenLabels, dietRequirementLabels } from "@/lib/health-profile";
import type { MealSlot } from "@/lib/food-plan/types";

const STYLE_LABEL: Record<MealStyle, string> = {
  quick: "Quick (under 20 minutes)",
  "home-cooked": "Home-cooked",
  light: "Light",
  hearty: "Hearty",
  "no-cook": "No cooking",
  batch: "Cook once, eat twice",
  warm: "Warm meals",
  cold: "Cold meals",
};

const SLOT_LABEL: Record<MealSlot, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snacks" };

function saveFood(patch: Partial<FoodPrefs>) {
  commitCompanion((state) => ({ ...state, food: { ...state.food, ...patch } }));
}

/** A searchable list of food words: start typing to search, or type your own. */
function WordList({ id, legend, hint, words, onChange }: { id: string; legend: string; hint: string; words: string[]; onChange: (next: string[]) => void }) {
  const [text, setText] = useState("");
  function add() {
    const next = cleanFoodWords([...words, text]);
    onChange(next);
    setText("");
  }
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <p className="hint">{hint}</p>
      <div className="inline-form">
        <input
          aria-label={legend}
          list={`${id}-words`}
          value={text}
          maxLength={40}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <datalist id={`${id}-words`}>
          {FOOD_WORDS.map((word) => (
            <option key={word} value={word} />
          ))}
        </datalist>
        <button className="btn btn-secondary" type="button" onClick={add} disabled={!text.trim()}>
          Add
        </button>
      </div>
      {words.length > 0 ? (
        <ul className="chip-list">
          {words.map((word) => (
            <li key={word} className="chip">
              {word}{" "}
              <button type="button" className="btn btn-ghost" aria-label={`Remove ${word}`} onClick={() => onChange(words.filter((item) => item !== word))}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  );
}

function YesNoField({ legend, value, onChange }: { legend: string; value: YesNo | ""; onChange: (next: YesNo | "") => void }) {
  return (
    <label className="field">
      <span>{legend}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as YesNo | "")}>
        <option value="">Prefer not to say</option>
        {YES_NO.map((option) => (
          <option key={option} value={option}>
            {option === "yes" ? "Yes" : option === "no" ? "No" : "Sometimes"}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Food likes, dislikes, and permanent exclusions, saved with the daily companion. */
export function FoodPreferencesView() {
  const { ready, companion, sample, answers } = useProfile();
  if (!ready) return <p className="hint">Loading your food choices…</p>;
  const food = companion.food;
  return (
    <div className="stack-lg">
      <div className="lz-hello">
        <p className="kicker">Food &amp; Wellness</p>
        <h1>My food choices</h1>
        <p>Tell LifeZoi what you enjoy and what you never want to see. Every ingredient in a suggested meal is checked against this list, including sauces, dressings, toppings, seasonings, and swaps.</p>
      </div>
      <SaveNote />
      {sample ? <p className="hint">Sample data is on. Changes are not saved.</p> : null}
      <section className="card stack">
        <h2>Allergies and requirements</h2>
        {answers && (answers.foodAllergies.length > 0 || answers.foodReactions.length > 0 || answers.dietRequirements.length > 0) ? (
          <ul>
            {answers.foodAllergies.map((item) => (
              <li key={item}>Diagnosed allergy: {allergenLabels[item]}</li>
            ))}
            {answers.foodReactions.map((item) => (
              <li key={item.food}>
                {item.type === "allergy" ? "Diagnosed allergy" : item.type === "intolerance" ? "Intolerance" : "Sensitivity"}: {item.food}
              </li>
            ))}
            {answers.dietRequirements.map((item) => (
              <li key={item}>Requirement: {dietRequirementLabels[item]}</li>
            ))}
          </ul>
        ) : (
          <p className="hint">No allergies or requirements are recorded in your assessment.</p>
        )}
        <p className="hint">
          Allergies, intolerances, and religious, cultural, or personal requirements are set in the{" "}
          <Link href="/assessment">health step of your assessment</Link>. LifeZoi never guesses them.
        </p>
      </section>
      <section className="card stack">
        <WordList
          id="exclude"
          legend="Foods I never want in a meal"
          hint="A permanent list. These are never in a suggested meal, sauce, topping, or swap."
          words={food.exclusions}
          onChange={(exclusions) => saveFood({ exclusions })}
        />
        <WordList id="like" legend="Foods I enjoy" hint="Meals with these come first." words={food.liked} onChange={(liked) => saveFood({ liked })} />
        <WordList
          id="dislike"
          legend="Foods I would rather not eat"
          hint="Left out, or swapped for something else when a swap is possible."
          words={food.disliked}
          onChange={(disliked) => saveFood({ disliked })}
        />
      </section>
      <section className="card stack">
        <h2>How you like to eat</h2>
        <div className="check-grid">
          <YesNoField legend="Do you eat meat?" value={food.eatsMeat} onChange={(eatsMeat) => saveFood({ eatsMeat })} />
          <YesNoField legend="Do you eat fish?" value={food.eatsFish} onChange={(eatsFish) => saveFood({ eatsFish })} />
          <YesNoField legend="Do you eat dairy?" value={food.eatsDairy} onChange={(eatsDairy) => saveFood({ eatsDairy })} />
        </div>
        <fieldset className="field">
          <legend>Cuisines you enjoy</legend>
          <div className="check-grid">
            {CUISINES.map((cuisine) => (
              <label key={cuisine} className="check-row">
                <input
                  type="checkbox"
                  checked={food.cuisines.includes(cuisine)}
                  onChange={(event) => saveFood({ cuisines: event.target.checked ? [...food.cuisines, cuisine] : food.cuisines.filter((item) => item !== cuisine) })}
                />
                <span>{cuisine}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>Meal styles</legend>
          <div className="check-grid">
            {MEAL_STYLES.map((style) => (
              <label key={style} className="check-row">
                <input
                  type="checkbox"
                  checked={food.mealStyles.includes(style)}
                  onChange={(event) => saveFood({ mealStyles: event.target.checked ? [...food.mealStyles, style] : food.mealStyles.filter((item) => item !== style) })}
                />
                <span>{STYLE_LABEL[style]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="check-row">
          <input type="checkbox" checked={food.calorieTracking} onChange={(event) => saveFood({ calorieTracking: event.target.checked })} />
          <span>Show calories where LifeZoi has USDA figures (optional)</span>
        </label>
      </section>
      <Link className="btn btn-primary" href="/food-plan/today">
        See today&apos;s meals
      </Link>
    </div>
  );
}

function MealCard({ suggestion, showKcal }: { suggestion: MealSuggestion; showKcal: boolean }) {
  const { recipe, swaps, warnings } = suggestion;
  return (
    <div className="stack">
      <h3>{recipe.name}</h3>
      <p>
        {recipe.summary} <span className="hint">· about {recipe.minutes} min</span>
        {showKcal && recipe.kcal !== null ? <span className="hint"> · about {Math.round(recipe.kcal)} kcal (USDA)</span> : null}
      </p>
      {swaps.length > 0 ? (
        <ul className="hint">
          {swaps.map((swap) => (
            <li key={swap}>{swap}</li>
          ))}
        </ul>
      ) : null}
      {warnings.map((warning) => (
        <p key={warning} className="alert">
          {warning}
        </p>
      ))}
      <details>
        <summary>Ingredients and cooking steps</summary>
        <h4>Ingredients</h4>
        <ul>
          {recipe.ingredients.map((item) => {
            const swapped = item.swap && swaps.some((text) => text.startsWith(`Made without ${item.name.toLowerCase()}`));
            return <li key={item.name}>{swapped && item.swap ? item.swap.name : item.name}</li>;
          })}
        </ul>
        <h4>Steps</h4>
        <ol>
          {recipe.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}

/** Today's personalized meals, regenerated each day from the person's answers and food choices. */
export function TodayMealsView() {
  const { ready, companion, answers, sample } = useProfile();
  const { session } = useSession();
  const [goalOverride, setGoalOverride] = useState<NutritionGoal | "">("");
  const [picks, setPicks] = useState<Record<MealSlot, number>>({ breakfast: 0, lunch: 0, dinner: 0, snack: 0 });
  if (!ready) return <p className="hint">Loading today&apos;s meals…</p>;
  const today = localISODate();
  const profile = session.foodPlan.profile;
  const goal = goalOverride || nutritionGoalFor(answers?.primaryGoal ?? "", answers?.wellnessGoals ?? []);
  const day = mealsForDay(answers, companion.food, goal, today, profile);
  const showKcal = companion.food.calorieTracking && !profile.eatingDisorder;
  const chosen: MealSuggestion[] = [];
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">Food &amp; Wellness</p>
          <h1>Today&apos;s meals</h1>
          <p className="script brand-line">Eat well. Feel better.</p>
          <p>New ideas each day, checked against your allergies, requirements, and the foods you avoid.</p>
        </div>
        <Art name="meal" />
      </div>
      <SaveNote />
      {!answers ? (
        <p className="alert">
          You have not filled in an assessment yet, so no allergies or requirements are known. <Link href="/assessment">Fill out your assessment</Link> or{" "}
          <Link href="/food-plan/preferences">add your food choices</Link> first.
        </p>
      ) : null}
      <section className="card stack">
        <label className="field">
          <span>Plan meals for</span>
          <select value={goal} onChange={(event) => setGoalOverride(event.target.value as NutritionGoal)}>
            {NUTRITION_GOALS.map((value) => (
              <option key={value} value={value}>
                {nutritionGoalLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <ul>
          {day.guidance.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {day.safety.map((line) => (
          <p key={line} className="hint">
            {line}
          </p>
        ))}
      </section>
      {(Object.keys(SLOT_LABEL) as MealSlot[]).map((slot) => {
        const options = day.slots[slot];
        if (options.length === 0) {
          return (
            <section key={slot} className="card stack">
              <h2>{SLOT_LABEL[slot]}</h2>
              <p className="hint">No idea in the LifeZoi list passes all of your exclusions for this meal. That is better than showing something unsafe.</p>
            </section>
          );
        }
        const index = picks[slot] % options.length;
        const pick = options[index] as MealSuggestion;
        chosen.push(pick);
        return (
          <section key={slot} className="card stack">
            <h2>{SLOT_LABEL[slot]}</h2>
            <MealCard suggestion={pick} showKcal={showKcal} />
            {!sample ? (
              <ActivityActions
                activityId={`meal-${slot}`}
                minutes={pick.recipe.minutes}
                counts={(status) => ({ nutritionHabits: status === "skipped" ? 0 : 1 })}
                onReplace={options.length > 1 ? () => setPicks({ ...picks, [slot]: index + 1 }) : undefined}
                replaceLabel="Show another idea"
              />
            ) : (
              <p className="hint">Sample data is on, so nothing is recorded.</p>
            )}
          </section>
        );
      })}
      <section className="card stack">
        <h2>Shopping list for today</h2>
        <ul>
          {shoppingList(chosen).map((line) => (
            <li key={line.name}>
              {line.name} <span className="hint">({line.recipes.join(", ")})</span>
            </li>
          ))}
        </ul>
        <p className="hint">Check every label. Recipes and products change, and LifeZoi cannot confirm any food is free of an allergen or cross-contact.</p>
      </section>
      {day.excluded.length > 0 ? (
        <details className="lz-section">
          <summary>
            <span>Left out today ({day.excluded.length})</span>
          </summary>
          <ul className="lz-section-body">
            {day.excluded.map((item) => (
              <li key={item.recipe.id}>
                {item.recipe.name}: {item.reason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <p>
        <Link href="/food-plan/preferences">Change my food choices</Link>
      </p>
    </div>
  );
}
