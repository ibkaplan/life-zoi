import { CLINICAL_REVIEW_NOTICE } from "@/lib/emotional-wellness/copy";
import type { CountryChoice, CrisisKind } from "@/lib/emotional-wellness/types";

/**
 * Deterministic crisis check. It does not call a model.
 * This check has not been reviewed by a licensed clinician and must not be called clinically validated.
 */

const SUICIDE_STRONG = [
  /\bkill myself\b/i,
  /\bkilling myself\b/i,
  /\bend my life\b/i,
  /\btake my own life\b/i,
  /\btake my life\b/i,
  /\b(do not|don't|dont) want to (live|be alive|wake up)\b/i,
  /\bno reason to live\b/i,
  /\bbetter off dead\b/i,
  /\bwish i (was|were) dead\b/i,
  /\bkms\b/i,
  /\bunalive myself\b/i,
];

const SUICIDE_NEGATABLE = [/\bsuicid/i, /\bwant to die\b/i, /\bwanna die\b/i, /\bend it all\b/i];

const SELF_HARM = [
  /\bself[-\s]?harm/i,
  /\bself[-\s]?injur/i,
  /\b(cut|cutting|hurt|hurting|harm|harming|injure|injuring) myself\b/i,
];

const MEDICAL = [
  /\bchest pain\b/i,
  /\bheart attack\b/i,
  /\b(cannot|can't|cant) breathe\b/i,
  /\btrouble breathing\b/i,
  /\bshortness of breath\b/i,
  /\bshort of breath\b/i,
  /\bnot breathing\b/i,
  /\bstroke\b/i,
  /\bface (is )?droop/i,
  /\bslurred speech\b/i,
  /\bsevere bleeding\b/i,
  /\bunconscious\b/i,
  /\bseizure\b/i,
  /\banaphyla/i,
  /\bcoughing blood\b/i,
  /\boverdos(e|ing)\b/i,
];

const DANGER = [
  /\b(going to|gonna|about to) (kill|hurt|attack) me\b/i,
  /\b(he|she|they|someone) (is|are) (going to|gonna|about to) (kill|hurt|attack) me\b/i,
  /\bi('m| am) in (immediate )?danger\b/i,
  /\b(being|getting) (attacked|beaten|stabbed|shot)\b/i,
  /\b(hurting|attacking) me\b/i,
  /\b(gun|knife) (on|to) me\b/i,
];

const HARM_TARGET =
  "him|her|them|someone|someone else|people|anyone|my (partner|wife|husband|boyfriend|girlfriend|child|kid|kids|son|daughter|baby|family|friend|mom|dad|mother|father|parent|boss|neighbor|neighbour)";

const HARM_OTHERS = [
  new RegExp(
    `\\b(going to|gonna|want to|plan to|planning to) (kill|hurt|harm|stab|shoot) (${HARM_TARGET})\\b`,
    "i",
  ),
  /\b(kill|hurt|harm) (him|her|them|someone else)\b/i,
];

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function positiveMatch(text: string, pattern: RegExp): boolean {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const expression = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(text))) {
    const before = text.slice(Math.max(0, match.index - 32), match.index);
    if (!/\b(not|no|never|don't|dont|do not|without|isn't|isnt|aren't|arent|nobody|no one)\b/i.test(before)) {
      return true;
    }
  }
  return false;
}

export function showsUsCrisisResources(country: CountryChoice): boolean {
  return country === "unset" || country === "us";
}

export function detectCrisis(text: string): CrisisKind[] {
  const value = normalize(text);
  if (!value) return [];
  const kinds: CrisisKind[] = [];
  const suicide =
    SUICIDE_STRONG.some((pattern) => pattern.test(value)) ||
    SUICIDE_NEGATABLE.some((pattern) => positiveMatch(value, pattern));
  if (suicide) kinds.push("suicide");
  if (SELF_HARM.some((pattern) => positiveMatch(value, pattern))) kinds.push("self-harm");
  if (DANGER.some((pattern) => positiveMatch(value, pattern))) kinds.push("immediate-danger");
  if (HARM_OTHERS.some((pattern) => positiveMatch(value, pattern))) kinds.push("harm-to-others");
  if (MEDICAL.some((pattern) => positiveMatch(value, pattern))) kinds.push("medical-emergency");
  return kinds;
}

export function standingCrisisNotice(country: CountryChoice): string {
  if (showsUsCrisisResources(country)) {
    return "If you may be in danger of suicide, self-harm, or immediate harm, call or text 988, visit https://988lifeline.org/, or call 911 for immediate danger. This notice stays up even when the companion is off.";
  }
  return "If you may be in danger, contact your local emergency services. This page does not list a United States crisis number for the country you set, and it will not invent a local number. This notice stays up even when the companion is off.";
}

export function crisisReply(kinds: readonly CrisisKind[], country: CountryChoice): string {
  const medical = kinds.includes("medical-emergency");
  const danger = kinds.includes("immediate-danger") || kinds.includes("harm-to-others");
  const emotional = kinds.includes("suicide") || kinds.includes("self-harm");
  const sentences: string[] = [];
  if (medical) sentences.push("This may be a medical emergency. This page cannot assess symptoms.");
  if (emotional) sentences.push("If you may be in danger of suicide or self-harm, pause here.");
  if (danger) sentences.push("If someone may be in immediate danger, get emergency help now.");
  if (showsUsCrisisResources(country)) {
    if (medical || danger || emotional) {
      sentences.push("In the United States, call 911 for immediate danger.");
    }
    sentences.push("You can call or text 988, or visit https://988lifeline.org/.");
  } else {
    sentences.push(
      "Contact your local emergency services. This page does not list a United States crisis number for the country you set, and it will not invent a local number.",
    );
  }
  sentences.push(
    "This tool will not describe methods, and it will not continue with ordinary coaching. It is not a crisis counselor.",
  );
  sentences.push(CLINICAL_REVIEW_NOTICE);
  return sentences.join(" ");
}
