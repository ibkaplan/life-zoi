"use client";

import { ListenToSteps } from "@/components/voice/read-aloud";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFoodFormat } from "@/components/food-plan/frame";
import { useFoodPlan } from "@/components/food-plan/use-food-plan";
import { guessSeason, recipeById, SEASON_LABEL, SEASONAL_FOODS, seasonalById, type SeasonalFood } from "@/lib/food-plan/seasonal";
import { SEASONS, type Season } from "@/lib/food-plan/types";

export function SeasonalIndex() {
  const { state, save } = useFoodPlan();
  const { t } = useFoodFormat();
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<Season | "">(state.profile.season);
  const foods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEASONAL_FOODS.filter((food) => {
      const seasonOk = !season || food.seasons.includes(season);
      const text = `${food.name} ${food.summary} ${t(food.name)} ${t(food.summary)}`.toLowerCase();
      return seasonOk && (!q || text.includes(q));
    });
  }, [query, season, t]);

  function useGuess() {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const guess = guessSeason(zone, new Date().getMonth());
    if (!guess) return;
    setSeason(guess.season);
    save({ ...state, profile: { ...state.profile, season: guess.season, seasonSource: "guess" } });
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">{t("Seasonal Nutrition")}</p>
        <h1>{t("New England seasonal foods")}</h1>
        <p>{t("Examples follow a New England year. Availability varies by farm, weather, and week. This library does not invent nutrient numbers.")}</p>
      </section>
      <div className="food-filters">
        <label className="field">
          <span>{t("Search")}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" />
        </label>
        <label className="field">
          <span>{t("Season")}</span>
          <select
            value={season}
            onChange={(event) => {
              const next = event.target.value as Season | "";
              setSeason(next);
              save({ ...state, profile: { ...state.profile, season: next, seasonSource: next ? "manual" : "" } });
            }}
          >
            <option value="">{t("All seasons")}</option>
            {SEASONS.map((item) => (
              <option key={item} value={item}>{t(SEASON_LABEL[item])}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" type="button" onClick={useGuess}>{t("Use a browser guess")}</button>
      </div>
      {state.profile.seasonSource === "guess" ? <p className="hint">{t("Guessed from this browser’s time zone. It can be wrong.")}</p> : null}
      <div className="grid-2">
        {foods.map((food) => (
          <Link key={food.id} className="card food-card" href={`/food-plan/seasonal/${food.id}`}>
            <h2>{t(food.name)}</h2>
            <p>{food.seasons.map((item) => t(SEASON_LABEL[item])).join(", ")}</p>
            <p>{t(food.summary)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SeasonalDetail({ slug }: { slug: string }) {
  const food = seasonalById(slug);
  const recipe = food ? recipeById(food.recipeId) : null;
  const { state, save } = useFoodPlan();
  const { t } = useFoodFormat();
  if (!food || !recipe) return null;
  const saved = state.favorites.includes(recipe.id);
  return (
    <article className="stack-lg">
      <p><Link href="/food-plan/seasonal">{t("Seasonal foods")}</Link></p>
      <header className="stack">
        <h1>{t(food.name)}</h1>
        <p>{t(food.summary)}</p>
        <p className="hint">{t("Availability varies. A New England example may not match your market.")}</p>
      </header>
      <section className="card food-card stack">
        <h2>{t("How to prepare")}</h2>
        <ul>{food.prepare.map((step) => <li key={step}>{t(step)}</li>)}</ul>
        <h2>{t("Storage")}</h2>
        <p>{t(food.storage)}</p>
        <h2>{t("Shopping note")}</h2>
        <p>{t(food.shopping)}</p>
      </section>
      <RecipeBlock food={food} saved={saved} onSave={() => {
        const favorites = saved ? state.favorites.filter((id) => id !== recipe.id) : [...state.favorites, recipe.id];
        save({ ...state, favorites });
      }} />
    </article>
  );
}

function RecipeBlock({ food, saved, onSave }: { food: SeasonalFood; saved: boolean; onSave: () => void }) {
  const { t } = useFoodFormat();
  const recipe = recipeById(food.recipeId);
  if (!recipe) return null;
  return (
    <section className="card stack">
      <h2>{t(recipe.name)}</h2>
      <p>{t("{minutes} minutes. {servings}. These are kitchen amounts, not a nutrient analysis.", { minutes: recipe.minutes, servings: t(recipe.servingsNote) })}</p>
      <ListenToSteps
        title={t(recipe.name)}
        list={{ heading: t("Ingredients"), items: recipe.ingredients.map((item) => t("{amount} {item}", { amount: t(item.amount), item: t(item.item) })) }}
        steps={recipe.steps.map((step) => t(step))}
        compact
      />
      <ul>{recipe.ingredients.map((item) => <li key={item.item}>{t("{amount} {item}", { amount: t(item.amount), item: t(item.item) })}</li>)}</ul>
      <ol>{recipe.steps.map((step) => <li key={step}>{t(step)}</li>)}</ol>
      <p>{recipe.highlights.map((line) => t(line)).join(" ")}</p>
      <p>{t(recipe.seasonalNote)}</p>
      <p>{t(recipe.ayurveda)}</p>
      <button className="btn btn-secondary" type="button" onClick={onSave}>{saved ? t("Saved to favorites") : t("Save favorite")}</button>
    </section>
  );
}
