import { contextPhrase } from "@/lib/emotional-wellness/copy";
import { crisisReply, detectCrisis } from "@/lib/emotional-wellness/crisis";
import type { CompanionMode, ContextId, CountryChoice, CrisisKind } from "@/lib/emotional-wellness/types";
import { makeTranslate, type Translate } from "@/lib/i18n/translate";

const english = makeTranslate(null);

export const MODEL_SEAM = "off" as const;

const LISTEN_REQUEST =
  /\b(just listen|only listen|keep listening|please listen|listen to me|no advice|don'?t give advice|do not give advice|only want to be (heard|listened)|want to be heard|just want to (talk|vent)|don'?t tell me what to do|do not tell me what to do|only want you to listen|stay and listen)\b/i;

const ADVICE_REQUEST =
  /\b(i want (a suggestion|advice|a step|help)|give me (a suggestion|advice)|what should i do|one small step)\b/i;

const MEDICATION =
  /\b(stop|start|change|increase|decrease|skip|double|adjust) (my |the |your )?(medication|medicine|dose|meds|insulin|chemo|chemotherapy|antidepressant|prescription)\b|\b(what dose|how many mg|should i take)\b/i;

const DIAGNOSIS =
  /\b(do i have|am i diagnosed|diagnose me|is this depression|is this anxiety|is this cancer|is this diabetes)\b/i;

const OUTCOME =
  /\b(will i (survive|be cured|die)|cure my (cancer|illness)|promise me|will the cancer (go away|spread)|survival rate|beat (the )?cancer)\b/i;

const EMOTIONS_CAUSED =
  /\b(emotions|stress|anxiety|anger|feelings) (caused|gave me|created|made) (my )?(cancer|diabetes|illness|disease|tumor)\b|\b(caused|cause of) (my )?(cancer|diabetes|illness|disease)\b/i;

export type CompanionResult = {
  text: string;
  mode: CompanionMode;
  crisis: boolean;
  kinds: CrisisKind[];
  adviceOffered: boolean;
  questionCount: number;
};

function questionCount(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function finish(text: string, mode: CompanionMode): CompanionResult {
  return {
    text,
    mode,
    crisis: false,
    kinds: [],
    adviceOffered: /\b(you should|try this|i recommend|a good idea is)\b/i.test(text),
    questionCount: questionCount(text),
  };
}

function contextSentence(context: ContextId, t: Translate): string {
  if (context === "general") return "";
  return ` ${t("You selected {context} as optional context. That choice is not a diagnosis, and you can change it.", {
    context: t(contextPhrase(context)),
  })}`;
}

function feelingSentence(text: string, t: Translate): string {
  const lower = text.toLowerCase();
  if (/\b(anxious|anxiety|worried|scared|afraid|panic|fear)\b/.test(lower)) {
    return t("Feeling afraid or worried can take up a lot of room.");
  }
  if (/\b(sad|grief|grieving|depressed|hopeless|heartbroken)\b/.test(lower)) {
    return t("Sadness and grief can be very heavy.");
  }
  if (/\b(angry|furious|frustrated|mad|resentful)\b/.test(lower)) {
    return t("Anger is a real feeling, and it can be exhausting.");
  }
  if (/\b(lonely|alone|isolated)\b/.test(lower)) {
    return t("Loneliness deserves to be taken seriously.");
  }
  if (/\b(tired|exhausted|overwhelmed|burned out|burnt out|weary)\b/.test(lower)) {
    return t("Feeling overwhelmed is enough of a reason to pause.");
  }
  if (/\b(numb|empty|feel nothing)\b/.test(lower)) {
    return t("Feeling numb is still a feeling, and you do not have to explain it.");
  }
  return t("Thank you for saying that.");
}

function crisisResult(kinds: CrisisKind[], country: CountryChoice, mode: CompanionMode, t: Translate): CompanionResult {
  const text = crisisReply(kinds, country, t);
  return {
    text,
    mode,
    crisis: true,
    kinds,
    adviceOffered: false,
    questionCount: questionCount(text),
  };
}

export function respondToCompanion(input: {
  message: string;
  context: ContextId;
  country: CountryChoice;
  mode: CompanionMode;
  companionEnabled?: boolean;
  /** Writes the reply in the chosen language. The checks above read the visitor's words as they are. */
  t?: Translate;
}): CompanionResult {
  const t = input.t ?? english;
  const message = input.message.replace(/\s+/g, " ").trim();
  const kinds = detectCrisis(message);
  if (kinds.length > 0) return crisisResult(kinds, input.country, input.mode, t);

  if (input.companionEnabled === false) {
    const text = t(
      "The companion is off, so no coaching reply was written. If you are in danger, the crisis check on this page still runs on its own. The paid-model seam stays off.",
    );
    return finish(text, input.mode);
  }

  if (!message) {
    return finish(t("Write a few words when you are ready. What feels most important to say?"), input.mode);
  }

  const context = contextSentence(input.context, t);
  if (MEDICATION.test(message)) {
    return finish(
      `${t("This tool cannot tell you to start, stop, or change a medication.")}${context} ${t("A clinician who knows your care can help with that. What feels most important to say about how you are feeling?")}`,
      input.mode,
    );
  }
  if (DIAGNOSIS.test(message)) {
    return finish(
      `${t("This tool cannot diagnose any condition.")}${context} ${t("A qualified clinician can assess what is going on. What feels heaviest right now?")}`,
      input.mode,
    );
  }
  if (OUTCOME.test(message)) {
    return finish(
      `${t("This tool cannot promise what will happen with cancer or any illness.")}${context} ${t("It also cannot say that emotions caused an illness. What kind of support would feel kind right now?")}`,
      input.mode,
    );
  }
  if (EMOTIONS_CAUSED.test(message)) {
    return finish(
      `${t("Feelings can be heavy, and they do not mean you caused an illness.")}${context} ${t("This tool does not treat emotions as the cause of cancer, diabetes, or any disease. What feels most important to say?")}`,
      input.mode,
    );
  }

  const wantsListen = LISTEN_REQUEST.test(message);
  const wantsAdvice = ADVICE_REQUEST.test(message) && !wantsListen;
  const mode: CompanionMode = wantsListen ? "listen" : wantsAdvice ? "open" : input.mode;
  const validation = `${feelingSentence(message, t)} ${t("You deserve to be heard.")}${context}`;

  if (mode === "listen") {
    return finish(`${validation} ${t("I will not add advice. What else do you want me to hear?")}`, "listen");
  }
  if (wantsAdvice) {
    return finish(
      `${validation} ${t("This tool will not choose a treatment for you. What is one thing you could do in the next ten minutes that matters to you?")}`,
      "open",
    );
  }
  return finish(`${validation} ${t("Would you like me to keep listening, or look at one small step?")}`, "open");
}
