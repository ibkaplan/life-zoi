import type { Metadata } from "next";
import { VideoDirectory } from "@/components/wellness/free-exercise-views";

export const metadata: Metadata = {
  title: "Exercise videos",
  description: "Official National Institute on Aging, MedlinePlus, and CDC activity links, with a player only when the publisher allows one.",
};

export default function ExerciseVideosPage() {
  return <VideoDirectory />;
}
