"use client";

import Link from "next/link";
import { FoodNumbers } from "@/components/food-plan/frame";
import { useFoodPlan } from "@/components/food-plan/use-food-plan";
import { ACTIVITY_FACTORS, buildTargets, clampProteinRate, RDA_G_PER_KG, REFERENCE_HIGH_G_PER_KG, REFERENCE_LOW_G_PER_KG } from "@/lib/food-plan/calc";
import { sumParts } from "@/lib/food-plan/meals";
import { FOOD_LINKS } from "@/lib/food-plan/sources";
import type { ProteinInputs } from "@/lib/food-plan/types";
import { PROTEIN_LIBRARY_IDS, scaleFood, usdaById, usdaUrl } from "@/lib/food-plan/usda";

export function ProteinPage() {
  const { state, save } = useFoodPlan();
  const flags = {
    pregnancy: state.profile.pregnancy,
    kidney: state.profile.kidney,
    liver: state.profile.liver,
    eatingDisorder: state.profile.eatingDisorder,
    complexMedical: state.profile.complexMedical,
  };
  const targets = buildTargets(state.protein, flags);
  function setProtein(next: ProteinInputs) {
    save({ ...state, protein: next });
  }
  const totals = sumParts(state.log.map((line) => ({ foodId: line.foodId, servings: line.servings })));
  return (
    <div className="stack-lg">
      <p className="kicker">Daily protein and calorie balance</p>
      <h1>Estimates, not a prescription</h1>
      <p>Protein and calories are related, and they are shown separately. Weight loss is not assumed. This page does not diagnose a deficiency, recommend a supplement, or promise a result.</p>
      <p>
        <Link href="/food-plan/protein/why">Why your body needs protein every day</Link>
        {" · "}
        <Link href="/food-plan/protein/muscle">Weight loss without ignoring your muscles</Link>
      </p>
      <form className="card stack" onSubmit={(event) => event.preventDefault()}>
        <label className="field"><span>Age</span><input value={state.protein.age} onChange={(event) => setProtein({ ...state.protein, age: event.target.value })} inputMode="numeric" /></label>
        <label className="field">
          <span>Equation form</span>
          <select value={state.protein.sex} onChange={(event) => setProtein({ ...state.protein, sex: event.target.value as ProteinInputs["sex"] })}>
            <option value="">Choose</option>
            <option value="female">Female form of Mifflin–St Jeor</option>
            <option value="male">Male form of Mifflin–St Jeor</option>
          </select>
        </label>
        <p className="hint">The published equation has two forms. Choosing one is not a medical determination.</p>
        <label className="field"><span>Height</span><input value={state.protein.height} onChange={(event) => setProtein({ ...state.protein, height: event.target.value })} inputMode="decimal" /></label>
        <label className="field">
          <span>Height unit</span>
          <select value={state.protein.heightUnit} onChange={(event) => setProtein({ ...state.protein, heightUnit: event.target.value as ProteinInputs["heightUnit"] })}>
            <option value="cm">Centimeters</option>
            <option value="in">Inches</option>
          </select>
        </label>
        <label className="field"><span>Weight</span><input value={state.protein.weight} onChange={(event) => setProtein({ ...state.protein, weight: event.target.value })} inputMode="decimal" /></label>
        <label className="field">
          <span>Weight unit</span>
          <select value={state.protein.weightUnit} onChange={(event) => setProtein({ ...state.protein, weightUnit: event.target.value as ProteinInputs["weightUnit"] })}>
            <option value="kg">Kilograms</option>
            <option value="lb">Pounds</option>
          </select>
        </label>
        <label className="field">
          <span>Activity</span>
          <select value={state.protein.activity} onChange={(event) => setProtein({ ...state.protein, activity: event.target.value as ProteinInputs["activity"] })}>
            <option value="">Choose</option>
            {Object.entries(ACTIVITY_FACTORS).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Goal</span>
          <select value={state.protein.goal} onChange={(event) => setProtein({ ...state.protein, goal: event.target.value as ProteinInputs["goal"] })}>
            <option value="">No goal selected</option>
            <option value="maintain">Maintain</option>
            <option value="lose">Lose</option>
            <option value="gain">Gain</option>
            <option value="muscle">Maintain muscle</option>
            <option value="nutrition">Improve nutrition</option>
          </select>
        </label>
        <label className="field">
          <span>Diet pattern</span>
          <select value={state.protein.pattern} onChange={(event) => setProtein({ ...state.protein, pattern: event.target.value as ProteinInputs["pattern"] })}>
            <option value="">No preference</option>
            <option value="omnivore">Omnivore</option>
            <option value="pescatarian">Pescatarian</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </label>
      </form>
      <TargetCard />
      <section className="stack">
        <h2>Foods with traced USDA values</h2>
        <p>Each figure is the per-100-gram FoodData Central value scaled to the listed gram weight. It is an estimate for that food, not a full diet analysis.</p>
        <div className="grid-2">
          {PROTEIN_LIBRARY_IDS.map((id) => {
            const food = usdaById(id);
            if (!food) return null;
            const scaled = scaleFood(food, 1);
            return (
              <article key={id} className="card food-card stack">
                <h3>{food.name}</h3>
                <p>{food.servingLabel}. {food.servingSource}.</p>
                <FoodNumbers kcal={scaled.kcal} protein={scaled.protein} fiber={scaled.fiber} sat={scaled.sat} sodium={scaled.sodium} />
                <p className="hint"><a href={usdaUrl(food.fdcId)}>FoodData Central {food.fdcId}</a>. {food.description}</p>
                <button className="btn btn-secondary" type="button" onClick={() => save({ ...state, log: [...state.log, { id: crypto.randomUUID(), foodId: id, servings: 1 }] })}>Add one serving to today’s log</button>
              </article>
            );
          })}
        </div>
      </section>
      <section className="card stack">
        <h2>Optional daily log</h2>
        <p>You can skip this. LifeZoi does not require a calorie diary.</p>
        {state.log.map((line) => {
          const food = usdaById(line.foodId);
          if (!food) return null;
          return (
            <div key={line.id} className="food-filters">
              <span>{food.name}</span>
              <label className="field">
                <span>Servings</span>
                <input value={line.servings} type="number" min={0.25} max={4} step={0.25} onChange={(event) => save({ ...state, log: state.log.map((item) => item.id === line.id ? { ...item, servings: Number(event.target.value) } : item) })} />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => save({ ...state, log: state.log.filter((item) => item.id !== line.id) })}>Remove</button>
            </div>
          );
        })}
        <FoodNumbers kcal={totals.kcal} protein={totals.protein} fiber={totals.fiber} sat={totals.sat} sodium={totals.sodium} />
        {targets.ok ? <p>Chosen protein target: {targets.proteinGrams.toFixed(1)} g. Calorie estimate: {targets.calorieTarget ?? "not set"} kcal. These meals and servings do not have to match each other.</p> : <p>{targets.reason}</p>}
        <p className="hint">Sources in this log: {[...new Set(state.log.map((line) => usdaById(line.foodId)?.fdcId).filter(Boolean))].join(", ") || "none yet"}.</p>
      </section>
    </div>
  );

  function TargetCard() {
    if (!targets.ok) return <p className="banner" role="status">{targets.reason}</p>;
    return (
      <section className="card stack">
        <h2>How the range is calculated</h2>
        <p>Resting estimate ({targets.body.sex} form) = 10×{targets.body.weightKg.toFixed(1)} kg + 6.25×{targets.body.heightCm.toFixed(1)} cm − 5×{targets.body.age} {targets.body.sex === "male" ? "+ 5" : "− 161"} = {targets.resting.toFixed(1)} kcal.</p>
        <p>Day estimate = {targets.resting.toFixed(1)} × {targets.activityFactor} ({targets.activityLabel}) = {targets.dayKcal.toFixed(1)} kcal. The multiplier is a common estimate, not a measurement.</p>
        <p>{targets.calorieNote} {targets.calorieTarget === null ? "" : `Shown calorie figure: ${targets.calorieTarget} kcal.`}</p>
        <p>General adult RDA = {RDA_G_PER_KG} × {targets.body.weightKg.toFixed(1)} kg = {targets.rdaGrams.toFixed(1)} g protein per day.</p>
        <p>A reference range for some suitable adults is {REFERENCE_LOW_G_PER_KG}–{REFERENCE_HIGH_G_PER_KG} g/kg/day, which is {targets.referenceLow.toFixed(1)}–{targets.referenceHigh.toFixed(1)} g for this weight. It is not a prescription for everyone. <a href={FOOD_LINKS.harvardProtein.url}>Harvard protein</a>, <a href={FOOD_LINKS.proteinReview.url}>review</a>, <a href={FOOD_LINKS.pubmedProtein.url}>PubMed 39002131</a>.</p>
        <p>{targets.proteinNote}</p>
        <label className="field">
          <span>Adjust the protein target ({state.protein.gramsPerKg ?? RDA_G_PER_KG} g per kg)</span>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.1}
            value={state.protein.gramsPerKg ?? 0.8}
            onChange={(event) => setProtein({ ...state.protein, gramsPerKg: clampProteinRate(Number(event.target.value)) })}
          />
        </label>
        <p>Chosen target: {targets.chosenPerKg.toFixed(1)} g/kg × {targets.body.weightKg.toFixed(1)} kg = {targets.proteinGrams.toFixed(1)} g per day.</p>
      </section>
    );
  }
}

