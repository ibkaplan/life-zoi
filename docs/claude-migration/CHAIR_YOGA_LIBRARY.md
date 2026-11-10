# Chair Yoga Studio video library

Route: `/academy/move/studio/chair-yoga`. Linked from the Movement Studio home, the Chair, Balance, and Mobility studio pages, the Wellness Library, the footer, and a "Today's class" card on My Day.

## What is in it

| Section | Videos |
| --- | --- |
| Chair Yoga – Seated | 22 |
| Standing Chair Yoga | 10 |
| Gentle Yoga & Mobility | 17 |

All 49 were confirmed public and embeddable on 2026-11-10 through YouTube's public oEmbed endpoint (no key). Title and channel are copied from that answer. The list is in `src/lib/wellness-library/chair-yoga-videos.ts`; the studio videos join the existing Wellness Library catalog (`VIDEOS` in `catalog.ts`, source `youtube-studio`), so `npm run check:library` and the sources and approvals page cover them.

Not verified, and labelled as such in the UI:

- Player length. Cards show the minutes written in the title, marked "from the title", or "Length shown on YouTube". Duration filters use the title minutes only.
- Level, age group, and seated or standing. These are LifeZoi's reading of the title and channel. Nobody has watched every class. Videos marked `mixed` do not say in the title how much is standing.
- Free status. Public YouTube videos play without a subscription, but `cost` stays `free-unverified` until a person checks.

## Adding a video

On a computer with internet:

```
npm run video:add -- https://www.youtube.com/watch?v=VIDEO_ID --section standing
```

The script calls `https://www.youtube.com/oembed`, reports videos that are removed, private, or not embeddable, reads minutes from the title, and prints an entry to paste into `STUDIO_VIDEO_SEEDS`. Check the guessed level, audience, position, and topics, write one neutral sentence with no treatment claim, and open a pull request. The tests reject duplicates, non-official embed addresses, and title minutes that are not in the title.

Channels to search next are in `CANDIDATE_CHANNELS` (Yoga With Adriene, Yoga ETC with Tina, Yoga & You, Yoga by Kierstie Payge, Yes2Next, SeniorShape Fitness). Gaps worth filling: a 45-minute seated class, more standing classes with supported warrior poses and heel raises, and seated leg and ankle work.

## Safety rules in code

- Recommendations never suggest a standing class to someone who reported a wheelchair or limited standing, and never suggest a floor class to someone with balance concerns or a walking aid. People with balance concerns start seated, with a chair-supported standing class as the alternative.
- Standing suggestions come only from Standing Chair Yoga. Balance videos carry the fall-support line. Every player shows sturdy chair, stop-if, and "does not treat or cure" text.
- Standing classes always show a seated alternative.

## Daily integration

- Choose as today's class: `customize.picks["<date>:chair-yoga"]` in companion state.
- Mark completed: a day entry `cy-<youtubeId>` that adds exercise minutes, so it counts in My Day, the weekly check-in, and reports.
- Weekly practice: Monday to Sunday sessions, minutes, days, and seated versus standing, with a nudge toward standing when every class was seated and the person has no reported limit.
- Favorites use the existing `video:<id>` favorites.

## Languages

The four-language work had not landed on `main` when this was built. All studio wording is in `CHAIR_YOGA_TEXT`, `SECTION_INFO`, `POSITION_TEXT`, `AUDIENCE_TEXT`, and `DURATION_BANDS` in `src/lib/wellness-library/chair-yoga.ts`, ready to move to translation keys. Video titles stay in the teacher's language.
