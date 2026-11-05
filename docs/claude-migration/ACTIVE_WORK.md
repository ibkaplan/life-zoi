# Active work

Snapshot date: 2026-11-05. Source of truth for code is GitHub `main` at `1d6a333`. The Cursor tracker was read and not edited by this refresh.

## Snapshot

| Item | State on 2026-11-05 |
| --- | --- |
| Default branch | `main` at `1d6a33377b792952fda52dd2b5a9e57c6464c086` |
| Closed, not merged | Pull request #1 (`cursor/lifezoi-app-ce49` at `0ab8b12`). Also #4, #5, #6, and #7, whose commits are already in `main` via #8. |
| Merged since the first docs | #3 `noindex`, #8 stack (`cd15d65`), #9 contrast (`0c1bef4`), #10 quieter homepage (`6063296`), then account commits `39be250` and `1d6a333` |
| Open pull requests | None in `gh pr list` for open state at inspection. Re-check before acting. |
| GitHub Actions | None (`total_count` 0) |
| Tracker | LZ-3 still open (canonical tree). LZ-7 is this doc refresh. LZ-1, LZ-2, LZ-4, LZ-5, and LZ-6 are done. |
| Live HTTP | Not re-requested on 2026-11-05. |

Agents were not stopped. Chat history outside the tracker and git was not copied. Igor’s wife’s Cursor setup is a second contributor and is not in this project’s agent list.

## Tasks

### LZ-1 — First application

1. Name: LZ-1 Build the lifeZoi web application.
2. Objective: ship the first responsive app described in the product specification.
3. Assigned agent: `bc-efe0545d-9f0c-5bcb-9551-93e15378ce49` for the pull request. The commits on `main` are not attributed to that id.
4. Status: done in the tracker. The pull request was later closed without merge. `main` continued and now includes accounts and the stacked tools.
5. Completed: the closed branch and `main` both started as assessment, WHAT IF?, and progress apps. They are not the same tree.
6. Files and branches: current app on `main`; alternative app still on `cursor/lifezoi-app-ce49`.
7. Outstanding: the owner’s recorded decision (LZ-3), not a merge.
8. Blockers: none for day-to-day edits on `main`.
9. Next action: work from `main`. Do not merge or reopen pull request #1 unless the owner asks.
10. References: https://github.com/ibkaplan/life-zoi/pull/1, agent https://cursor.com/agents/bc-efe0545d-9f0c-5bcb-9551-93e15378ce49, `README.md`.

### Decide the canonical tree

1. Name: Canonical tree decision.
2. Objective: stop maintaining two apps.
3. Assigned agent: none. Tracker id LZ-3, still unchecked on 2026-11-05.
4. Status: open as a decision. GitHub has already closed pull request #1 without merging it, and `main` has moved on (`noindex`, accounts, Change Lab, and the other tools).
5. Completed: `main` is the integrated product. The other branch is historical.
6. Files: the closed branch still differs, including `localStorage` and its own validation routes.
7. Outstanding: a recorded yes or no from the owner. Closing the pull request did not check the tracker box.
8. Blockers: the owner. Merging the branch would conflict and would discard later `main` work.
9. Next action: keep `main`. Ask the owner to close LZ-3 explicitly. Do not port the old branch unless they name a behavior that is still missing.
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
9. Next action: keep `noindex`. Include the SSA population figure and the mock assistant in the scientific review. Do not describe accounts as compliance.
10. References: [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).

### Supabase accounts

1. Name: Account storage.
2. Objective: signed-in assessment data in Supabase with row level security.
3. Assigned agent: not attributed to one id in the agent list. Commit `39be250`, then `1d6a333`.
4. Status: implemented in code. The README says the live project already has the tables. This refresh did not query it.
5. Completed: browser client, anon key, TOTP-aware policies, admin allowlist, `GET /api/account`, deletion function in SQL.
6. Files: `src/lib/account-store.ts`, `src/lib/supabase-browser.ts`, `supabase/schema.sql`.
7. Outstanding: confirm production env vars and that the live schema matches the file. Do not paste secrets into git.
8. Blockers: none for tab-only development.
9. Next action: leave credentials in the host. Do not add a service-role key to the client.
10. References: `README.md` section “Supabase”.

### Verify `main`

1. Name: Re-run checks on the default branch.
2. Objective: know whether the tree Claude will edit still passes its own scripts.
3. Assigned agent: none. The migration did not run the suite.
4. Status: outstanding.
5. Completed: tests exist, including account, mock assistant, Change Lab, and MedlinePlus cases. This refresh did not run them.
6. Files: `package.json`, `src/lib/**/*.test.ts`.
7. Outstanding: `npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, and a browser pass of the main flows.
8. Blockers: none technical. Time and an environment with Node 22.
9. Next action: this is the first Claude verification task in [INDEX.md](INDEX.md).
10. References: `README.md` scripts.

### Indexing

1. Name: Keep `noindex` until the privacy notice matches the system.
2. Objective: avoid treating the public URL as a launched product.
3. Assigned agent: landed with pull request #3 and the #8 integration.
4. Status: present on `main` in layout metadata and `X-Robots-Tag`.
5. Completed: both mechanisms. Pull request #1’s copy is no longer the only one.
6. Files: `src/app/layout.tsx`, `next.config.ts`.
7. Outstanding: confirm the deployed HTML still sends them after later deploys. Do not remove them.
8. Blockers: none.
9. Next action: leave them. Recheck only when a privacy review asks.
10. References: `README.md` deploy section.

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

No GitHub issues were confirmed in this refresh. `main` is one product: accounts when configured, tab storage otherwise, mock assistant, and educational tools. Pull request #1 is closed historical work. Document upload and a paid model are not started.

## Priority order

1. Verify `main` with the test scripts.
2. Ask the owner to record LZ-3. Do not reopen pull request #1 in the meantime.
3. Leave paid AI, document upload, and launch claims until a person asks.
4. Keep `noindex`.
