import type { Category, CategorySlug, EvidenceLevel, SafetyTopic, StudyType } from "@/lib/encyclopedia/types";
import { msg } from "@/lib/i18n/translate";

export const ENCYCLOPEDIA_TITLE = msg("LifeZoi Health Encyclopedia");
export const ENCYCLOPEDIA_SUBTITLE = msg("60 Years of Medical Discoveries — and Beyond");
export const ENCYCLOPEDIA_TAGLINE = msg("Knowledge for a Healthier, Longer Life.");
export const ENCYCLOPEDIA_INTRO = msg(
  "Explore the science behind health, medicine, nutrition, and longevity. Discover important medical breakthroughs, understand new research, and learn what scientific evidence tells us about living a healthier life.",
);
export const ENCYCLOPEDIA_PHILOSOPHY = msg("Knowledge. Science. Prevention. Longevity. Better Living.");
export const ENCYCLOPEDIA_DISCLAIMER = msg(
  "LifeZoi Health Encyclopedia provides educational information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional about personal medical decisions.",
);

/**
 * Category titles and descriptions are interface text, so they are translated.
 * Article bodies are English only for now (see the notice on the pages).
 */
export const CATEGORIES: readonly Category[] = [
  { slug: "medical-discoveries", title: msg("Medical Discoveries"), description: msg("The breakthroughs of the last 60 years: vaccines, scans, transplants, genetics, and how they changed care."), illustration: "microscope" },
  { slug: "cancer", title: msg("Cancer Research & Treatments"), description: msg("How cancer develops, how it is found early, how it is treated today, and what is still being tested."), illustration: "cell" },
  { slug: "fasting-metabolism", title: msg("Fasting & Metabolism"), description: msg("Insulin, blood glucose, autophagy, and what human trials really show about fasting."), illustration: "clock" },
  { slug: "nutrition", title: msg("Nutrition & Healthy Eating"), description: msg("Eating patterns that decades of research agree on, without fads or miracle foods."), illustration: "plate" },
  { slug: "brain", title: msg("Brain Health & Memory"), description: msg("How the brain ages, what supports memory, and the risk factors research can change."), illustration: "brain" },
  { slug: "heart", title: msg("Heart Health & Circulation"), description: msg("Blood pressure, cholesterol, and the everyday habits linked with a healthier heart."), illustration: "heart" },
  { slug: "gut", title: msg("Gut Health & Microbiome"), description: msg("The trillions of microbes in the gut, what we know about them, and what is still hype."), illustration: "gut" },
  { slug: "longevity", title: msg("Longevity & Healthy Aging"), description: msg("Staying strong, independent, and connected as the years go by."), illustration: "tree" },
  { slug: "sleep-stress", title: msg("Sleep & Stress"), description: msg("Why rest matters for the body and mind, and practical ways to protect it."), illustration: "moon" },
  { slug: "eastern-medicine", title: msg("Eastern Medicine"), description: msg("Traditional Chinese medicine, Ayurveda, acupuncture, and mind-body practices, weighed against the evidence."), illustration: "lotus" },
  { slug: "western-medicine", title: msg("Western Medicine"), description: msg("Evidence-based diagnosis, clinical trials, medicines, surgery, and prevention."), illustration: "stethoscope" },
  { slug: "future-medicine", title: msg("Future of Medicine & Medical Technology"), description: msg("Gene editing, mRNA, artificial intelligence, and other approaches still being studied."), illustration: "dna" },
];

export function categoryFor(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function isCategorySlug(value: unknown): value is CategorySlug {
  return typeof value === "string" && CATEGORIES.some((category) => category.slug === value);
}

export const EVIDENCE_INFO: Record<EvidenceLevel, { label: string; meaning: string }> = {
  strong: { label: msg("Strong Scientific Evidence"), meaning: msg("Supported by substantial, consistent research, usually many large human studies or official guidance built on them.") },
  promising: { label: msg("Promising Research"), meaning: msg("Encouraging findings, but further research is needed before it can be called established.") },
  limited: { label: msg("Limited Evidence"), meaning: msg("Only a small number of studies, or findings that are uncertain or mixed.") },
  "not-established": { label: msg("Not Established"), meaning: msg("There is currently not enough reliable evidence to support the claim.") },
};

export const STUDY_TYPE_TEXT: Record<StudyType, string> = {
  guidance: msg("Official health guidance"),
  "systematic-review": msg("Systematic reviews of human studies"),
  "randomized-trials": msg("Randomized human trials"),
  observational: msg("Observational studies in people"),
  "animal-lab": msg("Animal and laboratory research"),
  history: msg("Historical record"),
  approval: msg("Regulatory approval record"),
};

/** Extra safety notes shown at the top of serious topics. */
export const SAFETY_NOTES: Record<SafetyTopic, { title: string; text: string }> = {
  cancer: {
    title: msg("About cancer information"),
    text: msg("Cancer treatment decisions must be made with qualified oncology professionals. No food, supplement, fasting method, or traditional remedy has been shown to cure cancer. Do not delay or replace recommended treatment."),
  },
  fasting: {
    title: msg("Fasting is not right for everyone"),
    text: msg("Fasting may be unsafe for some people with diabetes, people taking medicines that lower blood sugar or blood pressure, pregnant or breastfeeding people, anyone with a history of eating disorders, people who are underweight, and people who are frail or medically vulnerable. Talk with your clinician first. Do not stop or change any medicine on your own, and do not use fasting as a treatment for a disease."),
  },
  diabetes: {
    title: msg("If you have diabetes"),
    text: msg("Changes in eating can change how your medicines work, especially insulin and some tablets, and can cause dangerously low blood sugar. Plan any change with your diabetes care team."),
  },
  heart: {
    title: msg("Heart symptoms need urgent care"),
    text: msg("Chest pain or pressure, sudden shortness of breath, fainting, or signs of stroke such as a drooping face, arm weakness, or slurred speech are emergencies. Call your local emergency number, such as 911 in the United States. Keep taking heart and blood pressure medicines as prescribed."),
  },
  herbs: {
    title: msg("Herbs and supplements can interact with medicines"),
    text: msg("Natural does not always mean safe. Some herbal products interact with prescription medicines, and some have been found to contain heavy metals or undeclared drugs. Tell your doctor and pharmacist about everything you take."),
  },
  "mental-health": {
    title: msg("If you are struggling"),
    text: msg("If you are thinking about harming yourself, or you are in crisis, contact local emergency services now. In the United States you can call or text 988, the Suicide & Crisis Lifeline."),
  },
};

/** Standard article section headings (the brief's article structure). */
export const SECTION_HEADINGS = [
  msg("What is it?"),
  msg("Why does it matter?"),
  msg("What does science tell us?"),
  msg("Important research and discoveries"),
  msg("Practical information for everyday life"),
  msg("Risks, limitations, and unanswered questions"),
] as const;

export const POPULAR_SEARCHES = [
  "immunotherapy",
  "intermittent fasting",
  "blood pressure",
  "memory",
  "acupuncture",
  "microbiome",
  "sleep",
  "CRISPR",
  "vaccines",
  "autophagy",
] as const;
