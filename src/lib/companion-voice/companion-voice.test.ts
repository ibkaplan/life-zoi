import { describe, expect, it } from "vitest";
import { guidedSession, isQuestion, matchCommand, minutesFrom, normalize, PAGES } from "@/lib/companion-voice/commands";
import { greetingFor, helloReply, nextVariant, RETURNING_LINES, spokenName } from "@/lib/companion-voice/greeting";
import { DEFAULT_COMPANION_PREFS, parseCompanionPrefs, serializeCompanionPrefs } from "@/lib/companion-voice/prefs";
import { companionStatus, serverCompanionState } from "@/lib/companion-voice/runtime";

const identity = (text: string, values?: Record<string, string | number>) =>
  values ? text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key])) : text;

function page(text: string) {
  const intent = matchCommand(text, 9);
  return intent.kind === "page" ? PAGES[intent.page].href : intent.kind;
}

describe("voice commands", () => {
  it("normalizes case, accents, and punctuation", () => {
    expect(normalize("  Медитацию!  ")).toBe("медитацию");
    expect(normalize("Διαλογισμός;")).toBe("διαλογισμος");
    expect(normalize("Open MY Day.")).toBe("open my day");
  });

  it("opens the pages from the spec in English", () => {
    expect(page("Open My Day")).toBe("/my-day");
    expect(page("Show my daily plan")).toBe("/my-day");
    expect(page("I want to see my daily plan.")).toBe("/my-day");
    expect(page("Open my health dashboard")).toBe("/dashboard");
    expect(page("Show my meal recommendations")).toBe("/food-plan/today");
    expect(page("Can you recommend something healthy for lunch?")).toBe("/food-plan/today");
    expect(page("What should I eat for breakfast?")).toBe("/food-plan/today");
    expect(page("Open Brain & Habit Quiz")).toBe("/brain-quiz");
    expect(page("Show my progress")).toBe("/progress");
    expect(page("Take me to my wellness encyclopedia")).toBe("/encyclopedia");
    expect(page("Open my sleep recommendations")).toBe("/library/topics/sleep");
    expect(page("Go back to the homepage")).toBe("/");
  });

  it("opens pages in Russian, Ukrainian, and Greek", () => {
    expect(page("Открой мой день")).toBe("/my-day");
    expect(page("Покажи мой прогресс")).toBe("/progress");
    expect(page("Что приготовить на ужин?")).toBe("/food-plan/today");
    expect(page("Відкрий мій день")).toBe("/my-day");
    expect(page("Відкрий енциклопедію")).toBe("/encyclopedia");
    expect(page("Άνοιξε τη μέρα μου")).toBe("/my-day");
    expect(page("Δείξε την πρόοδό μου")).toBe("/progress");
    expect(page("На главную")).toBe("/");
  });

  it("starts guided activities by session id", () => {
    expect(matchCommand("Start Pilates", 9)).toMatchObject({ kind: "guided", activity: "pilates", sessionId: "pilates-gentle" });
    expect(matchCommand("I would like to do Pilates", 9)).toMatchObject({ kind: "guided", sessionId: "pilates-gentle" });
    expect(matchCommand("Start meditation", 8)).toMatchObject({ kind: "guided", sessionId: "meditation-morning-5" });
    expect(matchCommand("Start a ten minute meditation", 21)).toMatchObject({ kind: "guided", sessionId: "meditation-evening-10" });
    expect(matchCommand("Let's do a five-minute breathing exercise.", 14)).toMatchObject({ kind: "guided", sessionId: "breathing-calm" });
    expect(matchCommand("Включи медитацию", 14)).toMatchObject({ kind: "guided", activity: "meditation" });
    expect(matchCommand("Хочу пілатес", 14)).toMatchObject({ kind: "guided", activity: "pilates" });
    expect(matchCommand("Ξεκίνα διαλογισμό", 14)).toMatchObject({ kind: "guided", activity: "meditation" });
    expect(matchCommand("Start yoga", 7)).toMatchObject({ sessionId: "yoga-morning" });
  });

  it("offers instead of starting when the person asks a question", () => {
    expect(matchCommand("How can I relax before going to sleep?", 22)).toMatchObject({ kind: "offer", target: { activity: "relax" } });
  });

  it("plays music by mood", () => {
    expect(matchCommand("Play relaxing music", 12)).toEqual({ kind: "music", category: "meditation" });
    expect(matchCommand("Включи музыку для сна", 12)).toEqual({ kind: "music", category: "sleep" });
    expect(matchCommand("Stop the music", 12)).toEqual({ kind: "music-stop" });
  });

  it("handles conversation", () => {
    expect(matchCommand("Good morning, LifeZoi!", 8).kind).toBe("greeting");
    expect(matchCommand("Доброе утро", 8).kind).toBe("greeting");
    expect(matchCommand("I'm feeling tired", 8)).toEqual({ kind: "feeling", mood: "low" });
    expect(matchCommand("yes please", 8).kind).toBe("yes");
    expect(matchCommand("Да", 8).kind).toBe("yes");
    expect(matchCommand("no", 8).kind).toBe("no");
    expect(matchCommand("stop", 8).kind).toBe("stop");
    expect(matchCommand("Stop listening", 8).kind).toBe("stop");
    expect(matchCommand("thank you", 8).kind).toBe("thanks");
    expect(matchCommand("what can you do", 8).kind).toBe("help");
  });

  it("sends open questions to LifeZoi AI only with the person's yes", () => {
    expect(matchCommand("Tell me something interesting about healthy aging.", 8)).toEqual({ kind: "question", text: "Tell me something interesting about healthy aging." });
    expect(matchCommand("Ask LifeZoi what helps memory", 8)).toEqual({ kind: "ask-ai", question: "what helps memory" });
  });

  it("puts safety first", () => {
    expect(matchCommand("I want to kill myself", 8).kind).toBe("crisis");
    expect(matchCommand("хочу умереть", 8).kind).toBe("crisis");
  });

  it("reads meditation lengths", () => {
    expect(minutesFrom("twenty minutes")).toBe(20);
    expect(minutesFrom("12 minutes")).toBe(10);
    expect(minutesFrom("пятнадцать минут")).toBe(15);
    expect(minutesFrom("")).toBe(5);
    expect(guidedSession("meditation", "meditation for sleep", 23)).toBe("meditation-sleep-5");
    expect(guidedSession("meditation", "stress meditation 3 minutes", 13)).toBe("meditation-stress-3");
  });

  it("tells questions from commands", () => {
    expect(isQuestion("What should I eat?")).toBe(true);
    expect(isQuestion("Как расслабиться")).toBe(true);
    expect(isQuestion("Open My Day")).toBe(false);
  });
});

