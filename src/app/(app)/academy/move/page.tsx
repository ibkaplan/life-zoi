import type { Metadata } from "next";
import { MoveIndex } from "@/components/wellness/academy-views";

export const metadata: Metadata = {
  title: "Movement library",
  description: "Original exercise sketches, seated options, and free exercise resources.",
};

export default function MovePage() {
  return <MoveIndex />;
}
