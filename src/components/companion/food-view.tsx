"use client";

import { ListenToSteps } from "@/components/voice/read-aloud";
import Link from "next/link";
import { useState } from "react";
import { Art } from "@/components/companion/art";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { ActivityActions, SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { useSession } from "@/components/session-provider";
import { commitCompanion } from "@/lib/companion/store";
import { cleanFoodWords, MEAL_STYLES, YES_NO, type FoodPrefs, type MealStyle, type YesNo } from "@/lib/companion/state";
import { WomensCareSection, WomensCareSettings } from "@/components/companion/womens-care-view";
import { plannedMeals } from "@/lib/companion/womens-care";
import {
  nutritionGoalFor,
  nutritionGoalLabels,
  NUTRITION_GOALS,
  reasonText,
  shoppingList,
  swapText,
  warningText,
  type MealSuggestion,
  type NutritionGoal,
} from "@/lib/companion/nutrition";
import { localISODate } from "@/lib/dates";
import { CUISINES, foodWordFromInput, foodWordLabel, foodWordOptions } from "@/lib/food-words";
import { allergenLabels, dietRequirementLabels } from "@/lib/health-profile";
import type { MealSlot } from "@/lib/food-plan/types";

const STYLE_LABEL: Record<MealStyle, string> = {
  quick: msg("Quick (under 20 minutes)"),
  "home-cooked": msg("Home-cooked"),
  light: msg("Light"),
  hearty: msg("Hearty"),
  "no-cook": msg("No cooking"),
  batch: msg("Cook once, eat twice"),
  warm: msg("Warm meals"),
  cold: msg("Cold meals"),
};

const SLOT_LABEL: Record<MealSlot, string> = { breakfast: msg("Breakfast"), lunch: msg("Lunch"), dinner: msg("Dinner"), snack: msg("Snacks") };

function saveFood(patch: Partial<FoodPrefs>) {
  commitCompanion((state) => ({ ...state, food: { ...state.food, ...patch } }));
}

/** A searchable list of food words: start typing to search, or type your own. */
function WordList({ id, legend, hint, words, onChange }: { id: string; legend: string; hint: string; words: string[]; onChange: (next: string[]) => void }) {
  const [text, setText] = useState("");
  const t = useT();
  function add() {
    // A suggestion picked in the chosen language is saved as its English word, so meal checks still match it.
    const next = cleanFoodWords([...words, foodWordFromInput(text, t)]);
    onChange(next);
    setText("");
  }
  return (
    <fieldset className="field">
      <legend>{t(legend)}</legend>
      <p className="hint">{t(hint)}</p>
      <div className="inline-form">
        <input
          aria-label={t(legend)}
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
          {foodWordOptions(t).map((word) => (
            <option key={word} value={word} />
          ))}
        </datalist>
        <button className="btn btn-secondary" type="button" onClick={add} disabled={!text.trim()}>
          {t("Add")}
        </button>
      </div>
      {words.length > 0 ? (
        <ul className="chip-list">
          {words.map((word) => (
            <li key={word} className="chip">
              {foodWordLabel(word, t)}{" "}
              <button type="button" className="btn btn-ghost" aria-label={t("Remove {food}", { food: foodWordLabel(word, t) })} onClick={() => onChange(words.filter((item) => item !== word))}>
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
  const t = useT();
  return (
    <label className="field">
      <span>{t(legend)}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as YesNo | "")}>
        <option value="">{t("Prefer not to say")}</option>
        {YES_NO.map((option) => (
          <option key={option} value={option}>
            {option === "yes" ? t("Yes") : option === "no" ? t("No") : t("Sometimes")}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Food likes, dislikes, and permanent exclusions, saved with the daily companion. */
export function FoodPreferencesView() {
  const { ready, companion, sample, answers } = useProfile();
  const t = useT();
  if (!ready) return <p className="hint">{t("Loading your food choices…")}</p>;
  const food = companion.food;
  return (
    <div className="stack-lg">
      <div className="lz-hello">
        <p className="kicker">{t("Food & Wellness")}</p>
        <h1>{t("My food choices")}</h1>
        <p>{t("Tell LifeZoi what you enjoy and what you never want to see. Every ingredient in a suggested meal is checked against this list, including sauces, dressings, toppings, seasonings, and swaps.")}</p>
      </div>
      <SaveNote />
      {sample ? <p className="hint">{t("Sample data is on. Changes are not saved.")}</p> : null}
      <section className="card stack">
        <h2>{t("Allergies and requirements")}</h2>
        {answers && (answers.foodAllergies.length > 0 || answers.foodReactions.length > 0 || answers.dietRequirements.length > 0) ? (
          <ul>
            {answers.foodAllergies.map((item) => (
              <li key={item}>{t("Diagnosed allergy: {food}", { food: t(allergenLabels[item]) })}</li>
            ))}
            {answers.foodReactions.map((item) => (
              <li key={item.food}>
                {t(item.type === "allergy" ? "Diagnosed allergy: {food}" : item.type === "intolerance" ? "Intolerance: {food}" : "Sensitivity: {food}", { food: foodWordLabel(item.food, t) })}
              </li>
            ))}
            {answers.dietRequirements.map((item) => (
              <li key={item}>{t("Requirement: {item}", { item: t(dietRequirementLabels[item]) })}</li>
            ))}
          </ul>
        ) : (
          <p className="hint">{t("No allergies or requirements are recorded in your assessment.")}</p>
        )}
        <p className="hint">
          {t("Allergies, intolerances, and religious, cultural, or personal requirements are set in the")}{" "}
          <Link href="/assessment">{t("health step of your assessment")}</Link>. {t("LifeZoi never guesses them.")}
        </p>
      </section>
      <section className="card stack">
        <WordList
          id="exclude"
          legend={msg("Foods I never want in a meal")}
          hint={msg("A permanent list. These are never in a suggested meal, sauce, topping, or swap.")}
          words={food.exclusions}
          onChange={(exclusions) => saveFood({ exclusions })}
        />
        <WordList id="like" legend={msg("Foods I enjoy")} hint={msg("Meals with these come first.")} words={food.liked} onChange={(liked) => saveFood({ liked })} />
        <WordList
          id="dislike"
          legend={msg("Foods I would rather not eat")}
          hint={msg("Left out, or swapped for something else when a swap is possible.")}
          words={food.disliked}
          onChange={(disliked) => saveFood({ disliked })}
        />
      </section>
      <section className="card stack">
        <h2>{t("How you like to eat")}</h2>
        <div className="check-grid">
          <YesNoField legend={msg("Do you eat meat?")} value={food.eatsMeat} onChange={(eatsMeat) => saveFood({ eatsMeat })} />
          <YesNoField legend={msg("Do you eat fish?")} value={food.eatsFish} onChange={(eatsFish) => saveFood({ eatsFish })} />
          <YesNoField legend={msg("Do you eat dairy?")} value={food.eatsDairy} onChange={(eatsDairy) => saveFood({ eatsDairy })} />
        </div>
        <fieldset className="field">
          <legend>{t("Cuisines you enjoy")}</legend>
          <div className="check-grid">
            {CUISINES.map((cuisine) => (
              <label key={cuisine} className="check-row">
                <input
                  type="checkbox"
                  checked={food.cuisines.includes(cuisine)}
                  onChange={(event) => saveFood({ cuisines: event.target.checked ? [...food.cuisines, cuisine] : food.cuisines.filter((item) => item !== cuisine) })}
                />
                <span>{t(cuisine)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>{t("Meal styles")}</legend>
          <div className="check-grid">
            {MEAL_STYLES.map((style) => (
              <label key={style} className="check-row">
                <input
                  type="checkbox"
                  checked={food.mealStyles.includes(style)}
                  onChange={(event) => saveFood({ mealStyles: event.target.checked ? [...food.mealStyles, style] : food.mealStyles.filter((item) => item !== style) })}
                />
                <span>{t(STYLE_LABEL[style])}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="check-row">
          <input type="checkbox" checked={food.calorieTracking} onChange={(event) => saveFood({ calorieTracking: event.target.checked })} />
          <span>{t("Show calories where LifeZoi has USDA figures (optional)")}</span>
        </label>
      </section>
      <section className="wc-care stack" aria-labelledby="wc-pref-title">
        <h2 id="wc-pref-title">{t("Women's Care")}</h2>
        <WomensCareSettings care={companion.womensCare} sample={sample} />
      </section>
      <Link className="btn btn-primary" href="/food-plan/today">
        {t("See today's meals")}
      </Link>
    </div>
  );
}

export function MealCard({ suggestion, showKcal }: { suggestion: MealSuggestion; showKcal: boolean }) {
  const { recipe, swaps, warnings } = suggestion;
  const t = useT();
  return (
    <div className="stack">
      <h3>{t(recipe.name)}</h3>
      <p>
        {t(recipe.summary)} <span className="hint">· {t("about {minutes} min", { minutes: recipe.minutes })}</span>
        {showKcal && recipe.kcal !== null ? <span className="hint"> · {t("about {kcal} kcal (USDA)", { kcal: Math.round(recipe.kcal) })}</span> : null}
      </p>
      {swaps.length > 0 ? (
        <ul className="hint">
          {swaps.map((swap) => (
            <li key={swap}>{swapText(recipe, swap, t)}</li>
          ))}
        </ul>
      ) : null}
      {warnings.map((warning) => (
        <p key={warning} className="alert">
          {warningText(warning, t)}
        </p>
      ))}
      <ListenToSteps
        title={recipe.name}
        list={{
          heading: "Ingredients",
          items: recipe.ingredients.map((item) => {
            const swapped = item.swap && swaps.some((text) => text.startsWith(`Made without ${item.name.toLowerCase()}`));
            return swapped && item.swap ? item.swap.name : item.name;
          }),
        }}
        steps={recipe.steps}
        label="Read the recipe aloud"
        compact
      />
      <details>
        <summary>{t("Ingredients and cooking steps")}</summary>
        <h4>{t("Ingredients")}</h4>
        <ul>
          {recipe.ingredients.map((item) => {
            const swapped = item.swap && swaps.some((text) => text.startsWith(`Made without ${item.name.toLowerCase()}`));
            return <li key={item.name}>{t(swapped && item.swap ? item.swap.name : item.name)}</li>;
          })}
        </ul>
        <h4>{t("Steps")}</h4>
        <ol>
          {recipe.steps.map((step) => (
            <li key={step}>{t(step)}</li>
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
  const t = useT();
  if (!ready) return <p className="hint">{t("Loading today's meals…")}</p>;
  const today = localISODate();
  const profile = session.foodPlan.profile;
  const goal = goalOverride || nutritionGoalFor(answers?.primaryGoal ?? "", answers?.wellnessGoals ?? []);
  const { day, care } = plannedMeals(answers, companion.food, goal, today, profile, companion.womensCare);
  const showKcal = companion.food.calorieTracking && !profile.eatingDisorder;
  const chosen: MealSuggestion[] = [];
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">{t("Food & Wellness")}</p>
          <h1>{t("Today's meals")}</h1>
          <p className="script brand-line">{t("Eat well. Feel better.")}</p>
          <p>{t("New ideas each day, checked against your allergies, requirements, and the foods you avoid.")}</p>
        </div>
        <Art name="meal" />
      </div>
      <SaveNote />
      {!answers ? (
        <p className="alert">
          {t("You have not filled in an assessment yet, so no allergies or requirements are known.")} <Link href="/assessment">{t("Fill out your assessment")}</Link>{" "}
          {t("or")} <Link href="/food-plan/preferences">{t("add your food choices")}</Link> {t("first.")}
        </p>
      ) : null}
      <section className="card stack">
        <label className="field">
          <span>{t("Plan meals for")}</span>
          <select value={goal} onChange={(event) => setGoalOverride(event.target.value as NutritionGoal)}>
            {NUTRITION_GOALS.map((value) => (
              <option key={value} value={value}>
                {t(nutritionGoalLabels[value])}
              </option>
            ))}
          </select>
        </label>
        <ul>
          {day.guidance.map((line) => (
            <li key={line}>{t(line)}</li>
          ))}
        </ul>
        {day.safety.map((line) => (
          <p key={line} className="hint">
            {t(line)}
          </p>
        ))}
      </section>
      <WomensCareSection care={companion.womensCare} adaptation={care} sample={sample} />
      {(Object.keys(SLOT_LABEL) as MealSlot[]).map((slot) => {
        const options = day.slots[slot];
        if (options.length === 0) {
          return (
            <section key={slot} className="card stack">
              <h2>{t(SLOT_LABEL[slot])}</h2>
              <p className="hint">{t("No idea in the LifeZoi list passes all of your exclusions for this meal. That is better than showing something unsafe.")}</p>
            </section>
          );
        }
        const index = picks[slot] % options.length;
        const pick = options[index] as MealSuggestion;
        chosen.push(pick);
        return (
          <section key={slot} className="card stack">
            <h2>{t(SLOT_LABEL[slot])}</h2>
            <MealCard suggestion={pick} showKcal={showKcal} />
            {!sample ? (
              <ActivityActions
                activityId={`meal-${slot}`}
                minutes={pick.recipe.minutes}
                counts={(status) => ({ nutritionHabits: status === "skipped" ? 0 : 1 })}
                onReplace={options.length > 1 ? () => setPicks({ ...picks, [slot]: index + 1 }) : undefined}
                replaceLabel={t("Show another idea")}
              />
            ) : (
              <p className="hint">{t("Sample data is on, so nothing is recorded.")}</p>
            )}
          </section>
        );
      })}
      <section className="card stack">
        <h2>{t("Shopping list for today")}</h2>
        <ul>
          {shoppingList(chosen).map((line) => (
            <li key={line.name}>
              {t(line.name)} <span className="hint">({line.recipes.map((name) => t(name)).join(", ")})</span>
            </li>
          ))}
        </ul>
        <p className="hint">{t("Check every label. Recipes and products change, and LifeZoi cannot confirm any food is free of an allergen or cross-contact.")}</p>
      </section>
      {day.excluded.length > 0 ? (
        <details className="lz-section">
          <summary>
            <span>{t("Left out today ({count})", { count: day.excluded.length })}</span>
          </summary>
          <ul className="lz-section-body">
            {day.excluded.map((item) => (
              <li key={item.recipe.id}>
                {t(item.recipe.name)}: {reasonText(item.recipe, item.reason, t)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <p>
        <Link href="/food-plan/preferences">{t("Change my food choices")}</Link>
      </p>
    </div>
  );
}
