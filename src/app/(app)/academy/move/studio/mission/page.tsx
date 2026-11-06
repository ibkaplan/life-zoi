import type { Metadata } from "next";
import { DailyMission } from "@/components/wellness/movement-studio-views";

export const metadata: Metadata = {
  title: "Daily Movement Mission",
  description: "A seven-day movement mission you mark complete yourself.",
};

export default function DailyMissionPage() {
  return <DailyMission />;
}
