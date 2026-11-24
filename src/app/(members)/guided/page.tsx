import type { Metadata } from "next";
import { Suspense } from "react";
import { GuidedPage } from "@/components/guided/guided-page";

export const metadata: Metadata = {
  title: "Guided sessions",
  description: "Voice-guided Pilates, yoga, stretching, breathing, relaxation, and meditation. General wellness guidance, not medical advice.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuidedPage />
    </Suspense>
  );
}
