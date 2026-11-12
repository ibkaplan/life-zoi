import type { Metadata } from "next";
import { EmotionalWellnessView } from "@/components/emotional-wellness/emotional-wellness-view";
import { PAGE_DESCRIPTION, PAGE_TITLE } from "@/lib/emotional-wellness/copy";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
};

export default function EmotionalWellnessPage() {
  return <EmotionalWellnessView />;
}
