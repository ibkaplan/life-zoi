# lifeZoi — Claude Code instructions

lifeZoi is a responsive health and longevity web app. WHAT IF? is a feature inside it, not the product name. The app helps people reflect on habits, compare a lifestyle change with public guidance, and record progress. It is educational. It does not diagnose, recommend medication changes, or predict lifespan.

Read `docs/claude-migration/INDEX.md` first, then the document that matches the task. Treat `main` as the codebase. Pull request #1 is a conflicting second implementation; do not merge it as part of routine work.

## Architecture

Next.js App Router, TypeScript, Tailwind CSS 4, React 19. There is no database client and no AI provider. Answers stay in `sessionStorage` for the current tab. Server routes validate and respond, then discard the body.

Important paths on `main`:

- `src/app/` — pages and route handlers
- `src/components/` — shell, assessment, WHAT IF?, progress, settings
- `src/lib/` — validation, scenarios, recommendations, session sanitizing, access rule
- `supabase/schema.sql` — prepared schema only; the app does not connect to it
- `README.md` — setup, deployment notes, and limitations

Routes: `/`, `/dashboard`, `/profile`, `/assessment`, `/what-if`, `/what-if/[id]`, `/progress`, `/settings`, `/privacy`, `GET /api/status`, `POST /api/recommendations`, `POST /api/what-if`.

## Development standards

Requirements: Node.js 22 and npm. Install with `npm ci`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local app at http://localhost:3000 |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

Match the existing style: small typed modules, server validation beside any client check, and plain language in the UI. Do not add a health score, invented measurement, or lifespan figure. Sample data must stay labeled as sample data (`Sample visitor` on `main`) and must not be written into the person’s saved session as if it were theirs.

Run the relevant tests for any behavior you change. Do not claim tests, a deploy, or compliance passed unless that was actually verified.

## Coordinator

Keep one accurate backlog. Decompose work so each task has a branch, files it may touch, and a way to tell it is done. Delegate independent work only when the file sets do not overlap. Review the result against the safety rules below before merging. Record durable decisions in `docs/claude-migration/` or the README, not only in chat.

Current priority: decide what to do with the conflicting open pull request, then continue from `main`. Details are in `docs/claude-migration/ACTIVE_WORK.md`.

## Delegated work

Use a worker for a bounded change. One worker per branch. Do not run two writers on the same files. Cloud sessions are enough for repository edits and unit tests. Use a local Claude Code session when the task needs a browser, local secrets, or a machine the cloud session cannot reach.

Require `npm test`, `npm run typecheck`, and `npm run lint` for application changes, plus `npm run build` when routing, config, or rendering changes. Medical and privacy copy needs a careful read, not only a green test run.

## Operational restrictions

- Do not expose secrets, tokens, or service-role keys. Do not commit `.env` files.
- Filling in Supabase or AI variables must not be described as turning accounts or AI on. `src/lib/status.ts` stays in development mode until a real adapter exists.
- Do not fake authentication or secure storage.
- Do not claim HIPAA, GDPR, or other regulatory compliance.
- Guidance stays qualitative. Do not invent citations, percentages, risk reductions, or a date of death.
- `noindex` is still required before a public launch whose privacy notice matches the real system. `main` does not set it today. Do not remove a future `noindex` until that review is done.
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
