import type { Metadata } from "next";
import { JourneyView } from "@/components/growth-academy/journey-view";

export const metadata: Metadata = {
  title: "My Growth Journey",
  description: "Your Training Academy record: course progress, completed lessons, achievements, learning history, and saved reflections.",
};

export default function GrowthJourneyPage() {
  return <JourneyView />;
}
