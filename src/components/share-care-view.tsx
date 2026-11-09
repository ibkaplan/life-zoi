"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CareShareArt } from "@/components/care-illustrations";
import { useAccount } from "@/lib/account-store";
import {
  canNavigatorShare,
  createInvitation,
  createInviteToken,
  defaultLongMessage,
  defaultShortMessage,
  ensureLink,
  invitationUrl,
  loadInvitationState,
  mailtoHref,
  mentionRelationship,
  PRODUCTION_SITE_ORIGIN,
  regenerateInvitation,
  RELATIONSHIP_SUGGESTIONS,
  replaceInvitationLink,
  resolveShareOrigin,
  revokeInvitation,
  SHARE_HEADING,
  SHARE_INTRO,
  SHARE_TAGLINE,
  sharePayload,
  smsHref,
  type CareReason,
  type InvitationStats,
} from "@/lib/share-care";
import { supabaseGateway } from "@/lib/share-care-store";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Tracking = "loading" | "omitted" | "unavailable" | "ready";

function subscribeNoop() {
  return () => {};
}

function reasonText(reason: CareReason): string {
  switch (reason) {
    case "sign-in":
      return "Sign in to create an invitation link.";
    case "active":
      return "You already have an invitation link. Revoke it before creating another.";
    case "unavailable":
      return "The invitation link could not be saved in this browser.";
    case "rejected":
      return "The invitation link could not be saved. Revoke the current link and try again.";
  }
}

