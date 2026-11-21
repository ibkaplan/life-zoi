import type { Metadata } from "next";
import { CoachingView } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Coaching from your answers",
  description: "Qualitative coaching from the latest assessment. Not a diagnosis.",
};

export default function CoachingPage() {
  return <CoachingView />;
}
