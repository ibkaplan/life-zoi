import type { Metadata } from "next";
import { SuggestView } from "@/components/feedback/suggest-view";

export const metadata: Metadata = {
  title: "Suggestions",
  description: "Suggest features, content, and improvements, and follow the status of your suggestions.",
};

export default function SuggestPage() {
  return <SuggestView />;
}
