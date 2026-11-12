"use client";

import Link from "next/link";
import { useMessages } from "@/components/locale-provider";
import { navLabel } from "@/lib/i18n/nav";
import { NAV_SECTIONS } from "@/lib/navigation";

/** The My Health section page: links to the existing health pages, nothing new is measured here. */
export function MyHealthView() {
  const m = useMessages();
  const h = m.myHealth;
  const pages = NAV_SECTIONS.find((section) => section.key === "myHealth")?.pages.filter((page) => page.href !== "/my-health") ?? [];
  const cards = h.cards as Record<string, string>;

  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">{h.kicker}</p>
        <h1>{h.title}</h1>
        <p className="lede">{h.intro}</p>
      </section>
      <ul className="section-hub">
        {pages.map((page, index) => (
          <li key={page.href}>
            <Link className="section-hub-card" href={page.href}>
              <span className="section-hub-step" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{navLabel(m, page)}</strong>
              {cards[page.href] ? <span>{cards[page.href]}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link className="btn btn-secondary" href="/dashboard">
          {h.back}
        </Link>
      </p>
    </div>
  );
}
