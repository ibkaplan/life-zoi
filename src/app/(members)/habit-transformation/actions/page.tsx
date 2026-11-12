import type { Metadata } from "next";
import { ActionsView } from "@/components/habit-transformation/practice-views";

export const metadata: Metadata = {
  title: "My Tiny Daily Actions",
  description: "Accept, change, ease, skip, or complete one small action tied to a routine you already have.",
};

export default function ActionsPage() {
  return <ActionsView />;
}
