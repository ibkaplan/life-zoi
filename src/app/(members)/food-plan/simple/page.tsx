import type { Metadata } from "next";
import { SimpleMeals } from "@/components/food-plan/simple-ui";

export const metadata: Metadata = {
  title: "Simple protein, simple meals",
  description: "You don't need complicated recipes to eat well. Simple meals with traced USDA numbers.",
};

export default function SimplePage() {
  return <SimpleMeals />;
}
