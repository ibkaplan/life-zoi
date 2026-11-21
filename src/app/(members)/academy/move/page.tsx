import type { Metadata } from "next";
import { MoveIndex } from "@/components/wellness/academy-views";
import { MovementStudioHome } from "@/components/wellness/movement-studio-views";
import { MovementBreakTeaser } from "@/components/movement-breaks/views";

export const metadata: Metadata = {
  title: "Movement Studio",
  description: "Movement lessons, written scripts, a daily mission, and progress saved in this browser tab.",
};

export default function MovePage() {
  return (
    <>
      <MovementStudioHome />
      <MovementBreakTeaser />
      <MoveIndex />
    </>
  );
}
