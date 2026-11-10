"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodMark, useFoodFormat } from "@/components/food-plan/frame";
import { msg } from "@/lib/i18n/translate";
import { HydrationNote } from "@/components/movement-breaks/views";
import { searchLibrary } from "@/lib/food-plan/plan";
import { FOOD_SUBTITLE, FOOD_TAGLINE, FOOD_TITLE, PROFESSIONAL_FOOD } from "@/lib/food-plan/sources";

const CARDS = [
  ["/food-plan/seasonal", msg("Seasonal Nutrition"), msg("New England examples, with preparation, storage, and a simple recipe.")],
  ["/food-plan/modern", msg("Modern Nutrition"), msg("The plate pattern LifeZoi follows when tradition disagrees.")],
  ["/food-plan/ayurveda", msg("Ayurvedic Inspiration"), msg("Traditional ideas only. Not a diagnosis.")],
  ["/food-plan/profile", msg("Discover My Food Profile"), msg("Optional questions. Weight loss is not assumed.")],
  ["/food-plan/week", msg("My Weekly Meal Plan"), msg("Seven days of simple meals you can swap.")],
  ["/food-plan/favorites", msg("My Favorite Recipes"), msg("Meals you save from the week or the library.")],
  ["/food-plan/shopping", msg("My Shopping List"), msg("Grouped, editable, and ready to print or copy.")],
  ["/food-plan/progress", msg("My Wellness Progress"), msg("A light note of what you cooked. No calorie diary.")],
  ["/food-plan/spices", msg("Spice guide"), msg("Kitchen use, flavor, and a supplement caution.")],
  ["/food-plan/science", msg("Science"), msg("Public sources for the plate, protein, and Ayurveda limits.")],
  ["/food-plan/protein", msg("Daily protein and calorie balance"), msg("Estimates you can read, adjust, or skip.")],
  ["/food-plan/simple", msg("Simple protein, simple meals"), msg("Short meals with traced USDA numbers.")],
] as const;

export function FoodHub() {
  const [query, setQuery] = useState("");
  const { t } = useFoodFormat();
  const hits = searchLibrary(query, t);
  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">LifeZoi</p>
        <h1>{t(FOOD_TITLE)}</h1>
        <p className="lede">{t(FOOD_SUBTITLE)}</p>
        <p className="food-tagline">{t(FOOD_TAGLINE)}</p>
        <p>{t(PROFESSIONAL_FOOD)}</p>
      </section>
      <HydrationNote />
      <section className="card food-card stack">
        <h2>{t("Recipe library assistant")}</h2>
        <p>
          {t("The Wellness Assistant at")} <Link href="/ai-assistant">/ai-assistant</Link>{" "}
          {t("answers prepared wellness questions. Meal ideas here come from the LifeZoi recipe library on this device. Your food profile is not sent to an outside service, and no second AI provider is used.")}
        </p>
        <label className="field">
          <span>{t("Search foods, recipes, and spices")}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" />
        </label>
        <ul className="stack">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <Link href={hit.href}>{t(hit.title)}</Link> <span className="hint">{t(hit.kind)}</span>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid-2">
        {CARDS.map(([href, title, text]) => (
          <Link key={href} className="card food-card learn-link" href={href}>
            <FoodMark label="" />
            <h2>{t(title)}</h2>
            <p>{t(text)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
