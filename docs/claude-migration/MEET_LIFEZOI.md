# Meet LifeZoi: public voice demo

Requested by Tetyana on 2026-11-25 ("two minutes, a beautiful result"). A public page at
`/free/meet` that lets a visitor hear the voice companion without an account.

## How it works

- **Script, not AI.** `src/lib/meet-demo/script.ts` holds one written conversation of 11
  lines in English, Ukrainian, Russian and Greek, with the same speakers and on-screen
  actions in every language (unit tested). No model is called and nothing is sent anywhere.
- **Voice.** LifeZoi's lines are read by the shared read-aloud player
  (`src/lib/voice/engine.ts`), so the browser's own voice, the visitor's saved speed, and the
  free natural voice (if installed) are used. The visitor's lines are shown, never spoken
  or recorded. The microphone is not used.
- **Captions.** The current line is shown large on the stage, and the conversation builds up
  as chat bubbles below. "Captions only" turns the voice off. If the browser cannot speak,
  or has no voice for the language, the demo plays with captions automatically.
- **Sharing.** "Share this demo" uses the phone's share sheet, or copies the link.
- **Joining.** The page ends with "I have an invitation" (`/#invitation`) and Log in, since
  LifeZoi is invitation-only.
- **Where it is listed.** One entry in `src/lib/free/hub.ts` (group "Try LifeZoi"), so it
  appears on the `/free` hub. Translations of that entry are in
  `src/lib/i18n/catalog/<locale>/meet-demo.json`.

## Rules kept

Labelled as a sample conversation. The "plan" it reads is described as a sample plan. No
figures, scores or medical claims (a test refuses digits in the script). `noindex` still
applies.

## Not done

- Not tested with real speech: the headless browser has no voices, so screenshots use
  captions-only mode. Needs a listen on a phone and a computer.
