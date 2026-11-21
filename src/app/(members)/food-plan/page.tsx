import type { Metadata } from "next";
import { FoodHub } from "@/components/food-plan/hub";
import { FOOD_SUBTITLE, FOOD_TITLE } from "@/lib/food-plan/sources";

export const metadata: Metadata = {
  title: FOOD_TITLE,
  description: FOOD_SUBTITLE,
};

export default function FoodPlanPage() {
  return <FoodHub />;
}
