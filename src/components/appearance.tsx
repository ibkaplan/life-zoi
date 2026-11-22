"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import {
  LOOK_CHOICES,
  LOOK_SHOWN_KEY,
  LOOK_STORAGE_KEY,
  parseLookChoice,
  resolveLook,
  type Look,
  type LookChoice,
} from "@/lib/appearance";
import { msg } from "@/lib/i18n/translate";

type Listener = () => void;
const listeners = new Set<Listener>();
let memoryChoice: LookChoice | null = null;

function readChoice(): LookChoice {
  try {
    return parseLookChoice(window.localStorage.getItem(LOOK_STORAGE_KEY));
  } catch {
    return "auto";
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOOK_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveLookChoice(choice: LookChoice) {
  try {
    window.localStorage.setItem(LOOK_STORAGE_KEY, choice);
  } catch {
    // Storage can be blocked; the choice then lasts until the page is reloaded.
  }
  memoryChoice = choice;
  listeners.forEach((listener) => listener());
}

export function useLookChoice(): LookChoice {
  return useSyncExternalStore(
    subscribe,
    () => memoryChoice ?? readChoice(),
    () => "auto",
  );
}

/** The look in use now: the person's choice, or the automatic one from their own saved questionnaire. */
export function useLook(): Look {
  const choice = useLookChoice();
  const { ready, sample, session } = useSession();
  const tableSex = ready && !sample ? (session.history[0]?.answers.tableSex ?? null) : null;
  return resolveLook(choice, tableSex);
}

/** Puts the current look on `<html data-look>` and remembers it so the next page paints it at once. */
export function AppearanceSync() {
  const look = useLook();
  const { ready } = useSession();
  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-look", look);
    try {
      window.localStorage.setItem(LOOK_SHOWN_KEY, look);
    } catch {
      // Without storage the background still changes; it is only chosen again on the next page.
    }
  }, [look, ready]);
  return null;
}

const LABELS: Record<LookChoice, { name: string; text: string }> = {
  auto: {
    name: msg("Automatic"),
    text: msg(
      "Calm Blue if your saved questionnaire says male, Soft Rose if it says female, and Classic Ivory for any other answer or no answer.",
    ),
  },
  ivory: { name: msg("Classic Ivory"), text: msg("Warm ivory with a touch of lavender and sage.") },
  blue: { name: msg("Calm Blue"), text: msg("Soft sky blue with gentle waves.") },
  rose: { name: msg("Soft Rose"), text: msg("Pale pink and light blue with soft circles.") },
};

/** Settings: the page background, as radio buttons with a small preview of each. */
export function AppearanceSettingsSection() {
  const t = useT();
  const choice = useLookChoice();
  const look = useLook();
  return (
    <section className="card stack" aria-labelledby="appearance-title">
      <h2 id="appearance-title">{t("Page background")}</h2>
      <p>{t("Choose a soft background for every page. Text and cards stay the same, so reading is just as clear. The choice is saved in this browser only.")}</p>
      <fieldset className="field">
        <legend className="sr-only">{t("Page background")}</legend>
        <div className="choices look-choices">
          {LOOK_CHOICES.map((value) => (
            <label className="choice look-choice" key={value}>
              <input type="radio" name="look" value={value} checked={choice === value} onChange={() => saveLookChoice(value)} />
              <span className="look-swatch" data-swatch={value === "auto" ? look : value} aria-hidden="true" />
              <span className="look-text">
                <b>{t(LABELS[value].name)}</b>
                <span className="hint">{t(LABELS[value].text)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
