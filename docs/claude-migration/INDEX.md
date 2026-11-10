# lifeZoi Claude Code migration index

Read this file first.

## Project

lifeZoi is a responsive web app for habit reflection, WHAT IF? lifestyle illustrations, evidence-informed educational guidance, and simple progress tracking. WHAT IF? is a feature, not the product name. The app must not diagnose, promise a lifespan, or present uncertain estimates as medical facts.

| | |
| --- | --- |
| Repository | https://github.com/ibkaplan/life-zoi |
| Default branch | `main` |
| Visibility | Public |
| Homepage recorded on the repo | https://life-zoi.vercel.app |
| Product owner named in the project brief | Igor Kaplansky (GitHub login `ibkaplan`) |
| Other contributor | Igor’s wife, in a separate Cursor setup. Her agents and tracker are not visible from this project. |
| Snapshot used for these docs | `main` at `1d6a333` (2026-11-05 inspection) |

## Architecture in brief

`main` is a Next.js 16 App Router application (TypeScript, React 19, Tailwind CSS 4). The session adapter is Supabase. Signed-in assessment answers, scenarios, goals, and check-ins are stored with the anon key and row level security when the public URL and anon key are set. Otherwise those answers stay in `sessionStorage`. `GET /api/status` reports `authentication: "supabase"` and `persistence: "account"` only in that connected case. Change Lab, Your Life Matters, wellness notes, and the assistant thread stay in the tab. The assistant is a development mock and refuses any other `AI_PROVIDER`. MedlinePlus is queried by LOINC code only. Search indexing is off (`robots` metadata and `X-Robots-Tag`).

https://github.com/ibkaplan/life-zoi/pull/1 was a second implementation. On 2026-11-05 it was closed and had never been merged. `main` is the tree to edit. The owner confirmed that on 2026-11-05 (LZ-3).

## Migration status

Migration documentation landed in pull request #2 (`c9f003a`) and was refreshed in #11. On 2026-11-05 the owner approved the Claude readiness report and LZ-3 (`main` is canonical). Claude verified `main` locally and in production and recorded it in #12 and the close-out pull request. The Claude side of [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) is complete. The owner still has to save any Cursor chat notes worth keeping and archive the Cursor agents. Claude cannot reach Cursor.

## Documents

| Document | Use it for |
| --- | --- |
| [CLAUDE.md](../../CLAUDE.md) | Short operating rules for every Claude Code session |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Product, stack, architecture, and what is actually built |
| [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md) | Permanent rules, decisions, pitfalls, and gaps |
| [ACTIVE_WORK.md](ACTIVE_WORK.md) | Open pull request, unfinished work, and next actions |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Runtimes, commands, integrations, and manual setup |
| [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) | Cursor coordinator and agents that were visible |
| [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md) | Coordinator and worker workflow in Claude Code |
| [AUTOMATIONS.md](AUTOMATIONS.md) | Schedules and triggers, including those that do not exist |
| [CHAIR_YOGA_LIBRARY.md](CHAIR_YOGA_LIBRARY.md) | Chair Yoga Studio videos, what was verified, and how to add more |
| [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) | Checks before relying on Claude Code and retiring Cursor |
| [DOCUMENT_PROCESSING_PLAN.md](DOCUMENT_PROCESSING_PLAN.md) | Future rules for lab documents. Not implemented. |

## Recommended reading order

1. This index.
2. [CLAUDE.md](../../CLAUDE.md) — rules that apply to every change.
3. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — what the software is.
4. [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md) — constraints that are easy to violate.
5. [ACTIVE_WORK.md](ACTIVE_WORK.md) — the open canonical-tree checkbox and launch reviews.
6. [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) — how to run it.
7. [DOCUMENT_PROCESSING_PLAN.md](DOCUMENT_PROCESSING_PLAN.md) — do not build upload from this plan alone.
8. [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) and [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md) — how work was coordinated and how to continue.
9. [AUTOMATIONS.md](AUTOMATIONS.md) — do not expect hidden schedulers.
10. [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) — prove the new environment before leaving Cursor.

## Agents that existed

Visible from this Cursor project on 2026-11-05. Igor’s wife has a second Cursor setup whose agents are not in this list.

