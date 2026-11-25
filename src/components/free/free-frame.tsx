"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";
import { FREE_HUB } from "@/lib/free/hub";
import { FREE_NOTICE, type FreeSource } from "@/lib/free/sources";
import "./free.css";

/** Breadcrumb, title, the not-a-diagnosis notice, sources, related tools, and the invitation. */
export function FreeFrame({
  href,
  kicker,
  title,
  lead,
  sources,
  children,
}: {
  href: string;
  kicker: string;
  title: string;
  lead: string;
  sources: readonly FreeSource[];
  children: React.ReactNode;
}) {
  const t = useT();
  const related = FREE_HUB.filter((entry) => entry.href !== href && entry.group === "calculators");
  return (
    <article className="stack-lg narrow">
      <nav className="free-crumbs" aria-label={t("Breadcrumb")}>
        <Link href="/free">{t("Free tools")}</Link> › <span aria-current="page">{t(title)}</span>
      </nav>
      <header className="free-hero">
        <p className="kicker">{t(kicker)}</p>
        <h1>{t(title)}</h1>
        <p className="free-lead">{t(lead)}</p>
      </header>
      <p className="free-notice" role="note">
        {t(FREE_NOTICE)}
      </p>
      {children}
      <section className="card stack free-sources" aria-labelledby="free-sources-title">
        <h2 id="free-sources-title">{t("Where these numbers come from")}</h2>
        <ul>
          {sources.map((source) => (
            <li key={source.href}>
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
              {" — "}
              {source.publisher}
            </li>
          ))}
        </ul>
      </section>
      <FreeInvite />
      <section className="stack" aria-labelledby="free-related-title">
        <h2 id="free-related-title">{t("More free tools")}</h2>
        <div className="free-related">
          {related.map((entry) => (
            <Link key={entry.href} className="btn btn-secondary" href={entry.href}>
              <span aria-hidden="true">{entry.icon}</span> {t(entry.title)}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

/** A soft invitation to join. Members see a link to their own space instead. */
export function FreeInvite() {
  const t = useT();
  const account = useAccount();
  if (account.phase === "ready")
    return (
      <aside className="free-invite">
        <h2>{t("Keep track in your LifeZoi space")}</h2>
        <p>{t("Write your readings in the health diary, follow your daily plan, and see your progress over time.")}</p>
        <div className="actions">
          <Link className="btn btn-primary" href="/my-health/diary">
            {t("Open my health diary")}
          </Link>
          <Link className="btn btn-secondary" href="/">
            {t("Go to my space")}
          </Link>
        </div>
      </aside>
    );
  return (
    <aside className="free-invite">
      <h2>{t("Want to keep your results?")}</h2>
      <p>
        {t(
          "LifeZoi members keep a private health diary, get one small idea a day, and see their progress over time. Joining is by invitation: ask a member for a link, or use the invitation you received.",
        )}
      </p>
      <div className="actions">
        <Link className="btn btn-primary" href="/#invitation">
          {t("I have an invitation")}
        </Link>
        <Link className="btn btn-secondary" href="/sign-in">
          {t("Log in")}
        </Link>
      </div>
    </aside>
  );
}
