import type { Metadata } from "next";
import { LifeZoiAiView } from "@/components/encyclopedia/ai-view";

export const metadata: Metadata = {
  title: "LifeZoi AI",
  description: "Ask health education questions and get answers with matching LifeZoi Health Encyclopedia articles.",
};

export default function LifeZoiAiPage() {
  return <LifeZoiAiView />;
}
