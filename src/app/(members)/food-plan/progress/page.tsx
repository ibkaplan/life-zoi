import type { Metadata } from "next";
import { ProgressView } from "@/components/food-plan/plan-ui";

export const metadata: Metadata = { title: "My Wellness Progress", description: "A light cooking note without calorie tracking." };

export default function FoodProgressPage() {
  return <ProgressView />;
}
