import type { Metadata } from "next";
import { MealIndex } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Meal education",
  description: "Meal lessons, added-sugar education, homemade bread, and gut health. No universal calorie target.",
};

export default function MealsPage() {
  return <MealIndex />;
}
