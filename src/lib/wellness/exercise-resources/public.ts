import { categories } from "@/lib/wellness/exercise-resources/categories";
import {
  ASK_A_PROFESSIONAL,
  BRAND_LINE,
  FALL_RISK,
  FREE_EXERCISE_MESSAGE,
  FREE_EXERCISE_TITLE,
  NOT_TREATMENT,
} from "@/lib/wellness/exercise-resources/copy";
import { exerciseApps } from "@/lib/wellness/exercise-resources/apps";
import { guides } from "@/lib/wellness/exercise-resources/guides";
import { externalLinks } from "@/lib/wellness/exercise-resources/links";
import { routines } from "@/lib/wellness/exercise-resources/routines";
import { videos } from "@/lib/wellness/exercise-resources/videos";

export function publicExerciseText(): string {
  return JSON.stringify({
    FREE_EXERCISE_TITLE,
    FREE_EXERCISE_MESSAGE,
    BRAND_LINE,
    ASK_A_PROFESSIONAL,
    NOT_TREATMENT,
    FALL_RISK,
    categories,
    routines,
    guides,
    videos,
    exerciseApps,
    externalLinks,
  });
}
