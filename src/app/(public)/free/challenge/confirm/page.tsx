import type { Metadata } from "next";
import { Suspense } from "react";
import { TokenAction } from "@/components/email-challenge/token-action";

export const metadata: Metadata = { title: "Confirm the 7-day challenge" };

export default function ConfirmChallengePage() {
  return (
    <Suspense fallback={null}>
      <TokenAction kind="confirm" />
    </Suspense>
  );
}
