import { decideAccess } from "@/lib/access";
import { isEmptyBrain } from "@/lib/brain-quiz/progress";
import { SAMPLE_VISITOR_NAME } from "@/lib/sample";
import { sanitizeSession } from "@/lib/session";
import {
  emptySession,
  type Assessment,
  type UserSession,
} from "@/lib/types";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ProfileWrite = {
  user_id: string;
  display_name: string | null;
  session_state: {
    draft: Assessment;
    draftStep: number;
    reassessDays: UserSession["reassessDays"];
    reassessOn: string;
    weeklyCheckIns: UserSession["weeklyCheckIns"];
    weightEntries: UserSession["weightEntries"];
    brainQuiz: UserSession["brainQuiz"];
  };
  updated_at: string;
};

export type AssessmentWrite = {
  id: string;
  user_id: string;
  answers: Assessment;
  completed_at: string;
};

export type ScenarioWrite = {
  id: string;
  user_id: string;
  habit_id: string;
  note: string | null;
  saved_at: string;
};

export type GoalWrite = {
  user_id: string;
  habit_id: string;
  days_per_week: number;
};

export type CheckInWrite = {
  id: string;
  user_id: string;
  habit_id: string;
  entry_date: string;
  done: boolean;
  note: string | null;
};

export type AccountWrite = {
  profile: ProfileWrite;
  assessments: AssessmentWrite[];
  scenarios: ScenarioWrite[];
  goals: GoalWrite[];
  checkIns: CheckInWrite[];
};

export type AccountRead = {
  profile: { display_name: string | null; session_state: unknown } | null;
  assessments: { id: string; answers: unknown; completed_at: string }[];
  scenarios: { id: string; habit_id: string; note: string | null; saved_at: string }[];
  goals: { habit_id: string; days_per_week: number }[];
  checkIns: {
    id: string;
    habit_id: string;
    entry_date: string;
    done: boolean;
    note: string | null;
  }[];
};

function isSampleName(value: string | null | undefined): boolean {
  return (value ?? "").trim().toLowerCase() === SAMPLE_VISITOR_NAME.toLowerCase();
}

export function isSampleSession(session: UserSession): boolean {
  if (isSampleName(session.draft.displayName)) return true;
  return (
    session.history.some((item) => isSampleName(item.answers.displayName) || item.id.startsWith("sample-")) ||
    session.scenarios.some((item) => item.id.startsWith("sample-")) ||
    session.checkIns.some((item) => item.id.startsWith("sample-"))
  );
}

export function isBlankSession(session: UserSession): boolean {
  return (
    session.history.length === 0 &&
    session.scenarios.length === 0 &&
    session.goals.length === 0 &&
    session.checkIns.length === 0 &&
    session.weeklyCheckIns.length === 0 &&
    session.weightEntries.length === 0 &&
    session.draftStep === 0 &&
    session.reassessDays === 0 &&
    session.reassessOn === "" &&
    session.draft.displayName.trim() === "" &&
    session.draft.sleepHours.trim() === "" &&
    session.draft.goals.length === 0 &&
    session.draft.habitNote.trim() === "" &&
    isEmptyBrain(session.brainQuiz)
  );
}

export function shouldCopyLocalIntoAccount(remote: UserSession, local: UserSession): boolean {
  return isBlankSession(remote) && !isBlankSession(local) && !isSampleSession(local);
}

export function normalizeStoredIds(
  session: UserSession,
  newId: () => string = () => crypto.randomUUID(),
): UserSession {
  const keep = (id: string) => (UUID.test(id) ? id : newId());
  return {
    ...session,
    history: session.history.map((item) => ({ ...item, id: keep(item.id) })),
    scenarios: session.scenarios.map((item) => ({ ...item, id: keep(item.id) })),
    checkIns: session.checkIns.map((item) => ({ ...item, id: keep(item.id) })),
  };
}

function profileName(session: UserSession): string | null {
  const raw = (session.history[0]?.answers.displayName || session.draft.displayName).trim();
  if (!raw || isSampleName(raw)) return null;
  return raw.slice(0, 40);
}

