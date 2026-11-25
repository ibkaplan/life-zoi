import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allAchievements, awardAchievements } from "@/lib/growth-academy/achievements";
import { challengeFor, DAILY_CHALLENGES } from "@/lib/growth-academy/challenges";
import { GROWTH_COURSES, growthCourse, lessonPath } from "@/lib/growth-academy/catalog";
import { containsPhrase, cuePhrases, practiceFeedback, words } from "@/lib/growth-academy/feedback";
import { cueKey } from "@/lib/growth-academy/lesson-text";
import ukCatalog from "@/lib/i18n/catalog/uk";
import ruCatalog from "@/lib/i18n/catalog/ru";
import elCatalog from "@/lib/i18n/catalog/el";
import {
  clearSavedText,
  completeChallenge,
  completeLesson,
  courseProgress,
  emptyAcademy,
  isCourseComplete,
  journeySummary,
  learningStreak,
  lessonStatus,
  openLesson,
  sanitizeAcademy,
  saveAnswers,
  savePractice,
  saveReflections,
  setExerciseDone,
  setPart,
  setVoicePref,
  TEXT_LIMIT,
  type AcademyState,
} from "@/lib/growth-academy/progress";
import { fitAcademy, mergeAcademy } from "@/lib/growth-academy/store";
import { NAV_SECTIONS, FOOTER_LINKS } from "@/lib/navigation";
import type { GrowthCourse, GrowthLesson } from "@/lib/growth-academy/types";

const day = (n: number) => `2026-11-${String(n).padStart(2, "0")}`;
const clock = (n: number) => ({ today: day(n) });
const course = (id: string) => growthCourse(id) as GrowthCourse;
const lesson = (c: GrowthCourse, n: number) => c.lessons[n - 1] as GrowthLesson;

/** Award like the store does after every change. */
function award(state: AcademyState, today = day(24)) {
  return awardAchievements(state, GROWTH_COURSES, today).state;
}

function completeFirst(state: AcademyState, c: GrowthCourse, count: number, today = 10): AcademyState {
  let next = state;
  for (const l of c.lessons.slice(0, count)) next = award(completeLesson(openLesson(next, c, l, clock(today)), c, l, clock(today)));
  return next;
}

const countWords = (l: GrowthLesson) =>
  [
    ...l.intro,
    ...l.learn.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])]),
    l.example.title,
    ...l.example.story,
    l.example.point,
    l.exercise.title,
    ...l.exercise.steps,
    l.practice.prompt,
    ...l.practice.examples.flatMap((e) => [e.text, e.why]),
    ...l.practice.lookFors,
    ...l.reflection,
    ...l.takeaways,
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

