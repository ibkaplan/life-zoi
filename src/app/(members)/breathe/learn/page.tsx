import type { Metadata } from "next";
import { BreatheLearn } from "@/components/breathe/views";

export const metadata: Metadata = {
  title: "What is nitric oxide? · Breathe for Life",
  description: "How nitric oxide works, its two pathways, and how it changes with age, with sources and evidence labels.",
};

export default function Page() {
  return <BreatheLearn />;
}
