"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import { hardMoments, momentBySlug } from "@/lib/library/lessons";

export function MomentsIndex() {
  const t = useT();
  return (
    <div className="library stack-lg">
      <p className="kicker">{t("Health Library")}</p>
      <h1>{t("HAVING A HARD MOMENT?")}</h1>
      <p className="lede">
        {t("Short, nonjudgmental notes. You can close the page. Nothing here is a score, a diagnosis, or a reason to be hard on yourself.")}
      </p>
      {hardMoments.map((moment) => (
        <Link key={moment.slug} className="card learn-link" href={`/library/moments/${moment.slug}`}>
          <h2>{t(moment.title)}</h2>
          <p>{t(moment.body[0])}</p>
        </Link>
      ))}
    </div>
  );
}

export function MomentView({ slug }: { slug: string }) {
  const t = useT();
  const moment = momentBySlug(slug);
  if (!moment) return null;
  return (
    <article className="library stack-lg">
      <p className="kicker">{t("Having a hard moment?")}</p>
      <h1>{t(moment.title)}</h1>
      {moment.body.map((paragraph) => (
        <p key={paragraph}>{t(paragraph)}</p>
      ))}
      <section className="card stack">
        <h2>{t("One small next step")}</h2>
        <p>{t(moment.next)}</p>
      </section>
      <ul>
        {moment.related.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{t(link.label)}</Link>
          </li>
        ))}
      </ul>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
      <p>
        <Link href="/library/moments">{t("All hard-moment guides")}</Link>
      </p>
    </article>
  );
}
