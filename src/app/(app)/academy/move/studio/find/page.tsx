import type { Metadata } from "next";
import { FindMyMovement } from "@/components/wellness/find-my-movement";

export const metadata: Metadata = {
  title: "Find My Movement",
  description: "Exercise videos you can filter by minutes, position, goal, and level, and play on LifeZoi.",
};

export default function FindMyMovementPage() {
  return <FindMyMovement />;
}
