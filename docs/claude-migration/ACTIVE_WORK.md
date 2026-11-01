# Active work

Snapshot date: 2026-11-01. Source of truth for code is GitHub. The Cursor project store is not updated by this file.

Nothing in the store was marked pending or blocked. The risk is unmerged and conflicting work, plus launch reviews that were never scheduled as tasks.

## Snapshot

| Item | State on 2026-11-01 |
| --- | --- |
| Default branch | `main` at `a6bfdcc60ad1fc1a93fe81d4fb336ad6260f427e` |
| Other branch | `cursor/lifezoi-app-ce49` at `0ab8b123bd0f5df2c5c929046091ed050b15b8b2` |
| Open pull requests | #1 only |
| Open issues | None |
| GitHub Actions | None |
| Working tree used for the migration | Clean `main` before the documentation branch |
| CI on `main` | Vercel deployment status success for `a6bfdcc`. No test workflow. |
| CI on pull request #1 | Vercel success, Vercel Preview Comments success. Merge state conflicting. |
| Live HTTP | `https://life-zoi.vercel.app` responded 200. Content was not browsed. |

Agents still present and idle, other than the documentation writer: coordinator `bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e`, builder `bc-efe0545d-9f0c-5bcb-9551-93e15378ce49`, and `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` with no artifact. Stopping them is not required to keep this snapshot. Their chat history was not copied out. If a person deletes those agents, the unrecovered transcripts are the only likely loss. The code is already on GitHub.

## Tasks

### LZ-1 — First application

1. Name: LZ-1 Build the lifeZoi web application.
2. Objective: ship the first responsive app described in the product specification.
3. Assigned agent: `bc-efe0545d-9f0c-5bcb-9551-93e15378ce49` for the pull request. The commits on `main` are not attributed to that id.
4. Status: done in the Cursor tracker, which points at pull request #1. Incomplete as a merged product. `main` already contains a different finished-looking tree.
5. Completed: both trees implement an assessment, WHAT IF?, progress, and rule-based guidance in development mode. Details differ. See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).
6. Files and branches: entire app on `main`; alternative app on `cursor/lifezoi-app-ce49`.
7. Outstanding: choose one tree. Resolve or close the conflicting pull request. Do not merge it blindly.
8. Blockers: content conflict with `main`. No recorded human review. Branch protection could not be read.
9. Next action: a person decides. Until then, Claude works from `main` and leaves pull request #1 untouched.
10. References: https://github.com/ibkaplan/life-zoi/pull/1, agent https://cursor.com/agents/bc-efe0545d-9f0c-5bcb-9551-93e15378ce49, `README.md`.

### Decide the canonical tree

1. Name: Canonical tree decision.
2. Objective: stop maintaining two apps.
3. Assigned agent: none. Needs a person.
4. Status: open, untracked in Cursor.
5. Completed: differences are documented in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md).
6. Files: nearly the whole `src/` tree differs.
7. Outstanding: the decision itself. Notable deltas: `sessionStorage` versus `localStorage`, no `noindex` on `main` versus `noindex` on the pull request, different API routes, check-in shape, suggestion cap, settings (confirm-clear versus type `delete` and JSON export).
8. Blockers: product owner choice. Merging the pull request today will conflict.
9. Next action: prefer `main` unless the owner wants the pull request’s `noindex`, `localStorage`, and export behavior enough to port those pieces forward as a new branch cut from `main`.
10. References: pull request #1, `README.md`, [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).

### Launch reviews

1. Name: Privacy, security, scientific, and legal review.
2. Objective: decide whether a public launch is acceptable.
3. Assigned agent: none. Not a coding task.
4. Status: not started. Required before launch by the product rules.
5. Completed: in-app notices say the build is educational, development-mode, and not a compliance claim. Sources are linked.
6. Files: `src/app/(app)/privacy/page.tsx`, `src/lib/sources.ts`, `src/lib/claims.ts`, `README.md`.
7. Outstanding: HIPAA/GDPR/consumer-health scope, retention and host logs, scientific read of the copy, production privacy notice, 988 wording outside the United States, indexing decision.
8. Blockers: needs qualified reviewers. Coding agents must not declare the reviews done.
9. Next action: keep the app in development mode and add `noindex` on `main` only when a task explicitly asks for that launch guard.
10. References: [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).

### Supabase adapter

1. Name: Optional accounts and database.
2. Objective: if accounts are wanted, connect an adapter that uses the prepared schema and `decideAccess`.
3. Assigned agent: none.
4. Status: planned. Not blocked by a bug. Blocked by a missing product decision and missing credentials.
5. Completed: `supabase/schema.sql`, `src/lib/access.ts`, status endpoint that refuses to pretend.
6. Files: those, plus a future server session. No client is installed.
7. Outstanding: create the Supabase project, apply SQL, implement the adapter, deletion, and tests against the real project.
8. Blockers: no credentials in the repo, by design. Do not add a service-role key to the client.
9. Next action: do not start until the canonical tree is chosen and a person supplies a project.
10. References: `README.md` section “Supabase, when you are ready”.

### Verify `main`

1. Name: Re-run checks on the default branch.
2. Objective: know whether the tree Claude will edit still passes its own scripts.
3. Assigned agent: none. The migration did not run the suite.
4. Status: outstanding.
5. Completed: tests exist. Vercel reported a successful deployment of `a6bfdcc`.
6. Files: `package.json`, `src/lib/*.test.ts`.
7. Outstanding: `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, and a browser pass of the main flows.
8. Blockers: none technical. Time and an environment with Node 22.
9. Next action: this is the first Claude verification task in [INDEX.md](INDEX.md).
10. References: `README.md` scripts.

### Indexing gap on `main`

1. Name: `noindex` missing on the default branch.
2. Objective: avoid indexing a site whose privacy notice does not yet match a reviewed production system.
3. Assigned agent: none.
4. Status: known gap. The public homepage URL is already recorded on the GitHub repo.
5. Completed: pull request #1 sets `robots` noindex. `main` does not.
6. Files: `src/app/layout.tsx` on `main` has no `robots` field.
7. Outstanding: a deliberate change after the canonical-tree decision, plus confirmation on the deployed HTML.
8. Blockers: should not be slipped into an unrelated pull request without saying so. Host logs and the public URL remain a review item even with `noindex`.
9. Next action: confirm with the owner, then add noindex on the chosen tree until the privacy review says otherwise.
10. References: product rules in [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).

### Unidentified earlier agent

1. Name: Explain or ignore `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6`.
2. Objective: avoid losing work that was never pushed.
3. Assigned agent: that id, status idle.
4. Status: unknown. No branch, diff, or events.
5. Completed: nothing visible.
6. Files: none linked.
7. Outstanding: only a person with access to that chat can say if anything was uncommitted.
8. Blockers: transcript not in the project store.
9. Next action: if the chat is empty or abandoned, no code action. Do not try to resume it from Claude.
10. References: [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md).

## What is not in progress

No bugs were filed. No architecture decision record beyond the README and these docs. No dependency upgrades were requested. No partial feature flag is half-landed inside `main`; the app on `main` is a coherent development-mode build. The partial work is the unmerged second app.

## Priority order

1. Verify `main` with the test scripts.
2. Decide the fate of pull request #1.
3. Leave Supabase, AI, and launch reviews until a person asks.
4. Add `noindex` only as an explicit follow-up on the chosen tree.
