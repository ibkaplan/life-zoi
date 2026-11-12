import type { Metadata } from "next";
import { BreathePractice } from "@/components/breathe/views";

export const metadata: Metadata = {
  title: "Breathing session · Breathe for Life",
  description: "A guided 5 to 10 minute breathing session with nasal breathing, Bhramari humming, and gentle belly breathing. No breath holding.",
};

export default function Page() {
  return <BreathePractice />;
}
