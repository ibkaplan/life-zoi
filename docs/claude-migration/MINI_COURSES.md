# 7-day mini-courses

Owner request (2026-11-24): short 7-day courses on the dashboard, such as a week of calm breathing and a week of movement, with one short practice a day and gentle progress.

## Where it is

- A block on `/dashboard`, after the main tool tiles. It shows the course in progress with the next day's practice, or the three courses to choose from.
- Its own page, `/courses`, listed under Dashboard in the menu and in the footer, with every day of every course and an "I did this" box per day.
- Code: `src/lib/courses/courses.ts` (content and progress logic, tested in `courses.test.ts`), `src/components/courses/mini-courses.tsx`, `src/components/courses/courses.css`. Translations: `src/lib/i18n/catalog/{uk,ru,el}/courses.json`.

## Courses

1. **A week of calm breathing**: Breathe for Life sessions (no breath holding), the nose-breathing page, and one day with My Music.
2. **A week of gentle movement**: a movement break, Daily Movement morning, balance and evening videos, Chair Yoga Studio, an easy walk, and moving to music.
3. **A week of rest and calm**: My Music, Nature, a calm-pace breathing session, one Focus timer session and break, and seated chair yoga.

Every day links to an existing members' page (checked by a test) and takes 15 minutes or less. Each course has a care line, and every view shows "General wellness ideas, not medical advice."

## Progress rules

- Progress is the days the person marked done. Days do not unlock by date and there is no deadline.
- No streaks. A day not done is "still ahead", never missed. If a day was already done today, the card suggests the next one can wait, but never blocks it.
- Pausing or switching courses keeps progress. "Start again from day 1" is the only action that clears it.
- Practices marked done count in LifeZoi Daily's weekly report ("Mini-course practices") and in Daily Engagement days.

## Storage and privacy

A `courses` field inside the existing companion state (`src/lib/companion/state.ts`), saved like the rest of it: on the account's `companion_state` row when signed in, otherwise in the browser. No migration. Nothing is sent to an AI or any outside service. The labeled sample writes nothing.

## Not done

- uk, ru, and el text needs a read by a native speaker.
- Not yet looked at in a browser while signed in. Check the dashboard block and `/courses` on a phone and a computer after the Vercel build.
