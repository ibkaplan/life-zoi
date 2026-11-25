import { describe, expect, it } from "vitest";
import {
  challengeDay,
  earnedBadges,
  emptyChallenge,
  fromRow,
  isStepOpen,
  nextStep,
  parseSummary,
  restartChallenge,
  sanitizeChallenge,
  startChallenge,
  toggleStep,
  TOGETHER_STEPS,
  type CircleSummary,
} from "@/lib/friends/challenge";

const noFriends: CircleSummary = { friendsJoined: 0, joinedThroughFriend: false, friendsSharing: 0, togetherDays: 0 };

describe("Together challenge", () => {
  it("has seven steps, one per day, each linking to a page on the site", () => {
    expect(TOGETHER_STEPS.map((step) => step.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const step of TOGETHER_STEPS) expect(step.href.startsWith("/")).toBe(true);
  });

  it("opens one step a day from the start date and keeps missed days open", () => {
    const started = startChallenge(emptyChallenge(), "2026-11-25");
    expect(challengeDay(started, "2026-11-25")).toBe(1);
    expect(isStepOpen(started, 1, "2026-11-25")).toBe(true);
    expect(isStepOpen(started, 2, "2026-11-25")).toBe(false);
    expect(challengeDay(started, "2026-11-28")).toBe(4);
    expect(isStepOpen(started, 2, "2026-11-28")).toBe(true);
    expect(isStepOpen(started, 8, "2026-12-30")).toBe(false);
    expect(challengeDay(started, "2026-11-24")).toBe(0);
  });

  it("counts days across a month end and a daylight-saving change", () => {
    const started = startChallenge(emptyChallenge(), "2026-03-27");
    expect(challengeDay(started, "2026-04-02")).toBe(7);
  });

  it("ticks and unticks only open steps", () => {
    let state = startChallenge(emptyChallenge(), "2026-11-25");
    state = toggleStep(state, 2, "2026-11-25");
    expect(state.doneDays).toEqual([]);
    state = toggleStep(state, 1, "2026-11-25");
    expect(state.doneDays).toEqual([1]);
    expect(nextStep(state, "2026-11-25")).toBeNull();
    expect(nextStep(state, "2026-11-27")?.day).toBe(2);
    state = toggleStep(state, 1, "2026-11-25");
    expect(state.doneDays).toEqual([]);
  });

  it("does not move the start date once started, and restart clears the steps", () => {
    const started = startChallenge(emptyChallenge(), "2026-11-25");
    expect(startChallenge(started, "2026-11-30").startedOn).toBe("2026-11-25");
    const shared = { ...toggleStep(started, 1, "2026-11-25"), shareWithFriends: true };
    expect(restartChallenge(shared, "2026-12-05")).toEqual({ startedOn: "2026-12-05", doneDays: [], shareWithFriends: true });
  });

  it("keeps only valid saved values", () => {
    expect(sanitizeChallenge({ startedOn: "2026-02-30", doneDays: [1] })).toEqual(emptyChallenge());
    expect(sanitizeChallenge({ startedOn: "2026-11-25", doneDays: [3, 1, 1, 9, 2.5, "4"], shareWithFriends: "yes" })).toEqual({
      startedOn: "2026-11-25",
      doneDays: [1, 3],
      shareWithFriends: false,
    });
    expect(fromRow({ started_on: "2026-11-25", done_days: [2], share_with_friends: true })).toEqual({
      startedOn: "2026-11-25",
      doneDays: [2],
      shareWithFriends: true,
    });
  });
});

describe("friend summary and badges", () => {
  it("reads only counts and ignores anything else", () => {
    expect(parseSummary(null)).toBeNull();
    expect(parseSummary([1])).toBeNull();
    expect(parseSummary({ friends_joined: 2, joined_through_friend: true, friends_sharing: -1, together_days: "9", email: "x" })).toEqual({
      friendsJoined: 2,
      joinedThroughFriend: true,
      friendsSharing: 0,
      togetherDays: 0,
    });
  });

  it("gives both people a badge when a friend joins through a link", () => {
    const empty = emptyChallenge();
    expect([...earnedBadges(null, empty)]).toEqual([]);
    expect(earnedBadges({ ...noFriends, friendsJoined: 1 }, empty).has("care-sharer")).toBe(true);
    expect(earnedBadges({ ...noFriends, joinedThroughFriend: true }, empty).has("warm-welcome")).toBe(true);
    expect(earnedBadges({ ...noFriends, friendsJoined: 2 }, empty).has("circle-of-three")).toBe(false);
    expect(earnedBadges({ ...noFriends, friendsJoined: 3 }, empty).has("circle-of-three")).toBe(true);
  });

  it("awards challenge badges from the person's own steps", () => {
    const all = { startedOn: "2026-11-01", doneDays: [1, 2, 3, 4, 5, 6, 7], shareWithFriends: false };
    const badges = earnedBadges(noFriends, all);
    expect(badges.has("first-step")).toBe(true);
    expect(badges.has("seven-days")).toBe(true);
    expect(badges.has("stronger-together")).toBe(false);
  });

  it("needs at least one sharing friend for Stronger Together", () => {
    const state = { startedOn: "2026-11-01", doneDays: [1], shareWithFriends: true };
    expect(earnedBadges({ ...noFriends, togetherDays: 20 }, state).has("stronger-together")).toBe(false);
    expect(earnedBadges({ ...noFriends, friendsSharing: 1, togetherDays: 14 }, state).has("stronger-together")).toBe(true);
  });
});
