"use client";

import Link from "next/link";
import { useFoodFormat } from "@/components/food-plan/frame";
import { DOSHA_NOTICE, AYURVEDA_LIMIT, FOOD_LINKS, PROFESSIONAL_FOOD } from "@/lib/food-plan/sources";
import { SPICES, spiceById } from "@/lib/food-plan/spices";

export function ModernNutrition() {
  const { t } = useFoodFormat();
  return (
    <article className="stack-lg">
      <p className="kicker">{t("Modern Nutrition")}</p>
      <h1>{t("A balanced plate comes first")}</h1>
      <p>{t(PROFESSIONAL_FOOD)}</p>
      <section className="card stack">
        <p>{t("The Harvard Healthy Eating Plate and USDA MyPlate both describe a pattern: vegetables and fruit in a large share, whole grains, protein foods, and a modest amount of oil. Water is the everyday drink. LifeZoi uses that pattern for every goal, including a goal to lose, maintain, or gain weight. It does not turn the plate into a calorie-cut plan or a fat-burn plan.")}</p>
        <p>{t("When a traditional idea would drop a food group, LifeZoi keeps the modern plate.")}</p>
        <ul>
          <li><a href={FOOD_LINKS.harvardPlate.url}>{FOOD_LINKS.harvardPlate.name}</a></li>
          <li><a href={FOOD_LINKS.myplate.url}>{FOOD_LINKS.myplate.name}</a></li>
          <li><a href={FOOD_LINKS.nih.url}>{FOOD_LINKS.nih.name}</a></li>
          <li><a href={FOOD_LINKS.cdc.url}>{FOOD_LINKS.cdc.name}</a></li>
          <li><a href={FOOD_LINKS.fda.url}>{FOOD_LINKS.fda.name}</a></li>
          <li><a href={FOOD_LINKS.nhs.url}>{FOOD_LINKS.nhs.name}</a></li>
        </ul>
      </section>
    </article>
  );
}

export function AyurvedaPage() {
  const { t } = useFoodFormat();
  return (
    <article className="stack-lg">
      <p className="kicker">{t("Ayurvedic Inspiration")}</p>
      <h1>{t("Traditional ideas, held lightly")}</h1>
      <p>{t(AYURVEDA_LIMIT)}</p>
      <p>{t(DOSHA_NOTICE)}</p>
      <section className="card stack">
        <p>{t("Vata, Pitta, and Kapha, and the mixes Vata-Pitta, Pitta-Kapha, Vata-Kapha, and Tridosha, are labels you may choose for flavor inspiration. You can also choose Not sure or Skip. LifeZoi never assigns one from your weight or a medical condition.")}</p>
        <p>{t("An optional note on a meal may suggest a spice or serving the food warm. It does not remove grains, beans, vegetables, or other parts of the modern plate, and it is hidden if the spice is on your avoid list.")}</p>
        <p><a href={FOOD_LINKS.nccih.url}>{FOOD_LINKS.nccih.name}</a></p>
      </section>
    </article>
  );
}

export function SciencePage() {
  const { t } = useFoodFormat();
  return (
    <article className="stack-lg">
      <p className="kicker">{t("Science")}</p>
      <h1>{t("Where the guidance comes from")}</h1>
      <section className="card stack">
        <h2>{t("Modern nutrition")}</h2>
        <p>{t("Plate patterns are taken from public pages by Harvard, MyPlate, NIH, CDC, FDA, and the NHS. LifeZoi does not calculate a personal disease risk from them.")}</p>
        <h2>{t("Protein and calories")}</h2>
        <p>{t("The general adult RDA used here is 0.8 g of protein per kg of body weight per day. A range of 1.2–1.6 g/kg/day is shown only as a reference for suitable adults, not as a prescription. The resting calorie estimate uses the Mifflin–St Jeor equation when age, height, weight, the equation’s female or male form, and an activity level are present. Activity multipliers are common estimates, not a measurement of your day. Food numbers are scaled from USDA FoodData Central per-100-gram values and are labeled as estimates.")}</p>
        <ul>
          <li><a href={FOOD_LINKS.harvardProtein.url}>{FOOD_LINKS.harvardProtein.name}</a></li>
          <li><a href={FOOD_LINKS.proteinReview.url}>{t(FOOD_LINKS.proteinReview.name)}</a></li>
          <li><a href={FOOD_LINKS.pubmedProtein.url}>{t(FOOD_LINKS.pubmedProtein.name)}</a></li>
          <li><a href={FOOD_LINKS.fdc.url}>{FOOD_LINKS.fdc.name}</a></li>
        </ul>
        <h2>{t("Ayurveda")}</h2>
        <p>{t(DOSHA_NOTICE)} <a href={FOOD_LINKS.nccih.url}>{FOOD_LINKS.nccih.name}</a></p>
        <h2>{t("New England seasons")}</h2>
        <p>{t("Season cards are examples, not a harvest guarantee.")}</p>
        <ul>
          <li><a href={FOOD_LINKS.unhHarvest.url}>{FOOD_LINKS.unhHarvest.name}</a></li>
          <li><a href={FOOD_LINKS.massGrown.url}>{FOOD_LINKS.massGrown.name}</a></li>
        </ul>
      </section>
      <p><Link href="/food-plan/protein">{t("Open the protein and calorie estimates")}</Link></p>
    </article>
  );
}

export function SpiceIndex() {
  const { t } = useFoodFormat();
  return (
    <div className="stack-lg">
      <p className="kicker">{t("Spice guide")}</p>
      <h1>{t("Spices for the kitchen")}</h1>
      <p>{t("Culinary use only. No disease claims, and no supplements.")}</p>
      <div className="grid-2">
        {SPICES.map((spice) => (
          <Link key={spice.id} className="card food-card" href={`/food-plan/spices/${spice.id}`}>
            <h2>{t(spice.name)}</h2>
            <p>{t(spice.flavor)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SpiceDetail({ slug }: { slug: string }) {
  const { t } = useFoodFormat();
  const spice = spiceById(slug);
  if (!spice) return null;
  return (
    <article className="stack-lg">
      <p><Link href="/food-plan/spices">{t("Spice guide")}</Link></p>
      <h1>{t(spice.name)}</h1>
      <section className="card food-card stack">
        <h2>{t("Flavor")}</h2>
        <p>{t(spice.flavor)}</p>
        <h2>{t("Culinary use")}</h2>
        <ul>{spice.culinary.map((line) => <li key={line}>{t(line)}</li>)}</ul>
        <h2>{t("Combinations")}</h2>
        <p>{t(spice.combinations)}</p>
        <h2>{t("Traditional association")}</h2>
        <p>{t(spice.traditional)}</p>
        <h2>{t("Cooking spice or supplement")}</h2>
        <p>{t(spice.caution)}</p>
      </section>
    </article>
  );
}
