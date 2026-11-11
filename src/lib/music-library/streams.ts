/**
 * Real recordings that the listener's browser streams from Wikimedia Commons.
 *
 * LifeZoi does not download, store, or proxy these files. The `<audio>` element
 * plays `stream` (an address on upload.wikimedia.org) only after the person
 * presses Play, so Wikimedia receives the listener's IP address while a piece plays.
 *
 * Every entry was checked on its Commons file page (`sourceUrl`) on `verifiedOn`:
 * the recording itself is public domain, CC0, CC BY, or CC BY-SA. "NC" and "ND"
 * licences are refused. Where the licence asks for credit, `attribution` holds the
 * line LifeZoi shows in the player and on My Music. Ogg and FLAC originals are
 * played through Commons' own MP3 copy (the `transcoded/…/.mp3` address) so they
 * also play in Safari.
 *
 * To add a recording, read its Commons page yourself, copy the licence exactly,
 * and run `npm test`: `streamedRecordingProblems` checks every field.
 */
import { ACCEPTED_LICENSES, type AcceptedLicense } from "@/lib/background-music/tracks";
import type { LibraryCategory } from "@/lib/music-library/catalog";

export type StreamedRecording = {
  id: string;
  category: LibraryCategory;
  /** Title shown in the player. Composer and work for classical pieces. */
  title: string;
  /** Performer or recordist, as the Commons page names them. */
  artist: string;
  /** For classical music: the composer, whose composition is public domain. */
  composer?: string;
  license: AcceptedLicense;
  /** Credit line the licence asks for, or "" when none is required (public domain, CC0). */
  attribution: string;
  /** The https address on upload.wikimedia.org that the browser streams. */
  stream: string;
  /** The Commons file page where the licence was read. */
  sourceUrl: string;
  /** Length in seconds, from the Commons file information. */
  seconds: number;
  /** The date a person read that page, as YYYY-MM-DD. */
  verifiedOn: string;
};

