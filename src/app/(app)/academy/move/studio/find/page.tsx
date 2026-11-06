import type { Metadata } from "next";
import { FindMyMovement } from "@/components/wellness/movement-studio-views";

export const metadata: Metadata = {
  title: "Find My Movement",
  description: "Filter movement lessons by minutes, position, goal, and level.",
};

export default function FindMyMovementPage() {
  return <FindMyMovement />;
}
