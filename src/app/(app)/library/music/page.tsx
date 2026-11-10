import type { Metadata } from "next";
import { MusicView } from "@/components/companion/music-view";

export const metadata: Metadata = {
  title: "Music library",
  description: "Classical music, meditation, yoga, nature sounds, happy morning, and sleep music, played inside LifeZoi.",
};

export default function MusicPage() {
  return <MusicView />;
}
