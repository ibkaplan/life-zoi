"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "@/lib/account-store";
import { localizeCommunityText, PRIVACY_NOTICE, REJECTION_NOTICE, sourceLabel } from "@/lib/community/notices";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import type { CommunityBoard, OwnMessage, PublicMessage, QueueMessage, ReportReason } from "@/lib/community/types";
import { getBrowserSupabase } from "@/lib/supabase-browser";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: msg("Harassment") },
  { value: "hate", label: msg("Hate") },
  { value: "spam", label: msg("Spam") },
  { value: "other", label: msg("Other") },
];

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

async function authHeader(): Promise<Record<string, string>> {
  const supabase = getBrowserSupabase();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function CommunityView() {
  const account = useAccount();
  const t = useT();
  const say = (text: string) => localizeCommunityText(text, t, formatTime);
  const [board, setBoard] = useState<CommunityBoard | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [reason, setReason] = useState<ReportReason>("harassment");

  async function load() {
    const headers = await authHeader();
    const response = await fetch("/api/community", { headers, cache: "no-store" });
    if (!response.ok) {
      setError(msg("The community could not be loaded."));
      return;
    }
    setBoard((await response.json()) as CommunityBoard);
  }

  useEffect(() => {
    const controller = new AbortController();
    authHeader()
      .then((headers) => fetch("/api/community", { headers, cache: "no-store", signal: controller.signal }))
      .then(async (response) => {
        if (!response.ok) throw new Error("load");
        setBoard((await response.json()) as CommunityBoard);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(msg("The community could not be loaded."));
      });
    return () => controller.abort();
  }, [account.phase]);

  async function post(payload: Record<string, unknown>) {
    const headers = await authHeader();
    if (!headers.Authorization) {
      setError(msg("Sign in from Settings before posting. Your message was not sent."));
      setNotice("");
      return;
    }
    setSending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; notice?: string; status?: string };
      if (!response.ok) {
        setError(result.error ?? msg("The message was not published."));
        return;
      }
      if (result.notice) setNotice(result.notice);
      if (payload.action === "submit" && result.status !== "rejected") setBody("");
      await load();
    } catch {
      setError(msg("The message was not published. Try again when you are ready."));
    } finally {
      setSending(false);
    }
  }

  const posts = (board?.messages ?? []).filter((message) => !message.parentId);
  const commentsFor = (id: string) => (board?.messages ?? []).filter((message) => message.parentId === id);

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{t("Community")}</p>
        <h1>{t("A quiet place to talk")}</h1>
        <p className="lede">{t("Share a habit thought under a chosen name. Every post and comment is checked before it is public.")}</p>
      </div>

      <section className="card stack" aria-labelledby="community-privacy">
        <h2 id="community-privacy">{t("Privacy")}</h2>
        <p>{t(PRIVACY_NOTICE)}</p>
        <p>
          {say(
            board?.retentionSummary ??
              msg("Rejected messages, messages you remove, and closed reports are kept for 30 days, then deleted."),
          )}
        </p>
        {board?.moderation === "not-configured" ? (
          <p>{t("Automatic checking is not configured on this server. A message stays in review until a person approves it. Nothing is published without that check.")}</p>
        ) : (
          <p>{t("Messages are checked before they are public. A finished check can publish a respectful note. If a check cannot finish, the message waits for a person.")}</p>
        )}
        {board?.storage === "memory" ? (
          <p>{t("Shared community storage is not configured, so this server holds messages in memory. They can disappear when the server restarts. They are still checked before anyone else can see them.")}</p>
        ) : null}
      </section>

      <section className="card stack">
        <h2>{t("Community guidelines")}</h2>
        <ul>
          <li>{t("Be respectful. Insults, threats, hate, and spam are not published.")}</li>
          <li>{t("Do not post identifying information.")}</li>
          <li>{t("Do not post health records or questionnaire answers.")}</li>
          <li>{t("Other members see your chosen name only.")}</li>
        </ul>
        <p>{t("If a message is not published, you will see: {notice}", { notice: t(REJECTION_NOTICE) })}</p>
        <p>{t("If a check is still running, times out, or cannot be reached, you will see that the message is awaiting moderation. It is not public yet.")}</p>
      </section>

      <section className="card stack">
        <h2>{t("Share a note")}</h2>
        {account.phase === "ready" ? null : (
          <p>
            {t("Sign in from")} <Link href="/settings">{t("Settings")}</Link>{" "}
            {t("before posting. Without a sign-in, the message is not sent.")}
          </p>
        )}
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            const clientRequestId = globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}`;
            void post({ action: "submit", displayName: name, body, clientRequestId });
          }}
        >
          <label className="field">
            <span>{t("Chosen community name")}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} autoComplete="off" />
          </label>
          <label className="field">
            <span>{t("Message")}</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? t("Checking…") : t("Share")}
          </button>
        </form>
        {notice ? (
          <p className="alert alert-ok" role="status">
            {say(notice)}
          </p>
        ) : null}
        {error ? (
          <p className="alert alert-error" role="alert">
            {say(error)}
          </p>
        ) : null}
      </section>

      <OwnList
        mine={board?.mine ?? []}
        sending={sending}
        onAppeal={(messageId) => void post({ action: "appeal", messageId })}
        onRemove={(messageId) => void post({ action: "remove", messageId })}
      />

      <section className="stack">
        <h2>{t("Messages")}</h2>
        {posts.length === 0 ? <p className="card empty">{t("No public messages yet.")}</p> : null}
        {posts.map((postMessage) => (
          <article key={postMessage.id} className="card stack community-message">
            <MessageBody message={postMessage} />
            <MessageActions
              message={postMessage}
              reason={reason}
              onReason={setReason}
              sending={sending}
              onReport={() => void post({ action: "report", messageId: postMessage.id, reason })}
              onBlock={() => void post({ action: "block", messageId: postMessage.id })}
              onMute={() => void post({ action: "mute", messageId: postMessage.id })}
            />
            {commentsFor(postMessage.id).map((comment) => (
              <article key={comment.id} className="community-comment stack">
                <MessageBody message={comment} />
                <MessageActions
                  message={comment}
                  reason={reason}
                  onReason={setReason}
                  sending={sending}
                  onReport={() => void post({ action: "report", messageId: comment.id, reason })}
                  onBlock={() => void post({ action: "block", messageId: comment.id })}
                  onMute={() => void post({ action: "mute", messageId: comment.id })}
                />
              </article>
            ))}
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                const comment = String(data.get("comment") ?? "");
                const clientRequestId = globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}`;
                void post({ action: "submit", displayName: name, body: comment, parentId: postMessage.id, clientRequestId }).then(() => {
                  form.reset();
                });
              }}
            >
              <label className="field">
                <span>{t("Comment under your chosen name")}</span>
                <textarea name="comment" maxLength={1000} />
              </label>
              <button className="btn btn-secondary" type="submit" disabled={sending}>
                {t("Comment")}
              </button>
            </form>
          </article>
        ))}
      </section>

      {board?.isAdmin && board.queue ? (
        <section className="stack" aria-labelledby="community-queue">
          <h2 id="community-queue">{t("Review queue")}</h2>
          <QueueGroup title={t("Awaiting review")} items={board.queue.pending} sending={sending} onApprove={(id) => void post({ action: "admin-approve", messageId: id })} onReject={(id) => void post({ action: "admin-reject", messageId: id })} />
          <QueueGroup title={t("Not published")} items={board.queue.rejected} sending={sending} onApprove={(id) => void post({ action: "admin-approve", messageId: id })} onReject={(id) => void post({ action: "admin-reject", messageId: id })} />
          <div className="stack">
            <h3>{t("Reports")}</h3>
            {board.queue.reports.length === 0 ? <p className="card empty">{t("No open reports.")}</p> : null}
            {board.queue.reports.map((report) => (
              <article key={report.id} className="card stack">
                <p>
                  <strong>{report.authorName}</strong> ·{" "}
                  {t(REASONS.find((item) => item.value === report.reason)?.label ?? report.reason)} · <time dateTime={report.createdAt}>{formatTime(report.createdAt)}</time>
                </p>
                <p>{report.body}</p>
                <p className="hint">
                  {t("Reports on this message: {reports}. Confirmed repeats for this member: {repeats}.", {
                    reports: report.reportCount,
                    repeats: report.authorViolationCount,
                  })}
                </p>
                <button className="btn btn-secondary" type="button" disabled={sending} onClick={() => void post({ action: "admin-dismiss", reportId: report.id })}>
                  {t("Dismiss")}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MessageBody({ message }: { message: PublicMessage }) {
  return (
    <div>
      <p>
        <strong>{message.authorName}</strong> · <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
      </p>
      <p>{message.body}</p>
    </div>
  );
}

function MessageActions({
  message,
  reason,
  onReason,
  sending,
  onReport,
  onBlock,
  onMute,
}: {
  message: PublicMessage;
  reason: ReportReason;
  onReason: (reason: ReportReason) => void;
  sending: boolean;
  onReport: () => void;
  onBlock: () => void;
  onMute: () => void;
}) {
  const t = useT();
  return (
    <div className="community-actions">
      <label className="field">
        <span className="sr-only">{t("Report reason for {name}", { name: message.authorName })}</span>
        <select value={reason} onChange={(event) => onReason(event.target.value as ReportReason)}>
          {REASONS.map((item) => (
            <option key={item.value} value={item.value}>
              {t(item.label)}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-secondary" type="button" disabled={sending} onClick={onReport}>
        {t("Report")}
      </button>
      <button className="btn btn-secondary" type="button" disabled={sending} onClick={onBlock}>
        {t("Block")}
      </button>
      <button className="btn btn-secondary" type="button" disabled={sending} onClick={onMute}>
        {t("Mute")}
      </button>
    </div>
  );
}

function OwnList({
  mine,
  sending,
  onAppeal,
  onRemove,
}: {
  mine: OwnMessage[];
  sending: boolean;
  onAppeal: (messageId: string) => void;
  onRemove: (messageId: string) => void;
}) {
  const t = useT();
  if (mine.length === 0) return null;
  return (
    <section className="stack">
      <h2>{t("Your messages")}</h2>
      {mine.map((message) => (
        <article key={message.id} className="card stack">
          <MessageBody message={message} />
          <p className={message.status === "rejected" ? "alert alert-error" : "alert"} role={message.status === "rejected" ? "alert" : "status"}>
            {localizeCommunityText(message.notice, t, formatTime)}
          </p>
          <div className="community-actions">
            {message.status === "rejected" && !message.appealed ? (
              <button className="btn btn-secondary" type="button" disabled={sending} onClick={() => onAppeal(message.id)}>
                {t("Appeal")}
              </button>
            ) : null}
            <button className="btn btn-danger" type="button" disabled={sending} onClick={() => onRemove(message.id)}>
              {t("Remove")}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function QueueGroup({
  title,
  items,
  sending,
  onApprove,
  onReject,
}: {
  title: string;
  items: QueueMessage[];
  sending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const t = useT();
  return (
    <div className="stack">
      <h3>{title}</h3>
      {items.length === 0 ? <p className="card empty">{t("Nothing in this list.")}</p> : null}
      {items.map((item) => (
        <article key={item.id} className="card stack">
          <p>
            <strong>{item.authorName}</strong> · {item.category} · {sourceLabel(item.source, t)} · <time dateTime={item.createdAt}>{formatTime(item.createdAt)}</time>
          </p>
          <p>{item.body}</p>
          <p className="hint">
            {t("Confirmed repeats: {repeats}. Reports: {reports}.", {
              repeats: item.authorViolationCount,
              reports: item.reportCount,
            })}
            {item.appealed ? ` ${t("Appealed.")}` : ""}
            {item.restrictedUntil ? ` ${t("Temporary limit until {time}.", { time: formatTime(item.restrictedUntil) })}` : ""}
          </p>
          <div className="community-actions">
            <button className="btn btn-primary" type="button" disabled={sending} onClick={() => onApprove(item.id)}>
              {t("Approve")}
            </button>
            <button className="btn btn-danger" type="button" disabled={sending} onClick={() => onReject(item.id)}>
              {t("Reject")}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
