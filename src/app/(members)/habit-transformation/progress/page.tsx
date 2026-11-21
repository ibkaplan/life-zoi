import type { Metadata } from "next";
import { ProgressView } from "@/components/habit-transformation/reflect-views";

export const metadata: Metadata = {
  title: "My Progress",
  description: "Saved habits, completed actions, weekly notes, and charts from your own check-ins.",
};

export default function ProgressPage() {
  return <ProgressView />;
}
