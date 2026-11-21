"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { CareWelcomeArt } from "@/components/care-illustrations";
import { useLocale, useMessages } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";
import {
  isInviteToken,
  markOpenNoted,
  rememberInviteVisit,
  shouldNoteOpen,
  WELCOME_BODY,
  WELCOME_HEADING,
  type NoteResult,
} from "@/lib/share-care";
import { supabaseGateway } from "@/lib/share-care-store";
import { getBrowserSupabase } from "@/lib/supabase-browser";

const openAttempts = new Set<string>();

function subscribeNoop() {
  return () => {};
}

export function WelcomeView() {
  const searchParams = useSearchParams();
  const { locale, messages: m } = useLocale();
  const w = m.welcome;
  const a = m.access;
  // English keeps the approved invitation wording from share-care.ts.
  const heading = locale === "en" ? WELCOME_HEADING : w.heading;
  const body = locale === "en" ? WELCOME_BODY : w.body;
  const account = useAccount();
  const phase = account.phase;
  const invite = searchParams.get("invite")?.trim() ?? "";
  const [visitNote, setVisitNote] = useState<"" | "inactive" | "checkFailed">("");
  const browserReady = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const countsStored = browserReady && getBrowserSupabase() !== null;

  useEffect(() => {
    rememberInviteVisit(window.sessionStorage, invite, phase);
    if (!isInviteToken(invite) || !shouldNoteOpen(window.sessionStorage, invite) || openAttempts.has(invite)) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    openAttempts.add(invite);
    let cancelled = false;
    const gateway = supabaseGateway(supabase);
    void gateway.note(invite, "open").then((result: NoteResult) => {
      if (cancelled) return;
      if (result === "noted") {
        markOpenNoted(window.sessionStorage, invite);
        return;
      }
      openAttempts.delete(invite);
      setVisitNote(result === "inactive" ? "inactive" : "checkFailed");
    });
    return () => {
      cancelled = true;
    };
  }, [invite, phase]);

  const storedNote =
    browserReady && isInviteToken(invite) && !countsStored
      ? w.notStored
      : visitNote === "inactive"
        ? w.inactive
        : visitNote === "checkFailed"
          ? w.checkFailed
          : "";

  return (
    <article className="stack-lg">
      <figure className="page-photo care-art">
        <CareWelcomeArt />
        <figcaption>{w.artCaption}</figcaption>
      </figure>
      <div>
        <h1>{heading}</h1>
        <p className="lede">{body}</p>
      </div>
      <section className="card stack">
        <h2>{a.registerTitle}</h2>
        {phase === "ready" ? (
          <p>{a.alreadySignedIn}</p>
        ) : isInviteToken(invite) ? (
          <RegisterForm token={invite} />
        ) : (
          <p role="status">{invite ? w.noCode : a.registerNoCode}</p>
        )}
        {storedNote ? <p role="status">{storedNote}</p> : null}
        <p>{w.free}</p>
        <div className="actions">
          <Link className="btn btn-secondary" href={phase === "ready" ? "/" : "/sign-in"}>
            {phase === "ready" ? a.mySpace : a.alreadyMember}
          </Link>
        </div>
      </section>
    </article>
  );
}

export function WelcomeFallback({ heading, body }: { heading: string; body: string }) {
  const { locale, messages } = useLocale();
  const w = messages.welcome;
  return (
    <article className="stack-lg">
      <h1>{locale === "en" ? heading : w.heading}</h1>
      <p className="lede">{locale === "en" ? body : w.body}</p>
      <p role="status">{w.opening}</p>
    </article>
  );
}

type RegisterState = "idle" | "busy" | "sent" | "inactive" | "full" | "busy-limit" | "email" | "failed" | "not-set-up";

/** Email only. The server checks the link and asks Supabase to send an invitation email. */
function RegisterForm({ token }: { token: string }) {
  const m = useMessages();
  const a = m.access;
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<RegisterState>("idle");

  if (state === "sent") {
    return (
      <p className="alert alert-ok" role="status">
        {a.registerSent}
      </p>
    );
  }

  const problem: Partial<Record<RegisterState, string>> = {
    inactive: a.registerInactive,
    full: a.registerFull,
    "busy-limit": a.registerBusy,
    email: a.registerEmail,
    failed: a.registerFailed,
    "not-set-up": a.registerNotSetUp,
  };

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        setState("busy");
        void fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
          cache: "no-store",
        })
          .then(async (response) => {
            const body = (await response.json().catch(() => ({}))) as { code?: unknown };
            const code = typeof body.code === "string" ? body.code : "";
            if (response.ok && code === "sent") return setState("sent");
            if (code === "inactive" || code === "full" || code === "email" || code === "not-set-up") return setState(code);
            if (code === "busy") return setState("busy-limit");
            setState("failed");
          })
          .catch(() => setState("failed"));
      }}
    >
      <p>{a.registerText}</p>
      <label className="field" htmlFor={id}>
        <span>{m.common.email}</span>
        <input
          id={id}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={state === "busy"}>
          {a.registerButton}
        </button>
      </div>
      {problem[state] ? (
        <p className="alert alert-error" role="alert">
          {problem[state]}
        </p>
      ) : null}
    </form>
  );
}
