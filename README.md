# lifeZoi

lifeZoi is a calm web app for reflecting on everyday habits, exploring a WHAT IF? change, and keeping a simple progress record. It is educational. It does not diagnose illness, recommend medication changes, or predict how long someone will live.

The product name in the interface is **lifeZoi**. WHAT IF? is a feature inside it.

## Accounts and this browser

Email and password sign-in uses Supabase Auth when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. The browser uses that public anon key and the signed-in session. It does not use the service role key.

- After sign-in, assessment answers, WHAT IF? scenarios, habit goals, check-ins, the in-progress assessment, and the reassessment choice are stored in that person’s rows. Row level security requires `auth.uid()` to match `user_id`.
- An authenticator app can be enrolled with a QR code or secret and a 6-digit code. Later sign-ins ask for a new code before those rows open. This is Supabase Auth’s built-in TOTP support.
- Email confirmation stays at the project’s existing setting.
- Without an account, or when those variables are missing, answers stay in this browser tab (`sessionStorage`). Closing the tab clears that copy.
- That tab storage is not encrypted by lifeZoi and is not a secure health record.
- Sample data is labeled “Sample visitor” and is not written into an account.
- Suggestion and WHAT IF? requests go to this app’s own server for validation, then are discarded. They are not sent to an AI service.
- The Wellness Assistant at `/ai-assistant` shows prepared questions and answers stored in the app. It is not a live chatbot. Listening uses the browser’s speech synthesis and does not send answer text to a speech service. Ask by voice is optional and uses the browser’s speech recognition. LifeZoi does not receive that audio. `AI_PROVIDER=mock` is the only enabled mode on the unused development endpoint. A different provider name is refused, and no paid model, payment service, or health-record database is contacted.
- Community posts and comments at `/community` are checked before they are public. When `OPENAI_API_KEY` is set, the server calls the free OpenAI Moderations endpoint only (`POST /v1/moderations`, model `omni-moderation-latest`). That key is never a `NEXT_PUBLIC_` variable. The community does not call chat completions and does not enable billing. Without the key, messages stay in review. Members see a chosen name only. Submitted message text may be processed by that moderation provider. Do not post identifying information, health records, or questionnaire answers. Rejected messages, removed messages, and closed reports are kept for 30 days, then deleted.
- Lab education can ask MedlinePlus Connect for a verified LOINC code only. Responses are cached for 12 hours. Personal results and documents are not sent. Real document upload is described in `docs/claude-migration/DOCUMENT_PROCESSING_PLAN.md` and is not active.
- Your Life Matters reflections, Change Lab notes, the assistant conversation, and wellness notes stay in this browser tab. Your Life Matters notes are personal reflections about purpose and kindness. They are not a medical score, and positive karma is presented as a philosophical metaphor.

`GET /api/status` reports `authentication: "supabase"` and `persistence: "account"` only when the account adapter is active and the public Supabase URL and anon key are set. Otherwise it reports `persistence: "development"` and `authentication: "not-configured"`.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` and set the public Supabase URL and anon key to use accounts locally. Do not commit real secrets. Do not put the service role key in `.env` as a `NEXT_PUBLIC_` variable.

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

## Supabase

The live project already has `profiles`, `assessments`, `scenarios`, `habit_goals`, and `check_ins`. `supabase/schema.sql` matches those tables and adds the profile role, the in-progress session fields, authenticator-aware policies, and account deletion.

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host’s environment. Do not ship the service role key to the browser, and do not use it to read user rows.
2. Sign-up and sign-in use email and password. The admin account is `tatyanaserikovaru@gmail.com`. The database trigger sets `profiles.role` from that email. The client cannot grant admin. `GET /api/account` checks the same allowlist from the verified session.
3. Authenticator enrollment is in Settings. Confirm a 6-digit code. Later sign-ins require that code before saved rows open.
4. Account deletion calls `delete_own_account()`, which removes that person’s rows and login.
5. `decideAccess` in `src/lib/access.ts` runs before an account write. Hiding a button is not authorization; row level security still applies.

## Deploy

The intended Vercel team is Right Intent LLC, slug `risi-0778846f`, team id `team_FthCxfnSPZ3JpaY3feKlqmIc`.

No environment variables are required to run the tab-only mode. Accounts need the public Supabase URL and anon key. Production should be served over HTTPS. Vercel provides that. Security headers set by the app are `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`. Every response also sends `X-Robots-Tag: noindex, nofollow`, and the root layout sets the same robots metadata. Leave both in place until a production privacy notice matches the real system. They ask search engines not to index the site. A `robots.txt` disallow rule is not a substitute.

Do not deploy with a claim of HIPAA, GDPR, or other compliance.

## Known limitations

- Search indexing is off until a reviewed privacy notice matches the real system. Do not remove the `noindex` metadata or `X-Robots-Tag` header before that review.
- Accounts store the signed-in session described above. There is no HIPAA, GDPR, or other compliance claim.
- Data without an account is tab-local and easy to lose. Tab storage and account storage are not encrypted by lifeZoi beyond what the host and Supabase provide.
- Suggestions are rules, not a clinician and not an AI model.
- Quantitative personal risk, “years gained,” and dates of death are intentionally absent.
- The GitHub token used in this environment could not change the repository from public to private.
- Row level security is in `supabase/schema.sql` and is enabled on the account tables.
