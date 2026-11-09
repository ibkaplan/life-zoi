import type { Metadata } from "next";
import { WellnessAssistantView } from "@/components/wellness-assistant-view";

export const metadata: Metadata = {
  title: "LIFEZOI WELLNESS ASSISTANT",
  description:
    "Prepared wellness answers, with an optional free model for general questions in this session. It is not medical care.",
};

export default function AiAssistantPage() {
  return <WellnessAssistantView />;
}
