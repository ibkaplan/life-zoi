import type { Metadata } from "next";
import { MovementProgress } from "@/components/wellness/movement-studio-views";

export const metadata: Metadata = {
  title: "My Movement Progress",
  description: "Lessons, video minutes, this week, categories, and missions saved in this browser tab.",
};

export default function MovementProgressPage() {
  return <MovementProgress />;
}
