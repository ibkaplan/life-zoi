import type { Metadata } from "next";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { LibraryIndex } from "@/components/habit-transformation/library-views";

export const metadata: Metadata = {
  title: "Habit library",
  description: "Nutrition, movement, sleep, stress, smoking, alcohol, hydration, aging, screens, and motivation.",
};

export default function LibraryPage() {
  return (
    <HabitFrame>
      <LibraryIndex />
    </HabitFrame>
  );
}
