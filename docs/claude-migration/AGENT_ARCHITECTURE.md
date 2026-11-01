# Cursor agent architecture

This is an inventory of agents that were visible on 2026-11-01. It is not a design for a larger fleet. Conversations were not exported. Dashboard events and pull-request metadata were read. Agents were not messaged or stopped.

## What existed

The Cursor Project is one coordinator plus a small number of cloud runs on https://github.com/ibkaplan/life-zoi. There is no separate orchestration service, queue, or scheduler in the repository.

The durable tracker in the Cursor project store (`notes.md`) has a single task: LZ-1, “Build the lifeZoi web application,” marked done, with a link to pull request #1. That file is not in GitHub. These migration documents are the copy that Claude can see.

## Coordinator

| | |
| --- | --- |
| Name | lifeZoi web app |
| Id | `bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e` |
| URL | https://cursor.com/agents/bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e |
| Status on 2026-11-01 | Idle. Not archived. |
| Source | Cursor desktop |
| Model recorded | Grok 4.7 |
| Branch / pull request on the agent record | None |

Responsibilities that can be reconstructed:

- Hold the product goal: a responsive lifeZoi app with assessment, WHAT IF?, and progress, under the safety rules in [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).
- Keep the short task list in the project store.
- Delegate implementation to a cloud agent rather than editing as the only worker.
- Accept a finished builder report when the worker opens a pull request.

Not recoverable from accessible files:

- The full coordinator prompt, planning rubric, and escalation policy.
- Whether the coordinator reviewed the code or only the report.
- Why a complete app was also committed directly to `main` (`2ed8ef7`, `a6bfdcc`) while another agent opened a conflicting pull request. Those `main` commits are authored as Cursor Agent and are not attached to this coordinator’s pull-request metadata.
- Any automatic next-task behavior. The tracker has no pending tasks.

Methods that match what actually happened:

- Decomposition was coarse: one implementation task for the whole first version, not a stack of feature branches.
- Delegation went to one builder (`bc-efe0545d-9f0c-5bcb-9551-93e15378ce49`).
- Parallelism was not controlled. A second idle agent and the direct `main` history show overlapping attempts. That overlap is the current merge conflict.
- Progress lived in the project store and in GitHub pull request #1, not in GitHub issues.
- Quality expectations stated in the product spec: lint, typecheck, tests, and honest limits. The builder reported `npm test` (15 tests), typecheck, lint, and a Next.js 16.4.3 build, plus a headless Chrome walkthrough. Those results were not re-run for this inventory. They describe the pull request branch, not `main`.
- Failure handling was not demonstrated. No stalled-agent recovery procedure was written down.
- Context management was the project store (`notes.md`, the product spec, the implementation report). None of that is loaded automatically by Claude Code.

No event-driven or scheduled coordinator duty was found. This migration run’s own subscription list was empty.

## Delegated agents

### LifeZoi web app — the pull request #1 builder

| | |
| --- | --- |
| Id | `bc-efe0545d-9f0c-5bcb-9551-93e15378ce49` |
| URL | https://cursor.com/agents/bc-efe0545d-9f0c-5bcb-9551-93e15378ce49 |
| Status on 2026-11-01 | Idle. Last recorded dashboard event: pull request created. |
| Model | Grok 4.7 |
| Branch | `cursor/lifezoi-app-ce49` |
| Deliverable | https://github.com/ibkaplan/life-zoi/pull/1 commit `0ab8b12` |
| Assignment | Build the first lifeZoi app. Received from the Cursor project, not from a GitHub issue. |
| Tools actually used | Repository edits, tests, a browser walkthrough reported by the agent, GitHub pull request. The report says deployment was not attempted. |
| Reporting | Implementation report stored in the Cursor project, not in the pull request branch. |
| Dependencies | None on other agents. It diverged from `main`. |
| Review | No GitHub reviews on the pull request at inspection time. Vercel and Vercel Preview Comments were success. Merge was already conflicting. |
| Completion | The agent’s turn finished. The product is not merged and is not the default branch. |

Constraints it was expected to follow are the product rules in [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md). Its tree does set `noindex`. `main` does not.

### lifeZoi application — no recorded output

| | |
| --- | --- |
| Id | `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` |
| URL | https://cursor.com/agents/bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6 |
| Status on 2026-11-01 | Idle. Created earlier than the coordinator record. |
| Model | Grok 4.7 |
| Branch, pull request, diff, events | None in the accessible metadata |

Do not invent a role for this run. Its conversation was not readable from the project store. If it produced the commits on `main`, that link was not present in the agent record.

### Claude Code migration — documentation only

| | |
| --- | --- |
| Id | `bc-d9827e20-0c85-51e9-8d6d-eaa0b1f3ed8c` |
| Purpose | Write this `docs/claude-migration/` set and root `CLAUDE.md`. |
| Constraint | No application changes. Do not merge pull request #1. Do not contact the other agents. |

## How coordination worked

| Behavior | What happened | Claude Code replacement |
| --- | --- | --- |
| Create tasks | One markdown checkbox in the Cursor store | GitHub issues, or a short list kept in git. Claude does not load the Cursor store. |
| Delegate | A cloud agent with its own branch | A Claude Code cloud thread or local session, one branch, a written definition of done. See [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md). |
| Parallel agents | Not safely isolated. Two implementations diverged. | Do not start a second writer until branches and files are disjoint. |
| Share knowledge | Project store plus GitHub | `CLAUDE.md` and this directory, committed on `main`. |
| Review | Unclear for `main`. Pull request #1 had no human review. | Coordinator reads the diff and the safety rules before merge. |
| Integrate | `main` moved by direct commits. Pull request #1 no longer applies cleanly. | Merge only fast-forward or conflict-free pull requests. Do not force pull request #1. |
| Failures | No written recovery | If a session stalls, leave its branch intact and continue from GitHub, not from memory. |
| Choose next work | Tracker shows nothing pending | A person, or the coordinator, picks from [ACTIVE_WORK.md](ACTIVE_WORK.md). Nothing starts itself. |

## Capability differences

Claude Code does not provide the Cursor cloud-agent roster, the shared project store, or Cursor Automations. Opening this repository in Claude loads `CLAUDE.md` and the files on the branch. It does not load `notes.md` from the Cursor store.

Claude Code can edit the repo, run the npm scripts, and open pull requests when GitHub credentials are connected. It does not automatically watch this repository’s pulls or deploys. Vercel’s Git integration is separate and already deploys the GitHub project; that is hosting, not an agent.

Do not assume a Claude Project can list or pause Cursor agents. Leave the existing Cursor runs idle unless a person stops them.

## Related documents

- [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md)
- [AUTOMATIONS.md](AUTOMATIONS.md)
- [ACTIVE_WORK.md](ACTIVE_WORK.md)
