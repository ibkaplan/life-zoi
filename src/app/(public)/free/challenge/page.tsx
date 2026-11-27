import type { Metadata } from "next";
import { ChallengeView } from "@/components/email-challenge/challenge-view";

export const metadata: Metadata = {
  title: "7-day challenge",
  description: "One short everyday task a day for seven days, on the page or by email, with consent and a one-click stop.",
};

export default function ChallengePage() {
  return <ChallengeView />;
}
