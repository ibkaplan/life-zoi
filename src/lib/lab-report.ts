export type RangeMark = "below" | "within" | "above";

export type SyntheticResult = {
  id: string;
  name: string;
  loinc: string;
  value: number;
  unit: string;
  rangeLow: number;
  rangeHigh: number;
  measuredOn: string;
  measures: string;
  whyItMatters: string;
  questions: string[];
};

export type SyntheticReport = {
  id: string;
  title: string;
  person: string;
  laboratory: string;
  notice: string;
  results: SyntheticResult[];
};

export function markAgainstSuppliedRange(value: number, low: number, high: number): RangeMark {
  if (value < low) return "below";
  if (value > high) return "above";
  return "within";
}

export function rangeSentence(mark: RangeMark): string {
  if (mark === "below") return "Below the range printed on this example report.";
  if (mark === "above") return "Above the range printed on this example report.";
  return "Inside the range printed on this example report.";
}

export const SYNTHETIC_REPORT: SyntheticReport = {
  id: "sample-panel",
  title: "Example wellness panel",
  person: "Sample visitor",
  laboratory: "Example Community Laboratory",
  notice:
    "Invented demonstration data. This is not a real person, not a real laboratory, and not your record. The range belongs only to this example report. Another laboratory can print a different range. lifeZoi does not diagnose diabetes, heart disease, or any other condition from these numbers.",
  results: [
    {
      id: "a1c",
      name: "HbA1c",
      loinc: "4548-4",
      value: 6.1,
      unit: "% of hemoglobin",
      rangeLow: 4,
      rangeHigh: 5.6,
      measuredOn: "2026-03-02",
      measures: "An A1C test generally reflects average blood glucose over about three months.",
      whyItMatters:
        "NIDDK explains that clinicians use A1C together with other tests and a person's history. A diagnosis needs confirmation and clinical context. lifeZoi does not apply a diagnostic cutoff.",
      questions: [
        "Does this kind of result need a repeat test?",
        "Which glucose test would you use alongside it?",
        "What lifestyle questions are worth discussing, without changing prescribed treatment on your own?",
      ],
    },
    {
      id: "glucose",
      name: "Blood glucose",
      loinc: "2345-7",
      value: 96,
      unit: "mg/dL",
      rangeLow: 70,
      rangeHigh: 99,
      measuredOn: "2026-03-02",
      measures: "A glucose test measures sugar in the blood at the time of the draw.",
      whyItMatters:
        "Fasting and non-fasting tests are not the same. The code on this row is LOINC 2345-7, glucose in serum or plasma. lifeZoi does not decide whether a number is healthy for you.",
      questions: [
        "Was this example meant to be fasting or not?",
        "How do you read one glucose result next to an A1C?",
      ],
    },
    {
      id: "ldl",
      name: "LDL cholesterol",
      loinc: "2089-1",
      value: 128,
      unit: "mg/dL",
      rangeLow: 0,
      rangeHigh: 99,
      measuredOn: "2026-03-02",
      measures: "LDL is one form of cholesterol in the blood.",
      whyItMatters:
        "Some reports use a calculated LDL, LOINC 13457-7, instead of 2089-1. The method changes the code. A clinician reads the method, the rest of the lipid results, and your history together.",
      questions: [
        "Is this result direct or calculated?",
        "What follow-up, if any, would you suggest besides a lifestyle conversation?",
      ],
    },
    {
      id: "triglycerides",
      name: "Triglycerides",
      loinc: "2571-8",
      value: 140,
      unit: "mg/dL",
      rangeLow: 0,
      rangeHigh: 149,
      measuredOn: "2026-03-02",
      measures: "A triglyceride test measures a type of fat in the blood.",
      whyItMatters:
        "MedlinePlus has a public page about the triglyceride test. A number inside one laboratory's range is not a promise about future health.",
      questions: ["What eating or alcohol patterns would you ask about with a result like this?"],
    },
  ],
};
