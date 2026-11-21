import type { Metadata } from "next";
import { BalanceChallengeView } from "@/components/practice-views";

export const metadata: Metadata = {
  title: "Balance and Brain Challenge",
  description: "Optional balance and attention practice with a safety stop.",
};

export default function BalanceChallengePage() {
  return <BalanceChallengeView />;
}
