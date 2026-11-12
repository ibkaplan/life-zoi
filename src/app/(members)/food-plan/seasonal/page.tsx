import type { Metadata } from "next";
import { SeasonalIndex } from "@/components/food-plan/library";

export const metadata: Metadata = {
  title: "Seasonal Nutrition",
  description: "New England seasonal foods with preparation, storage, and a simple recipe. Availability varies.",
};

export default function SeasonalPage() {
  return <SeasonalIndex />;
}
