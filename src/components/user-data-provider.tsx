"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearUserData, loadUserData, saveUserData } from "@/lib/storage";
import { createEmptyUserData, type UserData } from "@/lib/user-data";

type Ready = {
  status: "ready";
  data: UserData;
  commit: (next: UserData) => string | null;
  reset: () => string | null;
};

type State =
  | { status: "loading" }
  | { status: "error"; reason: "unavailable" | "corrupt"; raw: string | null }
  | Ready;

const UserDataContext = createContext<State>({ status: "loading" });

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadUserData();
      if (!loaded.ok) {
        setState({ status: "error", reason: loaded.reason, raw: loaded.raw });
        return;
      }
      setState({
        status: "ready",
        data: loaded.data,
        commit: (next) => write(setState, next),
        reset: () => wipe(setState),
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo(() => state, [state]);
  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

function write(setState: (state: State) => void, next: UserData): string | null {
  try {
    saveUserData(next);
  } catch {
    setState({ status: "error", reason: "unavailable", raw: null });
    return "This browser could not save your notes.";
  }
  setState({
    status: "ready",
    data: next,
    commit: (updated) => write(setState, updated),
    reset: () => wipe(setState),
  });
  return null;
}

function wipe(setState: (state: State) => void): string | null {
  try {
    clearUserData();
  } catch {
    setState({ status: "error", reason: "unavailable", raw: null });
    return "This browser could not delete the saved notes.";
  }
  const empty = createEmptyUserData();
  setState({
    status: "ready",
    data: empty,
    commit: (updated) => write(setState, updated),
    reset: () => wipe(setState),
  });
  return null;
}

export function useUserData(): State {
  return useContext(UserDataContext);
}

export function DataGate({ children }: { children: (ready: Ready) => ReactNode }) {
  const state = useUserData();
  if (state.status === "loading") {
    return (
      <p role="status" className="text-muted">
        Loading notes stored on this device…
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <div className="rounded-3xl border border-clay bg-sand p-5" role="alert">
        <h1 className="font-display text-3xl">Notes on this device could not be opened</h1>
        <p className="mt-2 text-muted">
          {state.reason === "corrupt"
            ? "The saved lifeZoi file is unreadable. Nothing new was written. You can download the raw text or clear it."
            : "Browser storage is unavailable. lifeZoi did not create an account or a server copy."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {state.raw ? (
            <button
              className="inline-flex min-h-11 items-center rounded-full bg-forest px-4 font-semibold text-surface"
              type="button"
              onClick={() => downloadText("lifezoi-unreadable.txt", state.raw ?? "")}
            >
              Download raw text
            </button>
          ) : null}
          <button
            className="inline-flex min-h-11 items-center rounded-full border border-danger px-4 font-semibold text-danger"
            type="button"
            onClick={() => {
              wipe(() => undefined);
              window.location.reload();
            }}
          >
            Clear saved notes
          </button>
        </div>
      </div>
    );
  }
  return children(state);
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function postValidation(path: string, body: unknown): Promise<{ ok: true } | { ok: false; message: string; errors?: { field: string; message: string }[] }> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { ok?: boolean; message?: string; errors?: { field: string; message: string }[] };
    if (response.ok && payload.ok) return { ok: true };
    return {
      ok: false,
      message: payload.message || "Nothing was saved because the check did not pass.",
      errors: payload.errors,
    };
  } catch {
    return { ok: false, message: "Nothing was saved. The check could not be completed." };
  }
}
