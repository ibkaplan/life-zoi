import type { Metadata } from "next";
import { MealIndex } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Nutrition",
  description: "A healthy plate, protein, sodium, fats, plants, and shopping, plus added sugar, homemade bread, gut health, and meal lessons. No personal targets.",
};

export default function MealsPage() {
  return <MealIndex />;
}
