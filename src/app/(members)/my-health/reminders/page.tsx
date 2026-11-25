import type { Metadata } from "next";
import { ReminderSettingsView } from "@/components/reminders/reminder-settings";

export const metadata: Metadata = {
  title: "My reminders",
  description: "Choose times to be reminded to measure blood pressure, check blood sugar, and keep daily habits. Saved in this browser; nothing is sent to a server.",
};

export default function RemindersPage() {
  return <ReminderSettingsView />;
}
