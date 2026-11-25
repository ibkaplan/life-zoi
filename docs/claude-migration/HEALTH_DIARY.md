# Health diary: blood pressure, blood sugar, cholesterol

Owner request, 2026-11-24: a diary to record blood pressure, blood sugar, and cholesterol, with history, trends, reminders, export for a doctor, and deletion.

## The site measures nothing

The owner asked whether LifeZoi could measure these on screen. It cannot, and the page says so in "Can LifeZoi measure these for me?": a website or phone screen cannot measure blood pressure, blood sugar, or cholesterol, and camera or fingertip-on-screen apps are not reliable. It points to a validated upper-arm cuff monitor (AHA), a glucose meter or a continuous glucose monitor the doctor suggests, and a lab blood test for cholesterol. No device or app is recommended by brand, and LifeZoi earns nothing from any. Device connections are a "Later" note only; nothing is built.

## Where it is

`/my-health/diary`, in the My Health section after "Understand My Lab Results" (menu, My Health hub card, footer). Code: `src/lib/health-diary/` (types, units, validate, ranges, series, csv, reminders, sample, repository, store), `src/components/health-diary/`, page `src/app/(members)/my-health/diary/page.tsx`.

## What it does

- Three tabs: Blood pressure (systolic, diastolic, optional pulse), Blood sugar (value, when measured: fasting, before a meal, 1 to 2 hours after a meal, bedtime, other), Cholesterol (any of total, LDL, HDL, triglycerides). Date, time, and an optional note (300 characters).
- Glucose and cholesterol can be typed in mg/dL or mmol/L. Values are stored in mg/dL and shown in the chosen unit. Factors: glucose 18.016, cholesterol 38.67, triglycerides 88.57. Russian, Ukrainian, and Greek start in mmol/L; English in mg/dL; the choice is remembered in the browser.
- Validation catches typing mistakes, not health targets: systolic 60–260, diastolic 30–160 and below systolic, pulse 30–220, glucose 20–600 mg/dL, total 50–500, LDL 10–400, HDL 10–150, triglycerides 20–2000. No future dates, nothing before 1990. The same limits are CHECK constraints in the table.
- Latest reading with a comparison label, a line chart (30 days, 3 months, 12 months, all; over 3 months it shows weekly averages), a summary (count, average, lowest, highest, first to latest), and the full list with delete. Charts use line style and marker shape, not color alone, and redraw narrower on phones so the text stays readable.
- Reminders: off, daily, weekly, monthly, every 3 months, per kind. Shown at the top of the page when due. No notifications, e-mail, or texts. Stored in the browser (a preference, not health data).
- Download CSV (UTF-8 with BOM, formula-like text neutralized) and Print summary (print or save as PDF). Both are made on the device.
- Delete one reading, delete all readings, "Clear my data" in Settings, and account deletion (on delete cascade) all remove readings.
- The labeled sample (Sample visitor) shows made-up readings and saves nothing.

## Reference ranges and sources (checked 2026-11-25)

| Measure | Ranges shown | Source |
| --- | --- | --- |
| Blood pressure | Normal <120 and <80; Elevated 120–129 and <80; Stage 1 130–139 or 80–89; Stage 2 ≥140 or ≥90; Severe >180 and/or >120 | AHA, Understanding Blood Pressure Readings |
| Low blood sugar | below 70 mg/dL | ADA, Hypoglycemia |
| Fasting lab glucose | below 100 usual, 100–125 prediabetes range, 126+ diabetes range | ADA, Diabetes Diagnosis; CDC, Diabetes Testing |
| Targets for many adults with diabetes | 80–130 before meals; below 180 1–2 hours after a meal starts | ADA, Checking Your Blood Sugar |
| Cholesterol, adults 20+ | total <200; LDL <100; HDL 60+ best, low under 40 men / 50 women; triglycerides <150 normal, 150–199 borderline high, 200+ high | MedlinePlus, Cholesterol Levels: What You Need to Know |

Labels say "range", never a diagnosis, and every block says individual targets differ and to ask a doctor. Blood pressure below 90/60 is labeled "Lower than the usual range" with a note that it can be normal.

Safety notes appear for blood pressure above 180 or 120 (wait a minute, measure again, emergency number with the AHA symptom list, otherwise the doctor), low blood pressure, and blood sugar below 70 (follow the doctor's plan, emergency number if someone cannot eat or drink safely, has a seizure, or passes out). A fixed "When to get help" card is always shown. Nothing names a medicine, a dose, or a food amount; the page says not to change medicine because of a diary number. Emergency wording says "your local emergency number", not 911.

## Storage and privacy

- Table `public.health_readings`, migration `supabase/migrations/20261125000000_health_readings.sql` (also in `schema.sql`, `verify.sql`, and policy tests in `supabase/test/policies.sql`). One row per reading; typed columns with CHECK constraints and a shape check per kind; index on (user_id, measured_at). Row level security `health_readings_own_rows`, the same rule as `academy_state`. Additive only: no existing table or row changes.
- Readings are only in the account. Unlike other pages, no copy is kept in localStorage, so nothing is left on a shared computer. Until the migration runs, the page says storage is not set up and saves nothing.
- Readings are never sent to an AI, an analytics tool, or any other service.

## Not checked

- Not used while signed in against the real Supabase project; the members' pages need a real sign-in. The page was checked on a phone and a computer width with the labeled sample in a local preview that was not committed. Check `/my-health/diary` on the Vercel preview after sign-in.
- Russian, Ukrainian, and Greek text needs a read by a native speaker, especially the safety notes.
