import { describe, expect, it } from "vitest";
import { installHintFor, isAppleMobile, isAppleSafari, parseClosedAt } from "@/lib/pwa/install-hint";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0 Mobile/15E148 Safari/604.1";
const IPAD_AS_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36";

const DAY = 24 * 60 * 60 * 1000;
const base = { standalone: false, canPrompt: false, userAgent: ANDROID_CHROME, maxTouchPoints: 5, closedAt: null, now: 100 * DAY };

describe("install hint", () => {
  it("offers the browser's install button when it fired beforeinstallprompt", () => {
    expect(installHintFor({ ...base, canPrompt: true })).toBe("prompt");
  });

  it("shows nothing on Android until the browser offers to install", () => {
    expect(installHintFor(base)).toBe("none");
  });

  it("explains Share, then Add to Home Screen, on iPhone and iPad Safari", () => {
    expect(installHintFor({ ...base, userAgent: IPHONE_SAFARI })).toBe("ios");
    expect(installHintFor({ ...base, userAgent: IPAD_AS_MAC, maxTouchPoints: 5 })).toBe("ios");
  });

  it("does not give Safari steps to Chrome on iPhone or to a Mac", () => {
    expect(installHintFor({ ...base, userAgent: IPHONE_CHROME })).toBe("none");
    expect(installHintFor({ ...base, userAgent: IPAD_AS_MAC, maxTouchPoints: 0 })).toBe("none");
  });

  it("never shows inside the installed app", () => {
    expect(installHintFor({ ...base, standalone: true, canPrompt: true })).toBe("none");
    expect(installHintFor({ ...base, standalone: true, userAgent: IPHONE_SAFARI })).toBe("none");
  });

  it("stays away for 30 days after it is closed, then comes back", () => {
    expect(installHintFor({ ...base, canPrompt: true, closedAt: base.now - 5 * DAY })).toBe("none");
    expect(installHintFor({ ...base, canPrompt: true, closedAt: base.now - 31 * DAY })).toBe("prompt");
  });

  it("ignores a closed time in the future, such as after a clock change", () => {
    expect(installHintFor({ ...base, canPrompt: true, closedAt: base.now + DAY })).toBe("prompt");
  });

  it("reads only a positive number as the closed time", () => {
    expect(parseClosedAt(null)).toBeNull();
    expect(parseClosedAt("")).toBeNull();
    expect(parseClosedAt("soon")).toBeNull();
    expect(parseClosedAt("-4")).toBeNull();
    expect(parseClosedAt("1700000000000")).toBe(1700000000000);
  });

  it("recognises Apple phones and Safari", () => {
    expect(isAppleMobile(IPHONE_SAFARI, 5)).toBe(true);
    expect(isAppleMobile(ANDROID_CHROME, 5)).toBe(false);
    expect(isAppleSafari(IPHONE_SAFARI)).toBe(true);
    expect(isAppleSafari(IPHONE_CHROME)).toBe(false);
  });
});