export const STREAMED_RECORDINGS: StreamedRecording[] = [
  {
    id: "moonlight-sonata-adagio",
    category: "classical",
    title: "Beethoven: Moonlight Sonata, first movement (Adagio sostenuto)",
    artist: "Musopen",
    composer: "Ludwig van Beethoven",
    license: "Public domain",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/48/Ludwig_van_Beethoven_-_sonata_no._14_in_c_sharp_minor_%27moonlight%27%2C_op._27_no._2_-_i._adagio_sostenuto.ogg/Ludwig_van_Beethoven_-_sonata_no._14_in_c_sharp_minor_%27moonlight%27%2C_op._27_no._2_-_i._adagio_sostenuto.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ludwig_van_Beethoven_-_sonata_no._14_in_c_sharp_minor_%27moonlight%27,_op._27_no._2_-_i._adagio_sostenuto.ogg",
    seconds: 336,
    verifiedOn: "2026-11-11",
  },
  {
    id: "fur-elise-piano",
    category: "classical",
    title: "Beethoven: Für Elise",
    artist: "Sebion7125",
    composer: "Ludwig van Beethoven",
    license: "CC BY-SA 3.0",
    attribution: "“Fur Elise” performed by Sebion7125, CC BY-SA 3.0, via Wikimedia Commons",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8f/Fur_Elise.ogg/Fur_Elise.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fur_Elise.ogg",
    seconds: 176,
    verifiedOn: "2026-11-11",
  },
  {
    id: "chopin-nocturne-op9-2",
    category: "classical",
    title: "Chopin: Nocturne in E-flat major, Op. 9 No. 2",
    artist: "Peter Johnston (Musopen)",
    composer: "Frédéric Chopin",
    license: "CC0 1.0",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/04/Chopin_Nocturne_No._2_in_E_Flat_Major%2C_Op._9.ogg/Chopin_Nocturne_No._2_in_E_Flat_Major%2C_Op._9.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg",
    seconds: 259,
    verifiedOn: "2026-11-11",
  },
  {
    id: "debussy-clair-de-lune",
    category: "classical",
    title: "Debussy: Clair de lune",
    artist: "Laurens Goedhart",
    composer: "Claude Debussy",
    license: "Public domain",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/be/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Clair_de_lune_(Claude_Debussy)_Suite_bergamasque.ogg",
    seconds: 304,
    verifiedOn: "2026-11-11",
  },
  {
    id: "satie-gymnopedie-1",
    category: "classical",
    title: "Satie: Gymnopédie No. 1",
    artist: "Robin Alciatore (Musopen)",
    composer: "Erik Satie",
    license: "Public domain",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg",
    seconds: 184,
    verifiedOn: "2026-11-11",
  },
  {
    id: "pachelbel-canon-macleod",
    category: "classical",
    title: "Pachelbel: Canon in D Major",
    artist: "Kevin MacLeod",
    composer: "Johann Pachelbel",
    license: "CC BY 3.0",
    attribution: "“Canon in D Major” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Canon_in_D_Major_%28ISRC_USUAN1100301%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Canon_in_D_Major_(ISRC_USUAN1100301).mp3",
    seconds: 265,
    verifiedOn: "2026-11-11",
  },
  {
    id: "meditation-impromptu-01",
    category: "meditation",
    title: "Meditation Impromptu 01",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Meditation Impromptu 01” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/4/44/Meditation_Impromptu_01_%28ISRC_USUAN1100163%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Meditation_Impromptu_01_(ISRC_USUAN1100163).mp3",
    seconds: 213,
    verifiedOn: "2026-11-11",
  },
  {
    id: "meditation-impromptu-02",
    category: "meditation",
    title: "Meditation Impromptu 02",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Meditation Impromptu 02” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/0/09/Meditation_Impromptu_02_%28ISRC_USUAN1100162%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Meditation_Impromptu_02_(ISRC_USUAN1100162).mp3",
    seconds: 249,
    verifiedOn: "2026-11-11",
  },
  {
    id: "meditation-impromptu-03",
    category: "meditation",
    title: "Meditation Impromptu 03",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Meditation Impromptu 03” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/9/97/Meditation_Impromptu_03_%28ISRC_USUAN1100161%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Meditation_Impromptu_03_(ISRC_USUAN1100161).mp3",
    seconds: 255,
    verifiedOn: "2026-11-11",
  },
  {
    id: "clean-soul",
    category: "yoga",
    title: "Clean Soul",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Clean Soul” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Clean_Soul_%28ISRC_USUAN1300033%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Clean_Soul_(ISRC_USUAN1300033).mp3",
    seconds: 307,
    verifiedOn: "2026-11-11",
  },
  {
    id: "winter-reflections",
    category: "yoga",
    title: "Winter Reflections",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Winter Reflections” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Winter_Reflections_%28ISRC_USUAN1100580%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Winter_Reflections_(ISRC_USUAN1100580).mp3",
    seconds: 142,
    verifiedOn: "2026-11-11",
  },
  {
    id: "gymnopedie-1-macleod",
    category: "yoga",
    title: "Satie: Gymnopédie No. 1",
    artist: "Kevin MacLeod",
    composer: "Erik Satie",
    license: "CC BY 3.0",
    attribution: "“Gymnopedie No. 1” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Gymnopedie_No._1_%28ISRC_USUAN1100787%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1_(ISRC_USUAN1100787).mp3",
    seconds: 187,
    verifiedOn: "2026-11-11",
  },
  {
    id: "ocean-waves-tropical-beach",
    category: "nature",
    title: "Ocean Waves on a Tropical Beach",
    artist: "Jarrod Stanley",
    license: "CC0 1.0",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/64/Ocean_Waves_on_a_Tropical_Beach.ogg/Ocean_Waves_on_a_Tropical_Beach.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ocean_Waves_on_a_Tropical_Beach.ogg",
    seconds: 384,
    verifiedOn: "2026-11-11",
  },
  {
    id: "birdsong-morning",
    category: "nature",
    title: "Birdsong morning",
    artist: "Matutinho",
    license: "CC BY-SA 4.0",
    attribution: "“Birdsong morning 01” by Matutinho, CC BY-SA 4.0, via Wikimedia Commons",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e7/Birdsong_morning_01.ogg/Birdsong_morning_01.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Birdsong_morning_01.ogg",
    seconds: 433,
    verifiedOn: "2026-11-11",
  },
  {
    id: "georgia-rapids",
    category: "nature",
    title: "Georgia Rapids",
    artist: "Jarrod Stanley",
    license: "CC0 1.0",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ea/Georgia_Rapids.ogg/Georgia_Rapids.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Georgia_Rapids.ogg",
    seconds: 384,
    verifiedOn: "2026-11-11",
  },
  {
    id: "carefree",
    category: "morning",
    title: "Carefree",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Carefree” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Carefree_%28ISRC_USUAN1400037%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Carefree_(ISRC_USUAN1400037).mp3",
    seconds: 205,
    verifiedOn: "2026-11-11",
  },
  {
    id: "bathed-in-the-light",
    category: "morning",
    title: "Bathed in the Light",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Bathed in the Light” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/7/75/Bathed_in_the_Light_%28ISRC_USUAN1100308%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bathed_in_the_Light_(ISRC_USUAN1100308).mp3",
    seconds: 166,
    verifiedOn: "2026-11-11",
  },
  {
    id: "sovereign-quarter",
    category: "morning",
    title: "Sovereign Quarter",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Sovereign Quarter” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Sovereign_Quarter_%28ISRC_USUAN1100454%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sovereign_Quarter_(ISRC_USUAN1100454).mp3",
    seconds: 291,
    verifiedOn: "2026-11-11",
  },
  {
    id: "brahms-wiegenlied",
    category: "sleep",
    title: "Brahms: Lullaby (Wiegenlied), Op. 49 No. 4",
    artist: "Pracchia-78",
    composer: "Johannes Brahms",
    license: "Public domain",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/df/Johannes_Brahms_ninna_nanna_op_49_n_4.ogg/Johannes_Brahms_ninna_nanna_op_49_n_4.ogg.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Johannes_Brahms_ninna_nanna_op_49_n_4.ogg",
    seconds: 109,
    verifiedOn: "2026-11-11",
  },
  {
    id: "satie-gymnopedie-2",
    category: "sleep",
    title: "Satie: Gymnopédie No. 2",
    artist: "Michael Laucke",
    composer: "Erik Satie",
    license: "Public domain",
    attribution: "",
    stream: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Satie_Gymnopedie_No_2_performed_by_Michael_Laucke.flac/Satie_Gymnopedie_No_2_performed_by_Michael_Laucke.flac.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Satie_Gymnopedie_No_2_performed_by_Michael_Laucke.flac",
    seconds: 147,
    verifiedOn: "2026-11-11",
  },
  {
    id: "tranquility",
    category: "sleep",
    title: "Tranquility",
    artist: "Kevin MacLeod",
    license: "CC BY 3.0",
    attribution: "“Tranquility” Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0",
    stream: "https://upload.wikimedia.org/wikipedia/commons/4/47/Tranquility_%28ISRC_USUAN1100581%29.mp3",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tranquility_(ISRC_USUAN1100581).mp3",
    seconds: 987,
    verifiedOn: "2026-11-11",
  },
];

