import type { CountryChoice } from "@/lib/emotional-wellness/types";
import { showsUsCrisisResources } from "@/lib/emotional-wellness/crisis";

export type RealOrg = {
  id: string;
  name: string;
  url: string;
  detail: string;
  usPhone: string | null;
  otherPhone: string | null;
};

export const REAL_ORGS: readonly RealOrg[] = [
  {
    id: "acs",
    name: "American Cancer Society",
    url: "https://www.cancer.org/about-us/online-help/contact-us.html",
    detail:
      "The American Cancer Society publishes cancer information and a contact line. It is not a crisis line, and contacting them is not a promise about cancer outcomes.",
    usPhone: "1-800-227-2345",
    otherPhone: null,
  },
  {
    id: "csc",
    name: "Cancer Support Community",
    url: "https://www.cancersupportcommunity.org/cancer-support-helpline",
    detail:
      "Cancer Support Community publishes a Cancer Support Helpline and the hours for it. This page repeats only the numbers listed on that page.",
    usPhone: "272-867-5309",
    otherPhone: "888-793-9355",
  },
  {
    id: "ada",
    name: "American Diabetes Association",
    url: "https://diabetes.org/about-us/center-information",
    detail:
      "The American Diabetes Association Center for Information publishes diabetes information. It does not change medication or diagnose diabetes.",
    usPhone: "1-800-342-2383",
    otherPhone: null,
  },
  {
    id: "nami",
    name: "NAMI",
    url: "https://www.nami.org/nami-helpline/",
    detail:
      "NAMI publishes the NAMI HelpLine for mental health information and support. This page does not invent a different phone number for NAMI.",
    usPhone: "800-950-6264",
    otherPhone: null,
  },
  {
    id: "nimh",
    name: "NIMH",
    url: "https://www.nimh.nih.gov/health/find-help",
    detail:
      "The National Institute of Mental Health publishes research-based information and a find-help page. This page does not invent an NIMH phone number.",
    usPhone: null,
    otherPhone: null,
  },
  {
    id: "lifeline",
    name: "988 Suicide & Crisis Lifeline",
    url: "https://988lifeline.org/",
    detail: "Call or text 988. For immediate danger, call 911. These are United States resources.",
    usPhone: "988",
    otherPhone: null,
  },
];

export type Attribution = {
  id: string;
  name: string;
  title: string;
  url: string;
  note: string;
};

export const ATTRIBUTIONS: readonly Attribution[] = [
  {
    id: "who-dwm",
    name: "World Health Organization",
    title: "Doing What Matters in Times of Stress: An Illustrated Guide",
    url: "https://www.who.int/publications/i/item/9789240003927",
    note: "Public stress-management skills include grounding, unhooking, acting on what matters, kindness, and making room. The exercises here use original wording and are not the WHO guide.",
  },
  {
    id: "asco",
    name: "American Society of Clinical Oncology",
    title: "Management of Anxiety and Depression in Adult Survivors of Cancer: ASCO Guideline Update",
    url: "https://ascopubs.org/doi/10.1200/JCO.23.00293",
    note: "ASCO discusses psychosocial and behavioral care for anxiety and depression in adult cancer survivors. This page does not deliver that care.",
  },
  {
    id: "sio-asco",
    name: "Society for Integrative Oncology and ASCO",
    title: "Integrative Oncology Care of Symptoms of Anxiety and Depression in Adults With Cancer: SIO–ASCO Guideline",
    url: "https://ascopubs.org/doi/10.1200/JCO.23.00857",
    note: "The SIO–ASCO guideline discusses integrative approaches for anxiety and depression symptoms in adults with cancer. This page is not that guideline.",
  },
  {
    id: "ada-standards",
    name: "American Diabetes Association",
    title: "Standards of Care in Diabetes",
    url: "https://professional.diabetes.org/standards-of-care",
    note: "The ADA Standards of Care cover diabetes care, including well-being. This page does not change diabetes treatment.",
  },
  {
    id: "apa",
    name: "American Psychological Association",
    title: "Health advisory on generative AI chatbots and wellness applications for mental health",
    url: "https://www.apa.org/topics/artificial-intelligence-machine-learning/health-advisory-chatbots-wellness-apps",
    note: "APA advises that chatbots and wellness apps are not a substitute for a qualified mental health professional. This companion is rules-based and is not a generative model.",
  },
  {
    id: "nimh",
    name: "National Institute of Mental Health",
    title: "Help for Mental Illnesses",
    url: "https://www.nimh.nih.gov/health/find-help",
    note: "NIMH describes where to seek help. This page is not an NIMH service.",
  },
  {
    id: "lifeline",
    name: "988 Suicide & Crisis Lifeline",
    title: "988 Lifeline",
    url: "https://988lifeline.org/",
    note: "United States crisis line. This page shows call, text, and immediate-danger numbers only when the country is the United States or not set. This page is not the Lifeline.",
  },
];

export function orgPhone(org: RealOrg, country: CountryChoice): string | null {
  if (country === "other") return org.otherPhone;
  return org.usPhone;
}

export function showEmergencyNumbers(country: CountryChoice): boolean {
  return showsUsCrisisResources(country);
}
