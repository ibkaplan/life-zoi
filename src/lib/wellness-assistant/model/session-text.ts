import type { WellnessTurn } from "@/lib/wellness-assistant/model/types";

const IGNORED_FIELDS = [
  "assessment",
  "labs",
  "labResults",
  "lab",
  "diagnoses",
  "diagnosis",
  "medications",
  "medication",
  "profile",
  "account",
  "records",
  "healthRecord",
  "healthRecords",
  "sessionState",
  "goals",
  "checkIns",
  "checkins",
] as const;

const STATED_DIAGNOSIS =
  /\b(?:i was diagnosed with|i am diagnosed with|i have been diagnosed with|diagnosed with|i have|i had)\s+(?:type\s*[12]\s+)?(?:diabetes|prediabetes|cancer|hypertension|high blood pressure|heart disease|depression|anxiety disorder|high cholesterol)\b/gi;

const LAB_VALUE =
  /\b(?:a1c|hba1c|hemoglobin a1c|glucose|ldl|hdl|cholesterol|triglycerides|creatinine|egfr|tsh|blood pressure)\b(?:\s*(?:is|was|of|:))?\s*\d+(?:\.\d+)?/gi;

const BLOOD_PRESSURE = /\b\d{2,3}\s*\/\s*\d{2,3}\b/g;

const DOSE = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|milligrams|micrograms|units|iu)\b/gi;

export function personalFieldsPresent(record: Record<string, unknown>): boolean {
  return IGNORED_FIELDS.some((key) => key in record && record[key] != null);
}

export function redactSessionText(text: string): string {
  return text
    .replace(STATED_DIAGNOSIS, "a personal diagnosis was left out")
    .replace(LAB_VALUE, "a personal result was left out")
    .replace(BLOOD_PRESSURE, "a personal reading was left out")
    .replace(DOSE, "a personal dose was left out")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function redactTurns(messages: WellnessTurn[]): WellnessTurn[] {
  return messages.map((message) =>
    message.role === "user" ? { role: "user", content: redactSessionText(message.content) } : message,
  );
}

const SUGGESTIONS: { pattern: RegExp; text: string }[] = [
  {
    pattern: /\b(sleep|insomnia|bedtime|waking|wake at night|night)\b/i,
    text: "A simple step for today: keep a regular bedtime tonight, since sleep is what you already asked about.",
  },
  {
    pattern: /\b(walk|exercise|movement|move|balance|stretch|yoga|strength|chair)\b/i,
    text: "A simple step for today: do one short, comfortable bit of the movement you already mentioned, and stop if it hurts.",
  },
  {
    pattern: /\b(sugar|sweet|breakfast|meal|vegetable|eat|eating|protein|fiber|water|food)\b/i,
    text: "A simple step for today: at the next meal, repeat one food or drink choice you already mentioned.",
  },
  {
    pattern: /\b(stress|stressed|calm|breath|anxious|relax)\b/i,
    text: "A simple step for today: take a few slow breaths or a short pause, since stress is what you already mentioned.",
  },
  {
    pattern: /\b(tired|energy|fatigue|sluggish)\b/i,
    text: "A simple step for today: take one short break, since energy is what you already asked about.",
  },
  {
    pattern: /\b(habit|motivation|routine|goal)\b/i,
    text: "A simple step for today: repeat one small habit you already named, instead of starting several new ones.",
  },
];

export function suggestionFromSession(messages: WellnessTurn[]): string | null {
  const said = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  if (!said.trim()) return null;
  const match = SUGGESTIONS.find((item) => item.pattern.test(said));
  return match?.text ?? null;
}
