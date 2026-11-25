"use client";

import Link from "next/link";
import "@/components/friends/friends.css";
import { useT } from "@/components/locale-provider";

/** A short card that points to Invite a friend from My Profile and Get started. */
export function FriendsTeaser() {
  const t = useT();
  return (
    <section className="card fr-teaser">
      <h2>
        <span aria-hidden="true">💌 </span>
        {t("Invite a friend")}
      </h2>
      <p>{t("Share your personal link, take the 7-day Together challenge, and both of you earn a badge when your friend joins.")}</p>
      <p>
        <Link className="btn btn-primary" href="/friends">
          {t("Invite a friend")}
        </Link>
      </p>
    </section>
  );
}
