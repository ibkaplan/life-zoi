"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodNumbers } from "@/components/food-plan/frame";
import { useFoodPlan } from "@/components/food-plan/use-food-plan";
import { todayDate } from "@/lib/browser-store";
import { mealById, mealTotals } from "@/lib/food-plan/meals";
import {
  ayurvedaLine,
  buildWeek,
  dayName,
  planBlockReason,
  regenerateDay,
  replacePlannedMeal,
  shoppingFromWeek,
} from "@/lib/food-plan/plan";
import { recipeById, SEASON_LABEL, seasonalById } from "@/lib/food-plan/seasonal";
import {
  ALLERGENS,
  DOSHAS,
  GOALS,
  SEASONS,
  type FoodProfile,
  type MealSlot,
} from "@/lib/food-plan/types";

const GOAL_LABEL: Record<(typeof GOALS)[number], string> = {
  lose: "Lose weight",
  maintain: "Maintain weight",
  gain: "Gain weight",
  balance: "Eat in a balanced way",
  variety: "More variety",
  seasonal: "Follow the season",
  ayurveda: "Explore Ayurveda as inspiration",
};

export function ProfileForm() {
  const { state, save } = useFoodPlan();
  const profile = state.profile;
  function setProfile(next: FoodProfile) {
    save({ ...state, profile: next });
  }
  return (
    <form className="stack-lg" onSubmit={(event) => event.preventDefault()}>
      <div className="stack">
        <p className="kicker">Discover My Food Profile</p>
        <h1>Tell LifeZoi only what you want to</h1>
        <p>Every question is optional. Leaving the goal blank does not assume weight loss. This page does not assign a dosha.</p>
      </div>
      <fieldset className="card stack">
        <legend>Goal</legend>
        {GOALS.map((goal) => (
          <label key={goal}>
            <input type="radio" name="goal" checked={profile.goal === goal} onChange={() => setProfile({ ...profile, goal })} /> {GOAL_LABEL[goal]}
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span>Foods you like</span>
        <input value={profile.likes} onChange={(event) => setProfile({ ...profile, likes: event.target.value })} type="text" />
      </label>
      <label className="field">
        <span>Foods you dislike</span>
        <input value={profile.dislikes} onChange={(event) => setProfile({ ...profile, dislikes: event.target.value })} type="text" />
      </label>
      <label className="field">
        <span>Eating pattern</span>
        <select value={profile.pattern} onChange={(event) => setProfile({ ...profile, pattern: event.target.value as FoodProfile["pattern"] })}>
          <option value="">No preference</option>
          <option value="omnivore">Omnivore</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>
      </label>
      <fieldset className="stack">
        <legend>Allergies</legend>
        {ALLERGENS.map((allergen) => (
          <label key={allergen}>
            <input
              type="checkbox"
              checked={profile.allergens.includes(allergen)}
              onChange={() => {
                const allergens = profile.allergens.includes(allergen)
                  ? profile.allergens.filter((item) => item !== allergen)
                  : [...profile.allergens, allergen];
                setProfile({ ...profile, allergens });
              }}
            /> {allergen}
          </label>
        ))}
        <label className="field">
          <span>Other allergy note</span>
          <input value={profile.allergyNote} onChange={(event) => setProfile({ ...profile, allergyNote: event.target.value })} type="text" />
        </label>
      </fieldset>
      <label className="field">
        <span>Foods to avoid</span>
        <input value={profile.avoid} onChange={(event) => setProfile({ ...profile, avoid: event.target.value })} type="text" />
      </label>
      <label className="field">
        <span>Meals per day</span>
        <select value={profile.mealsPerDay} onChange={(event) => setProfile({ ...profile, mealsPerDay: Number(event.target.value) as FoodProfile["mealsPerDay"] })}>
          <option value={0}>No preference (breakfast, lunch, and dinner)</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={profile.snack} onChange={() => setProfile({ ...profile, snack: !profile.snack })} /> Include an optional snack
      </label>
      <label className="field">
        <span>Cooking time</span>
        <select value={profile.cookMinutes} onChange={(event) => setProfile({ ...profile, cookMinutes: Number(event.target.value) as FoodProfile["cookMinutes"] })}>
          <option value={0}>No preference</option>
          <option value={15}>About 15 minutes</option>
          <option value={30}>About 30 minutes</option>
          <option value={45}>About 45 minutes</option>
          <option value={60}>About 60 minutes</option>
        </select>
      </label>
      <label className="field">
        <span>Budget</span>
        <select value={profile.budget} onChange={(event) => setProfile({ ...profile, budget: event.target.value as FoodProfile["budget"] })}>
          <option value="">No preference</option>
          <option value="modest">Modest</option>
          <option value="flexible">Flexible</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={profile.minimalCooking} onChange={() => setProfile({ ...profile, minimalCooking: !profile.minimalCooking })} /> Prefer minimal cooking
      </label>
      <label className="field">
        <span>Season</span>
        <select value={profile.season} onChange={(event) => setProfile({ ...profile, season: event.target.value as FoodProfile["season"], seasonSource: event.target.value ? "manual" : "" })}>
          <option value="">No season selected</option>
          {SEASONS.map((season) => <option key={season} value={season}>{SEASON_LABEL[season]}</option>)}
        </select>
      </label>
      <fieldset className="card stack">
        <legend>Traditional dosha label</legend>
        <p>{`Choose one if you want spice notes. Not sure and Skip are welcome. ${"Doshas are not medically validated biological classes."}`}</p>
        {DOSHAS.map((dosha) => (
          <label key={dosha}>
            <input type="radio" name="dosha" checked={profile.dosha === dosha} onChange={() => setProfile({ ...profile, dosha })} /> {dosha}
          </label>
        ))}
      </fieldset>
      <fieldset className="card stack">
        <legend>When LifeZoi should not build a plan</legend>
        <label><input type="checkbox" checked={profile.pregnancy} onChange={() => setProfile({ ...profile, pregnancy: !profile.pregnancy })} /> Pregnant or trying to become pregnant</label>
        <label><input type="checkbox" checked={profile.eatingDisorder} onChange={() => setProfile({ ...profile, eatingDisorder: !profile.eatingDisorder })} /> An eating disorder or a restrictive diet</label>
        <label><input type="checkbox" checked={profile.complexMedical} onChange={() => setProfile({ ...profile, complexMedical: !profile.complexMedical })} /> A complex medical diet</label>
        <label><input type="checkbox" checked={profile.kidney} onChange={() => setProfile({ ...profile, kidney: !profile.kidney })} /> Kidney disease</label>
        <label><input type="checkbox" checked={profile.liver} onChange={() => setProfile({ ...profile, liver: !profile.liver })} /> Liver disease</label>
        <p>Pregnancy, an eating disorder, or a complex medical diet: LifeZoi will not generate a personal meal plan. Kidney or liver disease: protein is not raised. Please talk with a qualified professional.</p>
      </fieldset>
      <p><Link className="btn btn-primary" href="/food-plan/week">Continue to the week</Link></p>
    </form>
  );
}

export function WeekView() {
  const { state, save } = useFoodPlan();
  const reason = planBlockReason(state.profile);
  const [message, setMessage] = useState(reason);
  function makeWeek() {
    const built = buildWeek(state.profile, Math.floor(Math.random() * 100000), crypto.randomUUID(), todayDate());
    if (!built.ok) {
      setMessage(built.reason);
      return;
    }
    setMessage(built.week.note);
    save({ ...state, week: built.week, shopping: shoppingFromWeek(built.week, state.shopping) });
  }
  const week = state.week;
  return (
    <div className="stack-lg">
      <div className="stack">
        <p className="kicker">My Weekly Meal Plan</p>
        <h1>Seven days</h1>
        <p>Breakfast, lunch, and dinner, plus a snack if you asked for one. Protein is spread across the day. Meals do not have to contain the same amount of protein. Cheese and processed meat are not the main protein.</p>
        {state.profile.goal === "lose" ? <p>A weight goal does not turn this into a calorie-cut or fat-burn plan. Portions stay at the listed serving until you edit them.</p> : null}
      </div>
      {message ? <p className="banner" role="status">{message}</p> : null}
      <div className="food-filters">
        <button className="btn btn-primary" type="button" onClick={makeWeek}>Build or regenerate the week</button>
      </div>
      {week ? (
        <div className="stack">
          <p>{week.note}</p>
          {week.days.map((day) => (
            <section key={day.index} className="card stack">
              <h2>{dayName(day.index)}</h2>
              {day.seasonalFoodId ? <p className="hint">Seasonal note: {seasonalById(day.seasonalFoodId)?.name}. Availability varies. Its own recipe is in the seasonal library and is not added to the USDA totals below.</p> : null}
              {day.meals.map((planned) => {
                const meal = mealById(planned.mealId);
                if (!meal) return null;
                const totals = mealTotals(meal, planned.portions);
                return (
                  <article key={planned.slot} className="food-card stack">
                    <h3>{planned.slot}: {meal.name}</h3>
                    <p>{meal.summary} About {meal.minutes} minutes.</p>
                    <ol>{meal.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    <FoodNumbers kcal={totals.kcal} protein={totals.protein} fiber={totals.fiber} sat={totals.sat} />
                    <p className="hint">Estimated from USDA FoodData Central for the foods in this meal. {totals.fiberGap.length ? `Fiber was not reported for ${totals.fiberGap.join(", ")}.` : ""}</p>
                    <p>{ayurvedaLine(meal, state.profile)}</p>
                    <label className="field">
                      <span>Portions</span>
                      <select
                        value={planned.portions}
                        onChange={(event) => {
                          const portions = Number(event.target.value);
                          const days = week.days.map((item) => item.index === day.index ? { ...item, meals: item.meals.map((row) => row.slot === planned.slot ? { ...row, portions } : row) } : item);
                          const next = { ...week, days };
                          save({ ...state, week: next, shopping: shoppingFromWeek(next, state.shopping) });
                        }}
                      >
                        {[0.5, 1, 1.5, 2].map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                    <div className="food-filters">
                      <button className="btn btn-secondary" type="button" onClick={() => {
                        const next = replacePlannedMeal(week, state.profile, day.index, planned.slot as MealSlot);
                        save({ ...state, week: next, shopping: shoppingFromWeek(next, state.shopping) });
                      }}>Replace this meal</button>
                      <button className="btn btn-secondary" type="button" onClick={() => {
                        const favorites = state.favorites.includes(meal.id) ? state.favorites : [...state.favorites, meal.id];
                        save({ ...state, favorites });
                      }}>Save favorite</button>
                    </div>
                  </article>
                );
              })}
              <button className="btn btn-ghost" type="button" onClick={() => {
                const next = regenerateDay(week, state.profile, day.index);
                save({ ...state, week: next, shopping: shoppingFromWeek(next, state.shopping) });
              }}>Regenerate this day</button>
            </section>
          ))}
        </div>
      ) : <p>No week yet. Build one when you are ready, or read the library first.</p>}
    </div>
  );
}

export function FavoritesView() {
  const { state, save } = useFoodPlan();
  return (
    <div className="stack">
      <h1>My Favorite Recipes</h1>
      {state.favorites.length === 0 ? <p>Save a meal from the week or a seasonal recipe.</p> : null}
      <ul className="stack">
        {state.favorites.map((id) => {
          const meal = mealById(id);
          const recipe = recipeById(id);
          const title = meal?.name ?? recipe?.name ?? id;
          return (
            <li key={id} className="card food-card">
              <h2>{title}</h2>
              <button className="btn btn-ghost" type="button" onClick={() => save({ ...state, favorites: state.favorites.filter((item) => item !== id) })}>Remove</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShoppingView() {
  const { state, save } = useFoodPlan();
  const [name, setName] = useState("");
  const groups = [...new Set(state.shopping.map((item) => item.group))];
  function write(shopping: typeof state.shopping) {
    save({ ...state, shopping });
  }
  const text = state.shopping.map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.name} — ${item.detail}`).join("\n");
  return (
    <div className="stack-lg food-print-root">
      <h1>My Shopping List</h1>
      <p>Grouped and combined from the week. Check items off, edit them, or add your own.</p>
      <div className="food-filters no-print">
        <button className="btn btn-secondary" type="button" onClick={() => window.print()}>Print</button>
        <button className="btn btn-secondary" type="button" onClick={() => void navigator.clipboard?.writeText(text)}>Copy</button>
        {state.week ? <button className="btn btn-ghost" type="button" onClick={() => write(shoppingFromWeek(state.week!, state.shopping))}>Update from the week</button> : null}
      </div>
      {groups.map((group) => (
        <section key={group} className="stack">
          <h2>{group}</h2>
          {state.shopping.filter((item) => item.group === group).map((item) => (
            <div key={item.id} className="card food-card stack">
              <label>
                <input type="checkbox" checked={item.checked} onChange={() => write(state.shopping.map((row) => row.id === item.id ? { ...row, checked: !row.checked } : row))} /> {item.name}
              </label>
              <label className="field">
                <span>Detail</span>
                <input value={item.detail} onChange={(event) => write(state.shopping.map((row) => row.id === item.id ? { ...row, detail: event.target.value } : row))} type="text" />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => write(state.shopping.filter((row) => row.id !== item.id))}>Remove</button>
            </div>
          ))}
        </section>
      ))}
      <form className="food-filters no-print" onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        write([...state.shopping, { id: crypto.randomUUID(), name: name.trim(), group: "Other", detail: "Added by you", checked: false, custom: true }]);
        setName("");
      }}>
        <label className="field">
          <span>Add an item</span>
          <input value={name} onChange={(event) => setName(event.target.value)} type="text" />
        </label>
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
    </div>
  );
}

export function ProgressView() {
  const { state, save } = useFoodPlan();
  const [note, setNote] = useState("");
  const [tried, setTried] = useState("");
  return (
    <div className="stack-lg">
      <h1>My Wellness Progress</h1>
      <p>A light record of cooking and curiosity. It does not track calories, weight, or streaks.</p>
      <form className="card stack" onSubmit={(event) => {
        event.preventDefault();
        const progress = [{ id: crypto.randomUUID(), date: todayDate(), cooked: null, triedFoodId: tried, note }, ...state.progress];
        save({ ...state, progress });
        setNote("");
      }}>
        <label className="field">
          <span>A seasonal food you tried</span>
          <select value={tried} onChange={(event) => setTried(event.target.value)}>
            <option value="">None</option>
            {state.profile.season ? null : null}
            {["asparagus", "blueberries-season", "apples-season", "kale", "potatoes"].map((id) => (
              <option key={id} value={id}>{seasonalById(id)?.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>A short note</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">Save note</button>
      </form>
      <ul className="stack">
        {state.progress.map((item) => (
          <li key={item.id} className="card">
            <p>{item.date}. {item.triedFoodId ? seasonalById(item.triedFoodId)?.name : "No seasonal food named."}</p>
            <p>{item.note}</p>
            <button className="btn btn-ghost" type="button" onClick={() => save({ ...state, progress: state.progress.filter((row) => row.id !== item.id) })}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
