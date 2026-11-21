import type { Metadata } from "next";
import { BaselineView } from "@/components/journey/baseline-view";

export const metadata: Metadata = {
  title: "My health profile",
  description: "Your starting health profile from your own answers, in plain words, with a personal plan. Not a diagnosis.",
};

export default function BaselinePage() {
  return <BaselineView />;
}
