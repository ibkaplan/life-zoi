import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isAdminEmail } from "@/lib/admin-allowlist";
import {
  prepareAccountWrite,
  rowsToSession,
  shouldCopyLocalIntoAccount,
} from "@/lib/account-records";
import {
  authenticatorQrMarkup,
  authenticatorQrSrc,
  isTotpCode,
  needsSecondFactor,
  validateAccountCredentials,
} from "@/lib/mfa";
import { createSampleSession } from "@/lib/sample";
import { emptySession, type UserSession } from "@/lib/types";
import { freshDay, setItemStatus } from "@/lib/my-day/storage";
import { validAnswers } from "@/lib/validation.test";

const USER = "11111111-1111-4111-8111-111111111111";
const WHEN = "2026-11-04T12:00:00.000Z";

function ownSession(): UserSession {
  return {
    ...emptySession(),
    draft: validAnswers({ displayName: "Ada" }),
    draftStep: 2,
    reassessDays: 30,
    reassessOn: "2026-11-04",
    history: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        completedAt: WHEN,
        answers: validAnswers({ displayName: "Ada" }),
      },
    ],
    scenarios: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        habitId: "walk",
        note: "after lunch",
        savedAt: WHEN,
      },
    ],
    goals: [{ habitId: "walk", daysPerWeek: 3 }],
    checkIns: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        date: "2026-11-04",
        habitId: "walk",
        done: true,
        note: "Done",
      },
    ],
  };
}

describe("account records", () => {
  it("round-trips a person's session and does not send a role", () => {
    const prepared = prepareAccountWrite(ownSession(), USER, WHEN);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.rows.profile).not.toHaveProperty("role");
    expect(prepared.rows.profile.user_id).toBe(USER);
    expect(prepared.rows.profile.display_name).toBe("Ada");
    expect(prepared.rows.assessments).toHaveLength(1);
    expect(prepared.rows.goals[0]).toEqual({ user_id: USER, habit_id: "walk", days_per_week: 3 });

    const loaded = rowsToSession({
      profile: {
        display_name: prepared.rows.profile.display_name,
        session_state: prepared.rows.profile.session_state,
      },
      assessments: prepared.rows.assessments,
      scenarios: prepared.rows.scenarios,
      goals: prepared.rows.goals,
      checkIns: prepared.rows.checkIns,
    });
    expect(loaded.draft.displayName).toBe("Ada");
    expect(loaded.draftStep).toBe(2);
    expect(loaded.reassessDays).toBe(30);
    expect(loaded.history[0]?.answers.sleepHours).toBe("7.5");
    expect(loaded.scenarios[0]?.habitId).toBe("walk");
    expect(loaded.checkIns[0]?.done).toBe(true);
    expect(loaded.myDay.days).toEqual({});
  });

  it("keeps a My Day completion on the account and drops it before the profile can grow past the size check", () => {
    const marked = setItemStatus(
      { savedTimes: {}, ayurvedaHidden: false, days: { "2026-11-06": freshDay("2026-11-06", {}) } },
      "2026-11-06",
      "water",
      "done",
    );
    const session = { ...ownSession(), myDay: marked };
    const prepared = prepareAccountWrite(session, USER, WHEN);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const loaded = rowsToSession({
      profile: { display_name: "Ada", session_state: prepared.rows.profile.session_state },
      assessments: prepared.rows.assessments,
      scenarios: prepared.rows.scenarios,
      goals: prepared.rows.goals,
      checkIns: prepared.rows.checkIns,
    });
    expect(loaded.myDay.days["2026-11-06"]?.items.water.status).toBe("done");
    expect(new TextEncoder().encode(JSON.stringify(prepared.rows.profile.session_state)).length).toBeLessThanOrEqual(20000);

    const bulky = { ...marked, days: { ...marked.days } };
    for (let index = 0; index < 14; index += 1) {
      const date = `2026-10-${String(index + 1).padStart(2, "0")}`;
      const day = freshDay(date, {});
      for (const id of Object.keys(day.items) as (keyof typeof day.items)[]) {
        day.items[id] = { ...day.items[id], note: "n".repeat(280), status: "done" };
      }
      bulky.days[date] = day;
    }
    const wide = prepareAccountWrite({ ...session, myDay: bulky }, USER, WHEN);
    expect(wide.ok).toBe(true);
    if (!wide.ok) return;
    expect(new TextEncoder().encode(JSON.stringify(wide.rows.profile.session_state)).length).toBeLessThanOrEqual(20000);
    expect(wide.rows.profile.session_state.draft.displayName).toBe("Ada");
  });

  it("refuses to copy sample data into an account", () => {
    const sample = createSampleSession("2026-11-04");
    expect(prepareAccountWrite(sample, USER, WHEN)).toEqual({ ok: false, reason: "sample" });
    expect(shouldCopyLocalIntoAccount(emptySession(), sample)).toBe(false);
    expect(shouldCopyLocalIntoAccount(emptySession(), ownSession())).toBe(true);
    expect(shouldCopyLocalIntoAccount(ownSession(), ownSession())).toBe(false);
    expect(prepareAccountWrite(emptySession(), "  ", WHEN)).toEqual({ ok: false, reason: "unauthenticated" });
  });

  it("keeps admin in the server allowlist and the database trigger", () => {
    expect(isAdminEmail("Tatyanaserikovaru@gmail.com")).toBe(true);
    expect(isAdminEmail(" tatyanaserikovaru@gmail.com ")).toBe(true);
    expect(isAdminEmail("someoneelse@gmail.com")).toBe(false);
    expect(isAdminEmail("tatyanaserikovaru@gmail.com.example")).toBe(false);
    const sql = readFileSync("supabase/schema.sql", "utf8");
    expect(sql).toContain("tatyanaserikovaru@gmail.com");
    expect(sql).toContain("new.role := 'admin'");
    expect(sql).toContain("new.role := 'member'");
    expect(sql).toContain("sample data is not saved to an account");
    for (const file of [
      "src/lib/supabase-browser.ts",
      "src/lib/supabase-user.ts",
      "src/lib/account-store.ts",
      "src/components/account-panel.tsx",
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("service_role");
      expect(source).not.toContain("SERVICE_ROLE");
    }
  });
});

describe("authenticator sign-in", () => {
  it("asks for a 6-digit code only when a second factor is still required", () => {
    expect(needsSecondFactor("aal1", "aal2")).toBe(true);
    expect(needsSecondFactor("aal2", "aal2")).toBe(false);
    expect(needsSecondFactor("aal1", "aal1")).toBe(false);
    expect(needsSecondFactor(null, "aal2")).toBe(false);
    expect(isTotpCode("123456")).toBe(true);
    expect(isTotpCode(" 123456 ")).toBe(true);
    expect(isTotpCode("12345")).toBe(false);
    expect(isTotpCode("1234567")).toBe(false);
    expect(isTotpCode("12 456")).toBe(false);
    expect(authenticatorQrSrc("<svg></svg>")).toBe(`data:image/svg+xml;utf-8,${encodeURIComponent("<svg></svg>")}`);
    expect(authenticatorQrMarkup("<svg></svg>")).toBe("<svg></svg>");
    expect(authenticatorQrMarkup("data:image/svg+xml;utf-8,<svg></svg>")).toBe("<svg></svg>");
    expect(authenticatorQrMarkup("<svg><script></script></svg>")).toBe("");
    expect(validateAccountCredentials("ada@example.com", "longenough")).toBeNull();
    expect(validateAccountCredentials("ada@example.com", "short")).toMatch(/8 characters/);
    expect(validateAccountCredentials("not-an-email", "longenough")).toMatch(/email/i);
  });
});
