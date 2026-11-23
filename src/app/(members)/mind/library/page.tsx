import type { Metadata } from "next";
import { MindShell } from "@/components/mind/shared";
import { MindLibrary } from "@/components/mind/mind-library";

export const metadata: Metadata = {
  title: "Psychology Encyclopedia",
  description: "The LifeZoi Psychology Encyclopedia: plain-language articles about emotions, anxiety, depression, relationships, sleep, aging, and more, with sources and evidence labels.",
};

export default function LibraryPage() {
  return (
    <MindShell translated title="Psychology Encyclopedia" intro="Understand the mind in plain language, with links to the original sources.">
      <MindLibrary />
    </MindShell>
  );
}
