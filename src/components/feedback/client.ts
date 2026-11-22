"use client";

import { useCallback, useEffect, useState } from "react";
import { msg } from "@/lib/i18n/translate";
import type { FeedbackBoard } from "@/lib/feedback/types";

export type BoardState =
  | { phase: "loading" }
  | { phase: "ready"; board: FeedbackBoard }
  | { phase: "failed"; error: string };

/** Loads published reviews, the rating summary, announcements, and the member's own submissions. */
export function useFeedbackBoard() {
  const [state, setState] = useState<BoardState>({ phase: "loading" });
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/feedback", { cache: "no-store", signal });
      const body = (await response.json().catch(() => ({}))) as FeedbackBoard & { error?: string };
      if (!response.ok) {
        setState({ phase: "failed", error: body.error ?? msg("Reviews could not be loaded. Try again later.") });
        return;
      }
      setState({ phase: "ready", board: body });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState({ phase: "failed", error: msg("Reviews could not be loaded. Try again later.") });
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    // Loading starts after the first paint; the state change happens when the request settles.
    void Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);
  return { state, reload: () => load() };
}

export type PostResult = { ok: true; notice: string } | { ok: false; error: string; field?: string; code?: string };

export async function postJson(url: string, payload: Record<string, unknown>): Promise<PostResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as { notice?: string; error?: string; field?: string; code?: string };
    if (!response.ok) {
      return { ok: false, error: body.error ?? msg("That could not be saved. Try again later."), field: body.field, code: body.code };
    }
    return { ok: true, notice: body.notice ?? msg("Saved.") };
  } catch {
    return { ok: false, error: msg("That could not be saved. Check your connection and try again.") };
  }
}

/** A random id per form, so a double click or a retry is saved once. */
export function newRequestId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function formatDay(iso: string, locale: string): string {
  const date = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}
