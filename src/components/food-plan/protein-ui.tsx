"use client";

import Link from "next/link";
import { FoodNumbers, useFoodFormat } from "@/components/food-plan/frame";
import { useFoodPlan } from "@/components/food-plan/use-food-plan";
import { ACTIVITY_FACTORS, buildTargets, clampProteinRate, RDA_G_PER_KG, REFERENCE_HIGH_G_PER_KG, REFERENCE_LOW_G_PER_KG } from "@/lib/food-plan/calc";
import { sumParts } from "@/lib/food-plan/meals";
import { FOOD_LINKS } from "@/lib/food-plan/sources";
import type { ProteinInputs } from "@/lib/food-plan/types";
import { PROTEIN_LIBRARY_IDS, scaleFood, usdaById, usdaUrl } from "@/lib/food-plan/usda";

export function ProteinPage() {
  const { state, save } = useFoodPlan();
  const { t, n, plain } = useFoodFormat();
  const flags = {
    pregnancy: state.profile.pregnancy,
    kidney: state.profile.kidney,
    liver: state.profile.liver,
    eatingDisorder: state.profile.eatingDisorder,
    complexMedical: state.profile.complexMedical,
  };
  const targets = buildTargets(state.protein, flags, t);
  function setProtein(next: ProteinInputs) {
    save({ ...state, protein: next });
  }
  const totals = sumParts(state.log.map((line) => ({ foodId: line.foodId, servings: line.servings })));
  return (
    <div className="stack-lg">
      <p className="kicker">{t("Daily protein and calorie balance")}</p>
      <h1>{t("Estimates, not a prescription")}</h1>
      <p>{t("Protein and calories are related, and they are shown separately. Weight loss is not assumed. This page does not diagnose a deficiency, recommend a supplement, or promise a result.")}</p>
      <p>
        <Link href="/food-plan/protein/why">{t("Why your body needs protein every day")}</Link>
        {" · "}
        <Link href="/food-plan/protein/muscle">{t("Weight loss without ignoring your muscles")}</Link>
      </p>
      <form className="card stack" onSubmit={(event) => event.preventDefault()}>
        <label className="field"><span>{t("Age")}</span><input value={state.protein.age} onChange={(event) => setProtein({ ...state.protein, age: event.target.value })} inputMode="numeric" /></label>
        <label className="field">
          <span>{t("Equation form")}</span>
          <select value={state.protein.sex} onChange={(event) => setProtein({ ...state.protein, sex: event.target.value as ProteinInputs["sex"] })}>
            <option value="">{t("Choose")}</option>
            <option value="female">{t("Female form of Mifflin–St Jeor")}</option>
            <option value="male">{t("Male form of Mifflin–St Jeor")}</option>
          </select>
        </label>
        <p className="hint">{t("The published equation has two forms. Choosing one is not a medical determination.")}</p>
        <label className="field"><span>{t("Height")}</span><input value={state.protein.height} onChange={(event) => setProtein({ ...state.protein, height: event.target.value })} inputMode="decimal" /></label>
        <label className="field">
          <span>{t("Height unit")}</span>
          <select value={state.protein.heightUnit} onChange={(event) => setProtein({ ...state.protein, heightUnit: event.target.value as ProteinInputs["heightUnit"] })}>
            <option value="cm">{t("Centimeters")}</option>
            <option value="in">{t("Inches")}</option>
          </select>
        </label>
        <label className="field"><span>{t("Weight")}</span><input value={state.protein.weight} onChange={(event) => setProtein({ ...state.protein, weight: event.target.value })} inputMode="decimal" /></label>
        <label className="field">
          <span>{t("Weight unit")}</span>
          <select value={state.protein.weightUnit} onChange={(event) => setProtein({ ...state.protein, weightUnit: event.target.value as ProteinInputs["weightUnit"] })}>
            <option value="kg">{t("Kilograms")}</option>
            <option value="lb">{t("Pounds")}</option>
          </select>
        </label>
        <label className="field">
          <span>{t("Activity")}</span>
          <select value={state.protein.activity} onChange={(event) => setProtein({ ...state.protein, activity: event.target.value as ProteinInputs["activity"] })}>
            <option value="">{t("Choose")}</option>
            {Object.entries(ACTIVITY_FACTORS).map(([id, item]) => <option key={id} value={id}>{t(item.label)}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{t("Goal")}</span>
          <select value={state.protein.goal} onChange={(event) => setProtein({ ...state.protein, goal: event.target.value as ProteinInputs["goal"] })}>
            <option value="">{t("No goal selected")}</option>
            <option value="maintain">{t("Maintain")}</option>
            <option value="lose">{t("Lose")}</option>
            <option value="gain">{t("Gain")}</option>
            <option value="muscle">{t("Maintain muscle")}</option>
            <option value="nutrition">{t("Improve nutrition")}</option>
          </select>
        </label>
        <label className="field">
          <span>{t("Diet pattern")}</span>
          <select value={state.protein.pattern} onChange={(event) => setProtein({ ...state.protein, pattern: event.target.value as ProteinInputs["pattern"] })}>
            <option value="">{t("No preference")}</option>
            <option value="omnivore">{t("Omnivore")}</option>
            <option value="pescatarian">{t("Pescatarian")}</option>
            <option value="vegetarian">{t("Vegetarian")}</option>
            <option value="vegan">{t("Vegan")}</option>
          </select>
        </label>
      </form>
      <TargetCard />
      <section className="stack">
        <h2>{t("Foods with traced USDA values")}</h2>
        <p>{t("Each figure is the per-100-gram FoodData Central value scaled to the listed gram weight. It is an estimate for that food, not a full diet analysis.")}</p>
        <div className="grid-2">
          {PROTEIN_LIBRARY_IDS.map((id) => {
            const food = usdaById(id);
            if (!food) return null;
            const scaled = scaleFood(food, 1);
            return (
              <article key={id} className="card food-card stack">
                <h3>{t(food.name)}</h3>
                <p>{t(food.servingLabel)}. {t(food.servingSource)}.</p>
                <FoodNumbers kcal={scaled.kcal} protein={scaled.protein} fiber={scaled.fiber} sat={scaled.sat} sodium={scaled.sodium} />
                <p className="hint"><a href={usdaUrl(food.fdcId)}>FoodData Central {food.fdcId}</a>. <span lang="en">{food.description}</span></p>
                <button className="btn btn-secondary" type="button" onClick={() => save({ ...state, log: [...state.log, { id: crypto.randomUUID(), foodId: id, servings: 1 }] })}>{t("Add one serving to today’s log")}</button>
              </article>
            );
          })}
        </div>
      </section>
      <section className="card stack">
        <h2>{t("Optional daily log")}</h2>
        <p>{t("You can skip this. LifeZoi does not require a calorie diary.")}</p>
        {state.log.map((line) => {
          const food = usdaById(line.foodId);
          if (!food) return null;
          return (
            <div key={line.id} className="food-filters">
              <span>{t(food.name)}</span>
              <label className="field">
                <span>{t("Servings")}</span>
                <input value={line.servings} type="number" min={0.25} max={4} step={0.25} onChange={(event) => save({ ...state, log: state.log.map((item) => item.id === line.id ? { ...item, servings: Number(event.target.value) } : item) })} />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => save({ ...state, log: state.log.filter((item) => item.id !== line.id) })}>{t("Remove")}</button>
            </div>
          );
        })}
        <FoodNumbers kcal={totals.kcal} protein={totals.protein} fiber={totals.fiber} sat={totals.sat} sodium={totals.sodium} />
        {targets.ok ? (
          <p>
            {t("Chosen protein target: {grams} g. Calorie estimate: {kcal} kcal. These meals and servings do not have to match each other.", {
              grams: n(targets.proteinGrams),
              kcal: targets.calorieTarget ?? t("not set"),
            })}
          </p>
        ) : (
          <p>{targets.reason}</p>
        )}
        <p className="hint">{t("Sources in this log: {sources}.", { sources: [...new Set(state.log.map((line) => usdaById(line.foodId)?.fdcId).filter(Boolean))].join(", ") || t("none yet") })}</p>
      </section>
    </div>
  );

  function TargetCard() {
    if (!targets.ok) return <p className="banner" role="status">{targets.reason}</p>;
    return (
      <section className="card stack">
        <h2>{t("How the range is calculated")}</h2>
        <p>
          {t(targets.body.sex === "male" ? "Resting estimate (male form)" : "Resting estimate (female form)")} = 10×{n(targets.body.weightKg)} {t("kg")} + {plain(6.25)}×{n(targets.body.heightCm)} {t("cm")} − 5×{targets.body.age} {targets.body.sex === "male" ? "+ 5" : "− 161"} = {n(targets.resting)} {t("kcal")}.
        </p>
        <p>
          {t("Day estimate = {resting} × {factor} ({activity}) = {day} kcal. The multiplier is a common estimate, not a measurement.", {
            resting: n(targets.resting),
            factor: plain(targets.activityFactor),
            activity: targets.activityLabel,
            day: n(targets.dayKcal),
          })}
        </p>
        <p>{targets.calorieNote} {targets.calorieTarget === null ? "" : t("Shown calorie figure: {kcal} kcal.", { kcal: targets.calorieTarget })}</p>
        <p>{t("General adult RDA = {rate} × {weight} kg = {grams} g protein per day.", { rate: plain(RDA_G_PER_KG), weight: n(targets.body.weightKg), grams: n(targets.rdaGrams) })}</p>
        <p>
          {t("A reference range for some suitable adults is {low}–{high} g/kg/day, which is {lowGrams}–{highGrams} g for this weight. It is not a prescription for everyone.", {
            low: plain(REFERENCE_LOW_G_PER_KG),
            high: plain(REFERENCE_HIGH_G_PER_KG),
            lowGrams: n(targets.referenceLow),
            highGrams: n(targets.referenceHigh),
          })}{" "}
          <a href={FOOD_LINKS.harvardProtein.url}>{t("Harvard protein")}</a>, <a href={FOOD_LINKS.proteinReview.url}>{t("review")}</a>, <a href={FOOD_LINKS.pubmedProtein.url}>PubMed 39002131</a>.
        </p>
        <p>{targets.proteinNote}</p>
        <label className="field">
          <span>{t("Adjust the protein target ({rate} g per kg)", { rate: plain(state.protein.gramsPerKg ?? RDA_G_PER_KG) })}</span>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.1}
            value={state.protein.gramsPerKg ?? 0.8}
            onChange={(event) => setProtein({ ...state.protein, gramsPerKg: clampProteinRate(Number(event.target.value)) })}
          />
        </label>
        <p>{t("Chosen target: {rate} g/kg × {weight} kg = {grams} g per day.", { rate: n(targets.chosenPerKg), weight: n(targets.body.weightKg), grams: n(targets.proteinGrams) })}</p>
      </section>
    );
  }
}

