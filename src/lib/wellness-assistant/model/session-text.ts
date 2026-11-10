import { msg } from "@/lib/i18n/translate";
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

/** Stated diagnoses in Ukrainian, Russian, and Greek. */
const STATED_DIAGNOSIS_LOCAL =
  /(?:мені поставили діагноз|у мене діагностували|у мене є|у мене|мне поставили диагноз|у меня диагностировали|у меня есть|у меня|μου διαγνωσαν|μου διέγνωσαν|έχω|εχω)\s+(?:цукровий діабет|сахарный диабет|діабет|диабет|переддіабет|преддиабет|рак|гіпертонію|гіпертонія|гипертонию|гипертония|високий тиск|высокое давление|хворобу серця|хвороба серця|болезнь сердца|депресію|депресія|депрессию|депрессия|тривожний розлад|тревожное расстройство|високий холестерин|высокий холестерин|διαβήτη|διαβητη|προδιαβήτη|καρκίνο|καρκινο|υπέρταση|υπερταση|καρδιοπάθεια|κατάθλιψη|καταθλιψη|υψηλή χοληστερίνη)/gi;

/** Lab values in Ukrainian, Russian, and Greek, such as «глюкоза 6,1». */
const LAB_VALUE_LOCAL =
  /(?:глюкоза|цукор у крові|цукор|сахар в крови|сахар|холестерин|лпнщ|лпвщ|лпнп|лпвп|тригліцериди|триглицериды|креатинін|креатинин|тиск|давление|γλυκόζη|γλυκοζη|σάκχαρο|σακχαρο|χοληστερίνη|χοληστερινη|τριγλυκερίδια|τριγλυκεριδια|κρεατινίνη|κρεατινινη|πίεση|πιεση)(?:\s*(?:[:=–—-]|становить|составляет|був|была|был|είναι|ειναι|ήταν))?\s*\d+(?:[.,]\d+)?/gi;

/** Doses written with Cyrillic units. */
const DOSE_LOCAL = /\d+(?:[.,]\d+)?\s*(?:мг|мкг|міліграм\p{L}*|миллиграмм\p{L}*|од\.|ед\.|одиниц\p{L}*|единиц\p{L}*|μονάδες)/giu;

const BLOOD_PRESSURE = /\b\d{2,3}\s*\/\s*\d{2,3}\b/g;

const DOSE = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|milligrams|micrograms|units|iu)\b/gi;

export function personalFieldsPresent(record: Record<string, unknown>): boolean {
  return IGNORED_FIELDS.some((key) => key in record && record[key] != null);
}

export function redactSessionText(text: string): string {
  return text
    .replace(STATED_DIAGNOSIS, "a personal diagnosis was left out")
    .replace(STATED_DIAGNOSIS_LOCAL, "a personal diagnosis was left out")
    .replace(LAB_VALUE, "a personal result was left out")
    .replace(LAB_VALUE_LOCAL, "a personal result was left out")
    .replace(BLOOD_PRESSURE, "a personal reading was left out")
    .replace(DOSE, "a personal dose was left out")
    .replace(DOSE_LOCAL, "a personal dose was left out")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function redactTurns(messages: WellnessTurn[]): WellnessTurn[] {
  return messages.map((message) =>
    message.role === "user" ? { role: "user", content: redactSessionText(message.content) } : message,
  );
}

/** `local` holds the same topics in Ukrainian, Russian, and Greek, matched on folded text. */
const SUGGESTIONS: { pattern: RegExp; local: RegExp; text: string }[] = [
  {
    pattern: /\b(sleep|insomnia|bedtime|waking|wake at night|night)\b/i,
    local: /сон|сну|спат|спля|безсон|бессон|прокида|просыпа|ніч|ноч|υπν|κοιμ|αυπνι|ξυπν|νυχτ/,
    text: msg("A simple step for today: keep a regular bedtime tonight, since sleep is what you already asked about."),
  },
  {
    pattern: /\b(walk|exercise|movement|move|balance|stretch|yoga|strength|chair)\b/i,
    local: /ходьб|ходи|гуля|прогул|вправ|рух|руха|рівноваг|розтяж|иог|сил|стіл|упражн|движен|двига|равновес|растяж|иог|стул|περπατ|ασκησ|γυμναστ|κινησ|ισορροπ|διατασ|γιογκ|δυναμ|καρεκλ/,
    text: msg("A simple step for today: do one short, comfortable bit of the movement you already mentioned, and stop if it hurts."),
  },
  {
    pattern: /\b(sugar|sweet|breakfast|meal|vegetable|eat|eating|protein|fiber|water|food)\b/i,
    local: /цукор|цукр|солод|сніданок|снiданок|іж|харч|овоч|білок|білк|клітковин|вод|сахар|сладк|завтрак|еда|еду|пищ|питани|овощ|белок|белк|клетчатк|ζαχαρ|γλυκ|πρωιν|φαγητ|γευμα|λαχανικ|πρωτειν|φυτικ|νερ|τροφ|διατροφ/,
    text: msg("A simple step for today: at the next meal, repeat one food or drink choice you already mentioned."),
  },
  {
    pattern: /\b(stress|stressed|calm|breath|anxious|relax)\b/i,
    local: /стрес|напруж|спокі|дихан|тривож|розслаб|стресс|напряж|спокой|дыхан|тревож|расслаб|στρεσ|αγχ|ηρεμ|αναπνο|χαλαρ/,
    text: msg("A simple step for today: take a few slow breaths or a short pause, since stress is what you already mentioned."),
  },
  {
    pattern: /\b(tired|energy|fatigue|sluggish)\b/i,
    local: /втом|втомл|енерг|сил нема|устал|усталост|энерги|вял|κουρασ|ενεργει|εξαντλ/,
    text: msg("A simple step for today: take one short break, since energy is what you already asked about."),
  },
  {
    pattern: /\b(habit|motivation|routine|goal)\b/i,
    local: /звичк|мотивац|рутин|розпоряд|мета|ціль|привычк|распоряд|цель|συνηθει|κινητρ|ρουτιν|στοχ/,
    text: msg("A simple step for today: repeat one small habit you already named, instead of starting several new ones."),
  },
];

function foldText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/ς/g, "σ");
}

export function suggestionFromSession(messages: WellnessTurn[]): string | null {
  const said = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  if (!said.trim()) return null;
  const folded = foldText(said);
  const match =
    SUGGESTIONS.find((item) => item.pattern.test(said)) ?? SUGGESTIONS.find((item) => item.local.test(folded));
  return match?.text ?? null;
}
