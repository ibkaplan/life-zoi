import type { Metadata } from "next";
import { ProgressView } from "@/components/progress-view";

export const metadata: Metadata = {
  title: "Progress",
  description: "A weekly check-in, saved progress, habit notes, assessments, and WHAT IF? scenarios.",
};

export default function ProgressPage() {
  return <ProgressView />;
}
