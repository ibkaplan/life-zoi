# Free public tools (`/free`)

Owner request, 2026-11-25: free calculators anyone can use without an account, placed so they are easy to find, with a soft invitation to join.

## What is there

| Page | What it does | Source of the numbers |
| --- | --- | --- |
| `/free` | Hub of all free tools, built from `src/lib/free/hub.ts` | — |
| `/free/calorie-calculator` | Resting energy by the Mifflin–St Jeor equation × a common activity factor (1.2 to 1.9), rounded to 10 kcal. Metric or pounds/feet. Adults 18–100. | Mifflin et al., Am J Clin Nutr 1990 (PubMed 2305711) |
| `/free/water-calculator` | Adequate intake for women, men, pregnancy, breastfeeding: litres from drinks, glasses of 250 ml, and total water. | National Academies DRI for water (2005), CDC |
| `/free/sleep-calculator` | CDC hours by age group and the bedtime for each hour, given a wake-up time and the person's own minutes to fall asleep. | CDC “About Sleep”, NHLBI |
| `/free/blood-pressure` | AHA adult category for a reading, the same safety notes as the health diary (`safetyNoteFor`), the AHA table, home-measuring tips. | American Heart Association |

Sources were checked on 2026-11-25. An EFSA water reference was left out because its page could not be opened from the build environment.

## Rules

- Everything under `/free` is public (`PUBLIC_PREFIXES` in `src/lib/auth/public-paths.ts`). Pages there must not read or write account data.
- The calculations run in the browser (`src/lib/free/calculators.ts`). Nothing typed is sent to a server or saved. No AI is called.
- Every page shows the not-a-diagnosis notice and its sources. No health score, no lifespan, no personal target.
- The invitation box (`FreeInvite`) asks visitors to use an invitation or log in; joining stays invitation-only. Members see a link to their health diary instead.

## Where people find them

- Visitors: “Free tools” in the public header, a calculators section on the landing page, “Free health tools” in the public footer.
- Members: “Free health calculators” in the My Health section row and card list, and in the footer.

## Search engines

Each page has a title, description, canonical link (`https://www.lifezoi.com/free/...`), Open Graph tags, and schema.org JSON-LD (`WebApplication` + `BreadcrumbList`; `CollectionPage` on the hub). The site-wide `noindex` stays until the owner lifts it (CLAUDE.md), so search engines will not list these pages yet. A sitemap is not added.

## Adding a tool

Add one entry to `FREE_HUB` (`title` and `summary` wrapped in `msg()`), put the page under `src/app/(public)/free/<name>/`, and add its translations in `src/lib/i18n/catalog/<locale>/`.
