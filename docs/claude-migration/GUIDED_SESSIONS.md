# Voice-guided sessions

Spoken, step-by-step sessions for Pilates, yoga, stretching, mobility, breathing, relaxation, and meditation, with one player for all of them. Added on branch `claude/project-thread-ng0uw1` (owner request, 2026-11-24).

## What is built

| Part | Where |
| --- | --- |
| Session scripts (7 movement and breathing sessions, 7 meditation themes × 3, 5, 10, 15, 20 minutes) | `src/lib/guided/movement.ts`, `src/lib/guided/meditation.ts`, `src/lib/guided/catalog.ts` |
| Player state machine (play, pause, resume, stop, restart, next and previous step, ducking, completion) | `src/lib/guided/controller.ts` |
| Timing, progress, time left | `src/lib/guided/timeline.ts` |
| Saved history (`companion_state.state.guided`) | `src/lib/guided/history.ts`, `addGuidedSession` in `src/lib/companion/state.ts` |
| Player UI and site-wide launcher | `src/components/guided/` (`GuidedProvider` is in the root layout) |
| Library and history page | `/guided` (`src/app/(members)/guided/page.tsx`) |
| My Day | "Guided sessions for your day" section on `/my-day`: Morning, Afternoon, Evening |
| My Health Day (members' home) | "Guided sessions for now" card with the current part of the day |
| Tests | `src/lib/guided/guided.test.ts` |
| Translations | `src/lib/i18n/catalog/{uk,ru,el}/guided.json` |

### How a session works

A session is a timed script of short cues. Each cue is spoken, then followed by a quiet hold while the person moves or rests. Pause stops the voice at once. Resume says the interrupted cue again from its start, or finishes the hold that was left. Nothing autoplays: the voice starts only from a Start or Play tap. While a session plays, the screen is kept awake where the browser supports the Wake Lock API.

### The voice

Guided sessions use the existing LifeZoi voice: the shared read-aloud player in `src/lib/voice/engine.ts`, with the person's saved voice, voice type (soft female or male), speed, and the optional free LifeZoi natural voices (Piper, on device). No other voice or service was added. Guided sessions read under the owner `guided-session`, so starting any other Listen button pauses the session instead of talking over it, and leaving the page pauses it as well.

Engine changes made for this work:

- `PlayOptions.volume`, plus a site-wide saved voice volume in `VoicePrefs.volume` (20% to 100%). The guided player has the slider, and it applies to every Listen button.
- `onEnd(reason)`: `"done"`, `"stopped"`, or `"replaced"`. Existing callers ignore the argument.
- `primeSpeech()`, which is called from a tap before starting. iPhone and iPad Safari only allow speech that a tap started.
- Find My Movement's read-aloud (`src/lib/wellness/movement-studio/voice-guide.ts`) used to talk to the browser directly. It now goes through the shared player. The Focus timer (`src/components/focus/read-aloud.ts`) still talks to the browser directly. That remains to be moved.

When the device has no voice for the page language, or the browser cannot speak, the session continues silently. Each cue stays on screen for about as long as it would take to say, and a note explains why.

### Music

Background music is the existing site-wide player. While the instructor speaks, and through gaps shorter than 6 seconds, the guided player claims `voice` audio focus, so music drops to its "during the session" level. During longer holds, while paused, and at the end, music returns to its normal level. Short gaps keep it low, so the music does not swell between sentences. The player shows Music on/off, the music category, the music volume, and the during-session volume.

### Starting a session from elsewhere

- `useGuided().launch(id, { start: true })` in React, called from a tap.
- `requestGuidedSession(id)` in `src/lib/guided/launcher.ts` for code outside React. It sends the cancelable window event `lifezoi:guided-start` with `{ id, start }`. The player calls `preventDefault()` when it accepts the id.
- The link `/guided?session=<id>&start=1`. Without a tap, a phone may still need Play pressed.

## Content rules

- General adult wellness instructions, written for LifeZoi. Each session has a safety line: move gently, stop if anything hurts or you feel dizzy or short of breath, and check with a health professional for conditions, injury, pregnancy, or recent surgery. Breathing sessions never ask anyone to force or hold the breath. Meditation, relaxation, and sleep sessions say not to listen while driving. "General wellness guidance, not medical advice" is shown on every session.
- Tests check that every session lasts within 6% of the minutes on its card at the default speed, that no hold is longer than 2 minutes, and that no cue asks for pain, breath holding, calories, or a cure.
- Times are planned estimates. The real length depends on the voice and speed, because the session always waits for the voice to finish.

## Not done or not verified

- **Not tried in a real browser yet.** Members' pages need a Supabase sign-in, and this cloud session has none, so there are no screenshots. The player logic is covered by unit tests with a fake voice and timers. iPhone Safari, Android Chrome, and desktop browsers still need a hands-on check: tap Start, Pause, Resume, lock the screen, and play music at the same time.
- The Russian, Ukrainian, and Greek scripts were translated by Claude and need a read by native speakers.
- iPhone and iPad Safari ignore voice volume for device voices. The music volume is the way to balance them there.
- Pause restarts the current sentence, not the exact word. That is deliberate, because pausing in the middle of a sentence is unreliable on phones.

## If the free voices are not good enough

The voice depends on the device. Recent iPhones, Macs, Edge, and Android with Google voices sound natural; older Windows voices sound robotic. Options, none of them enabled:

1. **Free, already available.** In Settings, turn on the LifeZoi natural voice (Piper, on the device), or download an Enhanced or Premium device voice. The Settings help text explains how. Cost: none.
2. **Pre-recorded narration made once with a neural TTS service.** The scripts are fixed text with no personal data, so they could be turned into audio files once and served as static files. The guided and translated text is about 22,000 characters per language, roughly 90,000 for all four. At the list prices neural voices typically charge per million characters, that is a one-time cost of a few dollars per voice. Check current prices before choosing. Hosting is a few tens of MB of audio. The player would need a `Narrator` that plays files, which its interface was built for (`src/lib/guided/controller.ts`).
3. **A human voice actor**, recording the same scripts once: the most natural option, but the most expensive and the slowest to change.
4. **Live paid neural TTS per sentence.** Not recommended: it costs money on every play, and it sends text to an outside service each time.

Options 2 to 4 need the owner's approval before anything is set up.