export function ProteinWhy() {
  const { t } = useFoodFormat();
  return (
    <article className="stack-lg">
      <p className="kicker">{t("WHY YOUR BODY NEEDS PROTEIN EVERY DAY")}</p>
      <h1>{t("Why your body needs protein every day")}</h1>
      <p>{t("Protein foods supply amino acids used to maintain body tissues. Public guidance treats protein as a daily part of eating, alongside vegetables, fruit, fiber, whole grains, and fats. LifeZoi does not diagnose a protein deficiency and does not say a supplement is required.")}</p>
      <p>{t("The general adult RDA is 0.8 g per kg of body weight per day. Some papers discuss 1.2–1.6 g/kg/day for suitable adults. That higher range is a reference, not a target for every person, and it is not used for pregnancy, kidney disease, or liver disease here.")}</p>
      <p><a href={FOOD_LINKS.harvardProtein.url}>{FOOD_LINKS.harvardProtein.name}</a></p>
      <p><Link href="/food-plan/protein">{t("Back to the estimates")}</Link></p>
    </article>
  );
}

export function ProteinMuscle() {
  const { t } = useFoodFormat();
  return (
    <article className="stack-lg">
      <p className="kicker">{t("WEIGHT LOSS WITHOUT IGNORING YOUR MUSCLES")}</p>
      <h1>{t("Weight loss without ignoring your muscles")}</h1>
      <p>{t("If weight loss is your goal, a moderate calorie reduction is the estimate LifeZoi will show, and only when it stays at or above 1,500 kcal. Very-low-calorie diets are not offered. Protein can support muscle while someone eats less, and resistance exercise is the activity that trains muscle. Protein by itself does not cause weight loss or build muscle. Sleep, consistency, vegetables, and fiber matter too.")}</p>
      <p>{t("No result is guaranteed. A clinician or registered dietitian should guide pregnancy, kidney disease, liver disease, and complex medical diets. LifeZoi will not raise protein for those situations.")}</p>
      <p><Link href="/food-plan/protein">{t("Back to the estimates")}</Link></p>
    </article>
  );
}
