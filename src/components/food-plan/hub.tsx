"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodMark } from "@/components/food-plan/frame";
import { searchLibrary } from "@/lib/food-plan/plan";
import { FOOD_SUBTITLE, FOOD_TAGLINE, FOOD_TITLE, PROFESSIONAL_FOOD } from "@/lib/food-plan/sources";

const CARDS = [
  ["/food-plan/seasonal", "Seasonal Nutrition", "New England examples, with preparation, storage, and a simple recipe."],
  ["/food-plan/modern", "Modern Nutrition", "The plate pattern LifeZoi follows when tradition disagrees."],
  ["/food-plan/ayurveda", "Ayurvedic Inspiration", "Traditional ideas only. Not a diagnosis."],
  ["/food-plan/profile", "Discover My Food Profile", "Optional questions. Weight loss is not assumed."],
  ["/food-plan/week", "My Weekly Meal Plan", "Seven days of simple meals you can swap."],
  ["/food-plan/favorites", "My Favorite Recipes", "Meals you save from the week or the library."],
  ["/food-plan/shopping", "My Shopping List", "Grouped, editable, and ready to print or copy."],
  ["/food-plan/progress", "My Wellness Progress", "A light note of what you cooked. No calorie diary."],
  ["/food-plan/spices", "Spice guide", "Kitchen use, flavor, and a supplement caution."],
  ["/food-plan/science", "Science", "Public sources for the plate, protein, and Ayurveda limits."],
  ["/food-plan/protein", "Daily protein and calorie balance", "Estimates you can read, adjust, or skip."],
  ["/food-plan/simple", "Simple protein, simple meals", "Short meals with traced USDA numbers."],
] as const;

export function FoodHub() {
  const [query, setQuery] = useState("");
  const hits = searchLibrary(query);
  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">LifeZoi</p>
        <h1>{FOOD_TITLE}</h1>
        <p className="lede">{FOOD_SUBTITLE}</p>
        <p className="food-tagline">{FOOD_TAGLINE}</p>
        <p>{PROFESSIONAL_FOOD}</p>
      </section>
      <section className="card food-card stack">
        <h2>Recipe library assistant</h2>
        <p>
          The Wellness Assistant at <Link href="/ai-assistant">/ai-assistant</Link> answers prepared wellness questions. Meal ideas here come from the LifeZoi recipe library on this device. Your food profile is not sent to an outside service, and no second AI provider is used.
        </p>
        <label className="field">
          <span>Search foods, recipes, and spices</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" />
        </label>
        <ul className="stack">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.id}`}>
              <Link href={hit.href}>{hit.title}</Link> <span className="hint">{hit.kind}</span>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid-2">
        {CARDS.map(([href, title, text]) => (
          <Link key={href} className="card food-card learn-link" href={href}>
            <FoodMark label="" />
            <h2>{title}</h2>
            <p>{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
