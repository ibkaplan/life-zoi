"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodNumbers, useFoodFormat } from "@/components/food-plan/frame";
import { msg } from "@/lib/i18n/translate";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
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
  shoppingDetail,
  shoppingFromWeek,
  SLOT_WORD,
  translateWeekNote,
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

const ALLERGEN_WORD: Record<(typeof ALLERGENS)[number], string> = {
  milk: msg("milk"),
  egg: msg("egg"),
  peanut: msg("peanut"),
  "tree-nut": msg("tree-nut"),
  fish: msg("fish"),
  shellfish: msg("shellfish"),
  soy: msg("soy"),
  wheat: msg("wheat"),
  sesame: msg("sesame"),
};

const DOSHA_WORD: Record<(typeof DOSHAS)[number], string> = {
  vata: msg("vata"),
  pitta: msg("pitta"),
  kapha: msg("kapha"),
  "vata-pitta": msg("vata-pitta"),
  "pitta-kapha": msg("pitta-kapha"),
  "vata-kapha": msg("vata-kapha"),
  tridosha: msg("tridosha"),
  "not-sure": msg("not-sure"),
  skip: msg("skip"),
};

/** Saved dates are ISO strings. They are shown in the chosen language. */
function formatDay(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (locale === "en" || !year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString(LOCALE_META[locale].htmlLang, { year: "numeric", month: "long", day: "numeric" });
}

const GOAL_LABEL: Record<(typeof GOALS)[number], string> = {
  lose: msg("Lose weight"),
  maintain: msg("Maintain weight"),
  gain: msg("Gain weight"),
  balance: msg("Eat in a balanced way"),
  variety: msg("More variety"),
  seasonal: msg("Follow the season"),
  ayurveda: msg("Explore Ayurveda as inspiration"),
};

export function ProfileForm() {
  const { state, save } = useFoodPlan();
  const { t } = useFoodFormat();
  const profile = state.profile;
  function setProfile(next: FoodProfile) {
    save({ ...state, profile: next });
  }
  return (
    <form className="stack-lg" onSubmit={(event) => event.preventDefault()}>
      <div className="stack">
        <p className="kicker">{t("Discover My Food Profile")}</p>
        <h1>{t("Tell LifeZoi only what you want to")}</h1>
        <p>{t("Every question is optional. Leaving the goal blank does not assume weight loss. This page does not assign a dosha.")}</p>
      </div>
      <fieldset className="card stack">
        <legend>{t("Goal")}</legend>
        {GOALS.map((goal) => (
          <label key={goal}>
            <input type="radio" name="goal" checked={profile.goal === goal} onChange={() => setProfile({ ...profile, goal })} /> {t(GOAL_LABEL[goal])}
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span>{t("Foods you like")}</span>
        <input value={profile.likes} onChange={(event) => setProfile({ ...profile, likes: event.target.value })} type="text" />
      </label>
      <label className="field">
        <span>{t("Foods you dislike")}</span>
        <input value={profile.dislikes} onChange={(event) => setProfile({ ...profile, dislikes: event.target.value })} type="text" />
      </label>
      <label className="field">
        <span>{t("Eating pattern")}</span>
        <select value={profile.pattern} onChange={(event) => setProfile({ ...profile, pattern: event.target.value as FoodProfile["pattern"] })}>
          <option value="">{t("No preference")}</option>
          <option value="omnivore">{t("Omnivore")}</option>
          <option value="pescatarian">{t("Pescatarian")}</option>
          <option value="vegetarian">{t("Vegetarian")}</option>
          <option value="vegan">{t("Vegan")}</option>
        </select>
      </label>
      <fieldset className="stack">
        <legend>{t("Allergies")}</legend>
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
            /> {t(ALLERGEN_WORD[allergen])}
          </label>
        ))}
        <label className="field">
          <span>{t("Other allergy note")}</span>
          <input value={profile.allergyNote} onChange={(event) => setProfile({ ...profile, allergyNote: event.target.value })} type="text" />
        </label>
      </fieldset>
      <label className="field">
        <span>{t("Foods to avoid")}</span>
        <input value={profile.avoid} onChange={(event) => setProfile({ ...profile, avoid: event.target.value })} type="text" />
      </label>
      <label className="field">
        <span>{t("Meals per day")}</span>
        <select value={profile.mealsPerDay} onChange={(event) => setProfile({ ...profile, mealsPerDay: Number(event.target.value) as FoodProfile["mealsPerDay"] })}>
          <option value={0}>{t("No preference (breakfast, lunch, and dinner)")}</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={profile.snack} onChange={() => setProfile({ ...profile, snack: !profile.snack })} /> {t("Include an optional snack")}
      </label>
      <label className="field">
        <span>{t("Cooking time")}</span>
        <select value={profile.cookMinutes} onChange={(event) => setProfile({ ...profile, cookMinutes: Number(event.target.value) as FoodProfile["cookMinutes"] })}>
          <option value={0}>{t("No preference")}</option>
          <option value={15}>{t("About 15 minutes")}</option>
          <option value={30}>{t("About 30 minutes")}</option>
          <option value={45}>{t("About 45 minutes")}</option>
          <option value={60}>{t("About 60 minutes")}</option>
        </select>
      </label>
      <label className="field">
        <span>{t("Budget")}</span>
        <select value={profile.budget} onChange={(event) => setProfile({ ...profile, budget: event.target.value as FoodProfile["budget"] })}>
          <option value="">{t("No preference")}</option>
          <option value="modest">{t("Modest")}</option>
          <option value="flexible">{t("Flexible")}</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={profile.minimalCooking} onChange={() => setProfile({ ...profile, minimalCooking: !profile.minimalCooking })} /> {t("Prefer minimal cooking")}
      </label>
      <label className="field">
        <span>{t("Season")}</span>
        <select value={profile.season} onChange={(event) => setProfile({ ...profile, season: event.target.value as FoodProfile["season"], seasonSource: event.target.value ? "manual" : "" })}>
          <option value="">{t("No season selected")}</option>
          {SEASONS.map((season) => <option key={season} value={season}>{t(SEASON_LABEL[season])}</option>)}
        </select>
      </label>
      <fieldset className="card stack">
        <legend>{t("Traditional dosha label")}</legend>
        <p>{`${t("Choose one if you want spice notes. Not sure and Skip are welcome.")} ${t("Doshas are not medically validated biological classes.")}`}</p>
        {DOSHAS.map((dosha) => (
          <label key={dosha}>
            <input type="radio" name="dosha" checked={profile.dosha === dosha} onChange={() => setProfile({ ...profile, dosha })} /> {t(DOSHA_WORD[dosha])}
          </label>
        ))}
      </fieldset>
      <fieldset className="card stack">
        <legend>{t("When LifeZoi should not build a plan")}</legend>
        <label><input type="checkbox" checked={profile.pregnancy} onChange={() => setProfile({ ...profile, pregnancy: !profile.pregnancy })} /> {t("Pregnant or trying to become pregnant")}</label>
        <label><input type="checkbox" checked={profile.eatingDisorder} onChange={() => setProfile({ ...profile, eatingDisorder: !profile.eatingDisorder })} /> {t("An eating disorder or a restrictive diet")}</label>
        <label><input type="checkbox" checked={profile.complexMedical} onChange={() => setProfile({ ...profile, complexMedical: !profile.complexMedical })} /> {t("A complex medical diet")}</label>
        <label><input type="checkbox" checked={profile.kidney} onChange={() => setProfile({ ...profile, kidney: !profile.kidney })} /> {t("Kidney disease")}</label>
        <label><input type="checkbox" checked={profile.liver} onChange={() => setProfile({ ...profile, liver: !profile.liver })} /> {t("Liver disease")}</label>
        <p>{t("Pregnancy, an eating disorder, or a complex medical diet: LifeZoi will not generate a personal meal plan. Kidney or liver disease: protein is not raised. Please talk with a qualified professional.")}</p>
      </fieldset>
      <p><Link className="btn btn-primary" href="/food-plan/week">{t("Continue to the week")}</Link></p>
    </form>
  );
}

export function WeekView() {
  const { state, save } = useFoodPlan();
  const { t, locale } = useFoodFormat();
  const reason = planBlockReason(state.profile, t);
  const [message, setMessage] = useState(reason);
  function makeWeek() {
    const built = buildWeek(state.profile, Math.floor(Math.random() * 100000), crypto.randomUUID(), todayDate(), t);
    if (!built.ok) {
      setMessage(built.reason);
      return;
    }
    setMessage(translateWeekNote(built.week.note, t));
    save({ ...state, week: built.week, shopping: shoppingFromWeek(built.week, state.shopping) });
  }
  const week = state.week;
  return (
    <div className="stack-lg">
      <div className="stack">
        <p className="kicker">{t("My Weekly Meal Plan")}</p>
        <h1>{t("Seven days")}</h1>
        <p>{t("Breakfast, lunch, and dinner, plus a snack if you asked for one. Protein is spread across the day. Meals do not have to contain the same amount of protein. Cheese and processed meat are not the main protein.")}</p>
        {state.profile.goal === "lose" ? <p>{t("A weight goal does not turn this into a calorie-cut or fat-burn plan. Portions stay at the listed serving until you edit them.")}</p> : null}
      </div>
      {message ? <p className="banner" role="status">{message}</p> : null}
      <div className="food-filters">
        <button className="btn btn-primary" type="button" onClick={makeWeek}>{t("Build or regenerate the week")}</button>
      </div>
      {week ? (
        <div className="stack">
          <p>{translateWeekNote(week.note, t)}</p>
          {week.days.map((day) => (
            <section key={day.index} className="card stack">
              <h2>{t(dayName(day.index))}</h2>
              {day.seasonalFoodId ? <p className="hint">{t("Seasonal note: {food}. Availability varies. Its own recipe is in the seasonal library and is not added to the USDA totals below.", { food: t(seasonalById(day.seasonalFoodId)?.name ?? "") })}</p> : null}
              {day.meals.map((planned) => {
                const meal = mealById(planned.mealId);
                if (!meal) return null;
                const totals = mealTotals(meal, planned.portions);
                return (
                  <article key={planned.slot} className="food-card stack">
                    <h3>{t("{slot}: {meal}", { slot: t(SLOT_WORD[planned.slot]), meal: t(meal.name) })}</h3>
                    <p>{t(meal.summary)} {t("About {minutes} minutes.", { minutes: meal.minutes })}</p>
                    <ol>{meal.steps.map((step) => <li key={step}>{t(step)}</li>)}</ol>
                    <FoodNumbers kcal={totals.kcal} protein={totals.protein} fiber={totals.fiber} sat={totals.sat} />
                    <p className="hint">{t("Estimated from USDA FoodData Central for the foods in this meal.")} {totals.fiberGap.length ? t("Fiber was not reported for {foods}.", { foods: totals.fiberGap.map((name) => t(name)).join(", ") }) : ""}</p>
                    <p>{t(ayurvedaLine(meal, state.profile))}</p>
                    <label className="field">
                      <span>{t("Portions")}</span>
                      <select
                        value={planned.portions}
                        onChange={(event) => {
                          const portions = Number(event.target.value);
                          const days = week.days.map((item) => item.index === day.index ? { ...item, meals: item.meals.map((row) => row.slot === planned.slot ? { ...row, portions } : row) } : item);
                          const next = { ...week, days };
                          save({ ...state, week: next, shopping: shoppingFromWeek(next, state.shopping) });
                        }}
                      >
                        {[0.5, 1, 1.5, 2].map((value) => <option key={value} value={value}>{value.toLocaleString(LOCALE_META[locale].htmlLang)}</option>)}
                      </select>
                    </label>
                    <div className="food-filters">
                      <button className="btn btn-secondary" type="button" onClick={() => {
                        const next = replacePlannedMeal(week, state.profile, day.index, planned.slot as MealSlot);
                        save({ ...state, week: next, shopping: shoppingFromWeek(next, state.shopping) });
                      }}>{t("Replace this meal")}</button>
                      <button className="btn btn-secondary" type="button" onClick={() => {
                        const favorites = state.favorites.includes(meal.id) ? state.favorites : [...state.favorites, meal.id];
                        save({ ...state, favorites });
                      }}>{t("Save favorite")}</button>
                    </div>
                  </article>
                );
              })}
              <button className="btn btn-ghost" type="button" onClick={() => {
                const next = regenerateDay(week, state.profile, day.index);
                save({ ...state, week: next, shopping: shoppingFromWeek(next, state.shopping) });
              }}>{t("Regenerate this day")}</button>
            </section>
          ))}
        </div>
      ) : <p>{t("No week yet. Build one when you are ready, or read the library first.")}</p>}
    </div>
  );
}

export function FavoritesView() {
  const { state, save } = useFoodPlan();
  const { t } = useFoodFormat();
  return (
    <div className="stack">
      <h1>{t("My Favorite Recipes")}</h1>
      {state.favorites.length === 0 ? <p>{t("Save a meal from the week or a seasonal recipe.")}</p> : null}
      <ul className="stack">
        {state.favorites.map((id) => {
          const meal = mealById(id);
          const recipe = recipeById(id);
          const title = meal?.name ?? recipe?.name ?? id;
          return (
            <li key={id} className="card food-card">
              <h2>{t(title)}</h2>
              <button className="btn btn-ghost" type="button" onClick={() => save({ ...state, favorites: state.favorites.filter((item) => item !== id) })}>{t("Remove")}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShoppingView() {
  const { state, save } = useFoodPlan();
  const { t, n } = useFoodFormat();
  const [name, setName] = useState("");
  const groups = [...new Set(state.shopping.map((item) => item.group))];
  function write(shopping: typeof state.shopping) {
    save({ ...state, shopping });
  }
  const text = state.shopping.map((item) => `${item.checked ? "[x]" : "[ ]"} ${t(item.name)} — ${shoppingDetail(item.detail, t, n)}`).join("\n");
  return (
    <div className="stack-lg food-print-root">
      <h1>{t("My Shopping List")}</h1>
      <p>{t("Grouped and combined from the week. Check items off, edit them, or add your own.")}</p>
      <div className="food-filters no-print">
        <button className="btn btn-secondary" type="button" onClick={() => window.print()}>{t("Print")}</button>
        <button className="btn btn-secondary" type="button" onClick={() => void navigator.clipboard?.writeText(text)}>{t("Copy")}</button>
        {state.week ? <button className="btn btn-ghost" type="button" onClick={() => write(shoppingFromWeek(state.week!, state.shopping))}>{t("Update from the week")}</button> : null}
      </div>
      {groups.map((group) => (
        <section key={group} className="stack">
          <h2>{t(group)}</h2>
          {state.shopping.filter((item) => item.group === group).map((item) => (
            <div key={item.id} className="card food-card stack">
              <label>
                <input type="checkbox" checked={item.checked} onChange={() => write(state.shopping.map((row) => row.id === item.id ? { ...row, checked: !row.checked } : row))} /> {t(item.name)}
              </label>
              <label className="field">
                <span>{t("Detail")}</span>
                <input value={item.detail} onChange={(event) => write(state.shopping.map((row) => row.id === item.id ? { ...row, detail: event.target.value } : row))} type="text" />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => write(state.shopping.filter((row) => row.id !== item.id))}>{t("Remove")}</button>
            </div>
          ))}
        </section>
      ))}
      <form className="food-filters no-print" onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        write([...state.shopping, { id: crypto.randomUUID(), name: name.trim(), group: msg("Other"), detail: msg("Added by you"), checked: false, custom: true }]);
        setName("");
      }}>
        <label className="field">
          <span>{t("Add an item")}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} type="text" />
        </label>
        <button className="btn btn-primary" type="submit">{t("Add")}</button>
      </form>
    </div>
  );
}

export function ProgressView() {
  const { state, save } = useFoodPlan();
  const { t, locale } = useFoodFormat();
  const [note, setNote] = useState("");
  const [tried, setTried] = useState("");
  return (
    <div className="stack-lg">
      <h1>{t("My Wellness Progress")}</h1>
      <p>{t("A light record of cooking and curiosity. It does not track calories, weight, or streaks.")}</p>
      <form className="card stack" onSubmit={(event) => {
        event.preventDefault();
        const progress = [{ id: crypto.randomUUID(), date: todayDate(), cooked: null, triedFoodId: tried, note }, ...state.progress];
        save({ ...state, progress });
        setNote("");
      }}>
        <label className="field">
          <span>{t("A seasonal food you tried")}</span>
          <select value={tried} onChange={(event) => setTried(event.target.value)}>
            <option value="">{t("None")}</option>
            {state.profile.season ? null : null}
            {["asparagus", "blueberries-season", "apples-season", "kale", "potatoes"].map((id) => (
              <option key={id} value={id}>{t(seasonalById(id)?.name ?? "")}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t("A short note")}</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">{t("Save note")}</button>
      </form>
      <ul className="stack">
        {state.progress.map((item) => (
          <li key={item.id} className="card">
            <p>{formatDay(item.date, locale)}. {item.triedFoodId ? t(seasonalById(item.triedFoodId)?.name ?? "") : t("No seasonal food named.")}</p>
            <p>{item.note}</p>
            <button className="btn btn-ghost" type="button" onClick={() => save({ ...state, progress: state.progress.filter((row) => row.id !== item.id) })}>{t("Remove")}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
