# Active work

Snapshot date: 2026-11-05. Source of truth for code is GitHub `main`. Verified by Claude at `a857fce` (docs-only after `1d6a333`). The Cursor tracker was read and not edited.

## Snapshot

| Item | State on 2026-11-05 |
| --- | --- |
| Default branch | `main` at `a857fce47cc8966dbac8f8624b43b28ba44a62d3` (#11, docs refresh). GitHub reports it unprotected. |
| Closed, not merged | Pull request #1 (`cursor/lifezoi-app-ce49` at `0ab8b12`). Also #4, #5, #6, and #7, whose commits are already in `main` via #8. |
| Merged since the first docs | #3 `noindex`, #8 stack (`cd15d65`), #9 contrast (`0c1bef4`), #10 quieter homepage (`6063296`), account commits `39be250` and `1d6a333`, #11 docs refresh (`a857fce`) |
| Open pull requests | None in `gh pr list` for open state at inspection. Re-check before acting. |
| GitHub Actions | None (`total_count` 0) |
| Tracker | LZ-3 answered by the owner on 2026-11-05: `main` is canonical. LZ-1, LZ-2, LZ-4, LZ-5, LZ-6, and LZ-7 are done. New work is tracked in GitHub. |
| Live HTTP | 2026-11-05: production deployment `dpl_7BaFBHgQozU5iQaRkicHkeSUo6Z8` (`e559e91`) is READY. `/api/status` returns `account` / `supabase`, `/api/ai-assistant` returns `mock`, and `X-Robots-Tag` plus the robots meta tag are served. |

Agents were not stopped. Chat history outside the tracker and git was not copied. Igor’s wife’s Cursor setup is a second contributor and is not in this project’s agent list.

## Tasks

### LZ-1 — First application

1. Name: LZ-1 Build the lifeZoi web application.
2. Objective: ship the first responsive app described in the product specification.
3. Assigned agent: `bc-efe0545d-9f0c-5bcb-9551-93e15378ce49` for the pull request. The commits on `main` are not attributed to that id.
4. Status: done in the tracker. The pull request was later closed without merge. `main` continued and now includes accounts and the stacked tools.
5. Completed: the closed branch and `main` both started as assessment, WHAT IF?, and progress apps. They are not the same tree.
6. Files and branches: current app on `main`; alternative app still on `cursor/lifezoi-app-ce49`.
7. Outstanding: nothing. LZ-3 was answered on 2026-11-05 in favor of `main`.
8. Blockers: none for day-to-day edits on `main`.
9. Next action: work from `main`. Do not merge or reopen pull request #1 unless the owner asks.
10. References: https://github.com/ibkaplan/life-zoi/pull/1, agent https://cursor.com/agents/bc-efe0545d-9f0c-5bcb-9551-93e15378ce49, `README.md`.

### Decide the canonical tree

1. Name: Canonical tree decision.
2. Objective: stop maintaining two apps.
3. Assigned agent: none. Tracker id LZ-3.
4. Status: decided 2026-11-05. The owner approved `main` as canonical in the Claude project. Before that it was open as a decision. GitHub has already closed pull request #1 without merging it, and `main` has moved on (`noindex`, accounts, Change Lab, and the other tools).
5. Completed: `main` is the integrated product. The other branch is historical.
6. Files: the closed branch still differs, including `localStorage` and its own validation routes.
7. Outstanding: none. The Cursor tracker box itself was not edited.
8. Blockers: none. Merging the branch would still conflict and discard later `main` work.
9. Next action: keep `main`. Do not port the old branch unless the owner names a behavior that is still missing.
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
7. Outstanding: production `/api/status` reports `account` / `supabase` (2026-11-05), so the public settings are set. Not yet checked: a real sign-in, and whether the live schema matches `supabase/schema.sql`. Both touch production data and need the owner. Do not paste secrets into git.
8. Blockers: none for tab-only development.
9. Next action: leave credentials in the host. Do not add a service-role key to the client.
10. References: `README.md` section “Supabase”.

### Verify `main`

1. Name: Re-run checks on the default branch.
2. Objective: know whether the tree Claude will edit still passes its own scripts.
3. Assigned agent: Claude coordinator, 2026-11-05.
4. Status: done at `a857fce` with Node v22.23.4 and npm 10.9.9.
5. Completed: `npm ci`, `npm test` (12 files, 79 tests passed), `npm run typecheck`, `npm run lint`, and `npm run build` all exit 0. With Supabase variables unset, `GET /api/status` returned `development` / `not-configured` and `GET /api/ai-assistant` returned `mode: mock`. `X-Robots-Tag: noindex, nofollow` and the robots meta tag are both served. A headless Chromium pass at 390 px and 1280 px over home, dashboard, profile, assessment, WHAT IF?, progress, outlook, settings, privacy, Change Lab, assistant, and lab results showed HTTP 200, no horizontal overflow, and no console errors. Outlook shows the “not an individual prediction” label. Turning on the sample in Settings labels dashboard, progress, WHAT IF?, and outlook as sample data and sets a separate `lifezoi.sample.v1` flag without writing into the person’s session.
6. Files: `package.json`, `src/lib/**/*.test.ts`.
7. Outstanding: the signed-in account flow was not checked. It creates production rows and needs the owner. The live site was checked separately (see Snapshot).
8. Blockers: none.
9. Next action: none for the default branch. Re-run before each merge.
10. References: `README.md` scripts, [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md).

### Indexing

1. Name: Keep `noindex` until the privacy notice matches the system.
2. Objective: avoid treating the public URL as a launched product.
3. Assigned agent: landed with pull request #3 and the #8 integration.
4. Status: present on `main` in layout metadata and `X-Robots-Tag`.
5. Completed: both mechanisms. Pull request #1’s copy is no longer the only one.
6. Files: `src/app/layout.tsx`, `next.config.ts`.
7. Outstanding: none. 2026-11-05: production at `e559e91` sends both. Do not remove them.
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

### Daily companion

1. Name: Personalized daily wellness companion.
2. Objective: the owner's final master specification (brand refresh, assessment health step, food protections, Wellness Library, music, books, brain games, plan, My Day, weekly check-in, reports).
3. Branch: `claude/project-thread-4qoczn`.
4. Status: implemented in code with unit tests, including the 12 acceptance scenarios (`src/lib/acceptance.test.ts`).
5. Outstanding: `companion_state` is applied in production (2026-11-13), so signed-in companion data can save to the account; not yet checked in a browser. Videos other than the NIA films, the NHS pages, and pending sources were not checked from the build environment; run `npm run check:library` from a machine with internet access.
6. Next action: approve or reject pending sources in `src/lib/wellness-library/catalog.ts` through a reviewed pull request.

### Movement breaks, hydration, and the calf muscle pump

1. Name: Water + movement education, the 30-minute movement break, and daily tracking.
2. Objective: the owner's hydration, lymphatic, calf-pump, and "why move every 30 minutes" requests, folded into Movement (`/academy/move/breaks`), My Day, My Plan, Food & Wellness, and the assessment.
3. Branch: `claude/project-thread-u6xrqp`.
4. Status: implemented with unit tests (`src/lib/movement-breaks/movement-breaks.test.ts`). The assessment gained an optional "Work and daily activity" question (`dailySetting`). Day logs gained `movementBreaks`; older saved data reads as 0. The reminder is per device (localStorage) and works only while a LifeZoi tab is open.
5. Outstanding: only two of the listed sources (Pinto et al. 2023 in PMC, and the ADA 2016 position statement in PMC) could be read from the build environment. StatPearls lymphatic physiology, PubMed 21486777, the calf-pump article in Advances in Physiology Education, PMC6985064, and PubMed 39630056 are marked in `src/lib/movement-breaks/content.ts` as still to be read by a person. All copy is English in one object (`MB`) ready for translation keys. The breathing section links to the existing breathing sounds until the Breathe for Life program lands.
6. Next action: a person reads the five unread sources and the medical copy, then the owner reviews the pull request.

### My Music (branch `claude/project-thread-9rthjc`, PR open for review)

- Done: "Relaxing music" renamed to My Music in all four languages; six categories; one site-wide player (`src/components/background-music/`) with previous/next, progress bar, volume, Music ON/OFF; music plays softly under videos, guided breathing, and speech (`audio-focus.ts` kinds `video`, `voice`, `sound`); catalog in `src/lib/music-library/catalog.ts`.
- Not done: no Pixabay track is included. pixabay.com was blocked from the cloud environment, so no licence was read. Add tracks with `public/audio/library/CREDITS.md`.
- New features that speak or play sound (for example a focus timer) should call `useAudioFocus(active, id, "voice")` so music lowers under them.

## What is not in progress

No GitHub issues were confirmed in this refresh. `main` is one product: accounts when configured, tab storage otherwise, mock assistant, and educational tools. Pull request #1 is closed historical work. Document upload and a paid model are not started.

## Priority order

1. `main` is verified and canonical. Keep pull request #1 closed.
2. Re-run the required scripts before every merge, because GitHub enforces no checks.
3. Leave paid AI, document upload, and launch claims until a person asks.
4. Keep `noindex`.

### Women's Care in Food & Wellness

1. Name: Women's Care inside the daily meal plan.
2. Objective: adapt the existing Today's meals plan for menstrual cycle phase, symptoms, perimenopause, and menopause, without a separate plan.
3. Status: implemented on branch `claude/project-thread-5j56b9`, pull request open and unmerged (2026-11-10).
4. Rules: used only after the person ticks both "I identify as a woman" and "cycle or menopause nutrition is relevant". Never inferred. Answers live in the companion state (browser, or the account `companion_state` row) and are not sent to an AI or outside service. Extra recipe ideas go through the same `checkRecipe` allergy, diet, religious, and exclusion checks; example foods use `ingredientAllowed`. Qualitative wording only; clinician pointer for heavy bleeding, severe symptoms, or iron worries.
5. Files: `src/lib/companion/womens-care.ts`, `src/components/companion/womens-care-view.tsx`, tests in `src/lib/companion/womens-care.test.ts`.
6. Outstanding: translation keys once the four-language work lands (all copy is in `womens-care.ts` and the view); medical copy review before launch.

### Natural read-aloud voice and calm breathing ball (2026-11-10)

1. Name: Shared read-aloud voice; slower breathing guide with an animated ball.
2. Objective: one Listen control across lifeZoi with the most natural free voice on the device, in the site language, and a breathing exercise that is no longer rushed.
3. Assigned agent: Claude project thread, branch `claude/project-thread-7ws1e7`.
4. Status: pull request open for the owner's review. Not merged, not deployed.
5. Completed:
   - `src/lib/voice/` is the only speech player (Web Speech API, no paid or remote service called by lifeZoi). It ranks device voices per language (natural, neural, premium, online first; novelty and robotic voices last or hidden), reads sentence by sentence with pauses, keeps one voice at a time, and never reads with a voice for another language. Pause stops the sentence and Resume reads it again, the same on every device.
   - `src/components/voice/` holds `ReadAloud` (Listen, Pause, Resume, Stop, Replay, Previous and Next step, speed, voice, wait between steps), `ListenToSteps`, a "Listen to this page" bar in the app shell, voice settings, and a guard that stops speech on navigation.
   - Pages that can show the person's own data read with on-device voices only (`src/components/voice/page-listen.tsx`). Online voices send the read text to the browser's provider, which the settings copy says.
   - Background music gets quieter (20 percent) while the voice speaks instead of pausing; on iPhone and iPad, where pages cannot change volume, it pauses as before.
   - Breathing: default 4 seconds in and 6 out, whole breaths per step, an eased ball drawn every frame from the session clock, a visible count, spoken "Breathe in" and counting on the same clock, Restart, a 3-minute length, and "I feel dizzy or unwell. Stop now".
6. Files: `src/lib/voice/*`, `src/components/voice/*`, `src/components/breathe/player.tsx`, `src/lib/breathe/program.ts`, `src/lib/breathe/state.ts`, `src/components/background-music/provider.tsx`, `src/lib/background-music/audio-focus.ts`, books, assistant, recipe, exercise, movement-break and settings views, `src/app/layout.tsx`, `src/app/globals.css`, and the uk, ru, el `core.json` catalogs.
7. Outstanding: nobody has listened to the voices yet. Checks used a stand-in speech engine in headless Chromium, which confirmed timing, voice choice, language, and controls but not sound quality. Breathing-page text is still English only. Translations of the new controls need a native-speaker read.
8. Next action: owner listens on a phone and a computer, then approves or asks for changes.

### Explore Breathing Practices and the breathing balloon (2026-11-11)

1. Name: Pranayama & breathing video library on `/breathe/practice`; balloon as an alternative to the breathing circle.
2. Objective: ten guided, sitting-friendly breathing videos playing inside lifeZoi, with hand positions for alternate nostril breathing and clear safety text, and a choice of circle or balloon in the guided session.
3. Assigned agent: Claude project thread, branch `claude/project-thread-x48ucp`.
4. Status: pull request open for the owner's review. Not merged, not deployed.
5. Completed:
   - `src/lib/breathe/practice-videos.ts` lists the ten videos (Diaphragmatic, Full Yogic, Nadi Shodhana, Anulom Vilom, Bhramari, Ujjayi, Sitali, Sitkari, Sama Vritti, Extended Exhale). YouTube's oEmbed returned 200 for each on 2026-11-11 through a separate web fetch. Titles and channels are copied from it. A length is shown only when the watch page or the title states it.
   - `src/components/breathe/practice-library.tsx` shows the cards and plays a video in a dialog through `youtube-nocookie.com`. It pauses background music like the other video players. The section is English on purpose and tells people using another language so.
   - The player has a Circle or Balloon choice, saved as `guide` in the breathing settings (default circle). The balloon scales from the same clock as the ball.
6. Files: the two files above, their test, `src/components/breathe/player.tsx`, `src/components/breathe/views.tsx`, `src/lib/breathe/state.ts`, `src/app/globals.css`, and the uk, ru, el `companion.json` catalogs (three new strings).
7. Outstanding: the build machine cannot reach youtube.com or i.ytimg.com, so no video has been played inside lifeZoi or watched end to end. Nobody has checked each video for breath holds, sound, or language. Seven of ten lengths are unknown. Most chosen videos are shorter tutorials, not 10 to 15 minute sessions.
8. Next action: owner (or a session whose network allows youtube.com, www.youtube-nocookie.com, i.ytimg.com) opens each card on a phone and a computer, watches the videos, and approves or asks for swaps.

### Connected journey, stage 1: navigation and homepage (2026-11-12)

1. Name: Nine-section navigation, phone menu, My Health hub, shorter homepage hero.
2. Objective: the owner's "Navigation and header correction" and stage 1 of [JOURNEY_PLAN.md](JOURNEY_PLAN.md).
3. Branch: `claude/project-thread-5yqy0i`. Pull request open for review. Not merged, not deployed.
4. Completed: `src/lib/navigation.ts` now holds `NAV_SECTIONS` (Home, Dashboard, My Health, Food & Wellness, Movement, Wellness Library, Brain & Mind, Progress, My Profile) with every former menu page filed under one section; `PUBLIC_LINKS` and `MEMBER_LINKS` were replaced. The header bar wraps instead of scrolling (the old centered scroller clipped Home and Movement). Under 1000 px: Home, Dashboard, Movement and a Menu button. New `/my-health` page. Homepage: shorter hero, "Open my Dashboard" button, Life Outlook moved below the main content. Footer still lists every page.
5. Outstanding: uk, ru, el labels for the new sections need a native-speaker read. Signed-in header not checked in a browser (no Supabase in the build environment); the account buttons are now on their own row so they cannot squeeze the menu.

### Phone layout polish (2026-11-12)

1. Name: Phone header in one row, bottom tab bar, full-screen menu.
2. Branch: `claude/project-thread-5yqy0i` (restarted from `main` after #49 merged). Pull request open for review.
3. Completed: under 1000 px the header is the logo, music and language in one row (the language button shows the globe and code under 560 px; its accessible name still says Language). Home, Dashboard, Movement and Menu sit in a tab bar fixed to the bottom of the screen, centered on tablets. Menu opens a full-height panel with every section, plus Account and Sign out when signed in (those leave the header on phones). The status note and the Listen control take less room on phones. Desktop is unchanged.
4. Outstanding: signed-in phone header and menu not checked in a browser (no Supabase here).

### Members-only access and invitation-only registration (2026-11-12)

1. Name: Protect every page and API for signed-in members; register only by invitation.
2. Branch: `claude/project-thread-if53gm`. Pull request open for review. Not merged, not deployed.
3. Completed: cookie sessions (`@supabase/ssr`, an earlier browser sign-in is moved over once), `src/proxy.ts` gate, `MemberGate` in the members' layout, `requireMember`/`requireAdmin` on every API, public landing page, invitation flow (`/admin/invitations`, `POST /api/register`, `/accept-invite`), migration `supabase/migrations/20261112000000_invite_registration.sql` with SQL tests on a throwaway Postgres.
4. Setup done (2026-11-13): migration applied in production; `SUPABASE_SERVICE_ROLE_KEY` set in Vercel Production since 2026-11-04 (sensitive, server only); owner reports `/accept-invite` redirect URLs and a custom SMTP sender (Resend) set in Supabase. Outstanding: a real invite, acceptance, and sign-in checked in a browser; confirm public sign-up is off.
5. Not done on purpose: per-account browser copies are not cleared on sign-out, because daily activities lived only in the browser until `companion_state` was applied. Now that it is applied (2026-11-13), revisit this.

### Automatic database migrations (2026-11-13)

1. Name: Apply Supabase migrations automatically after merge.
2. Branch: `claude/project-thread-0ile9g`.
3. Completed: migrations renamed to Supabase CLI names (`20261109000000_companion_state.sql`, `20261112000000_invite_registration.sql`); `scripts/check-migrations.py` (destructive-SQL guard); `scripts/db-migrate.sh` (verify, `supabase db push`, verify); `.github/workflows/db-migrate.yml` (pull requests: throwaway Postgres; `main`: production). Tested locally against Postgres 16 with Supabase CLI 3.1.0: before 10 checks false, after every check ok, second run a no-op.
4. Production before (2026-11-13, read-only verify.sql through the LifeZoi Supabase connector): 47 ok, 9 false, all from the two migrations. The connector's `apply_migration` asks a confirmation question that the Claude app's project view does not show, so it timed out; nothing was applied through the connector.
5. Done: the owner added `SUPABASE_DB_URL`; pull request #56 merged as `edbf7dc` and its first run (Actions run 43520905530) applied both migrations. Supabase lists versions 20261109000000 and 20261112000000; verify.sql afterwards: 56 ok, 0 failing.

