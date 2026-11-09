import type { Metadata } from "next";
import { FoodPreferencesView } from "@/components/companion/food-view";

export const metadata: Metadata = {
  title: "My food choices",
  description: "Foods you enjoy, foods you avoid, and a permanent list of foods never to include.",
};

export default function FoodPreferencesPage() {
  return <FoodPreferencesView />;
}
