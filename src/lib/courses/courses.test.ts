import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { emptyCompanion, isEmptyCompanion, sanitizeCompanion } from "@/lib/companion/state";
import {
  COURSE_DAYS,
  COURSE_NOTE,
  COURSES,
  courseDaysIn,
  emptyCourses,
  markDay,
  pauseCourse,
  restartCourse,
  sanitizeCourses,
  startCourse,
  summarize,
} from "@/lib/courses/courses";
import { activeDates, activitiesIn } from "@/lib/daily/daily";
import { emptySession } from "@/lib/types";

const APP = join(__dirname, "..", "..", "app", "(members)");
const TODAY = "2026-11-24";

function pageExists(href: string): boolean {
  const path = href.split("#")[0].replace(/^\//, "");
  try {
    return statSync(join(APP, path, "page.tsx")).isFile();
  } catch {
    return false;
  }
}

describe("7-day mini-courses content", () => {
  it("has seven numbered days in every course, each linking to an existing members' page", () => {
    expect(COURSES.length).toBeGreaterThanOrEqual(2);
    for (const course of COURSES) {
      expect(course.days.map((item) => item.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      for (const item of course.days) {
        expect(pageExists(item.href), `${course.id} day ${item.day}: ${item.href}`).toBe(true);
        expect(item.minutes).toBeGreaterThan(0);
        expect(item.minutes).toBeLessThanOrEqual(15);
      }
    }
    expect(readdirSync(APP)).toContain("courses");
  });

  it("stays gentle: no breath holding, no pushing, no streaks, and a not-medical-advice note", () => {
    const words = COURSES.flatMap((course) => [course.title, course.summary, course.care, ...course.days.flatMap((d) => [d.title, d.text])]).join(" ");
    const days = COURSES.flatMap((course) => course.days.map((d) => `${d.title} ${d.text}`)).join(" ");
    expect(days).not.toMatch(/\bhold\b/i);
    expect(words).not.toMatch(/streak|missed|failed|no pain|push through|burn|lose weight|cure|treat(s|ing)? /i);
    for (const course of COURSES) expect(course.care.length).toBeGreaterThan(20);
    expect(COURSE_NOTE).toMatch(/not medical advice/);
  });
});

describe("7-day mini-course progress", () => {
  it("starts, marks, and summarizes without dates driving anything", () => {
    let state = startCourse(emptyCourses(), "calm-breathing", TODAY);
    expect(state.current).toBe("calm-breathing");
    expect(summarize(state.progress["calm-breathing"], TODAY)).toEqual({ doneCount: 0, nextDay: 1, finished: false, doneToday: false });
    state = markDay(state, "calm-breathing", 1, TODAY, true);
    state = markDay(state, "calm-breathing", 3, "2026-11-26", true);
    expect(summarize(state.progress["calm-breathing"], "2026-11-26")).toEqual({ doneCount: 2, nextDay: 2, finished: false, doneToday: true });
    state = markDay(state, "calm-breathing", 3, TODAY, false);
    expect(summarize(state.progress["calm-breathing"], TODAY).doneCount).toBe(1);
    for (let day = 1; day <= COURSE_DAYS; day += 1) state = markDay(state, "calm-breathing", day, TODAY, true);
    expect(summarize(state.progress["calm-breathing"], TODAY)).toMatchObject({ doneCount: 7, nextDay: null, finished: true });
    expect(markDay(state, "calm-breathing", 9, TODAY, true)).toBe(state);
  });

  it("keeps progress when paused or when switching courses, and clears it only on restart", () => {
    let state = markDay(startCourse(emptyCourses(), "gentle-movement", TODAY), "gentle-movement", 1, TODAY, true);
    state = pauseCourse(state);
    expect(state.current).toBe("");
    state = startCourse(state, "rest-and-calm", TODAY);
    state = startCourse(state, "gentle-movement", "2026-12-01");
    expect(state.progress["gentle-movement"]).toEqual({ startedOn: TODAY, done: [{ day: 1, date: TODAY }] });
    state = restartCourse(state, "gentle-movement", "2026-12-01");
    expect(state.progress["gentle-movement"]).toEqual({ startedOn: "2026-12-01", done: [] });
  });

  it("sanitizes stored data", () => {
    const clean = sanitizeCourses({
      current: "unknown",
      progress: {
        "calm-breathing": { startedOn: TODAY, done: [{ day: 2, date: TODAY }, { day: 2, date: TODAY }, { day: 8, date: TODAY }, { day: 1, date: "2026-02-31" }, "x"] },
        "made-up": { startedOn: TODAY, done: [] },
        "gentle-movement": { startedOn: "nope", done: [] },
      },
    });
    expect(clean).toEqual({ current: "", progress: { "calm-breathing": { startedOn: TODAY, done: [{ day: 2, date: TODAY }] } } });
    expect(sanitizeCourses(null)).toEqual(emptyCourses());
  });

  it("is saved inside companion state and counts in LifeZoi Daily's week", () => {
    const companion = sanitizeCompanion({ courses: { current: "calm-breathing", progress: { "calm-breathing": { startedOn: TODAY, done: [{ day: 1, date: TODAY }] } } } });
    expect(companion.courses.current).toBe("calm-breathing");
    expect(isEmptyCompanion(companion)).toBe(false);
    expect(isEmptyCompanion(emptyCompanion())).toBe(true);
    const window = { start: "2026-11-18", end: TODAY };
    expect(courseDaysIn(companion.courses, window.start, window.end)).toHaveLength(1);
    const session = emptySession();
    expect(activitiesIn(session, companion, window)).toContainEqual({ id: "courses", label: "Mini-course practices", count: 1 });
    expect(activeDates(session, companion, window)).toEqual([TODAY]);
  });
});
