# Migration verification checklist

The new Claude coordinator runs this after `CLAUDE.md` and `docs/claude-migration/` are on `main`. Boxes are unchecked on purpose. The “Already observed” notes are what the documentation author could see on 2026-11-01. They are not a substitute for the coordinator’s own run.

## Repository

Claude coordinator run: 2026-11-05 at `a857fce`. Ticked boxes were checked in that run. Open boxes were not.

- [x] Claude Code can clone https://github.com/ibkaplan/life-zoi and see default branch `main`.
- [x] Root `CLAUDE.md` is present and the session is using it.
- [x] `docs/claude-migration/INDEX.md` links resolve.
- [x] Pull request #1 stays closed and unmerged unless the owner explicitly reopens that decision.

Already observed: the repo is public, default branch `main`, pull request #1 open and conflicting, no other open pulls, no issues.

## Coordinator and workers

- [x] One coordinator session can restate the product rules without inventing a lifespan feature or a connected database.
- [ ] A worker prompt for a trivial docs or test-only branch does not edit the same files as another open branch. 2026-11-05: not exercised. The coordinator did the verification itself, with no second writer.
- [x] The coordinator records the result on the pull request. 2026-11-05: pull request #12.

Already observed: Cursor had one coordinator, one builder with a pull request, and one idle agent with no artifact. Claude does not import them.

## Backlog

- [ ] [ACTIVE_WORK.md](ACTIVE_WORK.md) matches GitHub: `main` tip, pull request #1 state, and absence of issues.
- [x] New work is filed in GitHub, not only in Claude chat.
- [x] LZ-1 is not “started” a third time.

## Environment

- [x] Node.js 22 and npm are available.
- [x] `npm ci` succeeds.
- [x] `npm test` passes. Record the count. 2026-11-05: 12 files, 79 tests.
- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] The app serves locally. 2026-11-05: checked with `npm run build` and `next start`.
- [x] `GET /api/status` reports `development` / `not-configured` without public Supabase settings, and `account` / `supabase` when those settings are valid. 2026-11-05: the unset case passed locally, and production returned `account` / `supabase`.
- [x] `GET /api/ai-assistant` reports mock mode.
- [x] Sample data is labeled. Any SSA population figure keeps the “not an individual prediction” label.
- [x] Phone-width and desktop-width layouts of dashboard, assessment, WHAT IF?, and progress do not overflow horizontally.

Already observed: commands are documented. Tests were not executed during the documentation edit. Homepage HEAD returned 200. HTML was not reviewed.

## Integrations

- [x] GitHub pull requests can be opened by the Claude credential. 2026-11-05: #12.
- [x] The unit-test commands pass without a Supabase service-role key. Account checks, if run, use only the public anon key.
- [x] `.env.example` still has blank or commented values. No secret file is committed.
- [x] Vercel is unchanged unless a person asked for a deploy.
- [x] If a deploy is later approved, the live site still says notes stay in the browser. 2026-11-05: `/privacy` on production says Change Lab, reflections, the assistant thread, and wellness notes stay in the tab.

## Concurrency, git, and review

- [x] A test branch can be created and pushed without touching `cursor/lifezoi-app-ce49`.
- [x] A documentation or test pull request can be opened against `main`.
- [x] Required GitHub checks, if any appear, are allowed to finish. 2026-11-05: only the Vercel deployment status runs, and it finished.
- [ ] Merge is refused when checks fail. Protections are not bypassed. 2026-11-05: GitHub enforces nothing on `main`, so this is the coordinator’s rule, not a setting.

Already observed: branch protection endpoint returned 403. Rulesets list was empty. Auto-merge was disabled on the repository. On 2026-11-05 the branch list reported `main` as `protected: false`.

## Security

- [x] Diffs contain no API keys, tokens, private keys, or passwords.
- [x] Service-role and AI keys are not introduced.
- [x] The app does not claim HIPAA or GDPR compliance. 2026-11-05: `/privacy` on production says it does not claim them.
- [x] `noindex` stays on `main` in both the layout metadata and `X-Robots-Tag`.

## Deployment permissions

- [x] The coordinator knows the deploy rule. 2026-11-05: the owner gave standing approval to merge to `main` and let Vercel deploy production. Production data, billing, credentials, and environment variables still need the owner’s approval.
- [x] Claude is not given a Vercel token in the chat transcript.

## Automations

- [x] The coordinator does not expect a scheduled agent. [AUTOMATIONS.md](AUTOMATIONS.md) still matches the repo (no GitHub Actions).
- [x] Vercel Git integration is still the deploy path and was not turned off. 2026-11-05: production deployment of `e559e91` (#12) was READY.

## Memory

- [x] A new decision can be written into git and found in a later session that only has the repository.
- [x] The Cursor project store is not required to explain the safety rules.

## Usage

- [x] Only the sessions this checklist needs are running.
- [ ] A long or parallel run is reflected in the Claude usage view before more workers start. Owner’s view.

## Retire the Cursor project only when all of these are true

- [x] This checklist’s repository, test, and instruction boxes are done, with commands actually run.
- [x] The owner has decided what happens to pull request #1.
- [ ] Any unique Cursor chat notes the owner still cares about are saved. Agent `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` had no exported transcript. Only the owner can check the Cursor chats.
- [x] A Claude session has opened a pull request successfully. #12, merged.
- [x] The owner accepts that Vercel deploys remain, and that no Cursor automation was found to migrate. 2026-11-05: the owner approved the readiness report that said so.
- [x] Cursor agents can stay archived or idle. They do not need to be deleted for Claude to work.

Status on 2026-11-05: Claude’s side is done. What remains is the owner’s: save any Cursor chat notes worth keeping, then archive the Cursor agents and project. Until then, keep the Cursor project. Do not delete its store as part of reading these files.
