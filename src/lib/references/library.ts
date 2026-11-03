export type HealthReference = {
  id: string;
  topic: string;
  organization: string;
  title: string;
  url: string;
  updated: string | null;
  explanation: string;
  relatedTests: string[];
};

export const HEALTH_REFERENCES: readonly HealthReference[] = [
  {
    id: "medlineplus-a1c",
    topic: "HbA1c",
    organization: "National Library of Medicine, MedlinePlus",
    title: "Hemoglobin A1C (HbA1c) Test",
    url: "https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test",
    updated: null,
    explanation:
      "A MedlinePlus lab-test page about what an A1C test generally measures. lifeZoi links to the page and does not copy it.",
    relatedTests: ["4548-4"],
  },
  {
    id: "niddk-a1c",
    topic: "HbA1c and diabetes tests",
    organization: "National Institute of Diabetes and Digestive and Kidney Diseases",
    title: "The A1C Test & Diabetes",
    url: "https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis/a1c-test",
    updated: "2018-04",
    explanation:
      "NIDDK explains the A1C test, why results need clinical context, and that diagnosis is a clinician's decision. The page says it was last reviewed in April 2018.",
    relatedTests: ["4548-4", "2345-7", "1558-6"],
  },
  {
    id: "medlineplus-glucose",
    topic: "Blood glucose",
    organization: "National Library of Medicine, MedlinePlus",
    title: "Blood Glucose",
    url: "https://medlineplus.gov/bloodglucose.html",
    updated: null,
    explanation:
      "A MedlinePlus health topic for blood glucose. A single number does not diagnose diabetes.",
    relatedTests: ["2345-7", "1558-6"],
  },
  {
    id: "medlineplus-cholesterol",
    topic: "Cholesterol",
    organization: "National Library of Medicine, MedlinePlus",
    title: "Cholesterol",
    url: "https://medlineplus.gov/cholesterol.html",
    updated: null,
    explanation:
      "A MedlinePlus health topic covering cholesterol, including LDL and HDL as kinds of cholesterol.",
    relatedTests: ["2093-3", "2089-1", "13457-7", "2085-9"],
  },
  {
    id: "medlineplus-triglycerides",
    topic: "Triglycerides",
    organization: "National Library of Medicine, MedlinePlus",
    title: "Triglycerides Test",
    url: "https://medlineplus.gov/lab-tests/triglycerides-test",
    updated: null,
    explanation:
      "A MedlinePlus lab-test page about what a triglyceride test generally measures.",
    relatedTests: ["2571-8"],
  },
  {
    id: "cdc-cholesterol",
    topic: "Cholesterol",
    organization: "Centers for Disease Control and Prevention",
    title: "About Cholesterol",
    url: "https://www.cdc.gov/cholesterol/about/index.html",
    updated: null,
    explanation:
      "CDC consumer information about cholesterol. lifeZoi links to the page rather than copying it.",
    relatedTests: ["2093-3", "2089-1", "2085-9", "2571-8"],
  },
  {
    id: "medlineplus-nutrition",
    topic: "Food and eating patterns",
    organization: "National Library of Medicine, MedlinePlus",
    title: "Nutrition",
    url: "https://medlineplus.gov/nutrition.html",
    updated: null,
    explanation:
      "A MedlinePlus health topic for nutrition. Food-label practice in lifeZoi uses fictional packages and this public topic.",
    relatedTests: [],
  },
  {
    id: "medlineplus-connect",
    topic: "How references are retrieved",
    organization: "National Library of Medicine",
    title: "MedlinePlus Connect: Web Service",
    url: "https://medlineplus.gov/medlineplus-connect/web-service/",
    updated: null,
    explanation:
      "The free web service lifeZoi calls with a LOINC code only. NLM asks users to cache results for 12 to 24 hours and to stay under 100 requests a minute.",
    relatedTests: [],
  },
];

export function referencesForLoinc(loinc: string): HealthReference[] {
  return HEALTH_REFERENCES.filter((item) => item.relatedTests.includes(loinc));
}
