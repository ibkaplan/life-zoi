import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { MODEL_SEAM, respondToCompanion } from "@/lib/emotional-wellness/companion";
import {
  CLINICAL_REVIEW_NOTICE,
  COMPANION_OPENING,
  CONTEXT_OPTIONS,
  HEADLINE,
  JOURNAL_PRIVACY,
  SUPPORTING_LINE,
} from "@/lib/emotional-wellness/copy";
import { crisisReply, detectCrisis, standingCrisisNotice } from "@/lib/emotional-wellness/crisis";
import { exerciseCopy, EXERCISES, nextExerciseStep, startExercise, stopExercise } from "@/lib/emotional-wellness/exercises";
import { ATTRIBUTIONS, orgPhone, REAL_ORGS } from "@/lib/emotional-wellness/resources";
import {
  addPrivateNote,
  clearEmotionalStorage,
  createNoteId,
  EMOTIONAL_STORAGE_KEY,
  emptyEmotionalStore,
  loadEmotionalStore,
  removePrivateNote,
  sanitizeEmotionalStore,
  saveEmotionalStore,
} from "@/lib/emotional-wellness/storage";
import type { CompanionMode, ContextId, CountryChoice } from "@/lib/emotional-wellness/types";

const US_RESOURCE = /988|911|988lifeline\.org/i;
const ADVICE = /\b(you should|try this|i recommend|a good idea is)\b/i;
const LOVE = /\bi love you\b|\bi need you\b/i;
const METHOD = /how to (cut|overdose|hang)|pills to take|ways to die|describe a method/i;

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

function talk(
  message: string,
  extra: Partial<{ context: ContextId; country: CountryChoice; mode: CompanionMode; companionEnabled: boolean }> = {},
) {
  return respondToCompanion({
    message,
    context: extra.context ?? "general",
    country: extra.country ?? "unset",
    mode: extra.mode ?? "open",
    companionEnabled: extra.companionEnabled,
  });
}

describe("emotional wellness crisis check", () => {
  it("flags suicide, self-harm, danger, harm to others, and medical emergency", () => {
    expect(detectCrisis("I want to kill myself")).toContain("suicide");
    expect(detectCrisis("I am thinking about suicide")).toContain("suicide");
    expect(detectCrisis("I don't want to live")).toContain("suicide");
    expect(detectCrisis("I have been cutting myself")).toContain("self-harm");
    expect(detectCrisis("I want to hurt myself")).toContain("self-harm");
    expect(detectCrisis("He is going to kill me")).toContain("immediate-danger");
    expect(detectCrisis("I am going to hurt my partner")).toContain("harm-to-others");
    expect(detectCrisis("I have chest pain and cannot breathe")).toEqual(["medical-emergency"]);
    expect(detectCrisis("I think I am having a stroke")).toContain("medical-emergency");
  });

  it("does not treat swearing, idiom, or a negated worry as a crisis", () => {
    expect(detectCrisis("This is fucking awful and I feel like shit.")).toEqual([]);
    expect(detectCrisis("Damn this pain.")).toEqual([]);
    expect(detectCrisis("Fuck cancer.")).toEqual([]);
    expect(detectCrisis("My back is killing me.")).toEqual([]);
    expect(detectCrisis("I could kill for a nap.")).toEqual([]);
    expect(detectCrisis("I want to kill my pain.")).toEqual([]);
    expect(detectCrisis("I do not want to die.")).toEqual([]);
    expect(detectCrisis("I am not suicidal.")).toEqual([]);
    expect(detectCrisis("I don't have chest pain.")).toEqual([]);
    expect(detectCrisis("I would never hurt them.")).toEqual([]);
  });

  it("gives United States resources when the country is unset or the United States, and stops coaching", () => {
    for (const country of ["unset", "us"] as const) {
      const result = talk("I want to die", { country });
      expect(result.crisis).toBe(true);
      expect(result.adviceOffered).toBe(false);
      expect(result.questionCount).toBe(0);
      expect(result.text).toMatch(/call or text 988/i);
      expect(result.text).toContain("https://988lifeline.org/");
      expect(result.text).toMatch(/call 911/i);
      expect(result.text).toMatch(/will not describe methods/i);
      expect(result.text).toMatch(/will not continue with ordinary coaching/i);
      expect(result.text).not.toMatch(METHOD);
      expect(result.text).not.toMatch(/would you like|small step|you should/i);
      expect(result.text).toContain(CLINICAL_REVIEW_NOTICE);
    }
  });

  it("does not give United States numbers when a different country is set", () => {
    const result = talk("I want to kill myself", { country: "other" });
    expect(result.crisis).toBe(true);
    expect(result.text).not.toMatch(US_RESOURCE);
    expect(result.text).toMatch(/local emergency services/i);
    expect(result.text).toMatch(/will not invent a local number/i);
    expect(standingCrisisNotice("other")).not.toMatch(US_RESOURCE);
    expect(crisisReply(["medical-emergency"], "other")).not.toMatch(US_RESOURCE);
  });

  it("answers a crisis with the crisis reply even if the person asked only to be heard or the companion is off", () => {
    const listened = talk("I only want to be listened to, but I want to die");
    expect(listened.crisis).toBe(true);
    expect(listened.text).not.toMatch(/what else do you want me to hear/i);

    const paused = talk("I have chest pain", { companionEnabled: false, country: "us" });
    expect(paused.crisis).toBe(true);
    expect(paused.text).toMatch(/call 911/i);
    expect(paused.text).not.toMatch(/companion is off/i);
  });
});

