"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FoodMark, FoodNumbers, useFoodFormat } from "@/components/food-plan/frame";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { SLOT_WORD } from "@/lib/food-plan/plan";
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
  const { t } = useFoodFormat();
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
      <p className="kicker">{t("SIMPLE PROTEIN, SIMPLE MEALS")}</p>
      <h1>{t("Simple protein, simple meals")}</h1>
      <p className="lede">{t(SIMPLE_MESSAGE)}</p>
      <section className="card food-card stack">
        <h2>{t("You can eat healthy without spending hours in the kitchen")}</h2>
        <p>{t("These meals use foods you can assemble quickly. Numbers are estimates scaled from USDA FoodData Central. Nothing on this page is mandatory.")}</p>
      </section>
      <CheeseNote />
      <div className="food-filters">
        <label className="field"><span>{t("Pattern")}</span>
          <select value={pattern} onChange={(event) => setPattern(event.target.value as DietPattern | "")}>
            <option value="">{t("Any")}</option>
            <option value="omnivore">{t("Omnivore")}</option>
            <option value="vegetarian">{t("Vegetarian")}</option>
            <option value="vegan">{t("Vegan")}</option>
          </select>
        </label>
        <label><input type="checkbox" checked={dairyFree} onChange={() => setDairyFree(!dairyFree)} /> {t("Dairy-free")}</label>
        <label><input type="checkbox" checked={budget} onChange={() => setBudget(!budget)} /> {t("Budget")}</label>
        <label><input type="checkbox" checked={minimal} onChange={() => setMinimal(!minimal)} /> {t("Minimal cooking")}</label>
        <label><input type="checkbox" checked={quick} onChange={() => setQuick(!quick)} /> {t("Quick")}</label>
      </div>
      <p className="hint">{t("Allergies from your food profile are applied. A saved avoid list is respected.")}</p>
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
              <FoodMark label={t(food.name)} />
              <h2>{t(food.name)}</h2>
              <p>{t(food.servingLabel)}</p>
              <FoodNumbers kcal={scaled.kcal} protein={scaled.protein} fiber={scaled.fiber} sat={scaled.sat} />
              <ul>{food.ways.map((way) => <li key={way}>{t(way)}</li>)}</ul>
              <p className="hint"><a href={usdaUrl(food.fdcId)}>USDA {food.fdcId}</a></p>
            </article>
          );
        })}
      </div>
      <h2>{t("Simple meals")}</h2>
      <div className="stack">
        {meals.map((meal) => {
          const totals = mealTotals(meal);
          return (
            <article key={meal.id} className="card stack">
              <h3>{t("{slot}: {meal}", { slot: t(SLOT_WORD[meal.slot]), meal: t(meal.name) })}</h3>
              <p>{t(meal.summary)}</p>
              <ol>{meal.steps.map((step) => <li key={step}>{t(step)}</li>)}</ol>
              <FoodNumbers kcal={totals.kcal} protein={totals.protein} fiber={totals.fiber} sat={totals.sat} />
              <p className="hint">{t("Estimated.")} {totals.lines.map((line) => `${t(line.name)} (FDC ${line.fdcId})`).join("; ")}.</p>
            </article>
          );
        })}
      </div>
      <p><Link className="btn btn-primary" href="/food-plan/simple/plate">{t("Build my simple plate")}</Link></p>
      <p><Link href="/food-plan/simple/keep">{t("Lose fat. Support your muscles. Keep your meals simple.")}</Link></p>
    </div>
  );
}

