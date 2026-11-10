/**
 * What background music can play.
 *
 * 1. `RECORDINGS`: real recordings stored in `public/audio/classical/`. Add one
 *    only after reading its licence on the source page yourself. The steps are in
 *    `public/audio/classical/CREDITS.md`. The list is empty until a person adds a
 *    file whose licence they checked: no recording is listed that was not verified.
 * 2. These join the Classical category of the music library
 *    (`src/lib/music-library/catalog.ts`), ahead of LifeZoi's own in-browser
 *    performances of public domain melodies.
 */

/** Licences that allow LifeZoi to host and play the file. "NC" and "ND" licences are not accepted. */
export const ACCEPTED_LICENSES = ["Public domain", "CC0 1.0", "CC BY 3.0", "CC BY 4.0", "CC BY-SA 3.0", "CC BY-SA 4.0"] as const;
export type AcceptedLicense = (typeof ACCEPTED_LICENSES)[number];

export type Recording = {
  id: string;
  /** Composer and work, for example "Chopin — Nocturne in E-flat major, Op. 9 No. 2". Proper names stay untranslated. */
  title: string;
  composer: string;
  performer: string;
  /** Path under `public/`, for example `/audio/classical/chopin-nocturne-op9-2.mp3`. */
  file: string;
  license: AcceptedLicense;
  /** Attribution exactly as the licence asks for it. */
  attribution: string;
  /** The page where the licence was read, for example a Wikimedia Commons or Musopen file page. */
  sourceUrl: string;
  /** The date a person read that licence, as YYYY-MM-DD. */
  verifiedOn: string;
};

export const RECORDINGS: Recording[] = [];

/** Problems with a recording entry. An empty list means the entry is complete. */
export function recordingProblems(recording: Recording): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9-]{1,64}$/.test(recording.id)) problems.push("id must be lowercase letters, numbers, and dashes");
  if (!/^\/audio\/classical\/[a-z0-9-]+\.(mp3|ogg|oga|m4a)$/.test(recording.file)) problems.push("file must be /audio/classical/<name>.mp3, .ogg, .oga, or .m4a");
  if (!(ACCEPTED_LICENSES as readonly string[]).includes(recording.license)) problems.push("license is not one LifeZoi accepts");
  if (!/^https:\/\//.test(recording.sourceUrl)) problems.push("sourceUrl must be the https page where the licence was read");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recording.verifiedOn)) problems.push("verifiedOn must be YYYY-MM-DD");
  for (const field of ["title", "composer", "performer", "attribution"] as const) {
    if (!recording[field].trim()) problems.push(`${field} is required`);
  }
  return problems;
}
