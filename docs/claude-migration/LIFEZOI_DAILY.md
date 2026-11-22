# LifeZoi Daily — Your Wellness Journey

Owner request (2026-11-22): make the daily experience simpler and less like homework. Use the Lifestyle Assessment the person already completed, offer one recommendation a day, and keep all tracking optional.

## Where it is

- Top of the members' home (`/`, `HomeView`), the first page after logging in. The rest of the homepage is unchanged below it.
- Its own page, `/daily`, listed under Dashboard in the menu and in the footer. The page adds the weekly report.
- Code: `src/lib/daily/daily.ts` (logic, tested in `daily.test.ts`), `src/components/daily/lifezoi-daily.tsx`, `src/components/daily/daily.css`. Translations: `src/lib/i18n/catalog/{uk,ru,el}/daily.json`.

## What it shows

1. A welcome with the person's first name and the time of day.
2. One idea for today. `matchTopics` reads the latest saved assessment: chosen goals score 3, answers that show room to grow score 2, general fit scores 1. Today's idea rotates by date among the score 2 and 3 topics, so it is the same all day. "Explore more ideas" lists the other topics. There are eight topics: energy, healthy eating, weight, sleep, brain health, walking, balance and strength, and healthy aging. **Weight is offered only when the person chose a weight goal.** It is never inferred from height or weight.
3. One tip a day. Each tip only restates guidance from a source already in `src/lib/sources.ts`, and the page links to that source.
4. Three large buttons: How Do I Feel Today?, Give Me Today's Advice, and Show My Progress.
5. The feeling choice is optional and takes one tap: Great, Okay, or Low Energy, or Skip. Choosing Low Energy switches every idea to a gentler version.
6. Three separate indicators:
   - **Initial Wellness Assessment** shows whether the assessment is done, when, and how many habit areas match guidance (from `wellness-score.ts`).
   - **Lifestyle Progress** compares the two latest saved assessments. App use never counts toward it.
   - **Daily Engagement** shows the days in the last 7 with anything recorded in LifeZoi, labeled "not a health measurement". Days without a record are described as not recorded, never as missed.
7. The weekly report covers the last 7 days. It lists activities marked done (daily plan, breathing, focus, brain games, habit check-ins, movement breaks), daily topics opened, library items opened, measurable progress (an assessment updated this week, weights the person entered, feeling counts), and up to two areas to focus on next, taken from the person's goals and answers. When a week has no data, the report says so plainly and invents nothing.

## Storage and privacy

The feeling, skipped days, and explored topics are a new `daily` field inside the existing companion state (`src/lib/companion/state.ts`). It is saved like the rest of that state: on the account's `companion_state` row when signed in, and in the browser otherwise. No migration is needed because the row is a jsonb blob. Nothing is sent to an AI or any outside service. No health devices are connected, and the page says that any device connection would happen only with permission.

## Not done

- uk, ru, and el text needs a read by a native speaker.
- Not checked against real Supabase sign-in. The screenshots used a local sign-in bypass that was never committed, plus browser-seeded example data (`docs/screenshots/lifezoi-daily/`).
