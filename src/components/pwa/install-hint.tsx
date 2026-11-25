"use client";

import "@/components/pwa/install-hint.css";
import { useEffect, useState } from "react";
import { useMessages } from "@/components/locale-provider";
import { INSTALL_HINT_KEY } from "@/lib/pwa/config";
import { installHintFor, parseClosedAt, type InstallHint } from "@/lib/pwa/install-hint";

/** Chrome and Edge's install event. Not in the TypeScript DOM types yet. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function readClosedAt(): number | null {
  try {
    return parseClosedAt(window.localStorage.getItem(INSTALL_HINT_KEY));
  } catch {
    return null;
  }
}

function saveClosedAt() {
  try {
    window.localStorage.setItem(INSTALL_HINT_KEY, String(Date.now()));
  } catch {
    // Private windows may block storage; the hint simply comes back next visit.
  }
}

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.("(display-mode: standalone)").matches === true;
}

/**
 * A small, closable card that says lifeZoi can be added to the home screen.
 * On Android and desktop Chrome or Edge it uses the browser's own install prompt.
 * On iPhone and iPad Safari it explains Share, then Add to Home Screen.
 * It never shows inside the installed app, and stays away for 30 days once closed.
 */
export function InstallHint({ className }: { className?: string }) {
  const m = useMessages().install;
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hint, setHint] = useState<InstallHint>("none");

  useEffect(() => {
    const decide = (canPrompt: boolean) =>
      setHint(
        installHintFor({
          standalone: isStandalone(),
          canPrompt,
          userAgent: navigator.userAgent,
          maxTouchPoints: navigator.maxTouchPoints ?? 0,
          closedAt: readClosedAt(),
          now: Date.now(),
        }),
      );
    decide(false);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      decide(true);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setHint("none");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hint === "none") return null;

  const close = () => {
    saveClosedAt();
    setHint("none");
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => ({ outcome: "dismissed" as const }));
    setPromptEvent(null);
    if (choice.outcome === "accepted") setHint("none");
    else close();
  };

  return (
    <aside className={className ? `install-hint ${className}` : "install-hint"} aria-label={m.title}>
      <img className="install-hint-icon" src="/icons/icon-192.png" alt="" width={44} height={44} />
      <div className="install-hint-text">
        <p className="install-hint-title">{m.title}</p>
        <p>{hint === "ios" ? m.iosSteps : m.body}</p>
      </div>
      <div className="install-hint-actions">
        {hint === "prompt" ? (
          <button type="button" className="btn btn-primary" onClick={install}>
            {m.install}
          </button>
        ) : null}
        <button type="button" className="btn btn-secondary" onClick={close}>
          {m.notNow}
        </button>
      </div>
    </aside>
  );
}
