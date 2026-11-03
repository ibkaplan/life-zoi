import { populationFigure } from "@/lib/life-table";
import type { NormalizedAssessment } from "@/lib/types";

export const HOME_GAUGE_EMPTY =
  "No figure yet. This stays empty until a completed assessment includes an exact age copied from the official table and the female or male column. It is not a score, and it is not your number.";

export const HOME_GAUGE_SAMPLE =
  "Sample visitor data is not used here. The gauge stays empty.";

export const HOME_GAUGE_FIGURE_NOTE =
  "Population statistic. The published cell is for the Social Security area population. This is not your number and not a date.";

export function homeGauge(assessment: NormalizedAssessment | null, sample: boolean) {
  if (sample) {
    return { shown: false as const, figure: null, detail: HOME_GAUGE_SAMPLE };
  }
  const sex =
    assessment && (assessment.tableSex === "female" || assessment.tableSex === "male")
      ? assessment.tableSex
      : null;
  const age = assessment?.exactAge ?? null;
  if (age === null || sex === null) {
    return { shown: false as const, figure: null, detail: HOME_GAUGE_EMPTY };
  }
  const figure = populationFigure(age, sex);
  if (figure === null) {
    return {
      shown: false as const,
      figure: null,
      detail: `Age ${age} is not one of the copied rows, so no number is shown. lifeZoi does not fill the gap.`,
    };
  }
  return {
    shown: true as const,
    figure,
    detail: `${HOME_GAUGE_FIGURE_NOTE} Exact age ${age}, ${sex} column.`,
  };
}
