import type { Metadata } from "next";
import { MusicView } from "@/components/companion/music-view";

export const metadata: Metadata = {
  title: "Relaxing music",
  description: "Relaxation, meditation, sleep, classical, nature, focus, positive mood, and breathing sounds, played inside LifeZoi.",
};

export default function MusicPage() {
  return <MusicView />;
}
