import type { ResourceTier } from "@/lib/wellness/exercise-resources/copy";
import type { ExternalLinkId } from "@/lib/wellness/exercise-resources/links";

export type ExerciseApp = {
  id: string;
  linkId: ExternalLinkId;
  summary: string;
  tier: ResourceTier;
};

export const exerciseApps: ExerciseApp[] = [
  {
    id: "chair-yoga-fit",
    linkId: "chair-yoga-fit",
    summary:
      "Chair Yoga Fit is an optional outside app for seated movement. A free download is not the same as fully free functionality. Check the app for optional paid features. lifeZoi does not depend on the app, and the guides on this site work without it.",
    tier: "free",
  },
];
