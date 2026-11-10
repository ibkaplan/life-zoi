"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "@/components/locale-provider";
import { useBackgroundMusic } from "@/components/background-music/provider";
import { MusicNoteIcon, PlayPauseButton, statusText } from "@/components/background-music/shared";
import { dayPartFor, type DayPart } from "@/lib/background-music/prefs";

function subscribeClock(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}
const currentPart = (): DayPart => dayPartFor(new Date().getHours());
const morning = (): DayPart => "morning";

/** The dashboard greeting with the optional PLAY MORNING MUSIC control. Music never starts on its own here. */
export function MorningWelcome() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  // The server renders the morning greeting; the browser switches to the visitor's own clock.
  const part = useSyncExternalStore(subscribeClock, currentPart, morning);

  const greeting = part === "morning" ? m.music.greetingMorning : part === "afternoon" ? m.music.greetingAfternoon : m.music.greetingEvening;
  const off = music.ready && music.prefs.choice === "off";
  const showStatus = music.ready && !off && music.status !== "idle";

  return (
    <section className="morning-welcome stack" aria-labelledby="morning-welcome-title">
      <span className="morning-glow" aria-hidden="true" />
      <p id="morning-welcome-title" className="morning-title">{greeting}</p>
      <p>{m.music.welcomeLede}</p>
      {off ? (
        <p className="hint">{m.music.welcomeOff}</p>
      ) : (
        <div className="morning-actions">
          <span className="morning-note" aria-hidden="true">
            <MusicNoteIcon size={26} />
          </span>
          <PlayPauseButton label={part === "morning" ? m.music.playMorning : m.music.playMusic} className="btn morning-play" />
        </div>
      )}
      {showStatus ? (
        <p className="hint" role="status">
          {statusText(m, music.status, music.holdReason)}
        </p>
      ) : null}
    </section>
  );
}
