import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import {
  DURATION_CHOICES,
  NAMED_ROUTINE_TITLES,
  SAFETY_LINE,
  STUDIO_HERO,
  STUDIO_SECTION,
  comingSoonLessons,
  embedSrc,
  filterLessons,
  formatDuration,
  lessonById,
  playableLessons,
  studioCategories,
  studioLessons,
  studioPlainText,
} from "@/lib/wellness/movement-studio/catalog";
import { SCRIPT_LABEL } from "@/lib/wellness/movement-studio/scripts";
import {
  PROGRESS_COPY,
  completedCategoryCount,
  completedLessonCount,
  emptyProgress,
  isMissionMarked,
  loadProgress,
  markLessonComplete,
  markMission,
  missionDayForDate,
  missionsMarked,
  progressAfterPlay,
  restartWeek,
  saveProgress,
  videoSecondsCompleted,
  weekStartMonday,
} from "@/lib/wellness/movement-studio/progress";

const verifiedLengths: Record<string, string> = {
  MjMkBaqimFo: "0:40",
  n5kWf0pvEkc: "19:30",
  kCQ6irSQwYA: "11:15",
  JejTelL05Qw: "27:18",
  G1lwVhnnkoU: "10:06",
  Ev6yE55kYGw: "15:30",
  "4YOBIEOobCE": "0:56",
  z_GKdFf3qv4: "1:07",
  "751E9kAdkwg": "1:26",
  kgqIdCwVivE: "3:10",
  "87BeiyTFZyU": "2:27",
  "CW0h60-PS4Y": "2:02",
  KcdkySvCRCc: "18:29",
};

describe("movement studio catalog", () => {
  it("uses the studio hero, nine categories, and the safety line", () => {
    expect(STUDIO_HERO).toBe("MOVE BETTER. FEEL STRONGER. LIVE FULLY.");
    expect(STUDIO_SECTION).toBe("CHOOSE YOUR MOVEMENT");
    expect(studioCategories).toHaveLength(9);
    expect(studioCategories.map((category) => category.title)).toEqual([
      "Chair Movement Studio",
      "Balance & Stability",
      "Strong Body — Gentle Strength",
      "Tai Chi, Qigong & Mindful Movement",
      "Walk at Home",
      "Morning Mobility & Evening Relaxation",
      "Find My Movement",
      "Daily Movement Mission",
      "My Movement Progress",
    ]);
    expect(SAFETY_LINE).toContain("chest pain");
    expect(SAFETY_LINE).toContain("dizziness");
    expect(SAFETY_LINE).toContain("unusual shortness of breath");
    expect(SAFETY_LINE).toContain("significant pain");
    expect(SAFETY_LINE).toContain("sturdy chair");
    expect(SAFETY_LINE.toLowerCase()).toContain("not treatment");
  });

  it("plays only verified National Institute on Aging films at their real length", () => {
    const playable = playableLessons();
    expect(playable).toHaveLength(13);
    expect(playable.map((lesson) => lesson.youtubeId).sort()).toEqual(Object.keys(verifiedLengths).sort());
    for (const lesson of playable) {
      expect(formatDuration(lesson.durationSeconds)).toBe(verifiedLengths[lesson.youtubeId]);
      expect(embedSrc(lesson)).toBe(`https://www.youtube.com/embed/${lesson.youtubeId}`);
      expect(lesson.license.creator).toBe("National Institute on Aging");
      expect(lesson.license.embedAllowed).toBe(true);
      expect(lesson.license.rehostAllowed).toBe(false);
      expect(lesson.license.license).toContain("U.S. Government work");
    }
    expect(embedSrc(lessonById("video-strength")!)).toContain("JejTelL05Qw");
    expect(studioLessons.some((lesson) => lesson.kind === "video" && lesson.youtubeId === "QT5d4tTXW6U")).toBe(false);
  });

  it("keeps written routines as scripts without a player", () => {
    const soon = comingSoonLessons();
    expect(soon).toHaveLength(11);
    const named = soon.filter((lesson) => lesson.namedRoutine);
    expect(named.map((lesson) => lesson.title).sort()).toEqual([...NAMED_ROUTINE_TITLES].sort());
    expect(soon.some((lesson) => lesson.title === "Gentle back comfort" && !lesson.namedRoutine)).toBe(true);
    for (const lesson of soon) {
      expect(embedSrc(lesson)).toBeNull();
      expect(lesson.script.cues.length).toBeGreaterThan(3);
      const text = `${lesson.summary} ${lesson.script.cues.map((cue) => cue.words).join(" ")}`;
      expect(text).toMatch(/not a (finished )?(yoga )?video/);
    }
    expect(SCRIPT_LABEL).toBe("Script for later recording. This is not a finished video.");
    expect(playableLessons().some((lesson) => lesson.title === "The Emotional Benefits of Exercise")).toBe(true);
  });

  it("filters by real length, position, goal, and level", () => {
    const any = filterLessons(studioLessons, { minutes: "any", position: "any", goal: "any", level: "any" });
    expect(any).toHaveLength(studioLessons.length);
    const ten = filterLessons(studioLessons, { minutes: 10, position: "any", goal: "any", level: "any" });
    expect(ten.map((lesson) => lesson.id)).toEqual(
      expect.arrayContaining(["video-workout-10", "video-flexibility-4", "script-walk"]),
    );
    expect(ten.some((lesson) => lesson.id === "video-hands" || lesson.id === "video-emotional")).toBe(false);
    expect(filterLessons(studioLessons, { minutes: 15, position: "any", goal: "any", level: "any" }).map((lesson) => lesson.id)).toEqual([
      "video-workout-15",
    ]);
    expect(filterLessons(studioLessons, { minutes: 20, position: "any", goal: "any", level: "any" }).map((lesson) => lesson.id)).toEqual([
      "video-qa",
    ]);
    expect(filterLessons(studioLessons, { minutes: 25, position: "any", goal: "any", level: "any" })).toHaveLength(0);
    expect(filterLessons(studioLessons, { minutes: 30, position: "any", goal: "any", level: "any" })).toHaveLength(0);
    expect(filterLessons(studioLessons, { minutes: 5, position: "any", goal: "any", level: "any" }).map((lesson) => lesson.id)).toEqual([
      "script-back",
    ]);
    expect(
      filterLessons(studioLessons, { minutes: "any", position: "mat", goal: "any", level: "any" }).map((lesson) => lesson.id),
    ).toEqual(["video-flexibility-4"]);
    expect(
      filterLessons(studioLessons, { minutes: "any", position: "sitting", goal: "chair", level: "beginner" }).some(
        (lesson) => lesson.id === "video-strength",
      ),
    ).toBe(false);
    for (const minutes of DURATION_CHOICES) {
      for (const lesson of filterLessons(studioLessons, { minutes, position: "any", goal: "any", level: "any" })) {
        if (lesson.kind === "video") {
          expect(Math.abs(lesson.durationSeconds - minutes * 60)).toBeLessThanOrEqual(90);
        } else {
          expect(lesson.practiceMinutes).toBe(minutes);
        }
      }
    }
  });

  it("avoids prohibited claims and does not track calories or body weight in progress", () => {
    expect(containsProhibitedClaim(studioPlainText())).toBe(false);
    const progressText = Object.values(PROGRESS_COPY).join(" ");
    expect(containsProhibitedClaim(progressText)).toBe(false);
    expect(progressText.toLowerCase()).not.toMatch(/calorie|body weight/);
  });
});

