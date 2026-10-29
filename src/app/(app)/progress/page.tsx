import type { Metadata } from "next";
import { ProgressView } from "@/components/progress-view";

export const metadata: Metadata = {
  title: "Progress",
  description: "Monthly habit check-ins, assessments, and saved WHAT IF? scenarios.",
};

export default function ProgressPage() {
  return <ProgressView />;
}
