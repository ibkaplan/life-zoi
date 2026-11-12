import type { Metadata } from "next";
import { TodayMealsView } from "@/components/companion/food-view";

export const metadata: Metadata = {
  title: "Today's meals",
  description: "Breakfast, lunch, dinner, and snacks for today, checked against your allergies, requirements, and the foods you avoid.",
};

export default function TodayMealsPage() {
  return <TodayMealsView />;
}
