import type { Metadata } from "next";
import { MealIndex } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Meal education",
  description: "Meal lessons about everyday foods. No universal calorie target.",
};

export default function MealsPage() {
  return <MealIndex />;
}
