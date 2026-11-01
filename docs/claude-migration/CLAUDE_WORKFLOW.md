# Claude Code coordinator and worker workflow

This replaces the Cursor project’s informal delegation with a workflow Claude Code can actually run. It does not recreate a standing fleet. The repository is one Next.js app with no backend service of its own.

Read [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) for what Cursor was doing, and [ACTIVE_WORK.md](ACTIVE_WORK.md) for the queue.

## Coordinator

One Claude Code Project session is the coordinator. It owns direction, not every line of code.

It should:

- Read `CLAUDE.md` and [INDEX.md](INDEX.md) at the start of a new Project, and again after long gaps.
- Keep the backlog in GitHub (issues or pull-request descriptions), not in a private chat.
- Plan from [ACTIVE_WORK.md](ACTIVE_WORK.md) instead of inventing features.
- Split work so each task names the branch, the files it may change, the commands that must pass, and what “done” means.
- Track dependencies. The canonical-tree decision blocks a Supabase adapter and blocks merging pull request #1.
- Delegate only bounded tasks. Review the diff against [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md) before merge.
- Note new issues that tests or review uncover.
- Update durable docs when a decision changes (README or this directory).
- Tell the owner about blockers that need a person: the fate of pull request #1, credentials, launch reviews, production deploys.

The coordinator does not start work by itself. Nothing in this repo emits a “next task” event. See [AUTOMATIONS.md](AUTOMATIONS.md).

## Workers

Use extra sessions only when they earn their cost. Default is the coordinator doing the change, or one worker plus the coordinator reviewing.

| Worker | When to use | Do not use for |
| --- | --- | --- |
| App implementation | A defined change on `main`’s Next.js tree: UI, validation, copy, tests | Rewriting the other pull request in parallel |
| Safety read | A pass over health copy, sources, and claims before launch or after copy edits | Declaring legal or clinical approval |
| Documentation | README and `docs/claude-migration/` when decisions change | Drive-by refactors |

Database, infrastructure, performance, and security-specialist agents are not standing roles. There is no database connection, no custom infrastructure, and no performance program. If a Supabase adapter is approved later, the same app worker can add it with the coordinator reviewing authorization. A separate security pass is a checklist on that pull request, not a new permanent agent.

Worker prompt contents:

- Objective and non-goals.
- Branch name, cut from current `main`.
- Files in scope.
- Safety rules that apply (usually “follow `CLAUDE.md`”).
- Commands to run.
- Report: what changed, what was run, what was not run.

Assignments are chat prompts. Claude Code will not receive the Cursor delegation automatically.

Expected deliverable: a branch and a pull request, or a clear statement that the task could not be finished. No direct pushes to `main` unless the owner has said that is the project’s integration style. Historical commits did land on `main` directly. New Claude work should use pull requests so two writers cannot repeat that split.

## Execution environments

| Work | Where |
| --- | --- |
| Edits, unit tests, typecheck, lint, pull requests | Claude Code cloud thread with this repo |
| Browser checks of layout at phone and desktop widths, local env files, Vercel CLI against a personal login | Claude Code local session (Desktop or CLI) |
| Collaboration | GitHub branches and pull requests |

Cloud limits to plan for:

- A cloud VM may not match a laptop’s browser fonts or a signed-in Vercel account.
- Outbound network must allow npm and Google fonts during build (`next/font/google`).
- The cloud session does not see the Cursor project store.
- Do not paste secrets into the prompt to “help the cloud agent.” Use the host’s env settings if a future task truly needs them. This app’s tests do not.

Local limits:

- Node 22 must be installed.
- The agent can only see files on that machine.

## Concurrency

One writer per file set. Practical rule for this repo: one implementation branch at a time until pull request #1 is closed or deliberately rebuilt. The app shares `src/lib/types.ts`, the shell, and the global CSS. Parallel feature branches will conflict.

Isolated git worktrees are appropriate when a documentation change must not touch a dirty app checkout. They are not a reason to run two feature branches.

## Review before merge

For application changes, require:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build` if routes, `next.config.ts`, or rendering changed
- A read of any new health sentence for invented numbers, diagnoses, or lifespan claims
- Sample data still labeled
- `/api/status` still honest if persistence code was touched

For documentation-only changes, require a diff limited to the intended docs, a link check, and a secret scan. Do not demand a product release.

GitHub branch protection could not be read. If GitHub requires a review, wait for it. Do not bypass it.

## Model use on a Claude Ultra subscription

The subscription is metered. Treat parallel agents as a cost, not a default.

- Routine edits, tests, and doc fixes: a faster, lower-cost model that can follow `CLAUDE.md`.
- Canonical-tree conflict resolution, authorization design, and health-copy changes: a more capable model.
- Do not fan out “explore the repo” workers. The overview in this folder is the map. Open specific files.
- Do not re-read the whole repository at the start of every task.
- Give each delegated task a finish line so it does not wander.
- If a worker stalls, stop it and keep the branch. Do not start a duplicate.
- Check the subscription’s usage view when a session was long or when several branches ran. Cut concurrent sessions first.

Specific Claude model names change. Pick by capability and cost inside the product UI. Do not hard-code a model id in the repository.

## What Claude cannot take over unchanged

| Cursor behavior | Gap | Practical replacement |
| --- | --- | --- |
| Project store `notes.md` | Not in the repo and not visible to Claude | This directory plus GitHub issues |
| Cloud agent roster and “do not interrupt” control | No shared control plane with Cursor | Leave Cursor agents idle; do not script them |
| Reported browser walkthrough on a Cursor VM | Depends on whatever desktop Claude has | Local session or a cloud environment that actually has a browser |
| Vercel status inside the Cursor UI | Not part of Claude | GitHub commit statuses |
| Automatic delegation from a project coordinator | Claude Projects do not spawn this Cursor fleet | A person or one coordinator session writes the next prompt |

## First sessions

1. Coordinator reads [INDEX.md](INDEX.md) and runs the verification commands in it.
2. Coordinator reports test results and restates the pull request #1 conflict.
3. Stop and ask the owner which tree wins if the next task would edit product code.
4. Only then assign an implementation worker.

Do not open a Supabase project, an AI account, or a production deploy in the first session.
