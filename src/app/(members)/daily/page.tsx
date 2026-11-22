import type { Metadata } from "next";
import { LifeZoiDaily } from "@/components/daily/lifezoi-daily";

export const metadata: Metadata = {
  title: "LifeZoi Daily",
  description: "Your Wellness Journey: one idea for today from your assessment, one tip, an optional feeling check-in, your progress, and a weekly report. Nothing to fill in.",
};

export default function DailyPage() {
  return <LifeZoiDaily variant="page" />;
}
