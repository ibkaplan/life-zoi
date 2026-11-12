import type { Metadata } from "next";
import { ResourceHub } from "@/components/wellness/free-exercise-views";
import { FREE_EXERCISE_MESSAGE } from "@/lib/wellness/exercise-resources/copy";

export const metadata: Metadata = {
  title: "Free exercise resources",
  description: FREE_EXERCISE_MESSAGE,
};

export default function FreeExercisePage() {
  return <ResourceHub />;
}