const ATTRIBUTION_LICENSES: readonly string[] = ["CC BY 3.0", "CC BY 4.0", "CC BY-SA 3.0", "CC BY-SA 4.0"];

/** Problems with a streamed entry. An empty list means the entry is complete. */
export function streamedRecordingProblems(recording: StreamedRecording): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9-]{1,64}$/.test(recording.id)) problems.push("id must be lowercase letters, numbers, and dashes");
  if (!(ACCEPTED_LICENSES as readonly string[]).includes(recording.license)) problems.push("license is not one LifeZoi accepts");
  if (!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^\s?#]+\.mp3$/.test(recording.stream))
    problems.push("stream must be an MP3 address on https://upload.wikimedia.org/wikipedia/commons/");
  if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:[^\s?#]+$/.test(recording.sourceUrl))
    problems.push("sourceUrl must be the recording's https://commons.wikimedia.org/wiki/File:… page");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recording.verifiedOn)) problems.push("verifiedOn must be YYYY-MM-DD");
  if (!Number.isInteger(recording.seconds) || recording.seconds <= 0) problems.push("seconds must be a whole number above 0");
  for (const field of ["title", "artist"] as const) {
    if (!recording[field]?.trim()) problems.push(`${field} is required`);
  }
  const needsCredit = ATTRIBUTION_LICENSES.includes(recording.license);
  if (needsCredit && !recording.attribution.trim()) problems.push("attribution is required for a CC BY or CC BY-SA recording");
  if (recording.category === "classical" && !recording.composer?.trim()) problems.push("composer is required for classical music");
  return problems;
}
