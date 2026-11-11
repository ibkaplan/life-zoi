import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createAudioFocus } from "./audio-focus";
import { DEFAULT_PREFS, dayPartFor, effectiveVolume, parsePrefs, serializePrefs, sessionEffect, shouldTryResume } from "./prefs";
import { RECORDINGS, recordingProblems, type Recording } from "./tracks";
import {
  BUILT_IN_BY_CATEGORY,
  categoryPlaylist,
  LIBRARY_CATEGORIES,
  libraryRecordingProblems,
  nextIndex,
  PIXABAY_RECORDINGS,
  previousIndex,
  startIndex,
  type LibraryRecording,
} from "@/lib/music-library/catalog";
import { trackById } from "@/lib/companion/music";
import { en } from "@/lib/i18n/messages/en";
import { MESSAGES } from "@/lib/i18n/messages";

describe("music preference", () => {
  it("starts silent and soft when nothing was saved", () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(DEFAULT_PREFS.choice).toBe("unset");
    expect(shouldTryResume(DEFAULT_PREFS)).toBe(false);
    expect(DEFAULT_PREFS.volume).toBeLessThanOrEqual(0.4);
  });

  it("survives a round trip", () => {
    const prefs = { ...DEFAULT_PREFS, choice: "paused" as const, volume: 0.55, muted: true, trackId: "canon-ground", category: "nature" as const, underSessions: false, sessionVolume: 0.2 };
    expect(parsePrefs(serializePrefs(prefs))).toEqual(prefs);
  });

  it("ignores broken or unexpected values", () => {
    expect(parsePrefs("not json")).toEqual(DEFAULT_PREFS);
    expect(parsePrefs('{"choice":"loud","volume":9,"muted":"yes","trackId":"<script>","category":"rock","sessionVolume":"x"}')).toEqual({
      ...DEFAULT_PREFS,
      choice: "unset",
      volume: 1,
      muted: false,
      trackId: null,
    });
  });

  it("reads a preference saved before categories existed", () => {
    expect(parsePrefs('{"choice":"playing","volume":0.4,"muted":false,"trackId":"canon-ground"}')).toEqual({
      ...DEFAULT_PREFS,
      choice: "playing",
      volume: 0.4,
      trackId: "canon-ground",
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
    expect(effectiveVolume({ volume: 0.5, muted: true, sessionVolume: 0.2 }, true)).toBe(0);
  });

  it("plays at the separate, quieter session level under a video or voice", () => {
    expect(DEFAULT_PREFS.underSessions).toBe(true);
    expect(DEFAULT_PREFS.sessionVolume).toBeLessThan(DEFAULT_PREFS.volume);
    expect(effectiveVolume({ volume: 0.5, muted: false, sessionVolume: 0.15 }, true)).toBe(0.15);
  });

  it("lowers music under videos and voices, and pauses it for another tune", () => {
    expect(sessionEffect([], true)).toBe("none");
    expect(sessionEffect(["video"], true)).toBe("duck");
    expect(sessionEffect(["voice"], true)).toBe("duck");
    expect(sessionEffect(["video", "voice"], false)).toBe("pause");
    expect(sessionEffect(["video", "sound"], true)).toBe("pause");
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

  it("refuses licences that do not allow hosting", () => {
    const bad = { license: "CC BY-NC 4.0", file: "song.mp3", sourceUrl: "http://x", verifiedOn: "today" } as unknown as Recording;
    expect(recordingProblems({ ...bad, id: "x", title: "x", composer: "x", performer: "x", attribution: "x" }).length).toBe(4);
  });

  it("continues from the saved piece and wraps around in both directions", () => {
    const playlist = categoryPlaylist("classical", [], []);
    expect(startIndex(playlist, playlist[1]?.id ?? null)).toBe(1);
    expect(startIndex(playlist, "gone")).toBe(0);
    expect(nextIndex(playlist, playlist.length - 1)).toBe(0);
    expect(previousIndex(playlist, 0)).toBe(playlist.length - 1);
  });
});

describe("music library", () => {
  const example: LibraryRecording = {
    id: "ocean-waves",
    category: "nature",
    title: "Ocean Waves",
    artist: "Example uploader",
    file: "/audio/library/nature/ocean-waves.mp3",
    license: "Pixabay Content License",
    sourceUrl: "https://pixabay.com/sound-effects/ocean-waves-123456/",
    verifiedOn: "2026-11-10",
  };

  it("has the six categories, each with something to play", () => {
    expect(LIBRARY_CATEGORIES).toEqual(["classical", "meditation", "yoga", "nature", "morning", "sleep"]);
    for (const category of LIBRARY_CATEGORIES) {
      expect(categoryPlaylist(category, [], []).length, category).toBeGreaterThanOrEqual(3);
      for (const id of BUILT_IN_BY_CATEGORY[category]) expect(trackById(id), id).not.toBeNull();
    }
  });

  it("offers Moonlight Sonata and Für Elise as LifeZoi's own labelled performances", () => {
    for (const id of ["moonlight-opening", "fur-elise"]) {
      const track = trackById(id);
      expect(track?.credit).toMatch(/Beethoven.*public domain.*synthesized by LifeZoi/);
      expect(BUILT_IN_BY_CATEGORY.classical).toContain(id);
    }
  });

  it("classical in-browser pieces are public domain compositions", () => {
    for (const piece of categoryPlaylist("classical", [], [])) {
      if (piece.kind === "synth") expect(piece.track.credit, piece.id).toMatch(/public domain/i);
    }
  });

  it("lists only Pixabay tracks whose entry is complete and whose file is in public/", () => {
    for (const recording of PIXABAY_RECORDINGS) {
      expect(libraryRecordingProblems(recording), recording.id).toEqual([]);
      expect(existsSync(join(process.cwd(), "public", recording.file)), recording.file).toBe(true);
    }
    expect(new Set(PIXABAY_RECORDINGS.map((recording) => recording.id)).size).toBe(PIXABAY_RECORDINGS.length);
  });

  it("puts downloaded recordings ahead of the in-browser pieces of their category only", () => {
    expect(libraryRecordingProblems(example)).toEqual([]);
    expect(categoryPlaylist("nature", [example], [])[0]).toMatchObject({ kind: "file", id: "ocean-waves", artist: "Example uploader" });
    expect(categoryPlaylist("sleep", [example], []).some((piece) => piece.id === "ocean-waves")).toBe(false);
  });

  it("refuses incomplete or non-Pixabay entries", () => {
    expect(libraryRecordingProblems({ ...example, sourceUrl: "https://example.com/track" })).toHaveLength(1);
    expect(libraryRecordingProblems({ ...example, file: "/audio/library/sleep/ocean.mp3" })).toHaveLength(1);
    expect(libraryRecordingProblems({ ...example, license: "CC BY-NC 4.0" as never })).toHaveLength(1);
    expect(libraryRecordingProblems({ ...example, category: "classical", file: "/audio/library/classical/x.mp3" })).toEqual([
      "composer is required for classical music",
    ]);
  });

  it("names every category and piece in all four languages", () => {
    const ids = new Set(Object.values(BUILT_IN_BY_CATEGORY).flat());
    for (const [locale, messages] of Object.entries(MESSAGES)) {
      for (const category of LIBRARY_CATEGORIES) expect(messages.music.categories[category].name.trim(), `${locale} ${category}`).not.toBe("");
      for (const id of ids) {
        expect((messages.music.tracks as Record<string, string>)[id]?.trim(), `${locale} ${id}`).toBeTruthy();
        expect((messages.music.trackNotes as Record<string, string>)[id]?.trim(), `${locale} ${id}`).toBeTruthy();
      }
    }
    expect(Object.keys(en.music.tracks).sort()).toEqual([...ids].sort());
  });
});

describe("audio focus for the read-aloud voice", () => {
  it("lowers music for a voice instead of pausing it", () => {
    const focus = createAudioFocus();
    focus.claim("read-aloud", "voice");
    expect(focus.busy()).toBe(false);
    expect(focus.ducked()).toBe(true);
    focus.claim("video", "video");
    expect(focus.busy()).toBe(true);
    focus.release("read-aloud");
    expect(focus.ducked()).toBe(false);
  });
});
