import type { Metadata } from "next";
import { HealthDiaryView } from "@/components/health-diary/diary-view";

export const metadata: Metadata = {
  title: "Blood pressure, sugar & cholesterol diary",
  description: "Record blood pressure, blood sugar, and cholesterol readings you measured, see trends, and print a summary for your doctor.",
};

export default function HealthDiaryPage() {
  return <HealthDiaryView />;
}
