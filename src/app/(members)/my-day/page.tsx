import type { Metadata } from "next";
import { CompanionDayView } from "@/components/companion/day-view";

export const metadata: Metadata = {
  title: "My Day at LifeZoi",
  description: "A gentle plan for today: morning routine, meals, activity, brain, music, reading, relaxation, and sleep preparation. Educational only. Not a diagnosis.",
};

export default function MyDayPage() {
  return <CompanionDayView />;
}
