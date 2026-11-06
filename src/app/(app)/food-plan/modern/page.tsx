import type { Metadata } from "next";
import { ModernNutrition } from "@/components/food-plan/learn";

export const metadata: Metadata = {
  title: "Modern Nutrition",
  description: "The balanced plate LifeZoi follows, with links to Harvard, MyPlate, NIH, CDC, FDA, and the NHS.",
};

export default function ModernPage() {
  return <ModernNutrition />;
}
