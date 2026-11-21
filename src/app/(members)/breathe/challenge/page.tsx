import type { Metadata } from "next";
import { BreatheChallengeView } from "@/components/breathe/challenge-view";

export const metadata: Metadata = {
  title: "30-day challenge · Breathe for Life",
  description: "A four-week Nitric Oxide and Breathing Challenge with weekly goals and self-reported check-ins. It does not measure nitric oxide.",
};

export default function Page() {
  return <BreatheChallengeView />;
}
