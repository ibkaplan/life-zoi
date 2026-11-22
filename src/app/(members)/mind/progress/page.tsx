import type { Metadata } from "next";
import { MindShell } from "@/components/mind/shared";
import { MindProgressView } from "@/components/mind/mind-progress";

export const metadata: Metadata = {
  title: "My progress",
  description: "Optional, private LifeZoi Mind progress: questionnaire totals over time, completed exercises, and your plan. Off unless you turn it on, and deletable.",
};

export default function ProgressPage() {
  return (
    <MindShell title="My progress" intro="Optional and private. Look back on what you have tried, if you choose to keep a record.">
      <MindProgressView />
    </MindShell>
  );
}
