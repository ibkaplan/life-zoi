# My Music: Pixabay recordings

> **Superseded on 2026-11-11.** The owner decided LifeZoi streams music and does not
> download or store it. Do not add audio files here. Real recordings are listed in
> `src/lib/music-library/streams.ts` and stream from Wikimedia Commons. This file is
> kept only as a record of the earlier plan.

Every audio file in this folder must have an entry in `PIXABAY_RECORDINGS` in
`src/lib/music-library/catalog.ts`. The unit test refuses an entry without a
Pixabay track page, the licence name, a verification date, and a file that exists.

**Status on 2026-11-10: no Pixabay tracks have been added.** The cloud environment
that built My Music could not reach pixabay.com (the network policy refused the
connection), so no track page or licence was read and nothing was downloaded.
Until tracks are added, each category plays LifeZoi's own in-browser pieces
(`src/lib/companion/music.ts`), including LifeZoi's own soft performances of
Beethoven's Moonlight Sonata (opening) and Für Elise. These are labelled
"Played by LifeZoi in your browser". They are not recordings of a pianist.

## Licence rules (check each track)

1. Open the track's own page on https://pixabay.com/music/ (or /sound-effects/ for nature sounds).
2. Read the licence shown on that page. Accept the track only if it says
   **Pixabay Content License** and the page has no extra restriction
   (for example a "Content ID registered" notice you do not want, or a separate licence).
   Read the licence summary at https://pixabay.com/service/license-summary/ once.
3. Classical music: Beethoven, Mozart, and Chopin compositions are public domain, but a
   recording is its own work. Accept a classical recording only when the uploader
   says they performed or produced it themselves. Do not accept an upload that
   copies a commercial CD or another artist's recording.
4. LifeZoi plays files inside its player and shows no download link. Keep it that way:
   the Pixabay licence does not allow offering the music as standalone files.
5. No attribution is required by the Pixabay Content License, but LifeZoi still
   records the uploader and page so the source can be checked later.

## Adding a track

1. Download the MP3 from the track page. Keep it small: re-encode long tracks to
   96–128 kbps MP3 (for example `ffmpeg -i in.mp3 -b:a 112k out.mp3`).
   MP3 plays in Safari on iPhone, Chrome on Android, and desktop browsers.
2. Save it as `public/audio/library/<category>/<short-name>.mp3`, where category is
   one of `classical`, `meditation`, `yoga`, `nature`, `morning`, `sleep`.
3. Add an entry to `PIXABAY_RECORDINGS`:

   ```ts
   {
     id: "moonlight-sonata-piano",
     category: "classical",
     title: "<title exactly as on the Pixabay page>",
     artist: "<uploader exactly as on the page>",
     composer: "Ludwig van Beethoven",
     file: "/audio/library/classical/moonlight-sonata-piano.mp3",
     license: "Pixabay Content License",
     sourceUrl: "https://pixabay.com/music/<slug>-<number>/",
     verifiedOn: "YYYY-MM-DD",
   },
   ```

4. Run `npm test`. Recordings play first in their category, before LifeZoi's own pieces.

## Wanted tracks (search terms on Pixabay Music)

| Category | Search for | Notes |
| --- | --- | --- |
| Classical | `moonlight sonata piano`, `fur elise piano`, `mozart piano`, `chopin nocturne`, `classical piano calm` | Uploader must be the performer. Moonlight Sonata only if one passes rule 3. |
| Meditation & Peace | `meditation`, `peaceful ambient`, `mindfulness`, `calm instrumental` | Slow, no vocals. |
| Yoga & Wellness | `yoga`, `stretching`, `breathing music`, `spa` | Soft, steady, no strong beat. |
| Nature Sounds | `ocean waves`, `rain`, `birds singing`, `forest`, `stream water` | Often under Sound Effects. |
| Happy & Positive | `uplifting piano`, `morning`, `inspirational`, `positive acoustic` | Gentle, not loud. |
| Sleep & Calm | `sleep piano`, `lullaby`, `night ambient` | Very soft. |

Aim for 4–8 tracks per category for the first release.
