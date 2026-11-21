import type { Metadata } from "next";
import { PracticeView } from "@/components/library/practice-view";

export const metadata: Metadata = {
  title: "Daily practice",
  description: "An optional mission, a habit picker, and a calendar that does not punish gaps.",
};

export default function PracticePage() {
  return <PracticeView />;
}
