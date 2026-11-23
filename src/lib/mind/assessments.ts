/**
 * Validated screening questionnaires in LifeZoi Mind.
 *
 * Only instruments whose licence was verified are included:
 * - PHQ-9 and GAD-7: "No permission required to reproduce, translate, display or distribute"
 *   (Spitzer, Williams, Kroenke and colleagues, educational grant from Pfizer Inc.).
 *
 * Not included, and why (checked 2026-11-22):
 * - Perceived Stress Scale: Carnegie Mellon's Laboratory for the Study of Stress, Immunity,
 *   and Disease asks that permission requests go through Mapi Research Trust's ePROVIDE.
 *   The request is free, but no permission has been requested for LifeZoi.
 * - Insomnia Severity Index: distributed under licence by Mapi Research Trust. The terms
 *   could not be confirmed, so it is not shown.
 *
 * Wording, answer options, the two-week time frame, and scoring follow the published
 * English versions. Translations are not shown: only the official translations from the
 * developers may be used, and they have not been added or reviewed yet.
 */

export type InstrumentId = "phq9" | "gad7";

export type AnswerOption = { value: number; label: string };

export type Band = { min: number; max: number; label: string; meaning: string };

export type Instrument = {
  id: InstrumentId;
  name: string;
  shortName: string;
  topic: string;
  purpose: string;
  timeFrame: string;
  stem: string;
  items: readonly string[];
  options: readonly AnswerOption[];
  difficulty: { question: string; options: readonly string[] };
  maxScore: number;
  bands: readonly Band[];
  /** The total at which the developers suggest further evaluation by a clinician. */
  followUpAt: number;
  minutes: number;
  canTell: readonly string[];
  cannotTell: readonly string[];
  credit: string;
  permission: string;
  sources: readonly { label: string; url: string }[];
  /** Suggested next steps in LifeZoi Mind. */
  exercises: readonly string[];
  articles: readonly string[];
  /** Days to wait before taking it again, because both ask about the last two weeks. */
  repeatAfterDays: number;
};

const FREQUENCY: readonly AnswerOption[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

const DIFFICULTY = {
  question:
    "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
  options: ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"],
} as const;

const CREDIT =
  "Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc.";
const PERMISSION = "No permission required to reproduce, translate, display or distribute.";

export const PHQ9: Instrument = {
  id: "phq9",
  name: "Patient Health Questionnaire (PHQ-9)",
  shortName: "PHQ-9",
  topic: "Mood and depression symptoms",
  purpose:
    "The PHQ-9 is a widely used, validated questionnaire about common symptoms of depression over the last two weeks. Doctors and researchers use it as a first screening step and to follow changes over time.",
  timeFrame: "the last 2 weeks",
  stem: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
  items: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
  ],
  options: FREQUENCY,
  difficulty: DIFFICULTY,
  maxScore: 27,
  bands: [
    { min: 0, max: 4, label: "Minimal", meaning: "Few of these symptoms were reported over the last two weeks." },
    { min: 5, max: 9, label: "Mild", meaning: "Some of these symptoms were reported over the last two weeks." },
    { min: 10, max: 14, label: "Moderate", meaning: "A moderate number of these symptoms were reported, often enough that the developers suggest talking with a clinician." },
    { min: 15, max: 19, label: "Moderately severe", meaning: "Many of these symptoms were reported, often. The developers suggest talking with a clinician." },
    { min: 20, max: 27, label: "Severe", meaning: "Many of these symptoms were reported nearly every day. The developers suggest talking with a clinician soon." },
  ],
  followUpAt: 10,
  minutes: 3,
  canTell: [
    "How often you were bothered by nine common depression symptoms in the last two weeks.",
    "A score band that clinicians and researchers use as a starting point for a conversation.",
    "Changes in your answers if you take it again after at least two weeks.",
  ],
  cannotTell: [
    "Whether you have depression or any other condition. Only a qualified professional can assess that.",
    "What is causing how you feel. Grief, illness, medicines, sleep, and life events can all affect these answers.",
    "Whether a small change between two results means you are better or worse.",
  ],
  credit: CREDIT,
  permission: PERMISSION,
  sources: [
    { label: "Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.", url: "https://pubmed.ncbi.nlm.nih.gov/11556941/" },
    { label: "National Institute of Mental Health: Depression", url: "https://www.nimh.nih.gov/health/topics/depression" },
  ],
  exercises: ["behavioral-activation", "self-compassion", "gratitude", "paced-breathing"],
  articles: ["understanding-depression", "cognitive-behavioral-therapy", "sleep-and-mental-health", "loneliness"],
  repeatAfterDays: 14,
};

