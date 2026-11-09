import type { Metadata } from "next";
import { GamesView } from "@/components/companion/games-view";

export const metadata: Metadata = {
  title: "Brain games",
  description: "Sudoku, memory match, word puzzles, attention, and logic games for enjoyment and focus. Not a medical or cognitive test.",
};

export default function BrainGamesPage() {
  return <GamesView />;
}
