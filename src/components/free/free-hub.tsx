"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { HUB_GROUPS, hubGroup, type HubEntry } from "@/lib/free/hub";
import { FREE_NOTICE } from "@/lib/free/sources";
import { FreeInvite } from "./free-frame";
import "./free.css";

/** Cards for free tools. Used on the /free hub and on the public landing page. */
export function FreeCards({ entries, headingLevel = 3 }: { entries: readonly HubEntry[]; headingLevel?: 2 | 3 }) {
  const t = useT();
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="free-grid">
      {entries.map((entry) => (
        <Link key={entry.href} className="free-card" href={entry.href}>
          <span className="free-card-icon" aria-hidden="true">
            {entry.icon}
          </span>
          <Heading>{t(entry.title)}</Heading>
          <p>{t(entry.summary)}</p>
          <span className="free-card-go">{t("Open")} →</span>
        </Link>
      ))}
    </div>
  );
}

export function FreeHub() {
  const t = useT();
  return (
    <article className="stack-lg">
      <header className="free-hero">
        <p className="kicker">{t("Free for everyone")}</p>
        <h1>{t("Free health tools")}</h1>
        <p className="free-lead">{t("Quick calculators and guides you can use without an account. Each one shows where its numbers come from.")}</p>
      </header>
      <p className="free-notice" role="note">
        {t(FREE_NOTICE)}
      </p>
      {HUB_GROUPS.map((group) => {
        const entries = hubGroup(group.key);
        if (entries.length === 0) return null;
        return (
          <section key={group.key} className="stack" aria-labelledby={`free-group-${group.key}`}>
            <h2 id={`free-group-${group.key}`}>{t(group.title)}</h2>
            <FreeCards entries={entries} />
          </section>
        );
      })}
      <FreeInvite />
    </article>
  );
}
