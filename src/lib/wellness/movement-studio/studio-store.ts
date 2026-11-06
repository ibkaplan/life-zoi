import { localISODate } from "@/lib/dates";
import {
  emptyProgress,
  loadProgress,
  markLessonComplete,
  markMission,
  progressAfterPlay,
  restartWeek,
  saveProgress,
  type MissionDay,
  type StudioProgress,
} from "@/lib/wellness/movement-studio/progress";

type StudioSnapshot = {
  progress: StudioProgress;
  today: string | null;
};

const serverSnapshot: StudioSnapshot = { progress: emptyProgress(), today: null };
let snapshot: StudioSnapshot = serverSnapshot;
let ready = false;
const listeners = new Set<() => void>();

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  snapshot = { progress: loadProgress(window.sessionStorage), today: localISODate() };
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(progress: StudioProgress) {
  ensure();
  snapshot = { progress, today: snapshot.today };
  if (typeof window !== "undefined") saveProgress(window.sessionStorage, progress);
  emit();
}

export function subscribeStudio(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStudioSnapshot(): StudioSnapshot {
  ensure();
  return snapshot;
}

export function getStudioServerSnapshot(): StudioSnapshot {
  return serverSnapshot;
}

export function completeStudioLesson(lessonId: string) {
  commit(markLessonComplete(getStudioSnapshot().progress, lessonId));
}

export function markStudioMission(day: MissionDay, today: string) {
  commit(markMission(getStudioSnapshot().progress, day, today));
}

export function noteStudioPlay(lessonId: string) {
  progressAfterPlay(getStudioSnapshot().progress, lessonId);
}

export function restartStudioWeek(today: string) {
  commit(restartWeek(getStudioSnapshot().progress, today));
}
