import type { Metadata } from "next";
import { FavoritesView } from "@/components/food-plan/plan-ui";

export const metadata: Metadata = { title: "My Favorite Recipes", description: "Recipes you save from the food plan." };

export default function FavoritesPage() {
  return <FavoritesView />;
}
