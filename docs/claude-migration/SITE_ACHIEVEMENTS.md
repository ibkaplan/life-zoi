# My Streaks & Achievements

Owner request, 2026-11-25: extend the Training Academy achievements to the whole site, with daily streaks and badges for the diary, movement, breathing, quizzes, meals, and more, in four languages, with a gentle tone.

## Where it is

| Part | Where |
| --- | --- |
| Page | `/progress/achievements` (Progress section, footer, and buttons on `/progress` and `/profile`) |
| Activity days per area, runs, week grid | `src/lib/achievements/activity.ts` |
| Badges | `src/lib/achievements/badges.ts` |
| Page component and styles | `src/components/achievements/` |
| Tests | `src/lib/achievements/achievements.test.ts` |
| Translations | `src/lib/i18n/catalog/{uk,ru,el}/achievements.json`, menu label in `src/lib/i18n/messages/*.ts` |

## What counts as an active day

Only records the person already saved. Nothing is inferred.

| Area | Counted from |
| --- | --- |
| Health diary | `health_readings` rows (the reading's local date) |
| Movement | Companion day log: walking or exercise minutes, movement breaks, a ticked movement item (not water or breathing alone); guided Pilates, yoga, stretching, mobility |
| Breathing and calm | Breathe for Life sessions, the ticked breathing item, guided breathing, relaxation, meditation |
| Quizzes and brain training | Brain & Habit Quiz day marks and dailies, brain games, focus sessions |
| Meals | Calorie counter days with at least one item |
| Learning | Training Academy learning days and challenges, 7-day mini-course days |
| Check-ins | LifeZoi Daily feeling taps, weekly check-ins |

Dates after today are left out.

## Streak and badge rules (tested)

- "Days in a row now" counts back from today. If today has nothing yet, the run up to yesterday still shows, with "Today is still open, with no rush." After a pause the page says "Welcome back", never "lost", "missed", or "broken".
- Longest run, active days this week (Monday to Sunday), total active days, and a 12-week calendar where an empty day is "a rest day".
- 31 badges: per area first day, 7 days, 30 days (on any days); 3, 7, 14, 30 days in a row; 10, 50, 100 active days; Explorer (4 areas), All-round care (all 7), A full week (5 active days in one week). Each shows the date its rule was first met, or "x of y so far".
- A run badge stays after the run ends, because it records the day the run first reached that length.
- The 7-day mini-courses and My Health Day still show no streaks of their own; their days only add to this page.
- The Training Academy and My Brain Journey keep their own achievements; the page links to them.

## Storage

No migration and no new storage. Badges are worked out in the browser from the saved records each time. "Clear my data" clears the records and so the badges. If the diary table cannot be read, the page says diary readings are not counted yet.

## Not checked

- Not opened in a browser yet: members' pages need a Supabase sign-in, which the cloud session does not have. Check on the pull request's preview deployment while signed in, on a phone and a computer.
- uk/ru/el text was written by Claude and needs a read by a native speaker.
