# lifeZoi

lifeZoi is a calm web app for reflecting on everyday habits, exploring a WHAT IF? change, and keeping a simple progress record. It is educational. It does not diagnose illness, recommend medication changes, or predict how long someone will live.

The product name in the interface is **lifeZoi**. WHAT IF? is a feature inside it.

## Development mode

Supabase credentials were not available for this build, so authentication and database storage are **off**. The app does not pretend to sign anyone in.

- Answers, scenarios, goals, and check-ins stay in this browser tab (`sessionStorage`).
- Closing the tab clears them.
- That storage is not encrypted by lifeZoi and is not a secure health record.
- Suggestion and WHAT IF? requests go to this app’s own server for validation, then are discarded. They are not sent to an AI service.
- Sample data is labeled “Sample visitor” and is kept separate from what you type.

`GET /api/status` reports `persistence: "development"` and `authentication: "not-configured"`. If Supabase variables are present, the status still says the app does not connect. Filling in `.env` does not turn accounts on.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` only if you are documenting future Supabase variables. Do not commit real secrets.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local app |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit` |
| `npm test` | Unit tests (questionnaire, WHAT IF?, recommendations, access rules) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## What’s in the app

- Landing page, dashboard, profile, lifestyle assessment, WHAT IF?, progress, settings, and privacy.
- Desktop navigation and a compact mobile bar.
- A multi-step assessment with Back, Continue, skip for tobacco and alcohol, review, and validation.
- WHAT IF? illustrations for walking, sleep, smoking, eating, stress, alcohol, and social connection, plus a custom note that does not invent evidence.
- Monthly check-ins, goals, and a chart only after two or more check-ins for a habit in that month.
- Rule-based suggestions with links to the public sources they rely on. No AI provider is configured.

## Sources

Factual health statements are tied to pages that were reachable while this app was written, including WHO, NHLBI, NIMH, NIAAA, Nutrition.gov, the Dietary Guidelines for Americans, Smokefree.gov, ODPHP’s Physical Activity Guidelines page, and SAMHSA’s 988 page. The app does not calculate a lifespan or a date of death.

## Supabase, when you are ready

This build will not start using Supabase by itself.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. It creates tables and turns on row level security so `auth.uid()` must match `user_id`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host’s environment. Do not ship the service role key to the browser, and do not use it to read user rows.
4. Replace the development-mode session with a server session that calls `decideAccess` in `src/lib/access.ts` before every read or write. Hiding a button is not authorization.
5. Add a real account-deletion path that deletes that user’s rows.
6. Re-test against the live project. Until that is done, treat the SQL file as a prepared design, not as an active database.

## Deploy

The intended Vercel team is Right Intent LLC, slug `risi-0778846f`, team id `team_FthCxfnSPZ3JpaY3feKlqmIc`.

No environment variables are required for development mode. Production should be served over HTTPS. Vercel provides that. Security headers set by the app are `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`.

Do not deploy with a claim that accounts or encrypted health storage exist.

## Known limitations

- No accounts, no database, and no HIPAA, GDPR, or other compliance claim.
- Data in development mode is tab-local and easy to lose.
- Suggestions are rules, not a clinician and not an AI model.
- Quantitative personal risk, “years gained,” and dates of death are intentionally absent.
- The GitHub token used in this environment could not change the repository from public to private.
- Row level security is specified in SQL and covered by a text test. It has not been executed against a Supabase project.
