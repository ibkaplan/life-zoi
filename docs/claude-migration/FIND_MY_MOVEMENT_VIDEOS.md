# Find My Movement video library

Route: `/academy/move/studio/find`. Catalog: `src/lib/wellness/movement-studio/find-videos.ts`. Page: `src/components/wellness/find-my-movement.tsx`.

## What is in it

60 exercise videos, all already in the repository and already checked:

| Source | Videos | How it was checked | Terms |
| --- | --- | --- | --- |
| National Institute on Aging (YouTube @NIHAging) | 11 | Player length read from the YouTube IFrame API, 2026-11-06 | U.S. Government work. Played from the NIA channel. |
| Chair Yoga Studio list (`STUDIO_VIDEO_SEEDS`) | 49 | YouTube oEmbed said public and embeddable, 2026-11-10 | Creator keeps all rights and allows embedding. Played in YouTube's player under YouTube's Terms of Service. |

Left out: the two NIA talks that are only for watching, and the NHS Pilates example, which was never checked.

No file is copied or downloaded. Every video plays in `youtube-nocookie.com/embed/<id>` inside LifeZoi. Thumbnails come from `i.ytimg.com`. Each entry carries creator, source address, terms, and check date, and each card shows them.

## Filters

All four work together; Any is the default for each.

- Minutes 5 to 30. A length goes to the nearest choice within 2.5 minutes. 5 also holds shorter films. Longer than 32.5 minutes, or unknown, shows under Any only.
- Length: NIA uses the player length. Chair Yoga Studio uses the minutes in the title, marked "from the title". 22 classes have no minutes in the title and show "Length shown in the player".
- Position: Sitting, Standing, Mat, Chair exercises. A video can have several.
- Goal: Strength, Balance, Mobility, Calm and relaxation, Walking, Chair yoga, Flexibility, Stretching, Brain and body coordination.
- Level: Beginner, Gentle, Intermediate.

Positions, goals, and levels are LifeZoi's reading of each title and channel. Corrections go in `TAGS`. Nobody has watched every class.

When nothing matches, the page lists each single filter that, set back to Any, would show videos, with the count, plus a button to show all.

## Gaps

- Walking and Brain and body coordination have one video each (NIA heel-to-toe walk).
- 30 minutes has one video; 25 minutes has four.
- 10 min + Standing + Balance + Beginner has no video with a known length. 15 minutes has three.

To fill them, add verified videos with `npm run video:add -- <YouTube URL>` (see `CHAIR_YOGA_LIBRARY.md`) on a computer with internet. YouTube cannot be reached from the cloud sessions.

## Voice

"Listen to the instructions" reads the description, positions, and safety line aloud with the browser's own speech voices in the page language, preferring voices named Natural, Neural, Premium, Enhanced, Online, or Google. Nothing is sent to a server. `speakGuide` in `voice-guide.ts` is the hook a future LifeZoi voice can replace. The button is hidden when the browser cannot speak.