describe("Test 1: course availability", () => {
  it("has the five courses in order, each with ten lessons", () => {
    expect(GROWTH_COURSES.map((c) => c.id)).toEqual(["confidence", "mindfulness", "communication", "emotional-intelligence", "resilience"]);
    expect(GROWTH_COURSES.map((c) => c.title)).toEqual([
      "Confidence & Self-Esteem Training",
      "Mindfulness Training",
      "Communication Skills Training",
      "Emotional Intelligence Training",
      "Resilience & Motivation Training",
    ]);
    for (const c of GROWTH_COURSES) expect(c.lessons).toHaveLength(10);
    expect(GROWTH_COURSES.flatMap((c) => c.lessons)).toHaveLength(50);
  });

  it("has the Academy pages and lists them in the menu and footer", () => {
    const app = join(__dirname, "..", "..", "app", "(members)", "training-academy");
    for (const page of ["page.tsx", "journey/page.tsx", "[course]/page.tsx", "[course]/[lesson]/page.tsx", "[course]/summary/page.tsx"]) expect(existsSync(join(app, page)), page).toBe(true);
    const brain = NAV_SECTIONS.find((s) => s.key === "brain");
    expect(brain?.pages.map((p) => p.href)).toContain("/training-academy");
    expect(FOOTER_LINKS.map((p) => p.href)).toEqual(expect.arrayContaining(["/training-academy", "/training-academy/journey"]));
  });

  it("gives every course the fields a new course needs", () => {
    for (const c of GROWTH_COURSES) {
      expect(c.title && c.description && c.goal && c.tagline && c.shortTitle).toBeTruthy();
      expect(c.objectives.length).toBeGreaterThanOrEqual(3);
      expect(["beginner", "intermediate", "advanced"]).toContain(c.difficulty);
      expect(c.cover).toBeTruthy();
      expect(c.colors[0]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(c.achievement.id).toMatch(/^[a-z-]+$/);
    }
    expect(new Set(GROWTH_COURSES.map((c) => c.achievement.id)).size).toBe(5);
  });
});

describe("Test 2: lesson content", () => {
  const lessons = GROWTH_COURSES.flatMap((c) => c.lessons.map((l) => ({ c, l })));

  it("numbers lessons 1 to 10 with ids that match their course", () => {
    for (const c of GROWTH_COURSES)
      c.lessons.forEach((l, i) => {
        expect(l.number).toBe(i + 1);
        expect(l.id).toBe(`${c.id}-${String(i + 1).padStart(2, "0")}`);
      });
  });

  it.each(lessons.map(({ c, l }) => [l.id, c, l] as const))("%s has all eight parts with real content", (_id, _c, l) => {
    expect(l.title.length).toBeGreaterThan(3);
    expect(l.skill.length).toBeGreaterThan(20);
    expect(l.minutes).toBeGreaterThanOrEqual(5);
    expect(l.minutes).toBeLessThanOrEqual(10);
    expect(l.intro.length).toBeGreaterThanOrEqual(1);
    expect(l.learn.length).toBeGreaterThanOrEqual(2);
    for (const section of l.learn) expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
    expect(l.example.story.length).toBeGreaterThanOrEqual(1);
    expect(l.example.point.length).toBeGreaterThan(10);
    expect(l.exercise.steps.length).toBeGreaterThanOrEqual(2);
    expect(l.exercise.fields.length).toBeGreaterThanOrEqual(1);
    expect(new Set(l.exercise.fields.map((f) => f.id)).size).toBe(l.exercise.fields.length);
    for (const f of l.exercise.fields) expect(f.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
    expect(l.practice.prompt.length).toBeGreaterThan(20);
    expect(l.practice.examples.length).toBeGreaterThanOrEqual(2);
    expect(l.practice.lookFors.length).toBeGreaterThanOrEqual(2);
    expect(l.reflection.length).toBeGreaterThanOrEqual(2);
    expect(l.takeaways.length).toBeGreaterThanOrEqual(3);
    expect(countWords(l)).toBeGreaterThanOrEqual(600);
  });

  it("teaches a different thing in every lesson", () => {
    const all = lessons.map(({ l }) => l);
    for (const key of ["title", "skill"] as const) expect(new Set(all.map((l) => l[key])).size).toBe(50);
    expect(new Set(all.map((l) => l.practice.prompt)).size).toBe(50);
    expect(new Set(all.map((l) => l.example.title)).size).toBe(50);
    expect(new Set(all.map((l) => l.intro[0])).size).toBe(50);
  });

  it("makes no statistical or medical claims", () => {
    const text = JSON.stringify(GROWTH_COURSES);
    expect(text).not.toMatch(/\d+\s?%|percent|studies show|research shows|proven to|(?<!not )guarantee|\bcure/i);
  });

  it("adds a care note to lessons about anger, anxiety, stress, and difficult conversations", () => {
    const needCare = ["emotional-intelligence-04", "emotional-intelligence-05", "mindfulness-07", "communication-07", "confidence-08"];
    for (const id of needCare) {
      const found = lessons.find(({ l }) => l.id === id)?.l;
      expect(found?.care, id).toMatch(/professional|doctor|help|support service|emergency/i);
    }
  });

  it("includes the scenarios named in the brief", () => {
    const prompts = lessons.map(({ l }) => l.practice.prompt).join("\n");
    expect(prompts).toMatch(/group conversation/i);
    expect(prompts).toMatch(/interrupts you/i);
    expect(prompts).toMatch(/three slow breaths/i);
    expect(prompts).toMatch(/friend makes a comment that upsets you/i);
    expect(prompts).toMatch(/postponed an important goal/i);
  });
});

describe("Test 3: start a course", () => {
  it.each(GROWTH_COURSES.map((c) => [c.id, c] as const))("opening lesson 1 of %s starts the course but completes nothing", (_id, c) => {
    const state = openLesson(emptyAcademy(), c, lesson(c, 1), clock(1));
    expect(lessonStatus(state, lesson(c, 1).id)).toBe("in-progress");
    const progress = courseProgress(state, c);
    expect(progress.started).toBe(true);
    expect(progress.startedOn).toBe(day(1));
    expect(progress.completed).toBe(0);
    expect(progress.next.number).toBe(1);
    expect(lessonPath(c, progress.next)).toBe(`/training-academy/${c.id}/lesson-1`);
  });
});

describe("Test 4: lesson completion", () => {
  const c = course("confidence");
  const l = lesson(c, 1);

  it("only Complete lesson marks a lesson completed", () => {
    let state = openLesson(emptyAcademy(), c, l, clock(2));
    for (let part = 0; part < 7; part += 1) state = setPart(state, c, l, part, clock(2));
    state = setExerciseDone(state, c, l, true, clock(2));
    state = saveReflections(state, c, l, ["I am patient."], clock(2));
    expect(lessonStatus(state, l.id)).toBe("in-progress");
    state = completeLesson(state, c, l, clock(3));
    expect(lessonStatus(state, l.id)).toBe("completed");
    expect(state.lessons[l.id]?.completedOn).toBe(day(3));
  });

  it("completing again keeps the first completion date", () => {
    let state = completeLesson(openLesson(emptyAcademy(), c, l, clock(2)), c, l, clock(3));
    state = completeLesson(state, c, l, clock(9));
    expect(state.lessons[l.id]?.completedOn).toBe(day(3));
    expect(state.history.filter((h) => h.kind === "completed-lesson")).toHaveLength(1);
  });

  it("refuses a lesson from another course", () => {
    const other = lesson(course("mindfulness"), 1);
    expect(completeLesson(emptyAcademy(), c, other, clock(2))).toEqual(emptyAcademy());
  });
});

describe("Test 5: progress calculation", () => {
  it("matches the dashboard example from completed lessons", () => {
    let state = emptyAcademy();
    state = completeFirst(state, course("confidence"), 7);
    state = completeFirst(state, course("mindfulness"), 3);
    state = completeFirst(state, course("emotional-intelligence"), 5);
    state = completeFirst(state, course("resilience"), 2);
    const shown = GROWTH_COURSES.map((c) => {
      const p = courseProgress(state, c);
      return `${p.completed}/${p.total} ${p.completed ? `${p.percent}%` : "Not started"}`;
    });
    expect(shown).toEqual(["7/10 70%", "3/10 30%", "0/10 Not started", "5/10 50%", "2/10 20%"]);
    const summary = journeySummary(state, GROWTH_COURSES, day(10));
    expect(summary.lessonsCompleted).toBe(17);
    expect(summary.lessonsRemaining).toBe(33);
    expect(summary.coursesStarted).toBe(4);
    expect(summary.coursesCompleted).toBe(0);
  });

  it("counts a lesson that was opened but not completed as in progress, not done", () => {
    const c = course("communication");
    const state = openLesson(emptyAcademy(), c, lesson(c, 4), clock(5));
    expect(courseProgress(state, c)).toMatchObject({ completed: 0, percent: 0, started: true });
  });
});

describe("Test 6: returning user", () => {
  it("continues at the lesson and part where the person left", () => {
    const c = course("mindfulness");
    let state = completeFirst(emptyAcademy(), c, 3, 4);
    state = openLesson(state, c, lesson(c, 4), clock(5));
    state = setPart(state, c, lesson(c, 4), 3, clock(5));
    state = saveAnswers(state, c, lesson(c, 4), { [lesson(c, 4).exercise.fields[0]!.id]: "Tight shoulders" }, clock(5));
    // Leave and come back another day: the saved copy is read again.
    const back = sanitizeAcademy(JSON.parse(JSON.stringify(state)));
    const progress = courseProgress(back, c);
    expect(progress.next.number).toBe(4);
    expect(back.lessons[lesson(c, 4).id]?.part).toBe(3);
    expect(Object.values(back.lessons[lesson(c, 4).id]?.answers ?? {})).toEqual(["Tight shoulders"]);
    const summary = journeySummary(back, GROWTH_COURSES, day(6));
    expect(summary.continueAt?.course.id).toBe("mindfulness");
    expect(summary.continueAt?.lesson.number).toBe(4);
  });

  it("after a completed lesson, continue goes to the next one not completed", () => {
    const c = course("resilience");
    let state = completeFirst(emptyAcademy(), c, 1);
    state = completeLesson(openLesson(state, c, lesson(c, 3), clock(11)), c, lesson(c, 3), clock(11));
    expect(courseProgress(state, c).next.number).toBe(4);
    expect(courseProgress(state, c).completed).toBe(2);
  });
});

describe("Test 7: persistent storage", () => {
  it("joins progress made on two devices without losing a completed lesson", () => {
    const c = course("confidence");
    const phone = { ...completeFirst(emptyAcademy(), c, 2, 3), updatedAt: "2026-11-03T10:00:00.000Z" };
    let laptop = completeFirst(emptyAcademy(), course("mindfulness"), 1, 4);
    laptop = { ...openLesson(laptop, c, lesson(c, 1), clock(4)), updatedAt: "2026-11-04T10:00:00.000Z" };
    const merged = mergeAcademy(laptop, phone);
    expect(lessonStatus(merged, lesson(c, 1).id)).toBe("completed");
    expect(lessonStatus(merged, lesson(c, 2).id)).toBe("completed");
    expect(lessonStatus(merged, lesson(course("mindfulness"), 1).id)).toBe("completed");
    expect(merged.courses.confidence?.startedOn).toBe(day(3));
  });

  it("an empty copy never replaces saved progress", () => {
    const saved = completeFirst(emptyAcademy(), course("confidence"), 1);
    expect(mergeAcademy(emptyAcademy(), saved)).toBe(saved);
    expect(mergeAcademy(saved, null)).toBe(saved);
    expect(mergeAcademy(saved, emptyAcademy())).toBe(saved);
  });

  it("cleans anything unexpected and limits text length", () => {
    const state = sanitizeAcademy({
      lessons: { "confidence-01": { status: "completed", startedOn: "2026-11-01", answers: { "strength-1": "x".repeat(5000), "../bad": "no" } }, "bad id!": { startedOn: "2026-11-01" } },
      achievements: { "first-lesson": "not a date" },
      challenges: { "2026-02-30": "three-breaths" },
      prefs: { voice: false },
    });
    expect(Object.keys(state.lessons)).toEqual(["confidence-01"]);
    expect(state.lessons["confidence-01"]?.answers["strength-1"]).toHaveLength(TEXT_LIMIT);
    expect(state.lessons["confidence-01"]?.answers["../bad"]).toBeUndefined();
    expect(state.lessons["confidence-01"]?.completedOn).toBe("2026-11-01");
    expect(state.achievements).toEqual({});
    expect(state.challenges).toEqual({});
    expect(state.prefs.voice).toBe(false);
  });

  it("stays within the account size budget even with every box filled", () => {
    let state = emptyAcademy();
    const long = "a".repeat(TEXT_LIMIT);
    for (const c of GROWTH_COURSES)
      for (const l of c.lessons) {
        state = saveAnswers(state, c, l, Object.fromEntries(l.exercise.fields.map((f) => [f.id, long])), clock(1));
        state = saveReflections(state, c, l, l.reflection.map(() => long), clock(1));
        for (let i = 0; i < 3; i += 1) state = savePractice(state, c, l, `${i}${long}`, clock(1));
      }
    const fitted = fitAcademy(state);
    expect(new TextEncoder().encode(JSON.stringify(fitted)).length).toBeLessThanOrEqual(900_000);
    // Saved exercise answers and reflections are kept; only older extra practice answers may go.
    for (const c of GROWTH_COURSES) for (const l of c.lessons) expect(fitted.lessons[l.id]?.reflections.every((r) => r.length > 0)).toBe(true);
  });

  it("saves to the account table with row level security", () => {
    const migration = readFileSync(join(__dirname, "..", "..", "..", "supabase", "migrations", "20261124200000_academy_state.sql"), "utf8");
    expect(migration).toMatch(/create table if not exists public\.academy_state/);
    expect(migration).toMatch(/enable row level security/);
    expect(migration).toMatch(/auth\.uid\(\) = user_id/);
    expect(migration).not.toMatch(/\bdrop table\b|\bdelete from\b|\btruncate\b/i);
    const store = readFileSync(join(__dirname, "store.ts"), "utf8");
    expect(store).toMatch(/from\("academy_state"\)/);
  });

  it("can delete what was saved for one lesson and keep the progress", () => {
    const c = course("confidence");
    let state = completeFirst(emptyAcademy(), c, 1);
    state = saveReflections(state, c, lesson(c, 1), ["mine"], clock(2));
    state = clearSavedText(state, lesson(c, 1).id);
    expect(state.lessons[lesson(c, 1).id]?.reflections).toEqual([]);
    expect(lessonStatus(state, lesson(c, 1).id)).toBe("completed");
  });
});

describe("Test 8: course completion and achievements", () => {
  it("completes a course only when all ten lessons are completed, and awards each achievement once", () => {
    const c = course("communication");
    let state = completeFirst(emptyAcademy(), c, 9, 12);
    expect(isCourseComplete(state, c)).toBe(false);
    // Opening the last lesson does not complete the course.
    state = award(openLesson(state, c, lesson(c, 10), clock(13)));
    expect(isCourseComplete(state, c)).toBe(false);
    expect(state.achievements["communication-champion"]).toBeUndefined();
    state = award(completeLesson(state, c, lesson(c, 10), clock(14)), day(14));
    expect(isCourseComplete(state, c)).toBe(true);
    expect(state.courses.communication?.completedOn).toBe(day(14));
    expect(state.achievements["communication-champion"]).toBe(day(14));
    expect(state.achievements["first-course"]).toBe(day(14));
    expect(state.achievements["first-lesson"]).toBe(day(24));
    expect(state.achievements["three-lessons"]).toBeDefined();
    const again = award(completeLesson(state, c, lesson(c, 10), clock(20)), day(20));
    expect(again.achievements).toEqual(state.achievements);
    expect(again.courses.communication?.completedOn).toBe(day(14));
    expect(again.history.filter((h) => h.kind === "achievement" && h.ref === "communication-champion")).toHaveLength(1);
    expect(courseProgress(again, c).percent).toBe(100);
  });

  it("has every achievement from the brief", () => {
    const titles = allAchievements(GROWTH_COURSES).map((a) => a.title);
    for (const name of ["First Lesson Completed", "Three Lessons Completed", "First Course Completed", "Mindfulness Explorer", "Confidence Builder", "Communication Champion", "Emotional Awareness", "Resilience in Action", "Five Courses Completed"])
      expect(titles).toContain(name);
  });

  it("awards Five Courses Completed after all five", () => {
    let state = emptyAcademy();
    for (const c of GROWTH_COURSES) state = completeFirst(state, c, 10);
    expect(state.achievements["five-courses"]).toBeDefined();
    expect(journeySummary(state, GROWTH_COURSES, day(10)).coursesCompleted).toBe(5);
  });
});

describe("Test 9: daily challenge", () => {
  it("records one challenge a day and never touches lessons", () => {
    const c = course("mindfulness");
    const before = openLesson(emptyAcademy(), c, lesson(c, 1), clock(7));
    const challenge = challengeFor(day(7));
    const after = completeChallenge(before, challenge.id, clock(7));
    expect(after.challenges[day(7)]).toBe(challenge.id);
    expect(after.lessons).toEqual(before.lessons);
    expect(after.courses).toEqual(before.courses);
    expect(lessonStatus(after, lesson(c, 1).id)).toBe("in-progress");
    expect(completeChallenge(after, "three-breaths", clock(7))).toBe(after);
    const awarded = award(after);
    expect(awarded.achievements["first-challenge"]).toBeDefined();
    expect(awarded.achievements["first-lesson"]).toBeUndefined();
  });

  it("changes every day and has enough variety", () => {
    expect(DAILY_CHALLENGES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(DAILY_CHALLENGES.map((c) => c.id)).size).toBe(DAILY_CHALLENGES.length);
    for (let n = 1; n < 30; n += 1) expect(challengeFor(day(n)).id).not.toBe(challengeFor(day(n + 1)).id);
    expect(challengeFor("2025-12-31").id).toBeTruthy();
  });

  it("counts learning days in a row without punishing a missed day", () => {
    let state = completeChallenge(emptyAcademy(), "three-breaths", clock(20));
    state = completeChallenge(state, "small-step", clock(21));
    expect(learningStreak(state, day(21))).toBe(2);
    expect(learningStreak(state, day(22))).toBe(2);
    expect(learningStreak(state, day(24))).toBe(0);
  });
});

describe("Test 11: voice", () => {
  it("is on by default, can be turned off, and the choice is kept", () => {
    expect(emptyAcademy().prefs.voice).toBe(true);
    const off = setVoicePref(emptyAcademy(), false);
    expect(sanitizeAcademy(JSON.parse(JSON.stringify(off))).prefs.voice).toBe(false);
  });

  it("the lesson page uses the existing LifeZoi Listen player and hides it when voice is off", () => {
    const view = readFileSync(join(__dirname, "..", "..", "components", "growth-academy", "lesson-view.tsx"), "utf8");
    expect(view).toMatch(/from "@\/components\/voice\/read-aloud"/);
    expect(view).toMatch(/showVoice \? <ReadAloud/);
    expect(view).not.toMatch(/speechSynthesis|fetch\(/);
  });
});

describe("Interactive practice feedback (no AI)", () => {
  const practice = lesson(course("confidence"), 1).practice;

  it("is kind for empty, short, and full answers", () => {
    expect(practiceFeedback("", practice).notes).toEqual([]);
    expect(practiceFeedback("Thanks!", practice).general).toMatch(/Short answers are fine/);
    const full = practiceFeedback("Thank you, I really try to listen first.", practice);
    expect(full.general).toMatch(/Thank you for practicing/);
    expect(full.notes.length).toBeGreaterThan(0);
  });

  it("matches whole words, so short cue words do not match inside other words", () => {
    expect(containsPhrase(words("I use android"), ["and"])).toBe(false);
    expect(containsPhrase(words("bread and butter"), ["and"])).toBe(true);
    expect(containsPhrase(words("thanks a lot"), ["thank"])).toBe(true);
    expect(containsPhrase(words("I feel upset when"), words("I feel"))).toBe(true);
  });

  it("every lesson's cues are lower case and say something kind", () => {
    for (const c of GROWTH_COURSES)
      for (const l of c.lessons)
        for (const cue of l.practice.cues ?? []) {
          for (const phrase of cue.anyOf) expect(phrase, l.id).toBe(phrase.toLowerCase());
          expect(cue.say, l.id).not.toMatch(/\b(wrong|bad|fail|should have)\b/i);
        }
  });
});

describe("Lessons in Ukrainian, Russian, and Greek", () => {
  const catalogs: Record<string, Record<string, string>> = { uk: ukCatalog, ru: ruCatalog, el: elCatalog };

  it("ignores accents and the typographic apostrophe when matching", () => {
    expect(containsPhrase(words("Σας ευχαριστώ πολύ"), words("ευχαριστ"))).toBe(true);
    expect(containsPhrase(words("ΕΥΧΑΡΙΣΤΩ"), words("ευχαριστ"))).toBe(true);
    expect(containsPhrase(words("Я ещё подумаю"), words("еще"))).toBe(true);
    expect(containsPhrase(words("I’m listening"), words("i'm listening"))).toBe(true);
  });

  for (const [locale, catalog] of Object.entries(catalogs)) {
    const lookup = (key: string) => catalog[key];

    it(`has ${locale} feedback words for every cue, as a "cue: " list`, () => {
      const missing: string[] = [];
      for (const c of GROWTH_COURSES)
        for (const l of c.lessons)
          for (const cue of l.practice.cues ?? []) {
            const value = catalog[cueKey(cue)];
            if (!value?.startsWith("cue: ") || cuePhrases(cue, lookup).length <= cue.anyOf.length) missing.push(`${l.id}: ${cueKey(cue)}`);
          }
      expect(missing).toEqual([]);
    });

    it(`gives a kind note for a ${locale} example answer whenever the English one gets one`, () => {
      const quiet: string[] = [];
      for (const c of GROWTH_COURSES)
        for (const l of c.lessons)
          for (const example of l.practice.examples) {
            if (practiceFeedback(example.text, l.practice).notes.length === 0) continue;
            const translated = catalog[example.text] ?? "";
            if (practiceFeedback(translated, l.practice, lookup).notes.length === 0) quiet.push(`${l.id}: ${translated}`);
          }
      expect(quiet).toEqual([]);
    });

    it(`still understands an answer typed in English when the site is in ${locale}`, () => {
      const practice = lesson(course("confidence"), 1).practice;
      expect(practiceFeedback("Thank you, I really try to listen first.", practice, lookup).notes.length).toBeGreaterThan(0);
    });
  }

  it("no longer tells readers that lessons are in English only", () => {
    const view = readFileSync(join(__dirname, "..", "..", "components", "growth-academy", "lesson-view.tsx"), "utf8");
    expect(view).not.toMatch(/in English for now/);
  });
});