describe("welcome", () => {
  it("asks a new person to complete their profile", () => {
    const greeting = greetingFor({ hasProfile: false, name: "Tatyana", hour: 9, variant: 0, t: identity });
    expect(greeting.needsProfile).toBe(true);
    expect(greeting.text).toContain("Please complete your profile");
    expect(greeting.text).not.toContain("Tatyana");
  });

  it("greets a returning person by the name they typed, by time of day, without asking for the profile again", () => {
    const morning = greetingFor({ hasProfile: true, name: "Tatyana Ivanova", hour: 8, variant: 0, t: identity });
    expect(morning.text.startsWith("Good morning, Tatyana!")).toBe(true);
    expect(morning.needsProfile).toBe(false);
    expect(morning.text).not.toContain("complete your profile");
    expect(greetingFor({ hasProfile: true, name: "Tatyana", hour: 14, variant: 1, t: identity }).text.startsWith("Good afternoon, Tatyana!")).toBe(true);
    expect(greetingFor({ hasProfile: true, name: "", hour: 20, variant: 2, t: identity }).text.startsWith("Good evening!")).toBe(true);
  });

  it("never says the sample visitor's name", () => {
    expect(spokenName("Sample visitor")).toBeNull();
    expect(spokenName("  ")).toBeNull();
  });

  it("varies the welcome line", () => {
    for (let previous = 0; previous < RETURNING_LINES.length; previous += 1) {
      for (const random of [0, 0.3, 0.6, 0.99]) expect(nextVariant(previous, random)).not.toBe(previous);
    }
    expect(helloReply(9, identity)).toContain("How are you feeling?");
  });
});

describe("companion prefs and status", () => {
  it("starts with the welcome panel, voice on, microphone off", () => {
    expect(parseCompanionPrefs(null)).toEqual(DEFAULT_COMPANION_PREFS);
    expect(parseCompanionPrefs("not json")).toEqual(DEFAULT_COMPANION_PREFS);
    expect(DEFAULT_COMPANION_PREFS.mic).toBe("none");
    expect(DEFAULT_COMPANION_PREFS.handsFree).toBe(false);
  });

  it("keeps hands-free off without a microphone choice", () => {
    expect(parseCompanionPrefs(JSON.stringify({ handsFree: true, mic: "none" })).handsFree).toBe(false);
    const saved = { ...DEFAULT_COMPANION_PREFS, setup: "done" as const, handsFree: true, mic: "local" as const };
    expect(parseCompanionPrefs(serializeCompanionPrefs(saved))).toEqual(saved);
  });

  it("never claims to listen when it is not", () => {
    const base = serverCompanionState();
    expect(companionStatus(base, false)).toBe("ready");
    expect(companionStatus(base, true)).toBe("speaking");
    expect(companionStatus({ ...base, listening: true }, false)).toBe("listening");
    expect(companionStatus({ ...base, prefs: { ...base.prefs, handsFree: true, mic: "browser" } }, false)).toBe("paused");
    expect(companionStatus({ ...base, prefs: { ...base.prefs, voiceOutput: false } }, false)).toBe("off");
  });
});