| Agent | Role | Status seen |
| --- | --- | --- |
| [lifeZoi web app](https://cursor.com/agents/bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e) (`bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e`) | Coordinator. Tracker is the project store `notes.md`, not git. | Idle. Model recorded as Claude Opus. No branch on the agent record. |
| [Merge stacked app work](https://cursor.com/agents/bc-ba2e5916-e902-5eca-96cb-2eace1639ac8) (`bc-ba2e5916-e902-5eca-96cb-2eace1639ac8`) | Integrated the stacked app into `main` as pull request #8. | Idle. |
| [Blue button contrast](https://cursor.com/agents/bc-b910e6d5-7db7-5dc7-9f80-11f1a4f1a0b1) (`bc-b910e6d5-7db7-5dc7-9f80-11f1a4f1a0b1`) | Primary button contrast, pull request #9. | Idle. |
| [LifeZoi web app](https://cursor.com/agents/bc-efe0545d-9f0c-5bcb-9551-93e15378ce49) (`bc-efe0545d-9f0c-5bcb-9551-93e15378ce49`) | Built the alternative app, pull request #1. | Idle. That pull request is closed and was not merged. |
| [Verify merged lifeZoi pages](https://cursor.com/agents/bc-3073812f-5e00-5bf8-9506-46876dee1c1b) (`bc-3073812f-5e00-5bf8-9506-46876dee1c1b`) | Visible idle run. No branch on the record. Work product not read. | Idle. |
| [lifeZoi application](https://cursor.com/agents/bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6) (`bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6`) | No branch or pull request in accessible metadata. | Idle. |
| Local lifeZoi clone (`bc-52dc787f-c35a-51fa-8c57-6796ebe25a65`) | Cloned the repo to `~/github/life-zoi` on Igor’s MacBook Air through a Cursor self-hosted worker. | Not in the agent list this run could read. No self-hosted worker was connected at inspection. |
| Claude Code migration (`bc-d9827e20-0c85-51e9-8d6d-eaa0b1f3ed8c`) | Wrote and is refreshing this documentation. | This task. |

See [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md).

## Active priorities

1. Edit `main`. Pull request #1 is already closed and was not merged.
2. LZ-3 is answered: on 2026-11-05 the owner approved `main` as canonical. Do not revive pull request #1.
3. Before any public launch: privacy, security, scientific, and legal review. Keep `noindex`. Review 988 wording and the population life-table copy.
4. Do not turn on a paid AI provider or document upload without the controls in [DOCUMENT_PROCESSING_PLAN.md](DOCUMENT_PROCESSING_PLAN.md).

## Known missing information

- Cursor conversation transcripts and the coordinator’s full operating prompt were not in git and were not copied here.
- Which person or agent pushed `2ed8ef7` and `a6bfdcc` directly to `main` is not linked from the accessible agent metadata.
- The idle agent `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` has no recorded artifact.
- On 2026-11-05 GitHub reported `main` as `protected: false`. GitHub requires no review or check, so the coordinator runs the checks before merging.
- No Cursor automation id was available to look up. None were found in GitHub Actions or in this agent’s subscriptions.
- Supabase and AI secret values were not read. The README says a live Supabase project already has the account tables. This refresh did not query that database.
- Igor’s wife’s Cursor agents and tracker.
- The local-clone agent’s transcript. The tracker marks LZ-6 done.
- The live homepage was not browsed on 2026-11-05.

## Integrations that still need a person

Tab-only mode needs no secrets. Accounts need the public Supabase URL and anon key in the host, not in git. A paid model and document upload are not configured. Vercel already hosts the repo. Details: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

## Initialize the Claude coordinator

1. Open the GitHub repository in a Claude Code Project after this documentation is on `main`.
2. Confirm the session loaded root `CLAUDE.md`.
3. Read this index, then [ACTIVE_WORK.md](ACTIVE_WORK.md) and [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).
4. Use one coordinator session. Do not start parallel implementation workers on the same files. Do not reopen pull request #1 unless the owner asks.
5. Track new work in GitHub issues or pull requests so it survives outside Cursor’s project store.
6. Follow [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md) for model choice and delegation. The Claude Ultra subscription is not an unlimited pool.

## First verification task

From a clean checkout of `main`:

```bash
npm ci
npm test
npm run typecheck
npm run lint
```

Then start `npm run dev` and request `GET /api/status`. With Supabase variables unset, expect `persistence` `development` and `authentication` `not-configured`. With the public URL and anon key set, expect `persistence` `account` and `authentication` `supabase`. Confirm sample data is labeled. A population figure, if shown, must keep the “not an individual prediction” label. Confirm `GET /api/ai-assistant` reports mock mode.

## Before retiring Cursor

Complete [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md). Leave Cursor agents running until a person confirms Claude can edit, test, and open pull requests. Do not delete the Cursor project store until LZ-3 is answered and the safety rules are accepted in Claude. A local checkout belongs in Claude Desktop or local Claude Code, not in a Cursor self-hosted worker.
