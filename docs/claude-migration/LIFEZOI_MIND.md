# LifeZoi Mind

Emotional wellness section at `/mind` (members only, inside `src/app/(members)/mind/`). Educational support, not therapy. Added 2026-11-22.

## Pages

| Route | What it does |
| --- | --- |
| `/mind` | Talk by voice or text with the written companion, suggested topics, links to the other areas |
| `/mind/understand` | Questionnaire list: validated GAD-7 and PHQ-9, eight educational self-reflections, and why PSS and ISI are missing |
| `/mind/understand/[id]` | One question at a time, official scoring, result explanation, "Talk about this result" hand-off |
| `/mind/exercises`, `/mind/exercises/[id]` | 18 exercises, chosen length, steps read aloud with quiet pauses, optional writing prompts that are never saved |
| `/mind/plan` | Optional 7-day plan from chosen goals; change, skip, repeat, or mark days done |
| `/mind/library`, `/mind/library/[slug]` | Psychology Encyclopedia: 17 articles with evidence labels and references |
| `/mind/progress` | Consent switch, saved totals over time, exercises, plan, delete everything |
| `/mind/privacy` | What Mind is, where data goes, provider research |

Code: `src/lib/mind/` (logic, tested in `mind.test.ts`) and `src/components/mind/` (views, `mind.css`).

## Conversation

`src/lib/mind/conversation.ts` is rule-based and runs in the browser. No text is sent anywhere. Order of checks on each message:

1. Safety (`safety.ts`, reusing `detectCrisis` from Emotional Wellness). A crisis stops coaching and shows 988 call/text, 988lifeline.org, and 911. Severe distress adds a 988 note and keeps listening.
2. Boundaries: medication changes, diagnosis requests, "are you a therapist?".
3. A questionnaire hand-off: explains the band without diagnosing, then asks the brief's follow-up questions one at a time.
4. Greetings, closings, exercise requests, and questions answered from the encyclopedia.
5. Resentment and "am I right?": validates feelings without taking sides.
6. Topic flow (`topics.ts`, 17 topics, including a loved one's illness or caregiving, the person's own health worries, money, and job loss): acknowledge and ask what bothered them most, respond to that part, offer a balanced perspective, then next steps with exercises (and why) and articles. Replies use the person the visitor named ("your mom") through `{person}`. When the first message already answers the opening question, Mind goes straight to that part. A new concern raised mid-topic (for example money while talking about sleep) is acknowledged, remembered, and offered again once the current topic is done. Later turns use non-repeating open questions and point toward real-world support. Lasting problems with the person's own mood or functioning add a suggestion to see a professional. `conversation-dialogues.test.ts` holds 32 realistic conversations that must stay on topic.

It cannot understand arbitrary language. When nothing matches, it says thank you and asks for more, rather than pretending.

The conversation is kept in `sessionStorage` (`lifezoi.mind.conversation.v1`), so opening an article and coming back keeps it; closing the tab clears it.

## Voice

- Speaking: browser Web Speech API (`SpeechRecognition`), free. Before first use the page explains that some browsers send audio to their maker's service, checks `SpeechRecognition.available({ processLocally: true })`, and offers on-device only when available. Choice stored in `localStorage` (`lifezoi.mind.voice-consent.v1`).
- Listening indicator, interim words, tap to stop; tapping while Mind speaks interrupts it. Optional continuous mode listens again after each reply (turned off by a crisis reply or a denied microphone).
- Replies are read by the shared site player (`src/lib/voice/engine.ts`) with `localOnly: true`, so only on-device voices read the conversation. Pause, resume, stop. Voice and speed use the shared `VoiceChoices`. Devices do not expose voice gender, so the page says so instead of labeling voices male or female.
- Browsers without speech recognition (for example Firefox) get an honest "not available" state and can type.

## Questionnaires

| Instrument | Status | Evidence |
| --- | --- | --- |
| PHQ-9 | Included | Pfizer released PHQ and GAD-7 "without copyright restriction and at no charge" (2010); form footer: "No permission required to reproduce, translate, display or distribute." |
| GAD-7 | Included | Same |
| Perceived Stress Scale | Not included | CMU lab page (checked 2026-11-22) routes permission requests through Mapi Research Trust ePROVIDE. The request is free, but no permission was requested. |
| Insomnia Severity Index | Not included | Licensed through Mapi Research Trust; the page was in maintenance and terms could not be confirmed. |

Scoring: PHQ-9 bands 0–4, 5–9, 10–14, 15–19, 20–27 (Kroenke 2001); GAD-7 bands 0–4, 5–9, 10–14, 15–21 (Spitzer 2006); 10 or more on either shows the developers' suggestion to talk with a clinician. The difficulty question is asked and not scored.

