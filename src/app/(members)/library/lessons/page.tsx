import type { Metadata } from "next";
import { LessonsIndex } from "@/components/library/lessons-view";

export const metadata: Metadata = {
  title: "Daily lessons",
  description: "Short health lessons with one action, one reflection, and an optional mission.",
};

export default function LessonsPage() {
  return <LessonsIndex />;
}
