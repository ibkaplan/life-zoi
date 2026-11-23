import type { Metadata } from "next";
import { MindShell } from "@/components/mind/shared";
import { MindUnderstand } from "@/components/mind/mind-understand";

export const metadata: Metadata = {
  title: "Understand yourself",
  description: "Optional, private psychological self-assessment in LifeZoi Mind: GAD-7, PHQ-9, and educational self-reflections. Not a diagnosis.",
};

export default function UnderstandPage() {
  return (
    <MindShell translated title="Understand yourself" intro="Psychological self-assessment, at your own pace. Choose a questionnaire, answer privately, and see what the result can and cannot tell you.">
      <MindUnderstand />
    </MindShell>
  );
}
