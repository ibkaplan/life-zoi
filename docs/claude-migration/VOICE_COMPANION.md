# LifeZoi voice companion

Requested by Tetyana on 2026-11-24 ("voice-first LifeZoi companion"). It adds a spoken
welcome, optional hands-free listening, and voice navigation on every members' page,
plus a microphone on LifeZoi AI. It adds no new voice and no paid service.

## How it works

- **One voice.** Everything is spoken through the shared read-aloud player
  (`src/lib/voice/engine.ts`), so the companion uses the person's saved voice, speed,
  volume, and the free LifeZoi natural voice exactly like every Listen button.
- **Runtime:** `src/lib/companion-voice/runtime.ts`, one per tab, so hands-free carries
  on across pages. UI: `src/components/voice-companion/` (corner button, once-only
  welcome panel, welcome card, panel, settings card, microphone consent).
- **Welcome:** once per tab (`sessionStorage`), after the saved questionnaire is known.
  No saved questionnaire: the "complete your profile" welcome and a Complete my profile
  button. Saved questionnaire: morning, afternoon, or evening by local time, with the
  first name typed in the questionnaire (never the account name, never "Sample visitor"),
  and one of four lines that differs from last time. Sample data counts as no profile.
- **Autoplay:** browsers only let a page speak after a tap. When the tab has had no tap
  (`navigator.userActivation`) or the engine reports `not-allowed`, the card shows
  "▶ Hear my welcome". A fresh tab therefore usually needs that one tap; a welcome right
  after signing in (same tab) can play by itself.
- **Listening:** off until the person turns on the microphone and agrees to the notice.
  Browser speech recognition (Web Speech API), one sentence at a time, restarted for
  hands-free. It stops while any LifeZoi voice is speaking or about to speak (so it never
  hears itself), while the tab is hidden, while LifeZoi Mind or LifeZoi AI uses its own
  microphone (`holdMic`/`releaseMic`), and after about eight silent rounds. Tap the corner
  button or press Esc to interrupt.
- **Commands:** `src/lib/companion-voice/commands.ts` matches words in EN/UK/RU/EL in the
  browser. Pages: My Day, meals, sleep, Brain & Habit Quiz, progress, encyclopedia,
  dashboard, My Health, profile, nutrition, movement, My Music, LifeZoi AI, Mind,
  settings, home, back. Music by mood through the site music player.
- **Guided sessions:** "Start Pilates", "meditation for 10 minutes", "breathing" and so on
  fire `lifezoi:guided-start` with `{ id, start: true }` (the guided-session player from
  PR #93 calls `preventDefault()` when it takes it). If nobody takes it, the closest
  existing page opens. The companion never greets over an open guided session.
- **Open questions:** never sent anywhere by the companion. It offers to open LifeZoi AI
  with the question typed in; the person taps Ask. Crisis wording uses LifeZoi Mind's
  safety check and shows the 988/911 actions.
- **LifeZoi AI microphone:** a Speak button beside Ask. A spoken question is sent as text
  like a typed one, and its answer is read aloud.

## Saved data

`lifezoi.voice-companion.v1` in localStorage: switches and the microphone choice only.
Nothing said is stored.

## Tested

- Unit tests for commands, welcome, prefs, and the runtime with a fake speech engine and
  recognizer (`src/lib/companion-voice/*.test.ts`).
- Not tested in a real browser: the members' pages need a real sign-in, and a local
  sign-in bypass was not used for this change. Needs a check on a real device.

## Limits

- Chrome and Edge (desktop, Android) work best. Safari on iPhone supports recognition
  less reliably, needs a tap before speaking every new tab, and may stop hands-free
  listening sooner. Firefox has no speech recognition: the companion speaks only.
- Chrome sends audio to Google's speech service unless on-device recognition is offered.
- UK, RU, and EL wording needs a native speaker's read.
