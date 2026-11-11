# Daily Movement

Daily Movement (`/academy/move/studio/daily-movement`) is a video library for adults who move without mobility limits. It sits next to Chair Yoga Studio on the Movement page. Chair Yoga Studio is unchanged.

## Files

- `src/lib/wellness-library/daily-movement-videos.ts` — the 30 videos in 9 categories
- `src/lib/wellness-library/daily-movement.ts` — categories, written 5-minute routines, profile, and the morning and evening plan
- `src/lib/wellness-library/daily-movement.test.ts` — rules below, as tests
- `src/components/companion/daily-movement.tsx` — the page
- `DailyMovementBanner` and `MovementChoices` in `src/components/wellness/movement-studio-views.tsx`

## What was verified

On 2026-11-11 every video id was taken from YouTube search results and checked with YouTube's public oEmbed endpoint, which answers 200 only for a public video whose owner allows embedding. Titles and channels are copied from that answer.

Not verified: player length (`minutes` comes from the title), whether the instructor talks through the class (`talking` is `"unchecked"` unless the title says "No Talking"), and level or position (LifeZoi's reading of the title). Nobody from LifeZoi has watched every class. Re-check a video with `npm run video:add -- <URL>` before relying on it.

## Plan rules

The plan reads only the questionnaire's mobility answers, wellness goals, daily setting, and the saved movement level. Age is never read, so nobody is moved to chair exercises because of age.

| Answers | Morning | Evening |
| --- | --- | --- |
| No mobility limitations (or other limits not listed below) | Morning Aerobics video + 5-minute standing stretch | Evening stretch video + 5-minute relaxation |
| Joint pain | Low-Impact Aerobics video + stretch | Same evening |
| Breathlessness | Morning Stretching video + balance routine | Same evening |
| Balance concerns or walking aid | Morning Stretching (standing, no floor class first) + back and neck routine | Standing back, neck, and shoulder video + relaxation |
| Limited standing or wheelchair, or "Prefer chair exercises today" | Chair Yoga Studio first | Chair Yoga Studio first |
| No mobility answer yet | Beginner standing classes and a prompt to answer the questionnaire | Same evening |

Goals of only sleep, stress, or flexibility and balance start the morning with stretching instead of aerobics. An extra class for the day rotates through categories that match the goals. Intermediate classes are not suggested first at beginner level. Every routine step can be read aloud with the browser's own voices in the chosen language.
