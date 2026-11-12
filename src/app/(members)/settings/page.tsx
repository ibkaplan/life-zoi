import type { Metadata } from "next";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account sign-in, sample data, and how to clear lifeZoi answers.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
