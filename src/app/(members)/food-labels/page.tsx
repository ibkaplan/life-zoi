import type { Metadata } from "next";
import { FoodIntelligenceView } from "@/components/practice-views";

export const metadata: Metadata = {
  title: "Food Intelligence",
  description: "Practice reading fictional Nutrition Facts labels.",
};

export default function FoodLabelsPage() {
  return <FoodIntelligenceView />;
}
