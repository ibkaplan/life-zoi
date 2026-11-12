import type { Metadata } from "next";
import { CoachHome } from "@/components/wellness/coach-views";

export const metadata: Metadata = {
  title: "Everyday Wellness Coach",
  description: "Educational habit coaching for hydration, food, and everyday routines.",
};

export default function WellnessCoachPage() {
  return <CoachHome />;
}
