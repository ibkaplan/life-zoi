# Migration verification checklist

The new Claude coordinator runs this after `CLAUDE.md` and `docs/claude-migration/` are on `main`. Boxes are unchecked on purpose. The “Already observed” notes are what the documentation author could see on 2026-11-01. They are not a substitute for the coordinator’s own run.

## Repository

- [ ] Claude Code can clone https://github.com/ibkaplan/life-zoi and see default branch `main`.
- [ ] Root `CLAUDE.md` is present and the session is using it.
- [ ] `docs/claude-migration/INDEX.md` links resolve.
- [ ] Pull request #1 is still treated as conflicting work, not merged by accident.

Already observed: the repo is public, default branch `main`, pull request #1 open and conflicting, no other open pulls, no issues.

## Coordinator and workers

- [ ] One coordinator session can restate the product rules without inventing a lifespan feature or a connected database.
- [ ] A worker prompt for a trivial docs or test-only branch does not edit the same files as another open branch.
- [ ] The coordinator records the result on the pull request.

Already observed: Cursor had one coordinator, one builder with a pull request, and one idle agent with no artifact. Claude does not import them.

## Backlog

- [ ] [ACTIVE_WORK.md](ACTIVE_WORK.md) matches GitHub: `main` tip, pull request #1 state, and absence of issues.
- [ ] New work is filed in GitHub, not only in Claude chat.
- [ ] LZ-1 is not “started” a third time.

## Environment

- [ ] Node.js 22 and npm are available.
- [ ] `npm ci` succeeds.
- [ ] `npm test` passes. Record the count. Do not copy the “16 `it()` cases” figure if the run disagrees.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run dev` serves http://localhost:3000.
- [ ] `GET /api/status` reports `lifeZoi`, `development`, and `not-configured`.
- [ ] Sample data is labeled. No health score and no lifespan appear in the empty and sample paths.
- [ ] Phone-width and desktop-width layouts of dashboard, assessment, WHAT IF?, and progress do not overflow horizontally.

Already observed: commands are documented. Tests were not executed during the documentation edit. Homepage HEAD returned 200. HTML was not reviewed.

## Integrations

- [ ] GitHub pull requests can be opened by the Claude credential.
- [ ] No Supabase key is required for the checks above.
- [ ] `.env.example` still has blank or commented values. No secret file is committed.
- [ ] Vercel is unchanged unless a person asked for a deploy.
- [ ] If a deploy is later approved, the live site still says notes stay in the browser.

## Concurrency, git, and review

- [ ] A test branch can be created and pushed without touching `cursor/lifezoi-app-ce49`.
- [ ] A documentation or test pull request can be opened against `main`.
- [ ] Required GitHub checks, if any appear, are allowed to finish.
- [ ] Merge is refused when checks fail. Protections are not bypassed.

Already observed: branch protection endpoint returned 403. Rulesets list was empty. Auto-merge was disabled on the repository. Re-check at merge time.

## Security

- [ ] Diffs contain no API keys, tokens, private keys, or passwords.
- [ ] Service-role and AI keys are not introduced.
- [ ] The app does not claim HIPAA or GDPR compliance.
- [ ] `noindex` policy is understood: missing on `main`, present on pull request #1, still required before a reviewed public launch.

## Deployment permissions

- [ ] The coordinator knows production deploys need an explicit human approval.
- [ ] Claude is not given a Vercel token in the chat transcript.

## Automations

- [ ] The coordinator does not expect a scheduled agent. [AUTOMATIONS.md](AUTOMATIONS.md) still matches the repo (no GitHub Actions).
- [ ] Vercel Git integration is still the deploy path and was not turned off.

## Memory

- [ ] A new decision can be written into git and found in a later session that only has the repository.
- [ ] The Cursor project store is not required to explain the safety rules.

## Usage

- [ ] Only the sessions this checklist needs are running.
- [ ] A long or parallel run is reflected in the Claude usage view before more workers start.

## Retire the Cursor project only when all of these are true

- [ ] This checklist’s repository, test, and instruction boxes are done, with commands actually run.
- [ ] The owner has decided what happens to pull request #1.
- [ ] Any unique Cursor chat notes the owner still cares about are saved. Agent `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` had no exported transcript.
- [ ] A Claude session has opened a pull request successfully.
- [ ] The owner accepts that Vercel deploys remain, and that no Cursor automation was found to migrate.
- [ ] Cursor agents can stay archived or idle. They do not need to be deleted for Claude to work.

Until those are true, keep the Cursor project. Do not delete its store as part of reading these files.
