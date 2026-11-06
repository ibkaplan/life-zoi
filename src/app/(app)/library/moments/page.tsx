import type { Metadata } from "next";
import { MomentsIndex } from "@/components/library/moments-view";

export const metadata: Metadata = {
  title: "Having a hard moment?",
  description: "Short nonjudgmental guides for cravings, motivation, stress, and sleep.",
};

export default function MomentsPage() {
  return <MomentsIndex />;
}
