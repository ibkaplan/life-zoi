"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import "@/components/friends/friends.css";
import { useT } from "@/components/locale-provider";
import { LoadingState } from "@/components/sources";
import { useAccount } from "@/lib/account-store";
import { localISODate } from "@/lib/dates";
import {
  CHALLENGE_LENGTH,
  challengeDay,
  earnedBadges,
  emptyChallenge,
  FRIEND_BADGES,
  isComplete,
  isStepOpen,
  nextStep,
  restartChallenge,
  startChallenge,
  STRONGER_TOGETHER_DAYS,
  toggleStep,
  TOGETHER_STEPS,
  type CircleSummary,
  type FriendChallenge,
} from "@/lib/friends/challenge";
import { loadChallenge, loadCircleSummary, saveChallenge, type ChallengeSaveMode } from "@/lib/friends/store";
import { invitationUrl, loadInvitationState, PRODUCTION_SITE_ORIGIN, resolveShareOrigin } from "@/lib/share-care";
import { supabaseGateway } from "@/lib/share-care-store";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function subscribeNoop() {
  return () => {};
}

export type FriendsData = { state: FriendChallenge; mode: ChallengeSaveMode; summary: CircleSummary | null; link: string; linkChecked: boolean };

/** Invite a Friend: personal link, the 7-day Together challenge, and badges for both friends. */
export function FriendsView({ productionSite }: { productionSite: boolean }) {
  const t = useT();
  const account = useAccount();
  const userId = account.phase === "ready" ? account.userId : null;
  const today = useSyncExternalStore(subscribeNoop, () => localISODate(), () => "");
  const [loaded, setFriendsData] = useState<FriendsData | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load(id: string) {
      const supabase = getBrowserSupabase();
      const [challenge, summary, invitation] = await Promise.all([
        loadChallenge(id),
        loadCircleSummary(),
        supabase ? loadInvitationState(supabaseGateway(supabase)) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      const origin = productionSite ? PRODUCTION_SITE_ORIGIN : resolveShareOrigin(false, window.location.origin);
      const token = invitation && invitation.ok ? (invitation.value.active?.token ?? "") : "";
      setFriendsData({
        state: challenge.state,
        mode: challenge.mode,
        summary,
        link: token ? (invitationUrl(origin, token) ?? "") : "",
        linkChecked: Boolean(invitation && invitation.ok),
      });
    }
    void load(userId);
    return () => {
      cancelled = true;
    };
  }, [userId, productionSite]);

  if (account.phase === "loading" || (userId && !loaded) || !today) return <LoadingState label={t("Loading your session…")} />;

  if (!userId) {
    return (
      <div className="stack-lg narrow fr">
        <Heading />
        <section className="card empty">
          <h2>{t("Sign in to invite a friend")}</h2>
          <p>{t("Your invitation link, the Together challenge, and your badges belong to your account.")}</p>
          <Link className="btn btn-primary" href="/sign-in">
            {t("Sign in")}
          </Link>
        </section>
      </div>
    );
  }

  const data = loaded ?? { state: emptyChallenge(), mode: "device" as const, summary: null, link: "", linkChecked: false };

  async function update(next: FriendChallenge) {
    if (!userId) return;
    setFriendsData((current) => (current ? { ...current, state: next } : current));
    setSaving(true);
    const mode = await saveChallenge(userId, next);
    const fresh = await loadCircleSummary();
    setSaving(false);
    setFriendsData((current) => (current ? { ...current, mode, summary: fresh ?? current.summary } : current));
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return <FriendsPanel data={data} today={today} saving={saving} copied={copied} onUpdate={update} onCopy={copyLink} />;
}

/** The page body. It only shows what it is given, so it can be checked with made-up counts. */
export function FriendsPanel({
  data,
  today,
  saving,
  copied,
  onUpdate: update,
  onCopy: copyLink,
}: {
  data: FriendsData;
  today: string;
  saving: boolean;
  copied: boolean;
  onUpdate: (next: FriendChallenge) => void | Promise<void>;
  onCopy: () => void | Promise<void>;
}) {
  const t = useT();
  const { state, summary } = data;
  const earned = earnedBadges(summary, state);
  const day = Math.min(challengeDay(state, today), CHALLENGE_LENGTH);
  const upNext = nextStep(state, today);

  return (
    <div className="stack-lg fr">
      <Heading />

      <section className="card stack fr-link" aria-labelledby="fr-link-title">
        <h2 id="fr-link-title">
          <span aria-hidden="true">1 · </span>
          {t("Your personal invite link")}
        </h2>
        <p>{t("LifeZoi is by invitation only. Your link lets up to three people you choose create their own account.")}</p>
        {data.link ? (
          <>
            <p className="fr-link-box">
              <code>{data.link}</code>
            </p>
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => void copyLink()}>
                {copied ? t("Link copied") : t("Copy link")}
              </button>
              <Link className="btn btn-secondary" href="/share-the-care">
                {t("Write a message in Share the Care")}
              </Link>
            </div>
          </>
        ) : (
          <div className="actions">
            <Link className="btn btn-primary" href="/share-the-care">
              {t("Create my invite link")}
            </Link>
          </div>
        )}
        {!data.linkChecked ? <p className="hint">{t("Your link could not be checked right now. Share the Care shows it.")}</p> : null}
        <p className="fr-count">
          {summary
            ? summary.friendsJoined === 1
              ? t("1 friend joined through your invitations.")
              : t("{count} friends joined through your invitations.", { count: summary.friendsJoined })
            : t("Friend counts appear here once your account can show them.")}
        </p>
      </section>

      <section className="card stack" aria-labelledby="fr-challenge-title">
        <div>
          <h2 id="fr-challenge-title">
            <span aria-hidden="true">2 · </span>
            {t("The 7-day Together challenge")}
          </h2>
          <p>{t("One small step a day for a week, the same steps for you and your friend. Do it at your own pace: a missed day stays open.")}</p>
        </div>

        {!state.startedOn ? (
          <div className="actions">
            <button className="btn btn-primary" type="button" disabled={saving} onClick={() => void update(startChallenge(state, today))}>
              {t("Start the challenge today")}
            </button>
          </div>
        ) : (
          <>
            <div className="fr-progress" role="img" aria-label={t("{done} of {total} steps ticked", { done: state.doneDays.length, total: CHALLENGE_LENGTH })}>
              {TOGETHER_STEPS.map((step) => (
                <span key={step.day} data-done={state.doneDays.includes(step.day) ? "yes" : "no"} />
              ))}
            </div>
            <p className="hint">
              {isComplete(state)
                ? t("All seven steps are ticked. Well done, both of you!")
                : t("Day {day} of 7 · {done} of {total} steps ticked", { day: Math.max(day, 1), done: state.doneDays.length, total: CHALLENGE_LENGTH })}
            </p>
            {upNext ? (
              <p>
                <strong>{t("Next:")}</strong> {t(upNext.title)}
              </p>
            ) : null}
            <ol className="fr-steps">
              {TOGETHER_STEPS.map((step) => {
                const open = isStepOpen(state, step.day, today);
                const done = state.doneDays.includes(step.day);
                return (
                  <li key={step.day} className="fr-step" data-state={done ? "done" : open ? "open" : "later"}>
                    <span className="fr-step-mark" aria-hidden="true">
                      {done ? "✓" : step.day}
                    </span>
                    <div className="fr-step-body">
                      <h3>
                        {t("Day {day}", { day: step.day })}: {t(step.title)}
                      </h3>
                      {open ? (
                        <>
                          <p>{t(step.text)}</p>
                          <div className="actions">
                            <button
                              className={done ? "btn btn-secondary" : "btn btn-primary"}
                              type="button"
                              aria-pressed={done}
                              disabled={saving}
                              onClick={() => void update(toggleStep(state, step.day, today))}
                            >
                              {done ? t("Done ✓ (tap to undo)") : t("I did this step")}
                            </button>
                            <Link className="btn btn-secondary" href={step.href}>
                              {t(step.linkLabel)}
                            </Link>
                          </div>
                        </>
                      ) : (
                        <p className="hint">{t("Opens on day {day}.", { day: step.day })}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <label className="fr-share">
              <input
                type="checkbox"
                checked={state.shareWithFriends}
                disabled={saving}
                onChange={(event) => void update({ ...state, shareWithFriends: event.target.checked })}
              />
              <span>
                {t("Add my ticked days to the shared total my friends see.")}{" "}
                <span className="hint">{t("Only the number is shared. Friends never see which steps you ticked, your name, or anything else.")}</span>
              </span>
            </label>
            {summary ? (
              <p className="fr-count">
                {summary.friendsSharing > 0
                  ? t("Together you have ticked {days} steps. {friends} of your friends share their days.", {
                      days: summary.togetherDays,
                      friends: summary.friendsSharing,
                    })
                  : t("When a friend chooses to share their days, your shared total appears here.")}
              </p>
            ) : null}
            {isComplete(state) ? (
              <div className="actions">
                <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => void update(restartChallenge(state, today))}>
                  {t("Start another week together")}
                </button>
              </div>
            ) : null}
          </>
        )}
        <p className="hint">
          {data.mode === "account" ? t("Saved to your account.") : t("Saved in this browser on this device for now.")}
        </p>
      </section>

      <section className="card stack" aria-labelledby="fr-badges-title">
        <h2 id="fr-badges-title">
          <span aria-hidden="true">3 · </span>
          {t("Friend badges")}
        </h2>
        <p>{t("When a friend joins through your link, you both earn a badge: Care Sharer for you, Warm Welcome for your friend.")}</p>
        <ul className="fr-badges">
          {FRIEND_BADGES.map((badge) => {
            const has = earned.has(badge.id);
            return (
              <li key={badge.id} className="fr-badge" data-earned={has ? "yes" : "no"}>
                <span className="fr-badge-icon" aria-hidden="true">
                  {badge.icon}
                </span>
                <strong>{t(badge.title)}</strong>
                <span>{t(badge.text)}</span>
                <span className="fr-badge-state">{has ? t("Earned") : t("Not yet")}</span>
              </li>
            );
          })}
        </ul>
        <p className="hint">
          {t("Stronger Together needs {days} ticked steps between you and the friends who share their days.", { days: STRONGER_TOGETHER_DAYS })}
        </p>
      </section>

      <section className="card stack">
        <h2>{t("Privacy")}</h2>
        <ul>
          <li>{t("Friends are linked only by your invitation link. LifeZoi never shows you who joined, only how many.")}</li>
          <li>{t("The challenge steps are everyday habits. Nothing about your health is asked for or shared.")}</li>
          <li>{t("Deleting your account deletes your challenge and your badges.")}</li>
        </ul>
      </section>
    </div>
  );
}

function Heading() {
  const t = useT();
  return (
    <section className="fr-hero">
      <p className="kicker">{t("Invite a friend")}</p>
      <h1>{t("Healthy habits are easier together")}</h1>
      <p className="lede">
        {t("Send a friend your personal link, take the 7-day Together challenge side by side, and collect badges as you go.")}
      </p>
    </section>
  );
}
