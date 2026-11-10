import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomeView, WelcomeFallback } from "@/components/welcome-view";
import { WELCOME_BODY, WELCOME_HEADING } from "@/lib/share-care";

export const metadata: Metadata = {
  title: "Welcome to LifeZoi",
  description: WELCOME_BODY,
};

export default function WelcomePage() {
  return (
    <Suspense
      fallback={<WelcomeFallback heading={WELCOME_HEADING} body={WELCOME_BODY} />}
    >
      <WelcomeView />
    </Suspense>
  );
}