describe("movement studio progress", () => {
  const friday = "2026-11-06";

  it("keeps the week on Monday and never completes a mission by itself", () => {
    expect(weekStartMonday(friday)).toBe("2026-11-02");
    expect(missionDayForDate(friday)).toBe("fri");
    expect(missionDayForDate("2026-11-02")).toBe("mon");
    expect(missionDayForDate("2026-11-08")).toBe("sun");
    expect(missionsMarked(emptyProgress(), friday)).toBe(0);
    expect(isMissionMarked(emptyProgress(), "fri", friday)).toBe(false);
  });

  it("counts a marked film once and gives a script no video minutes", () => {
    const once = markLessonComplete(emptyProgress(), "video-strength");
    expect(videoSecondsCompleted(once)).toBe(1638);
    expect(videoSecondsCompleted(markLessonComplete(once, "video-strength"))).toBe(1638);
    const withScript = markLessonComplete(once, "script-walk");
    expect(completedLessonCount(withScript)).toBe(2);
    expect(videoSecondsCompleted(withScript)).toBe(1638);
    expect(completedCategoryCount(withScript)).toBe(2);
    expect(markLessonComplete(emptyProgress(), "not-a-lesson")).toEqual(emptyProgress());
  });

  it("does not complete anything when a film is played", () => {
    const started = emptyProgress();
    expect(progressAfterPlay(started, "video-hands")).toBe(started);
    expect(completedLessonCount(progressAfterPlay(started, "video-hands"))).toBe(0);
    expect(missionsMarked(progressAfterPlay(started, "video-hands"), friday)).toBe(0);
  });

  it("marks a mission only when asked, and restart clears that week only", () => {
    const monday = markMission(emptyProgress(), "mon", friday);
    expect(isMissionMarked(monday, "mon", friday)).toBe(true);
    expect(completedLessonCount(monday)).toBe(0);
    expect(missionsMarked(monday, friday)).toBe(1);
    const nextWeek = markMission(monday, "mon", "2026-11-09");
    const restarted = restartWeek(nextWeek, friday);
    expect(isMissionMarked(restarted, "mon", friday)).toBe(false);
    expect(isMissionMarked(restarted, "mon", "2026-11-09")).toBe(true);
    expect(restarted.completedLessonIds).toEqual([]);
  });

  it("stores progress in the provided storage and drops unknown data", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    saveProgress(storage, markLessonComplete(markMission(emptyProgress(), "sun", friday), "script-breathe"));
    const loaded = loadProgress(storage);
    expect(loaded.completedLessonIds).toEqual(["script-breathe"]);
    expect(isMissionMarked(loaded, "sun", friday)).toBe(true);
    memory.set("lifezoi.movement-studio.v1", JSON.stringify({ completedLessonIds: ["calories", "video-hands"], missionWeeks: { "2026-11-03": { mon: true } } }));
    const cleaned = loadProgress(storage);
    expect(cleaned.completedLessonIds).toEqual(["video-hands"]);
    expect(cleaned.missionWeeks).toEqual({});
  });
});
