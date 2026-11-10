"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CareWelcomeArt } from "@/components/care-illustrations";
import { useLocale } from "@/components/locale-provider";
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
        <h2>{w.ownAccount}</h2>
        <p>{w.notOpen}</p>
        <p>{w.free}</p>
        {invite && !isInviteToken(invite) ? (
          <p role="status">{w.noCode}</p>
        ) : null}
        {storedNote ? <p role="status">{storedNote}</p> : null}
        <div className="actions">
          <Link className="btn btn-primary" href="/dashboard">
            {w.explore}
          </Link>
          <Link className="btn btn-secondary" href="/sign-in">
            {m.common.signIn}
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
