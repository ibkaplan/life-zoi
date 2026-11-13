# Connected journey plan (2026-11-12)

Owner's requests: "Complete user journey, personal dashboard and long-term health tracking", "Navigation and header correction", and "Complete website organization". Rule for every stage: organize and connect what exists. Nothing is deleted or renamed. Each stage is its own pull request. Nothing is merged or deployed without the owner's approval.

Standing rule from the owner (2026-11-12): the phone version must look as polished as the computer version, never cramped. Every stage is designed for both and shown with phone and desktop screenshots.

## What exists today (inventory, `main` at f34c83a)

- About 140 pages. The header showed 5 public links plus a "My space" row (7 links) only when signed in. Dashboard, Wellness Library, Brain games, Lab results and 25 more pages were reachable only from the footer.
- Header bug: on screens 900 px and wider the brand, menu and account buttons share one row; the menu scrolls sideways and is centered, so when it is too wide (signed in, or longer languages) both ends, Home and Movement, are cut off.
- Homepage: a tall hero (headline, photo), then "Your Life Outlook", then companion cards, photo paths, free exercise, how it works, footer.
- Dashboard (`/dashboard`): morning welcome, Daily News (`NewsSections`), assessment, WHAT IF?, Change Lab, assistant, recommendations. My Day (`/my-day`) and My Plan (`/plan`) hold the daily plan and activity marks.
- Data: assessments, scenarios, habit goals and check-ins are in Supabase with row level security. Daily companion data (plan marks, preferences, weekly check-ins, favorites) uses `companion_state`, whose migration (`supabase/migrations/20261109000000_companion_state.sql`) is applied by the Database migrations GitHub Action; until it runs, the data stays on the device. No storage bucket exists. Lab results are an educational explainer with no upload.
- Invite-only access is planned in a separate thread and waits for approval. It will add a server gate and a public landing page. Stages below avoid `middleware`, `/sign-in`, and auth code so the two do not collide; the landing page decision is shared (see stage 1 note).

## Stages

1. **Navigation and homepage layout** (this PR). Nine sections in the requested order: Home, Dashboard, My Health, Food & Wellness, Movement, Wellness Library, Brain & Mind, Progress, My Profile. Every existing page is placed in one section and shown in a row under the header. Desktop: one wrapping bar, nothing scrolls or clips. Phones and tablets: Home, Dashboard, Movement and a Menu button that opens all sections. New `/my-health` hub page. Homepage hero made shorter, a Dashboard button added, Life Outlook moved lower. Footer keeps every page.
2. **Onboarding, health baseline, improvement plan.** Welcome step, then the existing assessment extended with the missing optional questions (target weight, food preferences, allergies, medications, family history), then a plain-language baseline and a plan whose every item links to a LifeZoi page. Builds on `/welcome`, `/assessment`, `/plan`. Needs a decision on where new answers are stored (see below).
3. **Dashboard, daily plan, daily check-in.** Greeting, today's overview, "Your daily plan" with direct buttons and Mark as done, daily check-in (weight, mood, energy, sleep, activity, water, nutrition, stress) saved per date, history list. Daily News stays. Reuses My Day's plan engine.
4. **Nutrition daily food plan.** Breakfast, lunch, dinner, snacks with recipes from the existing recipe set, approximate macros where the recipe has them, replace, favorite, mark eaten, record what was eaten. Gentle adjustments only, never from a single weight.
5. **Progress and monthly review.** Day 1, week 1, 2, month 1, 3, 6, 12 comparisons and charts from dated check-ins; automatic monthly summary; month-to-month comparison. Supportive wording.
6. **Lab results with secure upload.** Manual entry of values (test, date, lab, result, unit, range) with charts and baseline comparison first; file upload into a private Supabase Storage bucket with per-user policies, explicit consent, and delete. Educational explanations only. Needs owner approval for the bucket and tables, and a privacy review before launch.
7. **Connect all sections.** "Mark as done" from recipes, videos, brain games and breathing writes to the same daily record so the Dashboard and Progress update; "Back to my Dashboard" on activity pages.

## Decisions that need the owner

- **Database migrations (stages 2 to 6).** Cross-device storage needs either applying the pending `companion_state` migration or new tables (`daily_check_ins`, `lab_results`, `lab_reports`, `meal_logs`). Each migration will be in the repository with a plain-language note and run only by the owner.
- **File storage for lab reports (stage 6).** A private bucket, per-user folder policies, size and type limits, deletion. Not created without approval.
- **Health information in the AI assistant.** Unchanged: no lab values, diagnoses or account records are sent to the free model.
