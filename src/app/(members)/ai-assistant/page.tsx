import type { Metadata } from "next";
import { WellnessAssistantView } from "@/components/wellness-assistant-view";

export const metadata: Metadata = {
  title: "LIFEZOI WELLNESS ASSISTANT",
  description:
    "Prepared wellness questions and answers you can read or listen to. It is not medical care.",
};

export default function AiAssistantPage() {
  return <WellnessAssistantView />;
}
