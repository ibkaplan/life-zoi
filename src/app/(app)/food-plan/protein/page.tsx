import type { Metadata } from "next";
import { ProteinPage } from "@/components/food-plan/protein-ui";

export const metadata: Metadata = {
  title: "Daily protein and calorie balance",
  description: "Educational protein and calorie estimates from public equations and USDA FoodData Central.",
};

export default function ProteinRoute() {
  return <ProteinPage />;
}
