import { localISODate } from "@/lib/dates";
import { takeForAccount, userStorageKey, guestStorageKey } from "@/lib/owned-local";
import {
  emptyProgress,
  isEmptyStudio,
  loadProgress,
  markLessonComplete,
  markMission,
  MOVEMENT_STUDIO_KEY,
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
let activeKey = MOVEMENT_STUDIO_KEY;
const listeners = new Set<() => void>();

function ensure() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  snapshot = { progress: emptyProgress(), today: localISODate() };
}

export function bindStudioOwner(userId: string | null) {
  if (typeof window === "undefined") return;
  const storage = window.sessionStorage;
  if (userId) {
    const raw = takeForAccount(storage, MOVEMENT_STUDIO_KEY, userId, false);
    activeKey = userStorageKey(MOVEMENT_STUDIO_KEY, userId);
    snapshot = {
      progress: raw ? loadProgress(storage, activeKey) : emptyProgress(),
      today: localISODate(),
    };
  } else {
    activeKey = guestStorageKey(MOVEMENT_STUDIO_KEY);
    const guest = loadProgress(storage, activeKey);
    const legacy = loadProgress(storage, MOVEMENT_STUDIO_KEY);
    snapshot = {
      progress: !isEmptyStudio(guest) ? guest : legacy,
      today: localISODate(),
    };
    if (isEmptyStudio(guest) && !isEmptyStudio(legacy)) activeKey = MOVEMENT_STUDIO_KEY;
  }
  ready = true;
  emit();
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(progress: StudioProgress) {
  ensure();
  snapshot = { progress, today: snapshot.today };
  if (typeof window !== "undefined") saveProgress(window.sessionStorage, progress, activeKey);
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
