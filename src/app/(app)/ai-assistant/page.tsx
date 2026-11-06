import type { Metadata } from "next";
import { WellnessAssistantView } from "@/components/wellness-assistant-view";

export const metadata: Metadata = {
  title: "LIFEZOI WELLNESS ASSISTANT",
  description:
    "A prepared wellness information assistant. Choose a question, read the answer, or listen in the browser. It is not a live chatbot or medical care.",
};

export default function AiAssistantPage() {
  return <WellnessAssistantView />;
}
