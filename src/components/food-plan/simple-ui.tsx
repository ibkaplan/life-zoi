"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FoodMark, FoodNumbers } from "@/components/food-plan/frame";
import { useFoodPlan } from "@/components/food-plan/use-food-plan";
import { buildTargets } from "@/lib/food-plan/calc";
import { extraAllergens, mealAllowed, type MealFilter } from "@/lib/food-plan/plan";
import { mealTotals, SIMPLE_MEALS, sumParts } from "@/lib/food-plan/meals";
import { FOOD_LINKS, SIMPLE_MESSAGE } from "@/lib/food-plan/sources";
import type { DietPattern } from "@/lib/food-plan/types";
import {
  PLATE_CARB_IDS,
  PLATE_FAT_IDS,
  PLATE_PROTEIN_IDS,
  PLATE_VEGETABLE_IDS,
  scaleFood,
  SIMPLE_LIBRARY_IDS,
  usdaById,
  usdaUrl,
} from "@/lib/food-plan/usda";

export function SimpleMeals() {
  const { state } = useFoodPlan();
  const [pattern, setPattern] = useState<DietPattern | "">(state.profile.pattern);
  const [dairyFree, setDairyFree] = useState(state.profile.pattern === "vegan");
  const [budget, setBudget] = useState(false);
  const [minimal, setMinimal] = useState(false);
  const [quick, setQuick] = useState(false);
  const filter: MealFilter = {
    pattern,
    allergens: [...state.profile.allergens, ...extraAllergens(`${state.profile.allergyNote} ${state.profile.avoid} ${state.profile.dislikes}`)],
    text: `${state.profile.allergyNote} ${state.profile.avoid} ${state.profile.dislikes}`,
    dairyFree,
    budgetOnly: budget,
    quickOnly: quick,
    minimalOnly: minimal,
    maxMinutes: 0,
  };
  const meals = SIMPLE_MEALS.filter((meal) => mealAllowed(meal, filter, { time: true, budget: false, minimal: false }));
  return (
    <div className="stack-lg food-simple">
      <p className="kicker">SIMPLE PROTEIN, SIMPLE MEALS</p>
      <h1>Simple protein, simple meals</h1>
      <p className="lede">{SIMPLE_MESSAGE}</p>
      <section className="card food-card stack">
        <h2>You can eat healthy without spending hours in the kitchen</h2>
        <p>These meals use foods you can assemble quickly. Numbers are estimates scaled from USDA FoodData Central. Nothing on this page is mandatory.</p>
      </section>
      <CheeseNote />
      <div className="food-filters">
        <label className="field"><span>Pattern</span>
          <select value={pattern} onChange={(event) => setPattern(event.target.value as DietPattern | "")}>
            <option value="">Any</option>
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </label>
        <label><input type="checkbox" checked={dairyFree} onChange={() => setDairyFree(!dairyFree)} /> Dairy-free</label>
        <label><input type="checkbox" checked={budget} onChange={() => setBudget(!budget)} /> Budget</label>
        <label><input type="checkbox" checked={minimal} onChange={() => setMinimal(!minimal)} /> Minimal cooking</label>
        <label><input type="checkbox" checked={quick} onChange={() => setQuick(!quick)} /> Quick</label>
      </div>
      <p className="hint">Allergies from your food profile are applied. A saved avoid list is respected.</p>
      <div className="grid-2">
        {SIMPLE_LIBRARY_IDS.map((id) => {
          const food = usdaById(id);
          if (!food) return null;
          if (dairyFree && food.kind === "dairy") return null;
          if (pattern === "vegan" && food.kind !== "plant") return null;
          if (pattern === "vegetarian" && (food.kind === "meat" || food.kind === "fish")) return null;
          const scaled = scaleFood(food, 1);
          return (
            <article key={id} className="card food-card stack">
              <FoodMark label={food.name} />
              <h2>{food.name}</h2>
              <p>{food.servingLabel}</p>
              <FoodNumbers kcal={scaled.kcal} protein={scaled.protein} fiber={scaled.fiber} sat={scaled.sat} />
              <ul>{food.ways.map((way) => <li key={way}>{way}</li>)}</ul>
              <p className="hint"><a href={usdaUrl(food.fdcId)}>USDA {food.fdcId}</a></p>
            </article>
          );
        })}
      </div>
      <h2>Simple meals</h2>
      <div className="stack">
        {meals.map((meal) => {
          const totals = mealTotals(meal);
          return (
            <article key={meal.id} className="card stack">
              <h3>{meal.slot}: {meal.name}</h3>
              <p>{meal.summary}</p>
              <ol>{meal.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              <FoodNumbers kcal={totals.kcal} protein={totals.protein} fiber={totals.fiber} sat={totals.sat} />
              <p className="hint">Estimated. {totals.lines.map((line) => `${line.name} (FDC ${line.fdcId})`).join("; ")}.</p>
            </article>
          );
        })}
      </div>
      <p><Link className="btn btn-primary" href="/food-plan/simple/plate">Build my simple plate</Link></p>
      <p><Link href="/food-plan/simple/keep">Lose fat. Support your muscles. Keep your meals simple.</Link></p>
    </div>
  );
}

function CheeseNote() {
  return (
    <section className="card stack">
      <h2>Cheese is one option</h2>
      <p>Hard cheese can be a useful source of protein and calcium. The serving on this page is about one ounce (the 30 g reference amount), or a 17 g slice in the same FoodData Central record. It is not 200 g a day. Many hard cheeses are calorie-dense and high in saturated fat and sodium. Use a moderate portion and vary your protein foods.</p>
      <p>Other options: eggs, Greek yogurt, cottage cheese, beans, lentils, fish, chicken, and tofu. None of them is mandatory.</p>
      <ul>
        <li><a href={FOOD_LINKS.harvardCheese.url}>{FOOD_LINKS.harvardCheese.name}</a></li>
        <li><a href={FOOD_LINKS.heartProtein.url}>{FOOD_LINKS.heartProtein.name}</a></li>
        <li><a href={FOOD_LINKS.harvardProtein.url}>{FOOD_LINKS.harvardProtein.name}</a></li>
      </ul>
    </section>
  );
}

export function SimplePlate() {
  const { state, save } = useFoodPlan();
  const plate = state.plate;
  const flags = {
    pregnancy: state.profile.pregnancy,
    kidney: state.profile.kidney,
    liver: state.profile.liver,
    eatingDisorder: state.profile.eatingDisorder,
    complexMedical: state.profile.complexMedical,
  };
  const targets = buildTargets(state.protein, flags);
  const parts = useMemo(() => {
    const rows = [
      plate.proteinId ? { foodId: plate.proteinId, servings: plate.proteinServings } : null,
      plate.vegetableId ? { foodId: plate.vegetableId, servings: plate.vegetableServings } : null,
      plate.carbId ? { foodId: plate.carbId, servings: plate.carbServings } : null,
      plate.fatId ? { foodId: plate.fatId, servings: plate.fatServings } : null,
    ].filter((row): row is { foodId: string; servings: number } => row !== null);
    return sumParts(rows);
  }, [plate]);
  function choose(key: "proteinId" | "vegetableId" | "carbId" | "fatId", value: string) {
    save({ ...state, plate: { ...plate, [key]: value } });
  }
  return (
    <div className="stack-lg food-simple">
      <h1>Build my simple plate</h1>
      <p>Pick one protein, vegetables, a fiber-rich carbohydrate, and a healthy fat. Replace any of them and change the portion. Meals do not need the same amount of protein.</p>
      {plate.proteinId === "cheddar" ? <p>Hard cheese is one option in a moderate portion. It is not the center of this plate, and 200 g is not the serving.</p> : null}
      <PlateSelect label="Protein" value={plate.proteinId} ids={PLATE_PROTEIN_IDS} onChange={(value) => choose("proteinId", value)} servings={plate.proteinServings} onServings={(value) => save({ ...state, plate: { ...plate, proteinServings: value } })} />
      <PlateSelect label="Vegetables" value={plate.vegetableId} ids={PLATE_VEGETABLE_IDS} onChange={(value) => choose("vegetableId", value)} servings={plate.vegetableServings} onServings={(value) => save({ ...state, plate: { ...plate, vegetableServings: value } })} />
      <PlateSelect label="Fiber-rich carbohydrate" value={plate.carbId} ids={PLATE_CARB_IDS} onChange={(value) => choose("carbId", value)} servings={plate.carbServings} onServings={(value) => save({ ...state, plate: { ...plate, carbServings: value } })} />
      <PlateSelect label="Healthy fat" value={plate.fatId} ids={PLATE_FAT_IDS} onChange={(value) => choose("fatId", value)} servings={plate.fatServings} onServings={(value) => save({ ...state, plate: { ...plate, fatServings: value } })} />
      <FoodNumbers kcal={parts.kcal} protein={parts.protein} fiber={parts.fiber} sat={parts.sat} />
      <p className="hint">Estimated from the selected USDA records only. {parts.fiberGap.length ? `Fiber was not reported for ${parts.fiberGap.join(", ")}.` : ""}</p>
      {targets.ok ? (
        <p>Chosen daily protein target: {targets.proteinGrams.toFixed(1)} g. Calorie estimate: {targets.calorieTarget ?? "not set"} kcal. This plate is one combination toward that day, not a rule that every meal match it.</p>
      ) : (
        <p>{targets.reason} Food totals above are still estimates for the foods you picked. No personal target is set.</p>
      )}
    </div>
  );
}

function PlateSelect({
  label,
  value,
  ids,
  onChange,
  servings,
  onServings,
}: {
  label: string;
  value: string;
  ids: readonly string[];
  onChange: (value: string) => void;
  servings: number;
  onServings: (value: number) => void;
}) {
  return (
    <div className="food-filters">
      <label className="field">
        <span>{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Choose</option>
          {ids.map((id) => <option key={id} value={id}>{usdaById(id)?.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Portions of the listed serving</span>
        <select value={servings} onChange={(event) => onServings(Number(event.target.value))}>
          {[0.5, 1, 1.5, 2].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
    </div>
  );
}

export function SimpleKeep() {
  return (
    <article className="stack-lg food-simple">
      <p className="kicker">LOSE FAT. SUPPORT YOUR MUSCLES. KEEP YOUR MEALS SIMPLE.</p>
      <h1>Lose fat. Support your muscles. Keep your meals simple.</h1>
      <ul>
        <li>A moderate calorie deficit is the only reduction LifeZoi will estimate, and it will not go into a very-low-calorie diet.</li>
        <li>Protein can support muscle. It does not, by itself, cause weight loss or build muscle.</li>
        <li>Resistance exercise is what trains muscle.</li>
        <li>Vegetables and fiber can make meals more filling.</li>
        <li>Sleep and consistency matter.</li>
      </ul>
      <p>No result is guaranteed. No supplements are suggested. If you are pregnant or have kidney disease, liver disease, or a complex medical diet, do not use this page to raise protein. Talk with a qualified professional.</p>
      <p><Link href="/food-plan/simple">Back to simple meals</Link></p>
    </article>
  );
}
