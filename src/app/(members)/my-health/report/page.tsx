import type { Metadata } from "next";
import { WeeklyReportView } from "@/components/health-report/report-view";

export const metadata: Metadata = {
  title: "Weekly report for my doctor",
  description: "One printable page with your blood pressure, blood sugar, cholesterol, sleep, and mood for the week, to take to your doctor. Not a diagnosis.",
};

export default function WeeklyReportPage() {
  return <WeeklyReportView />;
}
