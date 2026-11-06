import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomeView } from "@/components/welcome-view";
import { WELCOME_BODY, WELCOME_HEADING } from "@/lib/share-care";

export const metadata: Metadata = {
  title: "Welcome to LifeZoi",
  description: WELCOME_BODY,
};

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <article className="stack-lg">
          <h1>{WELCOME_HEADING}</h1>
          <p className="lede">{WELCOME_BODY}</p>
          <p role="status">Opening your welcome…</p>
        </article>
      }
    >
      <WelcomeView />
    </Suspense>
  );
}