PHQ-9 item 9: any answer above "Not at all" shows a safety panel immediately, before the next question, with 988 and 911, and again at the top of the result, regardless of the total. The conversation hand-off repeats it.

Wording follows the published English forms. Translations are not shown; only official translations may be used and none have been added. Self-reflections (`reflections.ts`) are labeled as LifeZoi-written educational self-reflection and give no score.

Small changes are described as small: a change within the same band is not called better or worse.

## Progress and privacy

- Off by default. Without consent, the plan lives in `sessionStorage` only.
- With consent (`/mind/progress`), totals, completed exercises, noted reflections, and the plan are kept in `localStorage` under the account's own key (`lifezoi.mind.progress.v1.u.<id>`). No database table and no migration. Not encrypted by the app (the page says so).
- Never saved: individual answers, exercise writing, the conversation.
- Turning saving off deletes the saved copy. "Delete everything" removes saved, tab, and conversation copies.
- No HIPAA or other compliance claim. The Mind test fails if Mind code adds a compliance claim or a `fetch(`.

## AI provider

`provider.ts` defines `MindProvider`. Only `rules` is active. Researched 2026-11-22 and not activated:

- **Cloudflare Workers AI**: 10,000 Neurons/day free on Free and Paid plans; requests fail above it on Free. Cloudflare's data-usage page states it does not train on customer content and keeps it only as long as needed. Recommended for owner approval, server-side only, with a disclosure before any text is sent and the rules provider as fallback.
- **WebLLM**: runs an open model in the browser (WebGPU, one-time download). Most private, but needs a capable device and small models are less reliable on sensitive topics.
- **Gemini free tier**: not suitable. Its unpaid-service terms say content may be used to improve Google products, human reviewers may read it, and ask users not to submit sensitive or personal information.
- Groq: does not retain inference data by default (logs up to 30 days); free limits could not be confirmed.

Any provider must run after the safety check, never handle a detected crisis, keep its key on the server, and fail closed to the rules provider with a visible message.

## Not done yet

- Clinical review of the safety phrases, crisis copy, and all Mind wording. The 988 wording is United States only.
- Translations: the frame (title, tabs, safety block, disclaimer) the Exercises section (list, player, step voice), the 7-day plan, My progress, and Privacy & safety are in Ukrainian, Russian, and Greek (`catalog/<locale>/mind.json`, data listed in `src/lib/i18n/sources/mind.ts`). A page opts in with `<MindShell translated>`; a page without it stays marked `lang="en"` with a note in the person's language. The Talk page and its conversation also work in Russian, Ukrainian (`uk-cues.ts`, `uk.json`, `conversation-uk.test.ts`), and Greek (`el-cues.ts`, `el.json`, `conversation-el.test.ts`; Greek is matched in lower case without accents, and speech input uses el-GR): `respond(state, message, "ru")` turns recognizable Russian wording into English keywords (`src/lib/mind/lang/ru-cues.ts`) for the same rules, and answers from `src/lib/mind/lang/ru.json`. Russian replies name a person in the nominative ("ваша мама"), and plural people as "кто-то из ваших родителей", so the grammar stays correct. `conversation-ru.test.ts` checks that every reply has a Russian version and runs Russian dialogues. Greek replies name a person in the nominative ("η μαμά σας"), and plural people as "κάποιος από τους γονείς σας". Every language the site offers now has the conversation, so the old "replies are still in English" note was removed. The crisis check reads the person's own words in Ukrainian, Russian, and Greek, never the keywords. Understand yourself is translated too. That covers LifeZoi's own text about the PHQ-9 and GAD-7 (purpose, what they can and cannot tell, score band meanings, the safety-question message, results), the score comparison (`compareResults(…, tr)`), and the self-reflections, which are LifeZoi's own and not validated tests. The validated wording itself (stem, items, answer choices, difficulty question) and the developers' credit stay in English with `lang="en"`, with a note in the person's language, until the developers' official translations are added. The Psychology Encyclopedia is translated as well: the library page, search (it matches English and translated text), and all 17 articles (titles, summaries, sections, examples, evidence labels). Reference titles stay in English with `lang="en"`, because they name the original sources. With this, every Mind section is translated.
- PSS and ISI need permission or a licence before they can be added.
- Reference links were checked on 2026-11-22. Several PubMed records could not be opened by the automated check (captcha or rate limit); they should get a human check before launch.
- Screenshots and in-browser voice testing need a signed-in session (a preview deployment or a test account). Unit tests cover the logic.
