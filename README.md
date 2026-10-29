# lifeZoi

lifeZoi is a health and longevity web app. It helps someone reflect on everyday habits, explore a **WHAT IF?** change, and keep a simple progress record.

WHAT IF? is a feature inside lifeZoi. It is not the product name.

lifeZoi offers general wellness education. It does not diagnose, recommend medication changes, estimate lifespan, or predict a date of death.

Search engines are asked not to index this first version (`robots: noindex`). Remove that metadata only after the review described at the end of this file.

## Local development mode

Supabase and AI credentials are not required.

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are blank, the app runs in **local development mode**:

- Notes stay in this browser (`localStorage` key `lifezoi.local.v1`).
- There is no account, session, or secure server copy.
- The interface says this plainly. It does not pretend a login succeeded.
- Sample layouts are labeled **Sample data** and are not written into your notes.

If both Supabase variables are set, this version still does **not** turn on remote storage. Settings explains that the keys are unused. Apply `supabase/schema.sql` and add a server adapter before treating any cloud project as the system of record.

Guidance is a fixed set of rules in `src/lib/recommendations.ts`. No AI provider is called.

Saving an assessment, scenario, or check-in also posts the entry to a validation route. The route checks the shape and does not write a database. A host may still log request bodies. Do not put a public deployment online until that is reviewed.

## Setup

Requirements: Node.js 22+, npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.local` is gitignored. `.env.example` lists the variables and is safe to commit because the values are empty.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local Next.js app |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest, once |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Optional. Not used for storage in this version. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Optional. Not used for storage in this version. |
| `OPENAI_API_KEY` | Server only | Not read. Reserved if you later add an AI provider. Never prefix a secret with `NEXT_PUBLIC_`. |

Changing `NEXT_PUBLIC_*` values requires a new build. They are inlined into the browser bundle.

## Deploy to Vercel

This repository is a Next.js App Router project. Vercel can build it without extra framework settings.

1. Push the branch and import the repository in Vercel, or run the Vercel CLI from a checkout you control.
2. Leave the Supabase and AI variables empty unless you have finished the adapter work below. Empty variables keep local-mode behavior in each visitor’s browser.
3. Do not set a service-role key. This app has nowhere safe to use one yet.
4. Confirm the deployment URL loads the lifeZoi home page, the dashboard states that storage is local, and no secret appears in the page source.
5. This copy does not enable a custom domain, production data migration, or indexing.

Deployment is not done from this repository by itself. A successful `npm run build` only means the app can build.

## Connect a database later

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. It enables Row Level Security so `auth.uid() = user_id` on profiles, assessments, saved scenarios, habit goals, and check-ins. Anonymous access is revoked.
3. Add a server adapter that uses the signed-in user id. Enforce the same owner check in the server, not only in the interface. `canAccessRecord` in `src/lib/access.ts` is the app-side form of that rule.
4. Keep the service role key on the server. The anon key is public only because RLS is in place.
5. Replace browser storage only after export, deletion, and the privacy page match the new system.
6. Do not describe the result as HIPAA or GDPR compliant without a separate legal and technical review.

## Connect an AI provider later

Keep the API key on the server. Send the smallest habit summary that the feature needs, validate the model output, and discard responses that add numbers, citations you cannot resolve, diagnoses, or lifespan claims. Until that exists, leave the rule-based guidance in place.

## Product notes

- Main areas: Dashboard, My Profile, Lifestyle Assessment, WHAT IF?, Progress, Guidance, Settings, Privacy.
- The assessment has progress, Back, Continue, and a review step. Drafts stay in the browser.
- WHAT IF? compares a reported routine with a proposed change, separates established guidance from outcomes that vary, and links to public sources.
- Progress shows a month you choose, habits, check-ins, assessment history, and saved scenarios. You can correct or delete entries.
- Charts include the same counts in text and a table.

## Known limitations

- Browser storage can be cleared, shared with another person on the device, or blocked in private windows.
- Validation requests can appear in host logs even though the app does not store them.
- Source pages belong to public health agencies and can move. Re-check links before a public launch.
- Guidance and WHAT IF? copy are curated. They are not a clinical guideline and they are not individualized medical advice.
- There is no account recovery, encryption key, audit log, or automated backup.
- The app asks search engines not to index it.
- No production deployment is included or verified here.

## Review before a public launch

Privacy, security, scientific, and legal review are still required:

- Decide whether lifestyle answers are in scope for HIPAA, GDPR, state consumer-health laws, or similar rules. This project does not claim compliance.
- Review the validation routes, hosting logs, retention, and a future Supabase adapter.
- Have a clinician or qualified reviewer read the WHAT IF? and guidance copy against the cited sources.
- Confirm crisis wording (988 is United States only) for the countries you serve.
- Remove `noindex` only when that review is done and a real privacy notice matches production.
