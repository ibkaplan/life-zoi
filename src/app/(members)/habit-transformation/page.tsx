import type { Metadata } from "next";
import { IntroView } from "@/components/habit-transformation/reflect-views";
import { TITLE } from "@/lib/habit-transformation/catalog";

export const metadata: Metadata = {
  title: "Habit Transformation",
  description: TITLE,
};

export default function HabitTransformationPage() {
  return <IntroView />;
}
