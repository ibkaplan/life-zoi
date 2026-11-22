import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createMemoryFeedbackRepository } from "@/lib/feedback/repository";
import {
  adminAction,
  adminOverview,
  autoFlag,
  feedbackBoard,
  memberAction,
  memberCode,
  type AdminOverview,
  type FeedbackDeps,
} from "@/lib/feedback/service";
import { publicSummary, summarizeRatings } from "@/lib/feedback/stats";
import { reviewRow, toReview } from "@/lib/feedback/supabase-repository";
import type { FeedbackBoard, StoredReview } from "@/lib/feedback/types";
import { parseAnnouncement, parseImagePath, parseReview } from "@/lib/feedback/validation";

const ADMIN = { id: "00000000-0000-4000-8000-0000000000aa", isAdmin: true };
const memberN = (n: number) => ({ id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`, isAdmin: false });

function setup(start = Date.parse("2026-11-22T10:00:00Z")) {
  let now = start;
  let counter = 0;
  const deps: FeedbackDeps = {
    repo: createMemoryFeedbackRepository(),
    storage: "memory",
    now: () => now,
    newId: () => `00000000-0000-4000-9000-${String(++counter).padStart(12, "0")}`,
  };
  return { deps, advance: (ms: number) => (now += ms) };
}

const DAY = 24 * 60 * 60 * 1000;

async function board(deps: FeedbackDeps, actor = memberN(99)) {
  return (await feedbackBoard(actor, deps)).body as FeedbackBoard;
}

async function overview(deps: FeedbackDeps) {
  return (await adminOverview(ADMIN, deps)).body as AdminOverview;
}

async function review(deps: FeedbackDeps, actor: { id: string; isAdmin: boolean }, extra: Record<string, unknown> = {}) {
  return memberAction(actor, { action: "review", rating: 4, likedText: "The breathing pages", publishConsent: true, ...extra }, deps);
}

describe("rating maths", () => {
  it("averages only the ratings given, with no rounding up and no invented values", () => {
    expect(summarizeRatings([])).toEqual({ average: null, total: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    expect(summarizeRatings([5, 4, 4, 1])).toEqual({ average: 3.5, total: 4, counts: { 1: 1, 2: 0, 3: 0, 4: 2, 5: 1 } });
    expect(summarizeRatings([5, 5, 4]).average).toBe(4.7);
    expect(summarizeRatings([7, 0, Number.NaN, 3]).total).toBe(1);
  });

  it("counts published reviews with consent only", () => {
    const base = { publishConsent: true, status: "published" } as StoredReview;
    const rows = [
      { ...base, rating: 5 },
      { ...base, rating: 1 },
      { ...base, rating: 3, status: "pending" },
      { ...base, rating: 3, status: "hidden" },
      { ...base, rating: 2, publishConsent: false },
    ] as StoredReview[];
    expect(publicSummary(rows)).toEqual({ average: 3, total: 2, counts: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 1 } });
  });
});

describe("review form", () => {
  it("needs a star rating and accepts everything else as optional", () => {
    expect(parseReview({}).ok).toBe(false);
    expect(parseReview({ rating: 6 }).ok).toBe(false);
    const parsed = parseReview({ rating: "3" });
    expect(parsed.ok && parsed.value).toMatchObject({ rating: 3, publishConsent: false, displayName: null, recommend: null });
  });

  it("keeps a name only with consent to publish, and only a first name", () => {
    const anonymous = parseReview({ rating: 5, publishConsent: true, showName: false, displayName: "Anna" });
    expect(anonymous.ok && anonymous.value.displayName).toBeNull();
    const privateOne = parseReview({ rating: 5, publishConsent: false, showName: true, displayName: "Anna" });
    expect(privateOne.ok && privateOne.value.displayName).toBeNull();
    const named = parseReview({ rating: 5, publishConsent: true, showName: true, displayName: "  Anna  " });
    expect(named.ok && named.value.displayName).toBe("Anna");
    expect(parseReview({ rating: 5, publishConsent: true, showName: true, displayName: "anna@example.org" }).ok).toBe(false);
    expect(parseReview({ rating: 5, publishConsent: true, showName: true, displayName: "Олена" }).ok).toBe(true);
  });

  it("drops unknown sections and refuses long answers", () => {
    const parsed = parseReview({ rating: 4, likedSections: ["nutrition", "nope", "nutrition"] });
    expect(parsed.ok && parsed.value.likedSections).toEqual(["nutrition"]);
    expect(parseReview({ rating: 4, likedText: "x".repeat(1001) }).ok).toBe(false);
  });
});

describe("submitting and publishing reviews", () => {
  it("saves a review as waiting; nothing is public until the administrator publishes it", async () => {
    const { deps } = setup();
    const sent = await review(deps, memberN(1), { rating: 5, showName: true, displayName: "Anna" });
    expect(sent.status).toBe(201);
    expect((await board(deps)).summary.total).toBe(0);
    expect((await board(deps)).reviews).toEqual([]);
    const id = (await overview(deps)).reviews[0].id;
    expect((await adminAction(ADMIN, { target: "review", op: "publish", id }, deps)).status).toBe(200);
    const after = await board(deps);
    expect(after.summary).toMatchObject({ average: 5, total: 1 });
    expect(after.reviews[0]).toMatchObject({ rating: 5, name: "Anna", likedText: "The breathing pages" });
  });

  it("publishes an honest low rating like any other and never flags it for being low", async () => {
    const { deps } = setup();
    await review(deps, memberN(1), { rating: 1, likedText: "", improveText: "The menu is confusing on my phone." });
    const row = (await overview(deps)).reviews[0];
    expect(row.flagged).toBe(false);
    expect((await adminAction(ADMIN, { target: "review", op: "publish", id: row.id }, deps)).status).toBe(200);
    expect((await board(deps)).summary).toMatchObject({ average: 1, total: 1 });
  });

  it("shows an anonymous review without a name and never returns account ids or notes to members", async () => {
    const { deps } = setup();
    await review(deps, memberN(1), { featuresText: "A sleep diary" });
    const id = (await overview(deps)).reviews[0].id;
    await adminAction(ADMIN, { target: "review", op: "note", id, note: "Call back about sleep" }, deps);
    await adminAction(ADMIN, { target: "review", op: "publish", id }, deps);
    const json = JSON.stringify(await board(deps));
    expect(json).not.toContain(memberN(1).id);
    expect(json).not.toContain("Call back");
    expect(json).not.toContain("A sleep diary");
    expect((await board(deps)).reviews[0].name).toBeNull();
  });

  it("refuses to publish a review its author kept private", async () => {
    const { deps } = setup();
    await review(deps, memberN(1), { publishConsent: false });
    const id = (await overview(deps)).reviews[0].id;
    expect((await adminAction(ADMIN, { target: "review", op: "publish", id }, deps)).status).toBe(409);
    expect((await board(deps)).summary.total).toBe(0);
  });

  it("hides and restores a published review, and recalculates the average each time", async () => {
    const { deps } = setup();
    await review(deps, memberN(1), { rating: 5 });
    await review(deps, memberN(2), { rating: 2 });
    for (const row of (await overview(deps)).reviews) await adminAction(ADMIN, { target: "review", op: "publish", id: row.id }, deps);
    expect((await board(deps)).summary).toMatchObject({ average: 3.5, total: 2 });
    const low = (await overview(deps)).reviews.find((row) => row.rating === 2)!;
    await adminAction(ADMIN, { target: "review", op: "hide", id: low.id }, deps);
    expect((await board(deps)).summary).toMatchObject({ average: 5, total: 1 });
    await adminAction(ADMIN, { target: "review", op: "restore", id: low.id }, deps);
    expect((await board(deps)).summary).toMatchObject({ average: 3.5, total: 2 });
  });

  it("restores a review that was hidden before publication to the waiting list", async () => {
    const { deps } = setup();
    await review(deps, memberN(1));
    const id = (await overview(deps)).reviews[0].id;
    await adminAction(ADMIN, { target: "review", op: "hide", id }, deps);
    await adminAction(ADMIN, { target: "review", op: "restore", id }, deps);
    expect((await overview(deps)).reviews[0].status).toBe("pending");
  });

  it("flags, unflags, and deletes", async () => {
    const { deps } = setup();
    await review(deps, memberN(1));
    const id = (await overview(deps)).reviews[0].id;
    await adminAction(ADMIN, { target: "review", op: "flag", id, reason: "fraud" }, deps);
    expect((await overview(deps)).reviews[0]).toMatchObject({ flagged: true, flagReason: "fraud" });
    await adminAction(ADMIN, { target: "review", op: "unflag", id }, deps);
    expect((await overview(deps)).reviews[0].flagged).toBe(false);
    await adminAction(ADMIN, { target: "review", op: "delete", id }, deps);
    expect((await overview(deps)).reviews).toEqual([]);
  });

  it("allows one review a month per member and treats a double click as one review", async () => {
    const { deps, advance } = setup();
    expect((await review(deps, memberN(1), { clientRequestId: "request-0001" })).status).toBe(201);
    expect((await review(deps, memberN(1), { clientRequestId: "request-0001" })).status).toBe(200);
    expect((await review(deps, memberN(1))).status).toBe(409);
    expect((await board(deps, memberN(1))).nextReviewAt).not.toBeNull();
    advance(31 * DAY);
    expect((await review(deps, memberN(1))).status).toBe(201);
    expect((await overview(deps)).reviews).toHaveLength(2);
  });

  it("ignores a form filled in by a script (honeypot) without saving it", async () => {
    const { deps } = setup();
    expect((await review(deps, memberN(1), { website: "http://spam.example" })).status).toBe(200);
    expect((await overview(deps)).reviews).toEqual([]);
  });

  it("flags possible spam or private details for a person to read, without rejecting them", async () => {
    expect(autoFlag("Call me at +1 555 123 4567")).toBe("privacy");
    expect(autoFlag("write to anna@example.org")).toBe("privacy");
    expect(autoFlag("visit www.cheap-pills.example now")).toBe("spam");
    expect(autoFlag("I gave it one star because the recipes are hard to find.")).toBeNull();
    const { deps } = setup();
    expect((await review(deps, memberN(1), { thoughts: "email me at anna@example.org" })).status).toBe(201);
    expect((await overview(deps)).reviews[0]).toMatchObject({ flagged: true, flagReason: "privacy", status: "pending" });
  });

  it("keeps the features answer as a suggestion too, linked to the review", async () => {
    const { deps } = setup();
    await review(deps, memberN(1), { featuresText: "A sleep diary" });
    const data = await overview(deps);
    expect(data.suggestions).toHaveLength(1);
    expect(data.suggestions[0]).toMatchObject({ source: "review", category: "feature", title: "A sleep diary", reviewId: data.reviews[0].id });
    // It is not listed under the member's own suggestions form history.
    expect((await board(deps, memberN(1))).ownSuggestions).toEqual([]);
  });
});

describe("suggestions", () => {
  const suggest = (deps: FeedbackDeps, actor: { id: string; isAdmin: boolean }, extra: Record<string, unknown> = {}) =>
    memberAction(actor, { action: "suggestion", category: "feature", title: "Dark mode", details: "Easier at night", ...extra }, deps);

  it("saves a suggestion separately from reviews and shows the member its status", async () => {
    const { deps } = setup();
    expect((await suggest(deps, memberN(1))).status).toBe(201);
    expect((await overview(deps)).reviews).toEqual([]);
    const own = (await board(deps, memberN(1))).ownSuggestions;
    expect(own).toEqual([expect.objectContaining({ title: "Dark mode", status: "new" })]);
    expect((await board(deps, memberN(2))).ownSuggestions).toEqual([]);
  });

  it("refuses the same suggestion twice and limits how many are sent in a day", async () => {
    const { deps } = setup();
    await suggest(deps, memberN(1));
    expect((await suggest(deps, memberN(1), { title: "  dark   MODE ", details: "easier at night" })).status).toBe(409);
    for (let i = 0; i < 9; i += 1) expect((await suggest(deps, memberN(1), { title: `Idea number ${i}` })).status).toBe(201);
    expect((await suggest(deps, memberN(1), { title: "One more idea" })).status).toBe(429);
  });

  it("lets the administrator categorize, group by theme, change status, and keep notes private", async () => {
    const { deps } = setup();
    await suggest(deps, memberN(1));
    await suggest(deps, memberN(2), { title: "Night colors", category: "improvement" });
    const [a, b] = (await overview(deps)).suggestions;
    await adminAction(ADMIN, { target: "suggestion", op: "category", id: b.id, category: "feature" }, deps);
    for (const row of [a, b]) await adminAction(ADMIN, { target: "suggestion", op: "theme", id: row.id, theme: "Dark mode" }, deps);
    for (const status of ["under-review", "planned", "in-progress", "completed"]) {
      expect((await adminAction(ADMIN, { target: "suggestion", op: "status", id: a.id, status }, deps)).status).toBe(200);
    }
    expect((await adminAction(ADMIN, { target: "suggestion", op: "status", id: a.id, status: "done" }, deps)).status).toBe(400);
    await adminAction(ADMIN, { target: "suggestion", op: "note", id: a.id, note: "Ship in December" }, deps);
    const data = await overview(deps);
    expect(data.analytics.topThemes[0]).toEqual({ id: "Dark mode", count: 2, open: 1 });
    expect(data.analytics.suggestionsByCategory).toEqual([{ id: "feature", count: 2 }]);
    expect(data.analytics.completed).toBe(1);
    const own = JSON.stringify(await board(deps, memberN(1)));
    expect(own).toContain("completed");
    expect(own).not.toContain("Ship in December");
    expect(own).not.toContain("Dark mode\",\"open");
  });
});

describe("You asked, we listened! announcements", () => {
  it("lets the administrator create a draft, publish, hide, edit, and delete", async () => {
    const { deps } = setup();
    const draft = { target: "announcement", op: "create", title: "A new Brain Health section", description: "Based on your feedback.", implementedOn: "2026-11-20", category: "Brain & Mind", imagePath: "/imagery/brain.webp" };
    expect((await adminAction(ADMIN, draft, deps)).status).toBe(201);
    expect((await board(deps)).announcements).toEqual([]);
    const id = (await overview(deps)).announcements[0].id;
    await adminAction(ADMIN, { target: "announcement", op: "publish", id }, deps);
    expect((await board(deps)).announcements[0]).toMatchObject({ title: "A new Brain Health section", implementedOn: "2026-11-20" });
    await adminAction(ADMIN, { ...draft, op: "update", id, title: "Brain Health is here", published: true }, deps);
    expect((await board(deps)).announcements[0].title).toBe("Brain Health is here");
    await adminAction(ADMIN, { target: "announcement", op: "unpublish", id }, deps);
    expect((await board(deps)).announcements).toEqual([]);
    await adminAction(ADMIN, { target: "announcement", op: "delete", id }, deps);
    expect((await overview(deps)).announcements).toEqual([]);
  });

  it("accepts only images that are part of the site and real dates", () => {
    expect(parseImagePath("/imagery/brain.webp").ok).toBe(true);
    expect(parseImagePath("https://example.org/a.png").ok).toBe(false);
    expect(parseImagePath("//example.org/a.png").ok).toBe(false);
    expect(parseImagePath("/../secret.png").ok).toBe(false);
    expect(parseAnnouncement({ title: "Title", description: "Text", implementedOn: "2026-02-30" }).ok).toBe(false);
  });
});

describe("administrator protection", () => {
  it("refuses every administrator view and action to a member", async () => {
    const { deps } = setup();
    await review(deps, memberN(1));
    expect((await adminOverview(memberN(1), deps)).status).toBe(403);
    const id = (await overview(deps)).reviews[0].id;
    for (const op of ["publish", "hide", "restore", "delete", "note", "flag"]) {
      expect((await adminAction(memberN(1), { target: "review", op, id }, deps)).status).toBe(403);
    }
    expect((await adminAction(memberN(1), { target: "announcement", op: "create", title: "x" }, deps)).status).toBe(403);
    expect((await overview(deps)).reviews[0].status).toBe("pending");
  });

  it("shows the administrator a member code, never the account id", async () => {
    const { deps } = setup();
    await review(deps, memberN(1));
    const json = JSON.stringify(await overview(deps));
    expect(json).not.toContain(memberN(1).id);
    expect(json).toContain(memberCode(memberN(1).id));
  });

  it("routes check the sign-in on the server and use the service role only on the server", () => {
    const root = join(process.cwd(), "src");
    const member = readFileSync(join(root, "app/api/feedback/route.ts"), "utf8");
    const admin = readFileSync(join(root, "app/api/admin/feedback/route.ts"), "utf8");
    expect(member.match(/await requireMember\(request\)/g)).toHaveLength(2);
    expect(admin.match(/await requireAdmin\(request\)/g)).toHaveLength(2);
    for (const file of ["lib/feedback/runtime.ts", "lib/feedback/supabase-repository.ts"]) {
      expect(readFileSync(join(root, file), "utf8")).not.toMatch(/^"use client"/);
    }
  });

  it("keeps database rows and the app's review shape in step", () => {
    const original: StoredReview = {
      id: "00000000-0000-4000-9000-000000000001",
      userId: memberN(1).id,
      rating: 3,
      likedText: "a",
      likedSections: ["nutrition"],
      improveText: "b",
      improveSections: [],
      featuresText: "",
      recommend: "maybe",
      thoughts: "",
      publishConsent: true,
      displayName: "Anna",
      locale: "uk",
      status: "published",
      flagged: false,
      flagReason: null,
      adminNote: "",
      clientRequestId: null,
      contentHash: "h",
      createdAt: "2026-11-22T10:00:00.000Z",
      updatedAt: "2026-11-22T10:00:00.000Z",
      publishedAt: "2026-11-22T10:00:00.000Z",
    };
    expect(toReview(reviewRow(original))).toEqual(original);
  });
});

describe("review invitation timing", () => {
  it("waits until the member has used LifeZoi on several days, and never asks again after a review", async () => {
    const { blankInvite, noteVisit, shouldInvite, snooze } = await import("@/lib/feedback/invitation");
    const start = new Date("2026-11-01T09:00:00Z");
    let record = noteVisit(blankInvite(start), start);
    expect(shouldInvite(record, start, false)).toBe(false);
    for (const day of ["2026-11-03T09:00:00Z", "2026-11-06T09:00:00Z"]) record = noteVisit(record, new Date(day));
    const later = new Date("2026-11-07T09:00:00Z");
    expect(shouldInvite(record, later, false)).toBe(true);
    expect(shouldInvite(record, later, true)).toBe(false);
    record = snooze(record, later);
    expect(shouldInvite(record, new Date("2026-11-20T09:00:00Z"), false)).toBe(false);
    expect(shouldInvite(record, new Date("2026-12-08T09:00:00Z"), false)).toBe(true);
    record = snooze(record, new Date("2026-12-08T09:00:00Z"));
    expect(shouldInvite(record, new Date("2027-06-01T09:00:00Z"), false)).toBe(false);
  });

  it("counts one visit per day and survives broken saved data", async () => {
    const { noteVisit, parseInvite } = await import("@/lib/feedback/invitation");
    const now = new Date("2026-11-22T09:00:00Z");
    const record = parseInvite("{not json", now);
    expect(noteVisit(noteVisit(record, now), new Date("2026-11-22T20:00:00Z")).visitDays).toEqual(["2026-11-22"]);
  });
});