function MessageCard({
  id,
  title,
  hint,
  value,
  link,
  canShare,
  onChange,
  onCopy,
  onShare,
}: {
  id: string;
  title: string;
  hint: string;
  value: string;
  link: string;
  canShare: boolean;
  onChange: (value: string) => void;
  onCopy: (value: string) => void;
  onShare: (value: string) => void;
}) {
  const text = ensureLink(value, link);
  return (
    <section className="card stack">
      <h2>{title}</h2>
      <p className="hint">{hint}</p>
      <label className="field" htmlFor={id}>
        <span>Message</span>
        <textarea
          id={id}
          value={value}
          maxLength={1500}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => onChange(text)}
        />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={() => onCopy(text)}>
          Copy message
        </button>
        <a className="btn btn-secondary" href={mailtoHref(text)}>
          Email with your app
        </a>
        <a className="btn btn-secondary" href={smsHref(text)}>
          Text with your app
        </a>
        {canShare ? (
          <button className="btn btn-secondary" type="button" onClick={() => onShare(text)}>
            Share
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function ShareCareView({ productionSite }: { productionSite: boolean }) {
  const account = useAccount();
  const phase = account.phase;
  const browserOrigin = useSyncExternalStore(subscribeNoop, () => window.location.origin, () => "");
  const canShare = useSyncExternalStore(
    subscribeNoop,
    () => canNavigatorShare(window.navigator.share),
    () => false,
  );
  const [tracking, setTracking] = useState<Tracking>("loading");
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [activeToken, setActiveToken] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"revoke" | "regenerate" | null>(null);
  const [notice, setNotice] = useState("");
  const [tone, setTone] = useState<"ok" | "error">("ok");
  const [thinkingOf, setThinkingOf] = useState("");
  const [customWho, setCustomWho] = useState("");
  const [longText, setLongText] = useState("");
  const [shortText, setShortText] = useState("");
  const thinkingRef = useRef("");
  const previousLink = useRef("");

  function syncMessages(nextLink: string) {
    const previous = previousLink.current;
    if (!nextLink) {
      if (previous) {
        setLongText("");
        setShortText("");
      }
      previousLink.current = "";
      return;
    }
    if (previous === nextLink) return;
    if (!previous) {
      const who = thinkingRef.current;
      setLongText(who ? mentionRelationship(defaultLongMessage(nextLink), who, nextLink) : defaultLongMessage(nextLink));
      setShortText(who ? mentionRelationship(defaultShortMessage(nextLink), who, nextLink) : defaultShortMessage(nextLink));
    } else {
      setLongText((current) => replaceInvitationLink(current, previous, nextLink));
      setShortText((current) => replaceInvitationLink(current, previous, nextLink));
    }
    previousLink.current = nextLink;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (phase !== "ready") {
        if (!cancelled) {
          setStats(null);
          setActiveToken("");
          setTracking(phase === "loading" ? "loading" : "omitted");
          syncMessages("");
        }
        return;
      }
      const supabase = getBrowserSupabase();
      if (!supabase) {
        if (!cancelled) setTracking("omitted");
        return;
      }
      if (!cancelled) setTracking("loading");
      const loaded = await loadInvitationState(supabaseGateway(supabase));
      if (cancelled) return;
      if (!loaded.ok) {
        setStats(null);
        setActiveToken("");
        setTracking("unavailable");
        return;
      }
      setStats(loaded.value.stats);
      const nextToken = loaded.value.active?.token ?? "";
      setActiveToken(nextToken);
      setTracking("ready");
      const originNow = productionSite ? PRODUCTION_SITE_ORIGIN : resolveShareOrigin(false, window.location.origin);
      syncMessages(nextToken ? (invitationUrl(originNow, nextToken) ?? "") : "");
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [phase, productionSite, refreshKey]);

  const origin = productionSite ? PRODUCTION_SITE_ORIGIN : browserOrigin ? resolveShareOrigin(false, browserOrigin) : "";
  const link = origin && activeToken ? (invitationUrl(origin, activeToken) ?? "") : "";

  function choose(raw: string) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name || name.length > 80) return;
    setThinkingOf(name);
    thinkingRef.current = name;
    if (!link) return;
    setLongText((current) => mentionRelationship(current || defaultLongMessage(link), name, link));
    setShortText((current) => mentionRelationship(current || defaultShortMessage(link), name, link));
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copied. You choose who receives it.");
      setTone("ok");
    } catch {
      setNotice("The words could not be copied. Select them and copy them yourself.");
      setTone("error");
    }
  }

  async function shareText(text: string) {
    const share = window.navigator.share;
    if (!canNavigatorShare(share)) return;
    try {
      await share(sharePayload(text));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice("Sharing was not available. You can copy the message instead.");
      setTone("error");
    }
  }

  async function onCreate() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setNotice("Sign-in is not available in this browser, so an invitation link was not created.");
      setTone("error");
      return;
    }
    setBusy(true);
    const created = await createInvitation(supabaseGateway(supabase), createInviteToken());
    setBusy(false);
    if (!created.ok) {
      setNotice(reasonText(created.reason));
      setTone("error");
      return;
    }
    setConfirm(null);
    setNotice("Invitation link created. You choose who receives it.");
    setTone("ok");
    setRefreshKey((value) => value + 1);
  }

  async function onRegenerate() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    const created = await regenerateInvitation(supabaseGateway(supabase), createInviteToken());
    setBusy(false);
    setConfirm(null);
    if (!created.ok) {
      setNotice(reasonText(created.reason));
      setTone("error");
      setRefreshKey((value) => value + 1);
      return;
    }
    setNotice("A new link is ready, and the previous link was revoked.");
    setTone("ok");
    setRefreshKey((value) => value + 1);
  }

  async function onRevoke() {
    const supabase = getBrowserSupabase();
    if (!supabase || !activeToken) return;
    setBusy(true);
    const revoked = await revokeInvitation(supabaseGateway(supabase), activeToken);
    setBusy(false);
    setConfirm(null);
    if (!revoked.ok) {
      setNotice(reasonText(revoked.reason));
      setTone("error");
      return;
    }
    setNotice("The invitation link was revoked.");
    setTone("ok");
    setRefreshKey((value) => value + 1);
  }

  return (
    <article className="stack-lg">
      <div className="care-hero">
        <div>
          <h1>{SHARE_HEADING}</h1>
          <p className="care-tagline">{SHARE_TAGLINE}</p>
          <p className="lede">{SHARE_INTRO}</p>
        </div>
        <figure className="page-photo care-art">
          <CareShareArt />
          <figcaption>Original lifeZoi illustration.</figcaption>
        </figure>
      </div>

      <section className="card stack">
        <h2>Who might enjoy LifeZoi?</h2>
        <p>
          Suggestions: mother or father, husband or wife, children, brother or sister, friends, someone I care about. You can also write someone else. A suggestion only adds a line you can edit or delete.
        </p>
        <p className="hint">
          You choose the person. LifeZoi does not open your contacts, send the message for you, or invite a group. LifeZoi is free. Each person creates a separate account.
        </p>
        <div className="actions" role="group" aria-label="Suggestions">
          {RELATIONSHIP_SUGGESTIONS.map((item) => (
            <button
              key={item}
              className={thinkingOf === item ? "btn btn-secondary" : "btn btn-ghost"}
              type="button"
              aria-pressed={thinkingOf === item}
              onClick={() => choose(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="actions">
          <label className="field care-who" htmlFor="care-who">
            <span>Someone else</span>
            <input
              id="care-who"
              type="text"
              maxLength={80}
              autoComplete="off"
              value={customWho}
              placeholder="Anyone you care about"
              onChange={(event) => setCustomWho(event.target.value)}
            />
          </label>
          <button className="btn btn-secondary" type="button" onClick={() => choose(customWho)}>
            Use these words
          </button>
        </div>
      </section>

      <section className="card stack">
        <h2>Your invitation link</h2>
        {phase === "off" ? (
          <p>Account sign-in is not configured in this browser, so this page cannot create an invitation link or keep counts.</p>
        ) : null}
        {phase === "signed-out" || phase === "needs-mfa" || phase === "error" ? (
          <p>
            <Link href="/settings">Sign in from Settings</Link> to create an invitation link.
          </p>
        ) : null}
        {tracking === "loading" ? <p role="status">Checking your invitation link…</p> : null}
        {tracking === "omitted" ? (
          <p>
            Counts of links created, opens, and registrations appear for a signed-in account. This page does not keep a contact list, and it does not store a name, an email address, or health information.
          </p>
        ) : null}
        {tracking === "unavailable" ? (
          <p role="status">
            Invitation counts could not be loaded, so a new link is not created. This page still does not store a name, an email address, or health information.
          </p>
        ) : null}
        {tracking === "ready" && stats ? (
          <>
            <div className="care-stats">
              <p>
                <b>{stats.linksCreated}</b>
                <span>Links created</span>
              </p>
              <p>
                <b>{stats.opens}</b>
                <span>Opens</span>
              </p>
              <p>
                <b>{stats.registrations}</b>
                <span>Registrations</span>
              </p>
            </div>
            <p className="hint">
              These numbers are only for you. Opens count visits to your welcome link. Registrations count when someone who was signed out then signs in to their own account during that browser visit.
            </p>
          </>
        ) : null}
        {phase === "ready" && tracking === "ready" && !link ? (
          <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void onCreate()}>
            Create invitation link
          </button>
        ) : null}
        {link ? (
          <>
            <label className="field" htmlFor="care-link">
              <span>Invitation link</span>
              <input id="care-link" readOnly value={link} onFocus={(event) => event.currentTarget.select()} />
            </label>
            {productionSite ? null : (
              <p className="hint">
                This preview link uses this browser’s address. On the published site the link begins with {PRODUCTION_SITE_ORIGIN}.
              </p>
            )}
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => void copyText(link)}>
                Copy link
              </button>
              {confirm === "regenerate" ? (
                <>
                  <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => void onRegenerate()}>
                    Regenerate and revoke the previous link
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => setConfirm(null)}>
                    Keep this link
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => setConfirm("regenerate")}>
                  Regenerate link
                </button>
              )}
              {confirm === "revoke" ? (
                <>
                  <button className="btn btn-danger" type="button" disabled={busy} onClick={() => void onRevoke()}>
                    Revoke link
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => setConfirm(null)}>
                    Keep this link
                  </button>
                </>
              ) : (
                <button className="btn btn-danger" type="button" disabled={busy} onClick={() => setConfirm("revoke")}>
                  Revoke link
                </button>
              )}
            </div>
          </>
        ) : null}
        {notice ? (
          <p className={tone === "ok" ? "alert alert-ok" : "alert alert-error"} role={tone === "ok" ? "status" : "alert"}>
            {notice}
          </p>
        ) : null}
      </section>

      {link && longText ? (
        <MessageCard
          id="care-long-message"
          title="Long message"
          hint="Edit the words. The invitation link stays in the message. Email, text, and Share open your own apps so you can choose the recipient."
          value={longText}
          link={link}
          canShare={canShare}
          onChange={setLongText}
          onCopy={(text) => void copyText(text)}
          onShare={(text) => void shareText(text)}
        />
      ) : null}
      {link && shortText ? (
        <MessageCard
          id="care-short-message"
          title="Short message"
          hint="A shorter note, with the same invitation link."
          value={shortText}
          link={link}
          canShare={canShare}
          onChange={setShortText}
          onCopy={(text) => void copyText(text)}
          onShare={(text) => void shareText(text)}
        />
      ) : null}
    </article>
  );
}
