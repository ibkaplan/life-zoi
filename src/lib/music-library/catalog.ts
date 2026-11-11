/**
 * The LifeZoi music library: six categories, each a playlist for the one
 * site-wide music player (`src/components/background-music/provider.tsx`).
 *
 * A category plays, in order:
 * 1. Downloaded recordings from Pixabay Music (`PIXABAY_RECORDINGS`), stored in
 *    `public/audio/library/<category>/`. Add one only after reading the track's
 *    own Pixabay page and the Pixabay Content License yourself. The steps and
 *    the list of wanted tracks are in `public/audio/library/CREDITS.md`.
 *    The list is empty until a person adds a verified file: no track is listed
 *    whose licence was not read.
 * 2. Any classical recordings from `RECORDINGS` in `src/lib/background-music/tracks.ts`
 *    (classical category only).
 * 3. LifeZoi's own in-browser pieces from `src/lib/companion/music.ts`: original
 *    sound design, and LifeZoi performances of melodies whose composers died long
 *    ago. Nothing is downloaded or streamed for these.
 */
import { trackById, type Track } from "@/lib/companion/music";
import { RECORDINGS, type Recording } from "@/lib/background-music/tracks";

export const LIBRARY_CATEGORIES = ["classical", "meditation", "yoga", "nature", "morning", "sleep"] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export const DEFAULT_CATEGORY: LibraryCategory = "classical";

export function isLibraryCategory(value: unknown): value is LibraryCategory {
  return typeof value === "string" && (LIBRARY_CATEGORIES as readonly string[]).includes(value);
}

/** Picture shown on each category card. The words come from the translation files. */
export const CATEGORY_ICON: Record<LibraryCategory, string> = {
  classical: "🎹",
  meditation: "🪷",
  yoga: "🧘",
  nature: "🌿",
  morning: "🌅",
  sleep: "🌙",
};

/** LifeZoi's own pieces in each category, gentlest first. Ids are from `src/lib/companion/music.ts`. */
export const BUILT_IN_BY_CATEGORY: Record<LibraryCategory, readonly string[]> = {
  classical: ["moonlight-opening", "fur-elise", "canon-ground", "ode-to-joy"],
  meditation: ["still-point", "garden-air", "soft-evening"],
  yoga: ["gentle-flow", "breath-four-six", "breath-box"],
  nature: ["sea-shore", "spring-rain", "forest-birds", "flowing-stream"],
  morning: ["sunrise-piano", "morning-steps", "clear-desk"],
  sleep: ["brahms-lullaby", "night-harbour", "soft-evening"],
};

export const PIXABAY_LICENSE = "Pixabay Content License" as const;
export const PIXABAY_LICENSE_URL = "https://pixabay.com/service/license-summary/";

/** One downloaded Pixabay track. Every field is required; `libraryRecordingProblems` checks them. */
export type LibraryRecording = {
  id: string;
  category: LibraryCategory;
  /** The title exactly as the Pixabay page shows it. */
  title: string;
  /** The Pixabay uploader, exactly as the page names them. */
  artist: string;
  /** Path under `public/`, for example `/audio/library/nature/ocean-waves.mp3`. */
  file: string;
  license: typeof PIXABAY_LICENSE;
  /** The track's own page, for example `https://pixabay.com/music/<slug>-<number>/`. */
  sourceUrl: string;
  /** The date a person read that page and the licence, as YYYY-MM-DD. */
  verifiedOn: string;
  /** For a classical piece: the composer, so the composition is public domain. */
  composer?: string;
};

/**
 * Downloaded Pixabay tracks. Empty on purpose: the environment that built the
 * library could not reach pixabay.com, so no track page or licence was read.
 * Add entries by following `public/audio/library/CREDITS.md`.
 */
export const PIXABAY_RECORDINGS: LibraryRecording[] = [];

export type FilePiece = {
  kind: "file";
  id: string;
  title: string;
  artist: string;
  file: string;
  license: string;
  sourceUrl: string;
};

export type SynthPiece = { kind: "synth"; id: string; track: Track };

export type LibraryPiece = FilePiece | SynthPiece;

function fromLibrary(recording: LibraryRecording): FilePiece {
  return {
    kind: "file",
    id: recording.id,
    title: recording.title,
    artist: recording.artist,
    file: recording.file,
    license: recording.license,
    sourceUrl: recording.sourceUrl,
  };
}

function fromClassical(recording: Recording): FilePiece {
  return {
    kind: "file",
    id: recording.id,
    title: recording.title,
    artist: recording.performer,
    file: recording.file,
    license: recording.license,
    sourceUrl: recording.sourceUrl,
  };
}

/** The playlist for a category: downloaded recordings first, then LifeZoi's own pieces. */
export function categoryPlaylist(
  category: LibraryCategory,
  pixabay: readonly LibraryRecording[] = PIXABAY_RECORDINGS,
  classical: readonly Recording[] = RECORDINGS,
): LibraryPiece[] {
  const files: FilePiece[] = [
    ...pixabay.filter((recording) => recording.category === category).map(fromLibrary),
    ...(category === "classical" ? classical.map(fromClassical) : []),
  ];
  const builtIn = BUILT_IN_BY_CATEGORY[category].flatMap((id) => {
    const track = trackById(id);
    return track ? [{ kind: "synth" as const, id, track }] : [];
  });
  return [...files, ...builtIn];
}

/** Where to start: the saved piece if it is in the playlist, otherwise the first. */
export function startIndex(playlist: readonly LibraryPiece[], savedId: string | null): number {
  const index = savedId ? playlist.findIndex((piece) => piece.id === savedId) : -1;
  return index >= 0 ? index : 0;
}

export function nextIndex(playlist: readonly LibraryPiece[], current: number): number {
  return playlist.length === 0 ? 0 : (current + 1) % playlist.length;
}

export function previousIndex(playlist: readonly LibraryPiece[], current: number): number {
  return playlist.length === 0 ? 0 : (current - 1 + playlist.length) % playlist.length;
}

/** Length in seconds, when it is known before the file loads. */
export function pieceLength(piece: LibraryPiece | null): number | null {
  if (!piece) return null;
  return piece.kind === "synth" ? piece.track.minutes * 60 : null;
}

/** Problems with a Pixabay entry. An empty list means the entry is complete. */
export function libraryRecordingProblems(recording: LibraryRecording): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9-]{1,64}$/.test(recording.id)) problems.push("id must be lowercase letters, numbers, and dashes");
  if (!isLibraryCategory(recording.category)) problems.push("category is not a library category");
  const folder = isLibraryCategory(recording.category) ? recording.category : "<category>";
  if (!new RegExp(`^/audio/library/${folder}/[a-z0-9-]+\\.(mp3|m4a|ogg)$`).test(recording.file))
    problems.push(`file must be /audio/library/${folder}/<name>.mp3, .m4a, or .ogg`);
  if (recording.license !== PIXABAY_LICENSE) problems.push(`license must be "${PIXABAY_LICENSE}"`);
  if (!/^https:\/\/pixabay\.com\/(music|sound-effects)\/[a-z0-9-]+\/?$/.test(recording.sourceUrl))
    problems.push("sourceUrl must be the track's own https://pixabay.com/music/… or /sound-effects/… page");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recording.verifiedOn)) problems.push("verifiedOn must be YYYY-MM-DD");
  for (const field of ["title", "artist"] as const) {
    if (!recording[field]?.trim()) problems.push(`${field} is required`);
  }
  if (recording.category === "classical" && !recording.composer?.trim()) problems.push("composer is required for classical music");
  return problems;
}
