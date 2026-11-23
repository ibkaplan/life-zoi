import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ARTICLES, articleBySlug, recommendArticles } from "@/lib/mind/articles";
import { GAD7, INSTRUMENTS, NOT_INCLUDED, PHQ9, compareResults, scoreInstrument } from "@/lib/mind/assessments";
import { initialConversation, respond, resultOpening, type ConversationState } from "@/lib/mind/conversation";
import { exerciseById, MIND_EXERCISES, planExercise, plannedSeconds } from "@/lib/mind/exercises";
import { buildPlan, PLAN_DAYS, updatePlanDay } from "@/lib/mind/plan";
import { emptyProgress, parseProgress, sanitizeProgress, daysUntilRepeat } from "@/lib/mind/progress";
import { activeProvider, EVALUATED_PROVIDERS } from "@/lib/mind/provider";
import { REFLECTIONS, summarizeReflection, REFLECTION_LABEL } from "@/lib/mind/reflections";
import { checkSafety } from "@/lib/mind/safety";
import { TOPICS } from "@/lib/mind/topics";
import { listenErrorMessage, mapError } from "@/lib/mind/speech";

function talk(messages: string[], start: ConversationState = initialConversation()) {
  let state = start;
  const replies = [];
  for (const message of messages) {
    const turn = respond(state, message);
    state = turn.state;
    replies.push(turn.reply);
  }
  return { state, replies };
}

