import type { Metadata } from "next";
import { DailyMovementView } from "@/components/companion/daily-movement";

export const metadata: Metadata = {
  title: "Daily Movement",
  description: "Free standing aerobics, stretching, balance, and light strength classes from YouTube instructors, with a morning and evening plan.",
};

export default function DailyMovementPage() {
  return <DailyMovementView />;
}
