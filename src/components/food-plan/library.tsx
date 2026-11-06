"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFoodPlan } from "@/components/food-plan/use-food-plan";
import { guessSeason, recipeById, SEASON_LABEL, SEASONAL_FOODS, seasonalById, type SeasonalFood } from "@/lib/food-plan/seasonal";
import { SEASONS, type Season } from "@/lib/food-plan/types";

export function SeasonalIndex() {
  const { state, save } = useFoodPlan();
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<Season | "">(state.profile.season);
  const foods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEASONAL_FOODS.filter((food) => {
      const seasonOk = !season || food.seasons.includes(season);
      const text = `${food.name} ${food.summary}`.toLowerCase();
      return seasonOk && (!q || text.includes(q));
    });
  }, [query, season]);

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
        <p className="kicker">Seasonal Nutrition</p>
        <h1>New England seasonal foods</h1>
        <p>Examples follow a New England year. Availability varies by farm, weather, and week. This library does not invent nutrient numbers.</p>
      </section>
      <div className="food-filters">
        <label className="field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" />
        </label>
        <label className="field">
          <span>Season</span>
          <select
            value={season}
            onChange={(event) => {
              const next = event.target.value as Season | "";
              setSeason(next);
              save({ ...state, profile: { ...state.profile, season: next, seasonSource: next ? "manual" : "" } });
            }}
          >
            <option value="">All seasons</option>
            {SEASONS.map((item) => (
              <option key={item} value={item}>{SEASON_LABEL[item]}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" type="button" onClick={useGuess}>Use a browser guess</button>
      </div>
      {state.profile.seasonSource === "guess" ? <p className="hint">Guessed from this browser’s time zone. It can be wrong.</p> : null}
      <div className="grid-2">
        {foods.map((food) => (
          <Link key={food.id} className="card food-card" href={`/food-plan/seasonal/${food.id}`}>
            <h2>{food.name}</h2>
            <p>{food.seasons.map((item) => SEASON_LABEL[item]).join(", ")}</p>
            <p>{food.summary}</p>
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
  if (!food || !recipe) return null;
  const saved = state.favorites.includes(recipe.id);
  return (
    <article className="stack-lg">
      <p><Link href="/food-plan/seasonal">Seasonal foods</Link></p>
      <header className="stack">
        <h1>{food.name}</h1>
        <p>{food.summary}</p>
        <p className="hint">Availability varies. A New England example may not match your market.</p>
      </header>
      <section className="card food-card stack">
        <h2>How to prepare</h2>
        <ul>{food.prepare.map((step) => <li key={step}>{step}</li>)}</ul>
        <h2>Storage</h2>
        <p>{food.storage}</p>
        <h2>Shopping note</h2>
        <p>{food.shopping}</p>
      </section>
      <RecipeBlock food={food} saved={saved} onSave={() => {
        const favorites = saved ? state.favorites.filter((id) => id !== recipe.id) : [...state.favorites, recipe.id];
        save({ ...state, favorites });
      }} />
    </article>
  );
}

function RecipeBlock({ food, saved, onSave }: { food: SeasonalFood; saved: boolean; onSave: () => void }) {
  const recipe = recipeById(food.recipeId);
  if (!recipe) return null;
  return (
    <section className="card stack">
      <h2>{recipe.name}</h2>
      <p>{recipe.minutes} minutes. {recipe.servingsNote}. These are kitchen amounts, not a nutrient analysis.</p>
      <ul>{recipe.ingredients.map((item) => <li key={item.item}>{item.amount} {item.item}</li>)}</ul>
      <ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p>{recipe.highlights.join(" ")}</p>
      <p>{recipe.seasonalNote}</p>
      <p>{recipe.ayurveda}</p>
      <button className="btn btn-secondary" type="button" onClick={onSave}>{saved ? "Saved to favorites" : "Save favorite"}</button>
    </section>
  );
}
