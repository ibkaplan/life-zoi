# “What is your health age?” — public 2-minute check

Owner request, 2026-11-25: a free 2-minute quiz with a beautiful, shareable “your health age” result, placed with the other free tools so visitors find it quickly.

## Where it lives

- Page: `/free/health-age` (`src/app/(public)/free/health-age/page.tsx`). It is public because everything under `/free` is (`PUBLIC_PREFIXES` in `src/lib/auth/public-paths.ts`, added by the free calculators work).
- Listed in the Free tools hub (`src/lib/free/hub.ts`, group “discover”).
- Logic: `src/lib/health-age/quiz.ts`, tests in `quiz.test.ts`. View: `src/components/health-age/`. Translations: `src/lib/i18n/catalog/{uk,ru,el}/health-age.json`.

## What it asks

The person's age (18 to 100), then seven questions, one for each habit area that My Wellness Score uses (`HABIT_AREAS` in `src/lib/wellness-score.ts`): sleep, movement, vegetables and water, tobacco, alcohol, stress and mood, people around you. Each answer is judged against the same public guidance the dashboard uses. Tobacco and alcohol have “Prefer not to say”, which leaves the area out.

## The number

The owner first saw a choice between a habits-only result and a number of years, and chose the number on 2026-11-25 on condition that it is honest. So:

- Lifestyle health age = typed age − 1 year for each area on track + 1 year for each area that needs attention. Never below 18. Shown as “About N” with “N years younger/older than your age”.
- The page explains the rule in plain words under “How this number is made” and says the one-year step is LifeZoi's own illustration, not from a study, does not measure the body, and says nothing about how long anyone will live.
- Every result view and the share card say it is an estimate, not a medical test, diagnosis, or prediction.
- Do not replace the one-year step with risk figures, years of life gained, or a life expectancy.

## Privacy

Answers and age stay in React state on the page. Nothing is sent to the server, written to browser storage, or sent to an AI service. The share card is a PNG drawn in the browser with a canvas; it shows the lifestyle age, the band, and which areas are on track, never the typed age. The person shares it with the system share sheet (phones) or downloads it.

## Sign-up

The result ends with “Turn this into a plan”: membership is by invitation, so the buttons are “I have an invitation” (`/#invitation`), Log in, and More free tools.
