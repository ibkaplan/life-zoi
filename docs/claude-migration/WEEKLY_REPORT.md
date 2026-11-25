# Weekly report for a doctor

Owner request, 2026-11-25: one printable or downloadable page for a doctor with the week's blood pressure, blood sugar, cholesterol, sleep, and mood.

## Where it is

`/my-health/report`, in the My Health section after "Health diary" (menu, My Health hub card, footer) and as a button in the diary's "Show your doctor, or delete" card. Code: `src/lib/health-report/report.ts` (pure builder, CSV, labeled sample days), `src/components/health-report/`, page `src/app/(members)/my-health/report/page.tsx`.

## What it shows

- Seven days ending on a chosen day (today by default; previous / next week; never a future day).
- Blood pressure: count, average, lowest–highest, first → latest for systolic, diastolic, and pulse, then every reading with its note.
- Blood sugar: the same summary per measuring context (fasting, before a meal, after a meal, bedtime, other), so fasting and after-meal values are not mixed, then every reading.
- Cholesterol: results in the week; if none, the latest earlier result with its date.
- Sleep hours, mood (1–5), and energy (1–5) from My Day (`companion.days`), and the one-tap feeling from LifeZoi Daily (`companion.daily.feelings`), per day with a dash for days with nothing noted.
- Optional name and questions for the doctor. They are not saved anywhere; they appear only on the page and the printout.
- "Not a diagnosis" notice at the top and the usual "general information only … do not change any medicine" line at the bottom. No range verdicts, scores, or advice are added: the report lists the person's own numbers.

## Output and privacy

- Print or save as PDF uses the browser's print window; print CSS hides everything except the report and fits a typical week on one A4 page.
- Download CSV: one row per reading and per noted day value, UTF-8 with BOM, formula-like text neutralized (same `csvCell` as the diary).
- Readings come from the account's `health_readings` table through the diary's existing `useHealthDiary` hook; sleep and mood come from the companion store. Nothing is sent to an AI or any other service. No new table or migration.
- The labeled sample (Sample visitor) uses the diary's sample readings plus made-up sleep and mood days (`sampleDays`), with a "made-up numbers" tag on the printed sheet.

## Not checked

- Not used while signed in against the real Supabase project. Checked with the labeled sample in a local preview.
- Russian, Ukrainian, and Greek text needs a read by a native speaker.
