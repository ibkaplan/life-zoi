import type { Metadata } from "next";
import { MindShell } from "@/components/mind/shared";
import { MindPrivacy } from "@/components/mind/mind-privacy";

export const metadata: Metadata = {
  title: "Privacy & safety",
  description: "How LifeZoi Mind handles your words and voice, what it can and cannot do, and where to get crisis help.",
};

export default function PrivacyPage() {
  return (
    <MindShell title="Privacy & safety" intro="Plain answers about where your information goes and the limits of LifeZoi Mind.">
      <MindPrivacy />
    </MindShell>
  );
}
