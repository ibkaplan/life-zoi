import type { Metadata } from "next";
import { FoodLibrary } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Food comparison",
  description: "A small USDA SR Legacy subset, shown per 100 grams.",
};

export default function FoodComparePage() {
  return <FoodLibrary />;
}
