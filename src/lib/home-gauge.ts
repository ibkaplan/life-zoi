export const HOME_OUTLOOK_BEFORE =
  "Complete your assessment to explore your personal lifestyle profile.";

export const HOME_OUTLOOK_AFTER =
  "Your lifestyle profile is a reading of what you reported. These words are labels, not a result.";

export const HOME_OUTLOOK_LABELS = [
  "Positive habits",
  "Areas to improve",
  "Personal plan for a healthier future",
] as const;

export function homeOutlook(hasOwnAssessment: boolean) {
  return {
    detail: hasOwnAssessment ? HOME_OUTLOOK_AFTER : HOME_OUTLOOK_BEFORE,
    labels: HOME_OUTLOOK_LABELS,
  };
}
