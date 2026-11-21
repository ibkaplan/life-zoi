import type { Metadata } from "next";
import { MovementLibrary } from "@/components/library/movement-view";

export const metadata: Metadata = {
  title: "Movement library",
  description: "Chair yoga, walking, balance, and other text-guided movement with seated options.",
};

export default function MovementLibraryPage() {
  return <MovementLibrary />;
}
