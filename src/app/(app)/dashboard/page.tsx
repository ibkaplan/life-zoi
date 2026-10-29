import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your lifeZoi home for the assessment, WHAT IF?, and this month’s check-ins.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
