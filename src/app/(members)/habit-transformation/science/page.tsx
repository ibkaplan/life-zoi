import type { Metadata } from "next";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { ScienceBody } from "@/components/habit-transformation/library-views";

export const metadata: Metadata = {
  title: "The Science Behind",
  description: "COM-B and the Fogg behavior model, explained as educational ideas. Not a diagnosis.",
};

export default function SciencePage() {
  return (
    <HabitFrame>
      <ScienceBody />
    </HabitFrame>
  );
}
