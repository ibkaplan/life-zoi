"use client";

import "@/components/feedback/feedback.css";
import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { useFeedbackBoard } from "@/components/feedback/client";
import { AnnouncementCard } from "@/components/feedback/cards";
import { StorageNote } from "@/components/feedback/storage-note";

/** You asked, we listened! Changes the team made because members asked for them. */
export function ListenedView() {
  const t = useT();
  const { state } = useFeedbackBoard();
  return (
    <div className="stack-lg fb">
      <section className="fb-hero fb-hero-slim fb-hero-gold">
        <div className="fb-hero-text">
          <p className="kicker">{t("Reviews & Feedback")}</p>
          <h1>{t("You asked, we listened!")}</h1>
          <p className="lede">{t("Your suggestions make a difference. Here is what we have added or improved because LifeZoi members asked for it.")}</p>
        </div>
      </section>
      {state.phase === "loading" ? <p className="fb-card" role="status">{t("Loading…")}</p> : null}
      {state.phase === "failed" ? <p className="fb-error" role="alert">{t(state.error)}</p> : null}
      {state.phase === "ready" ? (
        <>
          <StorageNote storage={state.board.storage} />
          {state.board.announcements.length > 0 ? (
            <div className="fb-announce-list">
              {state.board.announcements.map((item) => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <section className="fb-card fb-empty">
              <h2>{t("The first announcement is on its way")}</h2>
              <p>{t("When we add something because members asked for it, we will tell you here.")}</p>
              <Link className="btn btn-primary fb-btn" href="/feedback/suggest">{t("Share a suggestion")}</Link>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
