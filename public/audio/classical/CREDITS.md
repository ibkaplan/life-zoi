# Background music recordings

This folder holds the recordings LifeZoi's background music may play. Every file
here must have an entry in `src/lib/background-music/tracks.ts` (`RECORDINGS`)
with its licence, attribution, and the page where a person read that licence.

**Status on 2026-11-10: no recordings have been added.** The cloud sandbox used to
build this feature could not reach Wikimedia Commons, Musopen, or the Internet
Archive, so no licence was read and no file was downloaded. Until a recording is
added, background music plays LifeZoi's own in-browser performances of public
domain melodies (Pachelbel, Brahms, Beethoven) from `src/lib/companion/music.ts`.
Nothing is downloaded or streamed for those.

## Adding a recording

1. Find the recording on a source that states its licence on the file page, for example
   Wikimedia Commons (`commons.wikimedia.org/wiki/File:…`), Musopen, or the Internet Archive.
   Good candidates are gentle piano or chamber pieces by Mozart, Chopin, Debussy, Bach, or Satie.
2. Check two things separately:
   - The **composition** is public domain (the composer died long ago).
   - The **recording** itself is released as public domain, CC0, CC BY, or CC BY-SA.
     A recording of an old piece is not public domain just because the music is.
     Do not use "NC" (non-commercial), "ND" (no derivatives), "all rights reserved",
     or YouTube audio.
3. Download the original file and save it here with a short lowercase name, for example
   `chopin-nocturne-op9-2.mp3`. MP3 plays in every major browser, including Safari.
   Keep each file small (a few MB); a 64–128 kbps MP3 is plenty for soft background music.
4. Add an entry to `RECORDINGS` in `src/lib/background-music/tracks.ts`:

   ```ts
   {
     id: "chopin-nocturne-op9-2",
     title: "Chopin — Nocturne in E-flat major, Op. 9 No. 2",
     composer: "Frédéric Chopin",
     performer: "<performer exactly as the source page names them>",
     file: "/audio/classical/chopin-nocturne-op9-2.mp3",
     license: "Public domain", // or "CC0 1.0", "CC BY 4.0", ...
     attribution: "<attribution text exactly as the licence asks>",
     sourceUrl: "https://commons.wikimedia.org/wiki/File:<exact file name>",
     verifiedOn: "YYYY-MM-DD",
   },
   ```

5. Add the same details to the table below and run `npm test`. The test checks that each
   entry is complete, the licence is one LifeZoi accepts, and the file exists in this folder.

When at least one recording is listed, the background player uses the recordings and
stops using the in-browser performances. The ♪ panel shows each recording's licence and
source link.

## Recordings in this folder

| File | Work | Performer | Licence | Source page | Verified on |
| --- | --- | --- | --- | --- | --- |
| _none yet_ | | | | | |
