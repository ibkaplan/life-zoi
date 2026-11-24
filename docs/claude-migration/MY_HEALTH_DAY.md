# My Health Day

Requested by the owner on 2026-11-24. A block on the members' home (`src/components/home-view.tsx`), right below LifeZoi Daily.

## What it shows

- Small habits: how many of the six movement-tracker items (`TRACK_ITEMS`) are ticked today. Links to `/academy/move/breaks`.
- Movement: today's walking plus exercise minutes and movement breaks from the companion day log.
- Breathing: today's Breathe for Life sessions and their minutes.
- Food: items, and the kcal total the calorie counter already shows, for today only. No target, no judgement. Empty when nothing is recorded.
- Fact of the Day from the Health Encyclopedia (`factOfTheDay`). Facts are still English only, so it is marked `lang="en"`.
- At most one gentle reminder, picked by time of day and what is still open. Never a warning, streak, or target.

## Matched to how you feel

LifeZoi Daily already had the one-tap feeling (Great, Okay, Low Energy). It was extended, not duplicated: after a tap, the feeling panel shows one breathing practice, one My Music category (with Play), and one movement from the academy. My Health Day shows the same three cards for today's feeling. The rules are fixed in `matchFeeling` (`src/lib/health-day/health-day.ts`): feeling plus morning, afternoon, or evening. Low energy always gets seated, gentle choices. No AI, nothing is sent anywhere.

## Checked

- `src/lib/health-day/health-day.test.ts` (summary, reminders, every match points to a real library item).
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Screenshots in the project files folder `my-health-day/`, taken with a local sign-in bypass that was not committed and browser-seeded example data.

## Not done

- uk, ru, and el text needs a read by a native speaker.
- The feeling stays at three choices. More (for example stressed or restless) would change the stored type and the weekly report.
