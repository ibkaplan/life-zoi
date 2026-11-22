"use client";

import "@/components/feedback/feedback.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/components/locale-provider";
import { noteVisit, readInvite, shouldInvite, snooze, writeInvite } from "@/lib/feedback/invitation";
import type { FeedbackBoard } from "@/lib/feedback/types";

/**
 * A polite, optional invitation on the Dashboard. It appears only after a member
 * has used LifeZoi on a few days, never after they left a review, and "Maybe later"
 * hides it for a month (twice at most). It never blocks the page.
 */
export function ReviewInvitation() {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const now = new Date();
    const record = noteVisit(readInvite(now), now);
    writeInvite(record);
    if (!shouldInvite(record, now, false)) return;
    const controller = new AbortController();
    // Ask the server too, so a review sent from another device also stops the invitation.
    fetch("/api/feedback", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const board = (await response.json()) as FeedbackBoard;
        if (shouldInvite(record, now, board.ownReview !== null)) setShow(true);
        else if (board.ownReview) writeInvite({ ...record, sent: true });
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  if (!show) return null;

  return (
    <aside className="fb-invite" aria-labelledby="fb-invite-title">
      <span className="fb-invite-stars" aria-hidden="true">★★★★★</span>
      <div className="fb-invite-text">
        <p id="fb-invite-title" className="fb-invite-title">{t("We hope you're enjoying LifeZoi! Would you like to share your experience?")}</p>
        <p className="hint">{t("It is optional and takes about two minutes.")}</p>
      </div>
      <div className="actions">
        <Link className="btn btn-primary fb-btn" href="/feedback#fb-form-title" onClick={() => setShow(false)}>
          {t("Leave a Review")}
        </Link>
        <button
          type="button"
          className="btn btn-secondary fb-btn"
          onClick={() => {
            const now = new Date();
            writeInvite(snooze(readInvite(now), now));
            setShow(false);
          }}
        >
          {t("Maybe Later")}
        </button>
      </div>
    </aside>
  );
}
