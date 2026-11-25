"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useT } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import {
  DISPLAY_STORAGE_KEY,
  defaultDisplay,
  newerDisplay,
  parseDisplay,
  sameDisplay,
  TEXT_SIZES,
  type DisplayPrefs,
  type TextSize,
} from "@/lib/display-prefs";
import { msg } from "@/lib/i18n/translate";

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedRaw: string | null | undefined;
let cached: DisplayPrefs = defaultDisplay();
let memory: DisplayPrefs | null = null;
const serverDisplay = defaultDisplay();

function readDevice(): DisplayPrefs {
  if (memory) return memory;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(DISPLAY_STORAGE_KEY);
  } catch {
    return cached;
  }
  // Same text gives the same object, so useSyncExternalStore does not loop.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parseDisplay(raw);
  }
  return cached;
}

function writeDevice(prefs: DisplayPrefs) {
  try {
    window.localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(prefs));
    memory = null;
  } catch {
    // Storage can be blocked; the choice then lasts until the page is reloaded.
    memory = prefs;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === DISPLAY_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDisplay(): DisplayPrefs {
  return useSyncExternalStore(subscribe, readDevice, () => serverDisplay);
}

/** Save a change on this device and, when signed in, in the account. */
export function saveDisplay(change: Partial<Pick<DisplayPrefs, "textSize" | "calm">>) {
  const next: DisplayPrefs = { ...readDevice(), ...change, updatedAt: new Date().toISOString() };
  writeDevice(next);
  // commitCompanion does nothing while the sample is on, and a guest copy stays in this browser.
  commitCompanion((state) => ({ ...state, display: next }));
}

function applyToPage(prefs: DisplayPrefs) {
  const root = document.documentElement;
  if (prefs.textSize === "normal") root.removeAttribute("data-text");
  else root.setAttribute("data-text", prefs.textSize);
  if (prefs.calm) root.setAttribute("data-calm", "on");
  else root.removeAttribute("data-calm");
}

/**
 * Puts the current choice on `<html>` and keeps this device and the account in step:
 * whichever copy was changed last wins.
 */
export function DisplaySync() {
  const device = useDisplay();
  const companion = useCompanion();
  const { sample } = useSession();

  useEffect(() => {
    applyToPage(device);
  }, [device]);

  const account = companion.state.display;
  const inAccount = companion.ready && companion.saveMode === "account";
  useEffect(() => {
    if (!inAccount) return;
    const chosen = newerDisplay(device, account);
    if (chosen === account && !sameDisplay(account, device)) {
      writeDevice(account);
    } else if (chosen === device && !sample && !sameDisplay(account, device)) {
      commitCompanion((state) => ({ ...state, display: device }));
    }
  }, [inAccount, device, account, sample]);

  return null;
}

const SIZE_LABELS: Record<TextSize, string> = {
  normal: msg("Normal"),
  large: msg("Large"),
  extra: msg("Extra large"),
};

/** A small "Aa" sample drawn at the size it stands for. */
const SAMPLE_SCALE: Record<TextSize, string> = { normal: "1em", large: "1.2em", extra: "1.4em" };

function SizeChoices({ name, compact = false }: { name: string; compact?: boolean }) {
  const t = useT();
  const display = useDisplay();
  return (
    <div className={compact ? "text-size-choices text-size-choices-compact" : "text-size-choices"}>
      {TEXT_SIZES.map((size) => (
        <label className="text-size-choice" key={size}>
          <input
            type="radio"
            name={name}
            value={size}
            checked={display.textSize === size}
            onChange={() => saveDisplay({ textSize: size })}
          />
          <span className="text-size-sample" aria-hidden="true" style={{ fontSize: SAMPLE_SCALE[size] }}>
            Aa
          </span>
          <span className="text-size-name">{t(SIZE_LABELS[size])}</span>
        </label>
      ))}
    </div>
  );
}

function CalmToggle() {
  const t = useT();
  const display = useDisplay();
  return (
    <label className="calm-toggle">
      <input type="checkbox" checked={display.calm} onChange={(event) => saveDisplay({ calm: event.target.checked })} />
      <span className="calm-toggle-text">
        <b>{t("Calm, simple layout")}</b>
        <span className="hint">
          {t("Hides decorative pictures and backgrounds, stops moving effects, adds space between parts, and underlines links. Every page and feature stays.")}
        </span>
      </span>
    </label>
  );
}

function savedWhere(signedInAccount: boolean, sample: boolean): string {
  if (sample) return msg("Saved in this browser. Sample data is on, so it is not saved to your account.");
  return signedInAccount
    ? msg("Saved in this browser and in your account, so it follows you to your other devices.")
    : msg("Saved in this browser on this device.");
}

/** Settings: text size and the calm layout. */
export function DisplaySettingsSection() {
  const t = useT();
  const companion = useCompanion();
  const { sample } = useSession();
  return (
    <section className="card stack" aria-labelledby="display-title">
      <h2 id="display-title">{t("Text size and layout")}</h2>
      <p>{t("Make the words larger, or choose a calmer page with less on it. Colours stay the same, so reading is just as clear.")}</p>
      <fieldset className="field">
        <legend>{t("Text size")}</legend>
        <SizeChoices name="text-size" />
      </fieldset>
      <CalmToggle />
      <p className="hint">{t(savedWhere(companion.saveMode === "account", sample))}</p>
    </section>
  );
}

/** The "Aa" button in the header: the same choices, one tap away on every page. */
export function DisplayButton() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const nameId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="display-switch" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="display-button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("Text size and layout")}
        title={t("Text size and layout")}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">
          A<span className="display-button-big">A</span>
        </span>
      </button>
      {open ? (
        <div className="display-panel" id={panelId} role="group" aria-label={t("Text size and layout")}>
          <p className="display-panel-title">{t("Text size")}</p>
          <SizeChoices name={`text-size-${nameId}`} compact />
          <CalmToggle />
        </div>
      ) : null}
    </div>
  );
}
