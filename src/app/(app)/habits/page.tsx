import type { Metadata } from "next";
import { HabitsHome } from "@/components/wellness/library-views";

export const metadata: Metadata = {
  title: "Shared challenges",
  description: "7-day and 30-day educational challenges stored in this browser tab.",
};

export default function HabitsPage() {
  return <HabitsHome />;
}
