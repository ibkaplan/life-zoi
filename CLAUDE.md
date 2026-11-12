# lifeZoi — Claude Code instructions

lifeZoi is a responsive health and longevity web app. WHAT IF? is a feature inside it, not the product name. The app helps people reflect on habits, compare a lifestyle change with public guidance, and record progress. It is educational. It does not diagnose, recommend medication changes, or predict lifespan.

Read `docs/claude-migration/INDEX.md` first, then the document that matches the task. Treat `main` as the codebase. Pull request #1 was closed without being merged. Do not reopen or merge it unless a person asks.

## Architecture

Next.js App Router, TypeScript, Tailwind CSS 4, React 19. `SESSION_ADAPTER` is `"supabase"`. Signed-in assessment answers, scenarios, goals, and check-ins use the anon key and `auth.uid()` row level security when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are a real public config. The browser client reads those two names directly so Next can inline them (`src/lib/supabase-browser.ts`). Without that configuration, answers stay in `sessionStorage` for the current tab. `GET /api/status` reports `authentication: "supabase"` and `persistence: "account"` only in the connected case.

The Wellness Assistant page at `/ai-assistant` is a prepared question-and-answer library: six topics and 28 written answers in `src/lib/wellness-assistant/guide.ts`, no typing, no voice input, and Listen reads the same blocks the page shows. The older 50-answer library and the free-model route stay on the server for a later assistant but are not shown on the page. `POST /api/ai-assistant/wellness` can call Google’s free-tier model `gemini-3.5-flash-lite` only when the server has `GEMINI_API_KEY`. That call sends the current assistant session, not lab values, diagnoses, or account records. Without the key, or when the free tier cannot answer, the prepared library is the reply. `AI_PROVIDER` other than `mock` on the separate development endpoint is refused and does not make a network call. Change Lab, Your Life Matters, the assistant thread, and wellness notes stay in `sessionStorage` even when an account exists. MedlinePlus Connect is called only with a verified LOINC code. Document upload is not implemented (`docs/claude-migration/DOCUMENT_PROCESSING_PLAN.md`).

Important paths on `main`:

- `src/app/` — pages and route handlers, including academy, Change Lab, outlook, and the assistant
- `src/components/` — shell, assessment, WHAT IF?, progress, settings
- `src/lib/` — validation, scenarios, recommendations, accounts, wellness, and `src/lib/ai/`
- `supabase/schema.sql` — account tables, row level security, authenticator-aware policies, admin role trigger, and account deletion
- `README.md` — setup, deployment notes, and limitations

Routes include `/`, `/dashboard`, `/profile`, `/assessment`, `/what-if`, `/progress`, `/settings`, `/sign-in`, `/reset-password`, `/privacy`, `/life-matters`, `/outlook`, `/change-lab`, `/ai-assistant`, `/lab-results`, academy, urges, habits, and wellness pages under `src/app/(app)/`. API routes: `GET /api/status`, `GET /api/account`, `GET|POST /api/ai-assistant`, `GET /api/references`, `GET /api/news`, `POST /api/recommendations`, `POST /api/what-if`.

## Development standards

Requirements: Node.js 22 and npm. Install with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local app at http://localhost:3000 |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

Match the existing style: small typed modules, server validation beside any client check, and plain language in the UI. Do not add a health score, invented measurement, or lifespan figure. The one exception, requested by the owner on 2026-11-12, is the dashboard’s “My Wellness Score & Progress” (`src/lib/wellness-score.ts`): a count of how many of seven habit areas in the person’s own saved assessments match the public guidance the suggestions already use, with an empty state when nothing is saved. Sample data must stay labeled as sample data (`Sample visitor` on `main`) and must not be written into the person’s saved session as if it were theirs.

Run the relevant tests for any behavior you change. Do not claim tests, a deploy, or compliance passed unless that was actually verified.

## Coordinator

Keep one accurate backlog. Decompose work so each task has a branch, files it may touch, and a way to tell it is done. Delegate independent work only when the file sets do not overlap. Review the result against the safety rules below before merging. Record durable decisions in `docs/claude-migration/` or the README, not only in chat.

Current priority: the tracker still has LZ-3, the owner’s decision on whether `main` or the closed pull request #1 is canonical. Until that is answered, continue from `main` and do not revive pull request #1. Details are in `docs/claude-migration/ACTIVE_WORK.md`.

## Delegated work

Use a worker for a bounded change. One worker per branch. Do not run two writers on the same files. Cloud sessions are enough for repository edits and unit tests. Use Claude Desktop or local Claude Code when the task needs a browser, local secrets, or files on a person’s machine. That local session replaces Cursor’s self-hosted worker path (`agent worker start` and a checkout such as `~/github/life-zoi`). It does not attach to a Cursor worker.

Require `npm test`, `npm run typecheck`, and `npm run lint` for application changes, plus `npm run build` when routing, config, or rendering changes. Medical and privacy copy needs a careful read, not only a green test run.

## Operational restrictions

- Do not expose secrets, tokens, or service-role keys. Do not commit `.env` files.
- Do not put a service-role key in the browser or in a `NEXT_PUBLIC_` variable. The anon key is public only with row level security.
- Do not describe the mock development endpoint as a live model. Do not set `AI_PROVIDER` to anything but `mock`. The wellness page may use `GEMINI_API_KEY` on the server for `gemini-3.5-flash-lite` only. Do not add a paid model, a browser key, or a `NEXT_PUBLIC_` copy of that key.
- Do not fake authentication or secure storage. Empty Supabase variables must stay `not-configured`.
- Do not claim HIPAA, GDPR, or other regulatory compliance.
- Guidance stays qualitative. Do not invent citations, percentages, risk reductions, or a date of death. The Life outlook page may show a copied Social Security population figure only with the existing “not an individual prediction” label. Do not turn that figure into a personal lifespan.
- `noindex` is set in the root layout and as `X-Robots-Tag: noindex, nofollow`. Leave both until a production privacy notice matches the real system.
- The 988 wording is for the United States and still needs review before launch.
- Hosts can log validation request bodies even though application code does not store them.
- Do not deploy, change infrastructure, or rotate credentials unless the task explicitly says so and a person has approved production changes.
- Follow GitHub branch protection. Do not merge unvalidated implementation changes. Do not bypass failed checks.
- Preserve working behavior unless the task asks for a change.

## Documentation

- `docs/claude-migration/INDEX.md` — start here
- `docs/claude-migration/PROJECT_OVERVIEW.md` — product and architecture
- `docs/claude-migration/PROJECT_KNOWLEDGE.md` — rules and decisions
- `docs/claude-migration/ACTIVE_WORK.md` — open work
- `docs/claude-migration/ENVIRONMENT_SETUP.md` — tools and integrations
- `docs/claude-migration/AGENT_ARCHITECTURE.md` — Cursor agents that existed
- `docs/claude-migration/CLAUDE_WORKFLOW.md` — how to coordinate in Claude Code
- `docs/claude-migration/AUTOMATIONS.md` — triggers that do and do not exist
- `docs/claude-migration/MIGRATION_CHECKLIST.md` — verification before retiring Cursor
- `docs/claude-migration/DOCUMENT_PROCESSING_PLAN.md` — future lab-document rules; not implemented
