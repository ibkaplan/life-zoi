import type { Metadata } from "next";
import { JourneyView } from "@/components/habit-transformation/journey-view";

export const metadata: Metadata = {
  title: "Start My Habit Journey",
  description: "Choose one or more habits and answer a short set of follow-up questions.",
};

export default function JourneyPage() {
  return <JourneyView />;
}
