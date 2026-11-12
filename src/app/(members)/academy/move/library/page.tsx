import type { Metadata } from "next";
import { WellnessLibraryView } from "@/components/companion/library-view";

export const metadata: Metadata = {
  title: "Wellness Library",
  description: "Pilates, yoga, aerobics, chair exercise, tai chi, and more, matched to your level and time, played inside LifeZoi.",
};

export default function WellnessLibraryPage() {
  return <WellnessLibraryView />;
}
