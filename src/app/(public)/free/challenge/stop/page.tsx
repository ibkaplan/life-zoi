import type { Metadata } from "next";
import { Suspense } from "react";
import { TokenAction } from "@/components/email-challenge/token-action";

export const metadata: Metadata = { title: "Stop the challenge emails" };

export default function StopChallengePage() {
  return (
    <Suspense fallback={null}>
      <TokenAction kind="stop" />
    </Suspense>
  );
}
