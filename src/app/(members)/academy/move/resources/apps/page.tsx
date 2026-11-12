import type { Metadata } from "next";
import { AppDirectory } from "@/components/wellness/free-exercise-views";

export const metadata: Metadata = {
  title: "Free and low-cost exercise apps",
  description: "An optional app directory. A free download is not the same as fully free functionality.",
};

export default function ExerciseAppsPage() {
  return <AppDirectory />;
}
