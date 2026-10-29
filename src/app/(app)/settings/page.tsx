import type { Metadata } from "next";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Development mode, sample data, and how to clear lifeZoi data in this browser.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
