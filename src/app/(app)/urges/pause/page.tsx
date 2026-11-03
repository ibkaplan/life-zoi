import type { Metadata } from "next";
import { PauseView } from "@/components/wellness/urge-tools";

export const metadata: Metadata = {
  title: "Pause, breathe, choose",
  description: "Name a craving, pause only when it is safe, and choose a next step.",
};

export default function PausePage() {
  return <PauseView />;
}
