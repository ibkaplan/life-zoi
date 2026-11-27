import { describe, expect, it } from "vitest";
import { emptyCompanion, isEmptyCompanion, sanitizeCompanion } from "@/lib/companion/state";
import { DISPLAY_BOOT_SCRIPT, defaultDisplay, newerDisplay, parseDisplay, sanitizeDisplay } from "./display-prefs";

describe("reading comfort settings", () => {
  it("keeps only known values", () => {
    expect(sanitizeDisplay({ textSize: "extra", calm: true, updatedAt: "2026-11-25T10:00:00.000Z" })).toEqual({
      textSize: "extra",
      calm: true,
      updatedAt: "2026-11-25T10:00:00.000Z",
    });
    expect(sanitizeDisplay({ textSize: "huge", calm: "yes", updatedAt: "soon" })).toEqual(defaultDisplay());
    expect(parseDisplay("not json")).toEqual(defaultDisplay());
    expect(parseDisplay(null)).toEqual(defaultDisplay());
  });

  it("lets the copy changed last win, and never lets an unchosen copy win", () => {
    const device = { textSize: "large" as const, calm: false, updatedAt: "2026-11-25T09:00:00.000Z" };
    const account = { textSize: "extra" as const, calm: true, updatedAt: "2026-11-25T10:00:00.000Z" };
    expect(newerDisplay(device, account)).toBe(account);
    expect(newerDisplay(account, device)).toBe(account);
    expect(newerDisplay(device, defaultDisplay())).toBe(device);
    expect(newerDisplay(defaultDisplay(), account)).toBe(account);
    expect(newerDisplay(device, null)).toBe(device);
  });

  it("travels in the account's companion state", () => {
    expect(emptyCompanion().display).toEqual(defaultDisplay());
    expect(sanitizeCompanion({}).display).toEqual(defaultDisplay());
    const state = sanitizeCompanion({ display: { textSize: "large", calm: true, updatedAt: "2026-11-25T10:00:00.000Z" } });
    expect(state.display.textSize).toBe("large");
    expect(isEmptyCompanion(state)).toBe(false);
    expect(isEmptyCompanion(emptyCompanion())).toBe(true);
  });

  it("boot script sets only known values on the page", () => {
    const run = (stored: string | null) => {
      const set: Record<string, string> = {};
      new Function("localStorage", "document", DISPLAY_BOOT_SCRIPT)(
        { getItem: () => stored },
        { documentElement: { setAttribute: (name: string, value: string) => (set[name] = value) } },
      );
      return set;
    };
    expect(run(JSON.stringify({ textSize: "extra", calm: true }))).toEqual({ "data-text": "extra", "data-calm": "on" });
    expect(run(JSON.stringify({ textSize: "normal", calm: false }))).toEqual({});
    expect(run(JSON.stringify({ textSize: "<script>", calm: "true" }))).toEqual({});
    expect(run("{broken")).toEqual({});
    expect(run(null)).toEqual({});
  });
});
