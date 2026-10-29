import { SAMPLE_LABEL } from "@/lib/copy";

export const samplePreview = {
  label: SAMPLE_LABEL,
  title: "Example lifestyle snapshot",
  notice: "Sample data. This invented example is not your information and it is not saved as your record.",
  lines: [
    "Example person, not you.",
    "Reported sleep: about 6 to 7 hours, often restless.",
    "Reported movement: activity on 1 to 2 days a week.",
    "Reported focus: sleep and movement.",
  ],
  month: {
    label: "Example month",
    done: 3,
    partial: 1,
    skipped: 1,
    note: "These counts are sample data for layout preview. They will not appear in your progress unless you enter them yourself.",
  },
};

export function isSamplePayload(value: unknown): boolean {
  return Boolean(value) && typeof value === "object" && value !== null && "sample" in value;
}
