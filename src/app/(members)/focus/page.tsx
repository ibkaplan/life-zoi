import type { Metadata } from "next";
import { FocusView } from "@/components/focus/focus-view";

export const metadata: Metadata = {
  title: "Focus & Brain Training",
  description:
    "A Pomodoro focus timer with gentle break activities for hands, eyes, breathing, and memory, optional music, and a calm daily record.",
};

export default function FocusPage() {
  return <FocusView />;
}
