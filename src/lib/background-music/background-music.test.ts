import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createAudioFocus } from "./audio-focus";
import { DEFAULT_PREFS, dayPartFor, effectiveVolume, parsePrefs, serializePrefs, shouldTryResume } from "./prefs";
import { backgroundPlaylist, nextIndex, RECORDINGS, recordingProblems, startIndex, type Recording } from "./tracks";

describe("music preference", () => {
  it("starts silent and soft when nothing was saved", () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(DEFAULT_PREFS.choice).toBe("unset");
    expect(shouldTryResume(DEFAULT_PREFS)).toBe(false);
    expect(DEFAULT_PREFS.volume).toBeLessThanOrEqual(0.4);
  });

  it("survives a round trip", () => {
    const prefs = { choice: "paused" as const, volume: 0.55, muted: true, trackId: "canon-ground" };
    expect(parsePrefs(serializePrefs(prefs))).toEqual(prefs);
  });

  it("ignores broken or unexpected values", () => {
    expect(parsePrefs("not json")).toEqual(DEFAULT_PREFS);
    expect(parsePrefs('{"choice":"loud","volume":9,"muted":"yes","trackId":"<script>"}')).toEqual({
      choice: "unset",
      volume: 1,
      muted: false,
      trackId: null,
    });
  });

  it("tries to continue only when the person left music playing", () => {
    expect(shouldTryResume({ ...DEFAULT_PREFS, choice: "playing" })).toBe(true);
    expect(shouldTryResume({ ...DEFAULT_PREFS, choice: "paused" })).toBe(false);
    expect(shouldTryResume({ ...DEFAULT_PREFS, choice: "off" })).toBe(false);
  });

  it("sends no sound when muted", () => {
    expect(effectiveVolume({ volume: 0.5, muted: true })).toBe(0);
    expect(effectiveVolume({ volume: 0.5, muted: false })).toBe(0.5);
  });

  it("names the part of the day", () => {
    expect(dayPartFor(4)).toBe("evening");
    expect(dayPartFor(5)).toBe("morning");
    expect(dayPartFor(11)).toBe("morning");
    expect(dayPartFor(12)).toBe("afternoon");
    expect(dayPartFor(18)).toBe("evening");
  });
});

describe("audio focus", () => {
  it("is busy while anything holds a claim", () => {
    const focus = createAudioFocus();
    const seen: number[] = [];
    focus.subscribe((claims) => seen.push(claims.length));
    focus.claim("video-player", "video");
    focus.claim("guided-breathing");
    focus.claim("guided-breathing");
    expect(focus.busy()).toBe(true);
    focus.release("video-player");
    focus.release("guided-breathing");
    expect(focus.busy()).toBe(false);
    expect(seen).toEqual([1, 2, 1, 0]);
  });
});

describe("playlist", () => {
  it("lists only recordings whose entry is complete and whose file is in public/", () => {
    for (const recording of RECORDINGS) {
      expect(recordingProblems(recording), recording.id).toEqual([]);
      expect(existsSync(join(process.cwd(), "public", recording.file)), recording.file).toBe(true);
    }
  });

  it("falls back to LifeZoi's own performances of public domain melodies", () => {
    const playlist = backgroundPlaylist([]);
    expect(playlist.length).toBeGreaterThan(0);
    for (const piece of playlist) {
      expect(piece.kind).toBe("synth");
      if (piece.kind === "synth") expect(piece.track.credit).toMatch(/public domain/i);
    }
  });

  it("uses real recordings instead once any are added", () => {
    const recording: Recording = {
      id: "example",
      title: "Example",
      composer: "Example",
      performer: "Example",
      file: "/audio/classical/example.mp3",
      license: "CC0 1.0",
      attribution: "Example",
      sourceUrl: "https://example.org/file",
      verifiedOn: "2026-11-10",
    };
    expect(backgroundPlaylist([recording]).map((piece) => piece.kind)).toEqual(["file"]);
  });

  it("refuses licences that do not allow hosting", () => {
    const bad = { license: "CC BY-NC 4.0", file: "song.mp3", sourceUrl: "http://x", verifiedOn: "today" } as unknown as Recording;
    expect(recordingProblems({ ...bad, id: "x", title: "x", composer: "x", performer: "x", attribution: "x" }).length).toBe(4);
  });

  it("continues from the saved piece and wraps around", () => {
    const playlist = backgroundPlaylist([]);
    expect(startIndex(playlist, playlist[1]?.id ?? null)).toBe(1);
    expect(startIndex(playlist, "gone")).toBe(0);
    expect(nextIndex(playlist, playlist.length - 1)).toBe(0);
  });
});
