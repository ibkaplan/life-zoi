import type { Metadata } from "next";
import { AiAssistantView } from "@/components/ai-assistant-view";

export const metadata: Metadata = {
  title: "AI Health Assistant",
  description:
    "An educational chat for wellness questions. It stays in development mode until a server AI provider is configured.",
};

export default function AiAssistantPage() {
  return <AiAssistantView />;
}