describe("emotional wellness companion", () => {
  it("uses the required lines and states the clinical limit", () => {
    expect(HEADLINE).toBe("You don't have to go through this alone.");
    expect(SUPPORTING_LINE).toBe(
      "You deserve to be heard, supported, and treated with kindness. Whatever you are facing, we can take one small step at a time.",
    );
    expect(CLINICAL_REVIEW_NOTICE).toMatch(/has not been reviewed by a licensed clinician/i);
    expect(CLINICAL_REVIEW_NOTICE).toMatch(/must not be called clinically validated/i);
    expect(COMPANION_OPENING).toMatch(/not a person, a therapist, a doctor, or a crisis counselor/i);
    expect(COMPANION_OPENING).toMatch(/does not love you or need you/i);
    expect(COMPANION_OPENING).not.toMatch(LOVE);
    expect(MODEL_SEAM).toBe("off");
  });

  it("asks one question, validates a feeling, and withholds advice when the person only wants to be heard", () => {
    const first = talk("I only want to be listened to. I feel overwhelmed.");
    expect(first.crisis).toBe(false);
    expect(first.mode).toBe("listen");
    expect(first.questionCount).toBe(1);
    expect(first.adviceOffered).toBe(false);
    expect(first.text).toMatch(/overwhelmed|heard/i);
    expect(first.text).not.toMatch(ADVICE);
    expect(first.text).not.toMatch(/small step/i);

    const second = talk("I feel so sad about everything", { mode: first.mode, context: "cancer" });
    expect(second.mode).toBe("listen");
    expect(second.questionCount).toBe(1);
    expect(second.adviceOffered).toBe(false);
    expect(second.text).toMatch(/not a diagnosis/i);
    expect(second.text).not.toMatch(/you have cancer|you should/i);
  });

  it("refuses medication changes, diagnosis, outcome promises, and the idea that emotions caused an illness", () => {
    const medication = talk("Should I change my medication?");
    expect(medication.crisis).toBe(false);
    expect(medication.questionCount).toBe(1);
    expect(medication.text).toMatch(/cannot tell you to start, stop, or change a medication/i);
    expect(medication.text).not.toMatch(/\bstop taking\b|\b\d+\s*mg\b/i);

    const diagnosis = talk("Do I have depression?", { context: "diabetes" });
    expect(diagnosis.text).toMatch(/cannot diagnose/i);
    expect(diagnosis.text).toMatch(/not a diagnosis/i);
    expect(diagnosis.text).not.toMatch(/you have diabetes/i);

    const outcome = talk("Will I survive cancer?");
    expect(outcome.text).toMatch(/cannot promise/i);
    expect(outcome.text).toMatch(/cannot say that emotions caused an illness/i);
    expect(outcome.text).not.toMatch(/you will survive/i);

    const caused = talk("My stress caused my cancer");
    expect(caused.text).toMatch(/do not mean you caused an illness/i);
    expect(caused.text).toMatch(/does not treat emotions as the cause/i);
    expect(caused.text).not.toMatch(/emotions caused your/i);
  });

  it("writes no coaching when replies are paused and the message is not a crisis", () => {
    const paused = talk("I feel sad and I want a plan", { companionEnabled: false });
    expect(paused.crisis).toBe(false);
    expect(paused.text).toMatch(/companion is off/i);
    expect(paused.text).toMatch(/paid-model seam stays off/i);
    expect(paused.questionCount).toBe(0);
    expect(paused.text).not.toMatch(/small step|you should/i);
  });

  it("keeps ordinary replies inside one question and away from prohibited claims", () => {
    const messages = [
      "I feel anxious about treatment",
      "hello",
      "what should I do",
      "I am lonely",
      "this day was hard",
    ];
    const texts = messages.map((message) => talk(message, { context: "treatment" }).text);
    for (const text of texts) {
      expect((text.match(/\?/g) ?? []).length).toBeLessThanOrEqual(1);
      expect(text).not.toMatch(LOVE);
      expect(text).not.toMatch(/you have cancer|emotions caused your|this is clinically validated/i);
      expect(containsProhibitedClaim(text)).toBe(false);
    }
  });
});

