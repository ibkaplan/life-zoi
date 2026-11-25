import { describe, expect, it } from "vitest";
import { defaultReminders, dueSlots, EMPTY_LOG, markHandled, nextSlot, sanitizeLog, sanitizeTimedReminders, slotKey, snooze, type TimedReminders } from "./schedule";

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 10, day, hours, minutes); // 2026-11-23 is a Monday

function withBp(times: string[], days = [0, 1, 2, 3, 4, 5, 6], since = 0): TimedReminders {
  const out = defaultReminders();
  out.blood_pressure = { on: true, times, days, since };
  return out;
}

describe("timed reminders", () => {
  it("starts with everything off", () => {
    expect(Object.values(defaultReminders()).every((item) => !item.on)).toBe(true);
    expect(dueSlots(defaultReminders(), EMPTY_LOG, at(23, 12))).toEqual([]);
  });

  it("cleans stored values", () => {
    const clean = sanitizeTimedReminders({ blood_pressure: { on: true, times: ["20:00", "08:00", "25:00", "08:00", 7], days: [1, 1, 9, -1, 3], since: "x" }, glucose: { on: true, times: [], days: [1] } });
    expect(clean.blood_pressure).toEqual({ on: true, times: ["08:00", "20:00"], days: [1, 3], since: 0 });
    expect(clean.glucose.on).toBe(false);
    expect(sanitizeTimedReminders("nonsense")).toEqual(defaultReminders());
  });

  it("shows the latest passed slot today only", () => {
    const reminders = withBp(["08:00", "20:00"]);
    expect(dueSlots(reminders, EMPTY_LOG, at(23, 7, 59))).toEqual([]);
    expect(dueSlots(reminders, EMPTY_LOG, at(23, 9)).map((slot) => slot.time)).toEqual(["08:00"]);
    expect(dueSlots(reminders, EMPTY_LOG, at(23, 21)).map((slot) => slot.time)).toEqual(["20:00"]);
  });

  it("respects days of the week and when it was turned on", () => {
    expect(dueSlots(withBp(["08:00"], [2]), EMPTY_LOG, at(23, 9))).toEqual([]); // Monday is not Tuesday
    expect(dueSlots(withBp(["08:00"], [1], at(23, 8, 30).getTime()), EMPTY_LOG, at(23, 9))).toEqual([]);
  });

  it("hides a handled or snoozed slot", () => {
    const reminders = withBp(["08:00"]);
    const key = slotKey("blood_pressure", at(23, 9), "08:00");
    expect(dueSlots(reminders, markHandled(EMPTY_LOG, key), at(23, 9))).toEqual([]);
    const snoozed = snooze(EMPTY_LOG, key, at(23, 9).getTime());
    expect(dueSlots(reminders, snoozed, at(23, 9, 10))).toEqual([]);
    expect(dueSlots(reminders, snoozed, at(23, 9, 16))).toHaveLength(1);
  });

  it("keeps only today's log", () => {
    const log = { handled: [slotKey("glucose", at(22, 9), "07:30"), slotKey("glucose", at(23, 9), "07:30")], snoozed: { [slotKey("glucose", at(22, 9), "07:30")]: 1 } };
    expect(sanitizeLog(log, at(23, 10))).toEqual({ handled: [slotKey("glucose", at(23, 9), "07:30")], snoozed: {} });
  });

  it("finds the next reminder", () => {
    expect(nextSlot(defaultReminders(), at(23, 9))).toBeNull();
    expect(nextSlot(withBp(["08:00", "20:00"]), at(23, 9))?.at).toBe(at(23, 20).getTime());
    expect(nextSlot(withBp(["08:00"], [3]), at(23, 9))?.at).toBe(at(25, 8).getTime());
  });
});