function CheeseNote() {
  const { t } = useFoodFormat();
  return (
    <section className="card stack">
      <h2>{t("Cheese is one option")}</h2>
      <p>{t("Hard cheese can be a useful source of protein and calcium. The serving on this page is about one ounce (the 30 g reference amount), or a 17 g slice in the same FoodData Central record. It is not 200 g a day. Many hard cheeses are calorie-dense and high in saturated fat and sodium. Use a moderate portion and vary your protein foods.")}</p>
      <p>{t("Other options: eggs, Greek yogurt, cottage cheese, beans, lentils, fish, chicken, and tofu. None of them is mandatory.")}</p>
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
  const { t, n } = useFoodFormat();
  const plate = state.plate;
  const flags = {
    pregnancy: state.profile.pregnancy,
    kidney: state.profile.kidney,
    liver: state.profile.liver,
    eatingDisorder: state.profile.eatingDisorder,
    complexMedical: state.profile.complexMedical,
  };
  const targets = buildTargets(state.protein, flags, t);
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
      <h1>{t("Build my simple plate")}</h1>
      <p>{t("Pick one protein, vegetables, a fiber-rich carbohydrate, and a healthy fat. Replace any of them and change the portion. Meals do not need the same amount of protein.")}</p>
      {plate.proteinId === "cheddar" ? <p>{t("Hard cheese is one option in a moderate portion. It is not the center of this plate, and 200 g is not the serving.")}</p> : null}
      <PlateSelect label={msg("Protein")} value={plate.proteinId} ids={PLATE_PROTEIN_IDS} onChange={(value) => choose("proteinId", value)} servings={plate.proteinServings} onServings={(value) => save({ ...state, plate: { ...plate, proteinServings: value } })} />
      <PlateSelect label={msg("Vegetables")} value={plate.vegetableId} ids={PLATE_VEGETABLE_IDS} onChange={(value) => choose("vegetableId", value)} servings={plate.vegetableServings} onServings={(value) => save({ ...state, plate: { ...plate, vegetableServings: value } })} />
      <PlateSelect label={msg("Fiber-rich carbohydrate")} value={plate.carbId} ids={PLATE_CARB_IDS} onChange={(value) => choose("carbId", value)} servings={plate.carbServings} onServings={(value) => save({ ...state, plate: { ...plate, carbServings: value } })} />
      <PlateSelect label={msg("Healthy fat")} value={plate.fatId} ids={PLATE_FAT_IDS} onChange={(value) => choose("fatId", value)} servings={plate.fatServings} onServings={(value) => save({ ...state, plate: { ...plate, fatServings: value } })} />
      <FoodNumbers kcal={parts.kcal} protein={parts.protein} fiber={parts.fiber} sat={parts.sat} />
      <p className="hint">{t("Estimated from the selected USDA records only.")} {parts.fiberGap.length ? t("Fiber was not reported for {foods}.", { foods: parts.fiberGap.map((name) => t(name)).join(", ") }) : ""}</p>
      {targets.ok ? (
        <p>
          {t("Chosen daily protein target: {grams} g. Calorie estimate: {kcal} kcal. This plate is one combination toward that day, not a rule that every meal match it.", {
            grams: n(targets.proteinGrams),
            kcal: targets.calorieTarget ?? t("not set"),
          })}
        </p>
      ) : (
        <p>
          {targets.reason} {t("Food totals above are still estimates for the foods you picked. No personal target is set.")}
        </p>
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
  const { t, locale } = useFoodFormat();
  return (
    <div className="food-filters">
      <label className="field">
        <span>{t(label)}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{t("Choose")}</option>
          {ids.map((id) => <option key={id} value={id}>{t(usdaById(id)?.name ?? "")}</option>)}
        </select>
      </label>
      <label className="field">
        <span>{t("Portions of the listed serving")}</span>
        <select value={servings} onChange={(event) => onServings(Number(event.target.value))}>
          {[0.5, 1, 1.5, 2].map((item) => <option key={item} value={item}>{item.toLocaleString(LOCALE_META[locale].htmlLang)}</option>)}
        </select>
      </label>
    </div>
  );
}

export function SimpleKeep() {
  const { t } = useFoodFormat();
  return (
    <article className="stack-lg food-simple">
      <p className="kicker">{t("LOSE FAT. SUPPORT YOUR MUSCLES. KEEP YOUR MEALS SIMPLE.")}</p>
      <h1>{t("Lose fat. Support your muscles. Keep your meals simple.")}</h1>
      <ul>
        <li>{t("A moderate calorie deficit is the only reduction LifeZoi will estimate, and it will not go into a very-low-calorie diet.")}</li>
        <li>{t("Protein can support muscle. It does not, by itself, cause weight loss or build muscle.")}</li>
        <li>{t("Resistance exercise is what trains muscle.")}</li>
        <li>{t("Vegetables and fiber can make meals more filling.")}</li>
        <li>{t("Sleep and consistency matter.")}</li>
      </ul>
      <p>{t("No result is guaranteed. No supplements are suggested. If you are pregnant or have kidney disease, liver disease, or a complex medical diet, do not use this page to raise protein. Talk with a qualified professional.")}</p>
      <p><Link href="/food-plan/simple">{t("Back to simple meals")}</Link></p>
    </article>
  );
}