describe("emotional wellness exercises, notes, and sources", () => {
  it("includes the optional exercises, a non-breath grounding practice, and a stop", () => {
    expect(EXERCISES.map((item) => item.id)).toEqual([
      "calm",
      "grounding",
      "name-feeling",
      "unhook",
      "kindness",
      "making-room",
      "small-step",
      "one-problem",
      "sleep",
      "gratitude",
    ]);
    const grounding = EXERCISES.find((item) => item.id === "grounding");
    expect(grounding?.breath).toBe("none");
    expect(`${grounding?.summary} ${grounding?.steps.join(" ")}`).toMatch(/does not ask you to breathe/i);
    expect(EXERCISES.find((item) => item.id === "gratitude")?.optional).toBe(true);
    const running = startExercise("calm");
    expect(running?.stepIndex).toBe(0);
    expect(stopExercise()).toBeNull();
    expect(nextExerciseStep(running)?.stepIndex).toBe(1);
    expect(exerciseCopy()).not.toMatch(/A few minutes each day are enough to practice the self-help techniques/);
    expect(exerciseCopy()).not.toMatch(LOVE);
    expect(containsProhibitedClaim(exerciseCopy())).toBe(false);
  });

  it("stores a private journal without a diagnosis field and deletes it", () => {
    const storage = memory();
    const id = createNoteId(1_700_000_000_000, 0.42);
    expect(id).toMatch(/^ew[a-z0-9]{4,40}$/);
    let store = addPrivateNote(emptyEmotionalStore(), "journal", "A heavy afternoon", "2026-11-06T12:00:00.000Z", id);
    store = addPrivateNote(store, "joys", "Warm tea", "2026-11-06T12:04:00.000Z", "ewjoy0001");
    store = addPrivateNote(store, "caregiverNotes", "I need a break tonight", "2026-11-06T12:05:00.000Z", "ewcare001");
    expect(store.journal).toHaveLength(1);
    expect(store.journal[0]).toEqual({ id, createdAt: "2026-11-06T12:00:00.000Z", text: "A heavy afternoon" });
    expect("diagnosis" in store).toBe(false);
    saveEmotionalStore(storage, store);
    expect(loadEmotionalStore(storage).caregiverNotes[0]?.text).toBe("I need a break tonight");
    const removed = removePrivateNote(loadEmotionalStore(storage), "journal", id);
    expect(removed.journal).toEqual([]);
    expect(removed.joys).toHaveLength(1);
    clearEmotionalStorage(storage);
    expect(storage.getItem(EMOTIONAL_STORAGE_KEY)).toBeNull();
    expect(JOURNAL_PRIVACY).toMatch(/not shown to other people/i);
    expect(JOURNAL_PRIVACY).toMatch(/not a diagnosis/i);

    const dirty = sanitizeEmotionalStore({
      context: "not-a-real-context",
      country: "mars",
      journal: [
        {
          id: "ewnote01",
          createdAt: "2026-11-06T12:00:00.000Z",
          text: "heavy day",
          diagnosis: "depression",
        },
      ],
    });
    expect(dirty.context).toBe("general");
    expect(dirty.country).toBe("unset");
    expect(dirty.journal[0]).toEqual({ id: "ewnote01", createdAt: "2026-11-06T12:00:00.000Z", text: "heavy day" });
    expect(JSON.stringify(dirty)).not.toContain("depression");
  });

  it("keeps context chips changeable and does not turn them into a diagnosis", () => {
    expect(CONTEXT_OPTIONS.map((item) => item.id)).toEqual([
      "cancer",
      "treatment",
      "diabetes",
      "chronic",
      "pain",
      "recovery",
      "caregiver",
      "loneliness",
      "general",
    ]);
    const store = { ...emptyEmotionalStore(), context: "pain" as const };
    expect(store.context).toBe("pain");
    expect(JSON.stringify(store)).not.toMatch(/diagnosis/);
    const reply = talk("I hurt today", { context: "pain" });
    expect(reply.text).toMatch(/not a diagnosis/i);
    expect(reply.text).not.toMatch(/you have/i);
  });

  it("lists real organizations and the requested attributions without invented numbers", () => {
    expect(REAL_ORGS.map((org) => org.name)).toEqual([
      "American Cancer Society",
      "Cancer Support Community",
      "American Diabetes Association",
      "NAMI",
      "NIMH",
      "988 Suicide & Crisis Lifeline",
    ]);
    expect(orgPhone(REAL_ORGS[0], "us")).toBe("1-800-227-2345");
    expect(orgPhone(REAL_ORGS[1], "us")).toBe("272-867-5309");
    expect(orgPhone(REAL_ORGS[1], "other")).toBe("888-793-9355");
    expect(orgPhone(REAL_ORGS[2], "unset")).toBe("1-800-342-2383");
    expect(orgPhone(REAL_ORGS[3], "us")).toBe("800-950-6264");
    expect(orgPhone(REAL_ORGS[4], "us")).toBeNull();
    expect(orgPhone(REAL_ORGS[5], "unset")).toBe("988");
    expect(orgPhone(REAL_ORGS[5], "other")).toBeNull();
    expect(orgPhone(REAL_ORGS[0], "other")).toBeNull();
    const phones = REAL_ORGS.flatMap((org) => [org.usPhone, org.otherPhone]).filter(Boolean).join(" ");
    expect(phones).not.toMatch(/555/);
    const titles = ATTRIBUTIONS.map((item) => `${item.name} ${item.title} ${item.url}`).join("\n");
    expect(titles).toMatch(/World Health Organization/);
    expect(titles).toMatch(/Doing What Matters in Times of Stress/);
    expect(titles).toContain("https://www.who.int/publications/i/item/9789240003927");
    expect(titles).toMatch(/ASCO Guideline Update/);
    expect(titles).toContain("https://ascopubs.org/doi/10.1200/JCO.23.00293");
    expect(titles).toMatch(/SIO–ASCO/);
    expect(titles).toContain("https://ascopubs.org/doi/10.1200/JCO.23.00857");
    expect(titles).toMatch(/Standards of Care in Diabetes/);
    expect(titles).toContain("https://professional.diabetes.org/standards-of-care");
    expect(titles).toMatch(/American Psychological Association/);
    expect(titles).toContain("https://www.apa.org/topics/artificial-intelligence-machine-learning/health-advisory-chatbots-wellness-apps");
    expect(titles).toMatch(/National Institute of Mental Health/);
    expect(titles).toContain("https://www.nimh.nih.gov/health/find-help");
    expect(titles).toContain("https://988lifeline.org/");
  });
});
