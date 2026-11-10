import type { Metadata } from "next";
import { MovementBreaksPage } from "@/components/movement-breaks/views";

export const metadata: Metadata = {
  title: "Water, movement, and your circulation",
  description:
    "Why short movement breaks matter, how the calf muscle pump and lymphatic system work, and a guided 2 to 3 minute break with seated options. Educational only. Not a diagnosis.",
};

export default function MovementBreaksRoute() {
  return <MovementBreaksPage />;
}