describe("LifeZoi Mind conversation", () => {
  it("answers the manager example with empathy and a specific follow-up question", () => {
    const { replies } = talk(["I had a terrible day. My manager criticized me in front of everyone, and now I cannot stop thinking about it."]);
    expect(replies[0].kind).toBe("reply");
    expect(replies[0].text).toContain("I'm sorry that happened.");
    expect(replies[0].text).toContain("What bothered you most: the way your manager spoke to you, the fact that other people were present, or the feeling that you were treated unfairly?");
    expect(replies[0].quickReplies).toContain("Other people were there");
  });

  it("follows up on the part the person chose, then offers perspective, then next steps with exercises", () => {
    const { replies, state } = talk([
      "My manager criticized me in front of everyone today.",
      "The fact that other people were there",
      "I imagine they think I'm bad at my job",
      "I'd like to talk to him calmly",
    ]);
    expect(replies[1].text).toMatch(/colleagues/);
    expect(replies[1].text).toMatch(/\?$/);
    expect(replies[2].text).toMatch(/separate three things/);
    expect(replies[3].exercises).toEqual(["paced-breathing", "thought-reframing", "i-statements"]);
    expect(replies[3].exerciseWhy).toBeTruthy();
    expect(replies[3].articles.length).toBeGreaterThan(0);
    expect(state.step).toBe(4);
    for (const reply of replies) for (const id of reply.exercises) expect(exerciseById(id), id).not.toBeNull();
  });

  it("does not repeat the same open question in later turns", () => {
    const { replies } = talk(["I feel lonely", "Few people around me", "I used to have my wife", "maybe call my neighbor", "ok", "I guess", "hmm", "yes"]);
    const later = replies.slice(4).map((reply) => reply.text);
    expect(new Set(later).size).toBe(later.length);
  });

  it("does not agree with resentment or take sides", () => {
    const { replies } = talk(["I want revenge on my boss, he is an idiot"]);
    expect(replies[0].text).not.toMatch(/you're right|he is an idiot|you should get/i);
    expect(replies[0].text).toMatch(/resentment/);
    const agree = talk(["My sister was so unfair to me, am I right?"]).replies[0];
    expect(agree.text).toMatch(/only know your side/);
  });

  it("stops ordinary coaching for crisis messages and gives 988 and 911", () => {
    for (const message of ["I want to kill myself", "I've been thinking about suicide", "I am going to hurt myself tonight", "everyone would be better off without me"]) {
      const reply = respond(initialConversation(), message).reply;
      expect(reply.kind, message).toBe("crisis");
      expect(reply.text).toMatch(/988/);
      expect(reply.text).toMatch(/911/);
      expect(reply.exercises).toEqual([]);
      expect(reply.quickReplies).toEqual([]);
    }
    const others = respond(initialConversation(), "I'm going to hurt him").reply;
    expect(others.kind).toBe("crisis");
    expect(others.text).toMatch(/911/);
  });

  it("keeps crisis handling in the middle of a topic flow", () => {
    const { replies } = talk(["my manager yelled at me in front of everyone", "I want to end my life"]);
    expect(replies[1].kind).toBe("crisis");
  });

  it("does not treat a negated mention as a crisis", () => {
    expect(checkSafety("I would never hurt myself, I'm just tired").level).not.toBe("crisis");
  });

  it("adds a 988 note for severe distress but keeps listening", () => {
    const reply = respond(initialConversation(), "I can't take it anymore, work is too much").reply;
    expect(reply.kind).toBe("reply");
    expect(reply.distress).toBe(true);
    expect(reply.text).toMatch(/988/);
  });

  it("refuses diagnosis and medication changes, and never advises stopping treatment", () => {
    const diagnosis = respond(initialConversation(), "Do I have depression?").reply;
    expect(diagnosis.kind).toBe("boundary");
    expect(diagnosis.text).toMatch(/can't diagnose/);
    const meds = respond(initialConversation(), "Should I stop taking my antidepressants?").reply;
    expect(meds.kind).toBe("boundary");
    expect(meds.text).toMatch(/not to stop a prescribed medicine without talking/);
    expect(meds.text).not.toMatch(/you (can|should) stop/i);
  });

  it("is honest about what it is", () => {
    const reply = respond(initialConversation(), "Are you a real therapist?").reply;
    expect(reply.text).toMatch(/not a person, a therapist, or a doctor/);
    expect(reply.text).toMatch(/not generated by an AI model/);
  });

  it("answers questions from the encyclopedia with article recommendations", () => {
    const reply = respond(initialConversation(), "What is mindfulness?").reply;
    expect(reply.kind).toBe("answer");
    expect(reply.articles[0]).toBe("mindfulness");
  });

  it("suggests professional help when problems last or affect daily life", () => {
    const reply = respond(initialConversation(), "I've felt sad every day for months and can't work").reply;
    expect(reply.text).toMatch(/doctor or a mental health professional/);
  });

  it("never uses dismissive stock phrases", () => {
    const banned = /\b(cheer up|calm down|everything happens for a reason|just think positive|don'?t worry|it could be worse|get over it)\b/i;
    const texts = TOPICS.flatMap((topic) => [topic.open, topic.perspective, topic.nextSteps, ...topic.facets.flatMap((f) => [f.reply, f.question])]);
    for (const text of texts) expect(text, text).not.toMatch(banned);
  });

  it("explains a questionnaire result without calling it a diagnosis, and asks the follow-up questions one at a time", () => {
    const opening = resultOpening({ instrument: "gad7", band: "Moderate", total: 12, suggestFollowUp: true, item9Positive: false });
    expect(opening.text).toMatch(/may be experiencing elevated anxiety symptoms/);
    expect(opening.text).toMatch(/cannot diagnose a condition/);
    expect(opening.text).toMatch(/Would you like to explore what may be contributing/);
    const start = initialConversation({ instrument: "gad7", band: "Moderate", total: 12, suggestFollowUp: true, item9Positive: false });
    const { replies } = talk(["Yes, let's explore", "Meetings at work", "Most days, for hours", "Yes, I wake up worrying", "Not really", "My job"], start);
    expect(replies[0].text).toMatch(/What situations tend to make you feel anxious\?/);
    expect(replies[1].text).toMatch(/How often/);
    expect(replies[2].text).toMatch(/sleep/);
    expect(replies[3].text).toMatch(/relax/);
    expect(replies[4].text).toMatch(/events or relationships/);
    expect(replies[5].exercises.length).toBeGreaterThan(0);
    expect(replies[5].text).toMatch(/doctor or mental health professional/);
  });

  it("respects a person who does not want to explore their result", () => {
    const start = initialConversation({ instrument: "phq9", band: "Mild", total: 6, suggestFollowUp: false, item9Positive: false });
    const reply = respond(start, "Not right now").reply;
    expect(reply.text).toMatch(/completely fine/);
  });
});

describe("validated questionnaires", () => {
  it("includes only PHQ-9 and GAD-7, and says why PSS and ISI are not shown", () => {
    expect(INSTRUMENTS.map((instrument) => instrument.id).sort()).toEqual(["gad7", "phq9"]);
    expect(NOT_INCLUDED.map((entry) => entry.name).join(" ")).toMatch(/Perceived Stress Scale.*Insomnia Severity Index/);
    for (const instrument of INSTRUMENTS) expect(instrument.permission).toMatch(/No permission required/);
  });

  it("keeps the published item counts, options, and time frame", () => {
    expect(PHQ9.items).toHaveLength(9);
    expect(GAD7.items).toHaveLength(7);
    for (const instrument of INSTRUMENTS) {
      expect(instrument.options.map((option) => option.label)).toEqual(["Not at all", "Several days", "More than half the days", "Nearly every day"]);
      expect(instrument.stem).toMatch(/^Over the last 2 weeks/);
    }
    expect(PHQ9.items[8]).toBe("Thoughts that you would be better off dead or of hurting yourself in some way");
  });

  it("scores PHQ-9 with the published bands", () => {
    const cases: [number[], number, string][] = [
      [[0, 0, 0, 0, 0, 0, 0, 0, 0], 0, "Minimal"],
      [[1, 1, 1, 1, 0, 0, 0, 0, 0], 4, "Minimal"],
      [[1, 1, 1, 1, 1, 0, 0, 0, 0], 5, "Mild"],
      [[2, 2, 2, 2, 1, 0, 0, 0, 0], 9, "Mild"],
      [[2, 2, 2, 2, 2, 0, 0, 0, 0], 10, "Moderate"],
      [[2, 2, 2, 2, 2, 2, 2, 0, 0], 14, "Moderate"],
      [[3, 3, 3, 3, 3, 0, 0, 0, 0], 15, "Moderately severe"],
      [[3, 3, 3, 3, 3, 2, 2, 0, 0], 19, "Moderately severe"],
      [[3, 3, 3, 3, 3, 3, 2, 0, 0], 20, "Severe"],
      [[3, 3, 3, 3, 3, 3, 3, 3, 3], 27, "Severe"],
    ];
    for (const [answers, total, band] of cases) {
      const result = scoreInstrument(PHQ9, answers);
      expect(result?.total).toBe(total);
      expect(result?.band.label).toBe(band);
      expect(result?.suggestFollowUp).toBe(total >= 10);
    }
  });

  it("scores GAD-7 with the published bands", () => {
    const cases: [number[], number, string][] = [
      [[0, 0, 0, 0, 0, 0, 0], 0, "Minimal"],
      [[1, 1, 1, 1, 0, 0, 0], 4, "Minimal"],
      [[1, 1, 1, 1, 1, 0, 0], 5, "Mild"],
      [[2, 2, 2, 2, 1, 0, 0], 9, "Mild"],
      [[2, 2, 2, 2, 2, 0, 0], 10, "Moderate"],
      [[2, 2, 2, 2, 2, 2, 2], 14, "Moderate"],
      [[3, 3, 3, 3, 3, 0, 0], 15, "Severe"],
      [[3, 3, 3, 3, 3, 3, 3], 21, "Severe"],
    ];
    for (const [answers, total, band] of cases) {
      const result = scoreInstrument(GAD7, answers);
      expect(result?.total).toBe(total);
      expect(result?.band.label).toBe(band);
    }
  });

  it("flags any positive answer on PHQ-9 item 9, whatever the total", () => {
    const low = scoreInstrument(PHQ9, [0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(low?.band.label).toBe("Minimal");
    expect(low?.item9Positive).toBe(true);
    expect(scoreInstrument(PHQ9, [1, 1, 1, 1, 1, 1, 1, 1, 0])?.item9Positive).toBe(false);
    expect(scoreInstrument(GAD7, [3, 3, 3, 3, 3, 3, 3])?.item9Positive).toBe(false);
  });

  it("refuses incomplete or invalid answers", () => {
    expect(scoreInstrument(GAD7, [1, 1, 1])).toBeNull();
    expect(scoreInstrument(GAD7, [1, 1, 1, 1, 1, 1, null])).toBeNull();
    expect(scoreInstrument(GAD7, [1, 1, 1, 1, 1, 1, 4])).toBeNull();
    expect(scoreInstrument(GAD7, [1, 1, 1, 1, 1, 1, 1.5])).toBeNull();
  });

  it("does not call a small change improvement or worsening", () => {
    expect(compareResults(PHQ9, 7, 6)).toMatch(/does not show that things are better or worse/);
    expect(compareResults(PHQ9, 16, 8)).toMatch(/not proof of recovery/);
    expect(compareResults(GAD7, 4, 12)).toMatch(/cannot tell you why/);
  });
});

describe("self-reflection questionnaires", () => {
  it("are labeled as educational and give no score", () => {
    expect(REFLECTION_LABEL).toMatch(/not a clinically validated test/);
    const summary = summarizeReflection(REFLECTIONS[0], [2, 0, 1, 2, 0]);
    expect(summary).not.toHaveProperty("total");
    expect(summary.worthAttention).toContain("I feel there is more to do than I can manage.");
    expect(summary.worthAttention).toContain("I have time for things that help me recharge.");
  });

  it("cover the requested topics and only point at real exercises and articles", () => {
    expect(REFLECTIONS.map((entry) => entry.id)).toEqual(["stress", "sleep", "self-esteem", "emotional-regulation", "burnout", "relationships", "boundaries", "wellbeing"]);
    for (const entry of REFLECTIONS) {
      for (const id of entry.exercises) expect(exerciseById(id), id).not.toBeNull();
      for (const slug of entry.articles) expect(articleBySlug(slug), slug).not.toBeNull();
    }
  });
});

describe("exercises, plan, and encyclopedia", () => {
  it("builds exercises close to the chosen length", () => {
    for (const exercise of MIND_EXERCISES) {
      for (const minutes of exercise.lengths) {
        const seconds = plannedSeconds(planExercise(exercise, minutes));
        expect(seconds, `${exercise.id} ${minutes}`).toBeGreaterThan(minutes * 60 * 0.5);
        expect(seconds, `${exercise.id} ${minutes}`).toBeLessThan(minutes * 60 * 1.8);
      }
    }
  });

  it("builds a 7-day plan from goals that can be skipped, repeated, and changed", () => {
    const plan = buildPlan(["sleep"], "2026-11-22T10:00:00.000Z");
    expect(plan.days).toHaveLength(7);
    expect(plan.days[1].exercise).toBe("progressive-muscle-relaxation");
    let next = updatePlanDay(plan, 0, "done");
    next = updatePlanDay(next, 0, "repeat");
    next = updatePlanDay(next, 1, "skip");
    next = updatePlanDay(next, 2, { exercise: "worry-time" });
    next = updatePlanDay(next, 3, { exercise: "not-an-option" });
    expect(next.days[0]).toMatchObject({ status: "done", doneCount: 2 });
    expect(next.days[1].status).toBe("skipped");
    expect(next.days[2].exercise).toBe("worry-time");
    expect(next.days[3].exercise).toBe(plan.days[3].exercise);
    for (const day of PLAN_DAYS) {
      expect(articleBySlug(day.article), day.article).not.toBeNull();
      for (const option of day.options) expect(exerciseById(option.exercise), option.exercise).not.toBeNull();
    }
  });

  it("has the requested encyclopedia topics, each with references, examples, and reading time", () => {
    expect(ARTICLES.length).toBe(15);
    for (const article of ARTICLES) {
      expect(article.references.length, article.slug).toBeGreaterThan(0);
      for (const ref of article.references) expect(ref.url).toMatch(/^https:\/\/(www\.)?(nimh\.nih\.gov|apa\.org|pubmed\.ncbi\.nlm\.nih\.gov|cdc\.gov|nccih\.nih\.gov|nhlbi\.nih\.gov|nia\.nih\.gov|hhs\.gov)\//);
      expect(article.minutes).toBeGreaterThan(0);
      expect(article.example.text.length).toBeGreaterThan(20);
      for (const id of article.exercises) expect(exerciseById(id), id).not.toBeNull();
    }
    expect(recommendArticles("I can't sleep at night")[0].slug).toBe("sleep-and-mental-health");
  });

  it("only links topics and questionnaires to articles and exercises that exist", () => {
    for (const topic of TOPICS) {
      for (const slug of topic.articles) expect(articleBySlug(slug), slug).not.toBeNull();
      for (const id of topic.exercises) expect(exerciseById(id), id).not.toBeNull();
    }
    for (const instrument of INSTRUMENTS) {
      for (const slug of instrument.articles) expect(articleBySlug(slug), slug).not.toBeNull();
      for (const id of instrument.exercises) expect(exerciseById(id), id).not.toBeNull();
    }
  });
});

describe("privacy and providers", () => {
  it("uses the in-browser rules provider and sends nothing", () => {
    expect(activeProvider().info).toMatchObject({ id: "rules", sendsText: false, status: "active" });
    for (const provider of EVALUATED_PROVIDERS) expect(provider.status).not.toBe("active");
  });

  it("drops broken stored progress instead of trusting it", () => {
    expect(parseProgress("not json")).toEqual(emptyProgress());
    const cleaned = sanitizeProgress({
      results: [
        { id: "a", instrument: "phq9", total: 8, band: "Mild", date: "2026-11-01", item9Positive: false },
        { id: "b", instrument: "pss", total: 8, band: "x", date: "2026-11-01" },
        { id: "c", instrument: "gad7", total: 99, band: "x", date: "2026-11-01" },
      ],
      exercises: [{ id: "e", exercise: "paced-breathing", minutes: 5, date: "2026-11-02" }, { nope: true }],
      plan: { goals: ["sleep", "hack"], startedAt: "2026-11-01", days: [1, 2] },
    });
    expect(cleaned.results.map((result) => result.id)).toEqual(["a"]);
    expect(cleaned.exercises).toHaveLength(1);
    expect(cleaned.plan).toBeNull();
  });

  it("waits two weeks before suggesting a repeat questionnaire", () => {
    expect(daysUntilRepeat("2026-11-20T00:00:00Z", 14, new Date("2026-11-22T00:00:00Z"))).toBe(12);
    expect(daysUntilRepeat("2026-11-01T00:00:00Z", 14, new Date("2026-11-22T00:00:00Z"))).toBe(0);
  });

  it("does not claim HIPAA compliance or call an outside service from Mind code", () => {
    const dirs = [__dirname, join(__dirname, "..", "..", "components", "mind")];
    for (const dir of dirs) {
      let files: string[] = [];
      try {
        files = readdirSync(dir).filter((name) => /\.tsx?$/.test(name) && !name.endsWith(".test.ts"));
      } catch {
        continue;
      }
      for (const name of files) {
        const code = readFileSync(join(dir, name), "utf8");
        expect(code, name).not.toMatch(/HIPAA[- ]compliant|GDPR[- ]compliant|is compliant with/i);
        expect(code, name).not.toMatch(/\bfetch\(/);
      }
    }
  });
});

describe("microphone access", () => {
  it("allows the microphone for this site in the Permissions-Policy header", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toMatch(/microphone=\(self\)/);
    expect(config).not.toMatch(/microphone=\(\)/);
    expect(config).toMatch(/camera=\(\)/);
  });

  it("tells a browser block apart from a site block and a speech-service block", () => {
    expect(mapError("not-allowed", false, false)).toBe("denied");
    expect(mapError("not-allowed", false, true)).toBe("site-blocked");
    expect(mapError("service-not-allowed", false, false)).toBe("service-blocked");
    expect(mapError("service-not-allowed", true, false)).toBe("local-unavailable");
    expect(mapError("audio-capture", false, false)).toBe("no-microphone");
    for (const kind of ["denied", "site-blocked", "service-blocked"] as const) {
      expect(listenErrorMessage(kind)).toMatch(/\btyp(e|ing)\b/i);
    }
  });
});

describe("crisis wording in other languages", () => {
  it("catches suicide, self-harm, and medical emergencies typed in Russian, Ukrainian, or Greek", () => {
    for (const text of ["Я не хочу жить", "хочу умереть", "Я хочу покінчити з собою", "Δεν θέλω να ζω", "думаю о самоубийстве"]) {
      const result = checkSafety(text);
      expect(result.level, text).toBe("crisis");
      expect(result.kinds, text).toContain("suicide");
    }
    expect(checkSafety("Хочу порезать себя").kinds).toContain("self-harm");
    expect(checkSafety("У меня сильная боль в груди и трудно дышать").kinds).toContain("medical-emergency");
    const reply = respond(initialConversation(), "Я не хочу жить").reply;
    expect(reply.kind).toBe("crisis");
    expect(reply.text).toMatch(/988/);
  });

  it("leaves ordinary Russian messages alone", () => {
    expect(checkSafety("У меня был тяжёлый день на работе").level).toBe("none");
  });
});