export const GAD7: Instrument = {
  id: "gad7",
  name: "Generalized Anxiety Disorder scale (GAD-7)",
  shortName: "GAD-7",
  topic: "Anxiety and worry",
  purpose:
    "The GAD-7 is a widely used, validated seven-question screening tool about anxiety and worry over the last two weeks. It is often used as a first step before a fuller conversation with a professional.",
  timeFrame: "the last 2 weeks",
  stem: "Over the last 2 weeks, how often have you been bothered by the following problems?",
  items: [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen",
  ],
  options: FREQUENCY,
  difficulty: DIFFICULTY,
  maxScore: 21,
  bands: [
    { min: 0, max: 4, label: "Minimal", meaning: "Few anxiety symptoms were reported over the last two weeks." },
    { min: 5, max: 9, label: "Mild", meaning: "Some anxiety symptoms were reported over the last two weeks." },
    { min: 10, max: 14, label: "Moderate", meaning: "Anxiety symptoms were reported often enough that the developers suggest talking with a clinician." },
    { min: 15, max: 21, label: "Severe", meaning: "Anxiety symptoms were reported often, many nearly every day. The developers suggest talking with a clinician." },
  ],
  followUpAt: 10,
  minutes: 2,
  canTell: [
    "How often you were bothered by seven common anxiety symptoms in the last two weeks.",
    "A score band that clinicians use as a starting point for a conversation.",
    "Changes in your answers if you take it again after at least two weeks.",
  ],
  cannotTell: [
    "Whether you have an anxiety disorder or any other condition. Only a qualified professional can assess that.",
    "What is causing the worry. Stressful events, health problems, caffeine, and some medicines can all play a part.",
    "Whether a small change between two results means you are better or worse.",
  ],
  credit: CREDIT,
  permission: PERMISSION,
  sources: [
    { label: "Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.", url: "https://pubmed.ncbi.nlm.nih.gov/16717171/" },
    { label: "National Institute of Mental Health: Anxiety Disorders", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" },
  ],
  exercises: ["paced-breathing", "grounding-54321", "worry-time", "progressive-muscle-relaxation"],
  articles: ["anxiety-and-stress", "how-the-brain-processes-emotions", "mindfulness", "cognitive-behavioral-therapy"],
  repeatAfterDays: 14,
};

export const INSTRUMENTS: readonly Instrument[] = [GAD7, PHQ9];

export type NotIncluded = { name: string; reason: string; url: string };

export const NOT_INCLUDED: readonly NotIncluded[] = [
  {
    name: "Perceived Stress Scale (PSS)",
    reason:
      "Its authors ask that permission requests go through Mapi Research Trust. The request is free, but LifeZoi has not received permission yet, so the scale is not shown. The stress reflection below is an educational alternative, not the PSS.",
    url: "https://www.cmu.edu/dietrich/psychology/stress-immunity-disease-lab/scales",
  },
  {
    name: "Insomnia Severity Index (ISI)",
    reason:
      "It is distributed under licence by Mapi Research Trust, and LifeZoi could not confirm the terms. It is not shown. The sleep reflection below is an educational alternative, not the ISI.",
    url: "https://eprovide.mapi-trust.org/isi-insomnia-severity-index",
  },
];

export function instrumentById(id: string): Instrument | null {
  return INSTRUMENTS.find((instrument) => instrument.id === id) ?? null;
}

export type ScoreResult = {
  instrument: InstrumentId;
  total: number;
  maxScore: number;
  band: Band;
  /** True when the total reaches the developers' suggested point for further evaluation. */
  suggestFollowUp: boolean;
  /** PHQ-9 only: any answer above "Not at all" on item 9. */
  item9Positive: boolean;
  item9Value: number | null;
  difficulty: string | null;
};

/** Answers are 0–3 per item. Returns null unless every item has a valid answer. */
export function scoreInstrument(instrument: Instrument, answers: readonly (number | null | undefined)[], difficulty: number | null = null): ScoreResult | null {
  if (answers.length !== instrument.items.length) return null;
  let total = 0;
  for (const answer of answers) {
    if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer > 3) return null;
    total += answer;
  }
  const band = bandOf(instrument, total);
  const item9Value = instrument.id === "phq9" ? (answers[8] as number) : null;
  return {
    instrument: instrument.id,
    total,
    maxScore: instrument.maxScore,
    band,
    suggestFollowUp: total >= instrument.followUpAt,
    item9Positive: item9Value !== null && item9Value > 0,
    item9Value,
    difficulty:
      difficulty !== null && Number.isInteger(difficulty) && difficulty >= 0 && difficulty < instrument.difficulty.options.length
        ? instrument.difficulty.options[difficulty]
        : null,
  };
}

/** Index of the PHQ-9 item about thoughts of being better off dead or of self-harm. */
export const PHQ9_SAFETY_ITEM = 8;

export const ITEM9_MESSAGE = {
  title: "Thank you for answering honestly",
  paragraphs: [
    "You said you have had thoughts that you would be better off dead or of hurting yourself. That is important, and you do not have to carry it alone.",
    "Please talk with someone today. In the United States you can call or text 988, the Suicide & Crisis Lifeline, at any time. If you might act on these thoughts, call 911 or go to the nearest emergency department now.",
    "Please also tell a doctor, counselor, or someone you trust about this answer, whatever your total score is. A total score does not show how serious these thoughts are.",
  ],
} as const;

function bandOf(instrument: Instrument, total: number): Band {
  return instrument.bands.find((entry) => total >= entry.min && total <= entry.max) ?? instrument.bands[instrument.bands.length - 1];
}

/**
 * Plain-language comparison of two results of the same questionnaire. A change inside
 * the same score band is described as small and is not treated as improvement or worsening.
 */
export function compareResults(
  instrument: Instrument,
  earlier: number,
  later: number,
  tr: (english: string, values?: Record<string, string | number>) => string = fillEnglish,
): string {
  const change = later - earlier;
  const before = bandOf(instrument, earlier);
  const after = bandOf(instrument, later);
  const values = { change: Math.abs(change), before: tr(before.label), after: tr(after.label) };
  if (change === 0) return tr("Your total is the same as last time.");
  if (before.label === after.label) {
    return tr("Your total changed by {change} and stayed in the same band ({after}). A small change like this can happen from one ordinary week to the next, so it does not show that things are better or worse.", values);
  }
  if (change < 0) {
    return tr("Your total is {change} lower, moving from {before} to {after}. You reported these symptoms less often this time. That can be worth noticing, but it is not proof of recovery.", values);
  }
  return tr("Your total is {change} higher, moving from {before} to {after}. You reported these symptoms more often this time. The questionnaire cannot tell you why. It may be a good moment to look after yourself and to talk with someone you trust or a professional.", values);
}

function fillEnglish(english: string, values?: Record<string, string | number>): string {
  return values ? english.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole)) : english;
}
