"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CareWelcomeArt } from "@/components/care-illustrations";
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
  const account = useAccount();
  const phase = account.phase;
  const invite = searchParams.get("invite")?.trim() ?? "";
  const [visitNote, setVisitNote] = useState("");
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
      setVisitNote(
        result === "inactive"
          ? "This invitation link is no longer active. You can still explore LifeZoi and create your own account."
          : "This browser could not check the invitation link. You can still explore LifeZoi and create your own account.",
      );
    });
    return () => {
      cancelled = true;
    };
  }, [invite, phase]);

  const storedNote =
    browserReady && isInviteToken(invite) && !countsStored
      ? "Invitation counts are not stored in this browser. You can still explore LifeZoi and create your own account."
      : visitNote;

  return (
    <article className="stack-lg">
      <figure className="page-photo care-art">
        <CareWelcomeArt />
        <figcaption>Original lifeZoi illustration.</figcaption>
      </figure>
      <div>
        <h1>{WELCOME_HEADING}</h1>
        <p className="lede">{WELCOME_BODY}</p>
      </div>
      <section className="card stack">
        <h2>Your own account</h2>
        <p>Create an account when you want one. It is separate, and you set the pace.</p>
        <p>LifeZoi is free. The welcome link does not show a name, an email address, or health information.</p>
        {invite && !isInviteToken(invite) ? (
          <p role="status">This link does not include a LifeZoi invitation code. You can still explore and create your own account.</p>
        ) : null}
        {storedNote ? <p role="status">{storedNote}</p> : null}
        <div className="actions">
          <Link className="btn btn-primary" href="/settings">
            Create your account in Settings
          </Link>
          <Link className="btn btn-secondary" href="/dashboard">
            Explore LifeZoi
          </Link>
        </div>
      </section>
    </article>
  );
}