export function ProteinWhy() {
  return (
    <article className="stack-lg">
      <p className="kicker">WHY YOUR BODY NEEDS PROTEIN EVERY DAY</p>
      <h1>Why your body needs protein every day</h1>
      <p>Protein foods supply amino acids used to maintain body tissues. Public guidance treats protein as a daily part of eating, alongside vegetables, fruit, fiber, whole grains, and fats. LifeZoi does not diagnose a protein deficiency and does not say a supplement is required.</p>
      <p>The general adult RDA is 0.8 g per kg of body weight per day. Some papers discuss 1.2–1.6 g/kg/day for suitable adults. That higher range is a reference, not a target for every person, and it is not used for pregnancy, kidney disease, or liver disease here.</p>
      <p><a href={FOOD_LINKS.harvardProtein.url}>{FOOD_LINKS.harvardProtein.name}</a></p>
      <p><Link href="/food-plan/protein">Back to the estimates</Link></p>
    </article>
  );
}

export function ProteinMuscle() {
  return (
    <article className="stack-lg">
      <p className="kicker">WEIGHT LOSS WITHOUT IGNORING YOUR MUSCLES</p>
      <h1>Weight loss without ignoring your muscles</h1>
      <p>If weight loss is your goal, a moderate calorie reduction is the estimate LifeZoi will show, and only when it stays at or above 1,500 kcal. Very-low-calorie diets are not offered. Protein can support muscle while someone eats less, and resistance exercise is the activity that trains muscle. Protein by itself does not cause weight loss or build muscle. Sleep, consistency, vegetables, and fiber matter too.</p>
      <p>No result is guaranteed. A clinician or registered dietitian should guide pregnancy, kidney disease, liver disease, and complex medical diets. LifeZoi will not raise protein for those situations.</p>
      <p><Link href="/food-plan/protein">Back to the estimates</Link></p>
    </article>
  );
}