function emptyNote(note: string): string | null {
  const trimmed = note.trim();
  return trimmed ? trimmed.slice(0, 280) : null;
}

export function sessionToRows(session: UserSession, actorUserId: string, updatedAt: string): AccountWrite {
  const userId = actorUserId.trim();
  return {
    profile: {
      user_id: userId,
      display_name: profileName(session),
      session_state: {
        draft: session.draft,
        draftStep: session.draftStep,
        reassessDays: session.reassessDays,
        reassessOn: session.reassessOn,
        weeklyCheckIns: session.weeklyCheckIns,
        weightEntries: session.weightEntries,
        brainQuiz: session.brainQuiz,
      },
      updated_at: updatedAt,
    },
    assessments: session.history.map((item) => ({
      id: item.id,
      user_id: userId,
      answers: item.answers,
      completed_at: item.completedAt,
    })),
    scenarios: session.scenarios.map((item) => ({
      id: item.id,
      user_id: userId,
      habit_id: item.habitId,
      note: emptyNote(item.note),
      saved_at: item.savedAt,
    })),
    goals: session.goals.map((item) => ({
      user_id: userId,
      habit_id: item.habitId,
      days_per_week: item.daysPerWeek,
    })),
    checkIns: session.checkIns.map((item) => ({
      id: item.id,
      user_id: userId,
      habit_id: item.habitId,
      entry_date: item.date,
      done: item.done,
      note: emptyNote(item.note),
    })),
  };
}

export function prepareAccountWrite(
  session: UserSession,
  actorUserId: string,
  updatedAt: string,
):
  | { ok: true; rows: AccountWrite }
  | { ok: false; reason: "sample" | "unauthenticated" | "not-owner" } {
  const clean = normalizeStoredIds(sanitizeSession(session));
  if (isSampleSession(clean)) return { ok: false, reason: "sample" };
  const actor = actorUserId.trim();
  if (!decideAccess(actor, actor).allowed) return { ok: false, reason: "unauthenticated" };
  const rows = sessionToRows(clean, actor, updatedAt);
  const owners = [
    rows.profile.user_id,
    ...rows.assessments.map((row) => row.user_id),
    ...rows.scenarios.map((row) => row.user_id),
    ...rows.goals.map((row) => row.user_id),
    ...rows.checkIns.map((row) => row.user_id),
  ];
  if (owners.some((owner) => !decideAccess(actor, owner).allowed)) {
    return { ok: false, reason: "not-owner" };
  }
  return { ok: true, rows };
}

function dateOnly(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

export function rowsToSession(input: AccountRead): UserSession {
  const state =
    input.profile?.session_state &&
    typeof input.profile.session_state === "object" &&
    !Array.isArray(input.profile.session_state)
      ? (input.profile.session_state as Record<string, unknown>)
      : {};
  return sanitizeSession({
    draft: state.draft,
    draftStep: state.draftStep,
    reassessDays: state.reassessDays,
    reassessOn: state.reassessOn,
    weeklyCheckIns: state.weeklyCheckIns,
    weightEntries: state.weightEntries,
    brainQuiz: state.brainQuiz,
    history: input.assessments.map((row) => ({
      id: row.id,
      completedAt: row.completed_at,
      answers: row.answers,
    })),
    scenarios: input.scenarios.map((row) => ({
      id: row.id,
      habitId: row.habit_id,
      note: row.note ?? "",
      savedAt: row.saved_at,
    })),
    goals: input.goals.map((row) => ({
      habitId: row.habit_id,
      daysPerWeek: row.days_per_week,
    })),
    checkIns: input.checkIns.map((row) => ({
      id: row.id,
      date: dateOnly(row.entry_date),
      habitId: row.habit_id,
      done: row.done,
      note: row.note ?? "",
    })),
  });
}

export function blankAccountRead(): AccountRead {
  return {
    profile: null,
    assessments: [],
    scenarios: [],
    goals: [],
    checkIns: [],
  };
}

export function emptyAccountSession(): UserSession {
  return emptySession();
}
