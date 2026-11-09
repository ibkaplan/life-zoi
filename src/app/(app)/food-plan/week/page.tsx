import type { Metadata } from "next";
import { WeekView } from "@/components/food-plan/plan-ui";

export const metadata: Metadata = {
  title: "My Weekly Meal Plan",
  description: "Seven days of simple meals with protein, vegetables, and optional snacks.",
};

export default function WeekPage() {
  return <WeekView />;
}
