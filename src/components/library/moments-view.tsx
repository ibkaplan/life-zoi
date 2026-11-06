import Link from "next/link";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import { hardMoments, momentBySlug } from "@/lib/library/lessons";

export function MomentsIndex() {
  return (
    <div className="library stack-lg">
      <p className="kicker">Health Library</p>
      <h1>HAVING A HARD MOMENT?</h1>
      <p className="lede">
        Short, nonjudgmental notes. You can close the page. Nothing here is a score, a diagnosis, or a reason to be hard on yourself.
      </p>
      {hardMoments.map((moment) => (
        <Link key={moment.slug} className="card learn-link" href={`/library/moments/${moment.slug}`}>
          <h2>{moment.title}</h2>
          <p>{moment.body[0]}</p>
        </Link>
      ))}
    </div>
  );
}

export function MomentView({ slug }: { slug: string }) {
  const moment = momentBySlug(slug);
  if (!moment) return null;
  return (
    <article className="library stack-lg">
      <p className="kicker">Having a hard moment?</p>
      <h1>{moment.title}</h1>
      {moment.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <section className="card stack">
        <h2>One small next step</h2>
        <p>{moment.next}</p>
      </section>
      <ul>
        {moment.related.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
      <p>
        <Link href="/library/moments">All hard-moment guides</Link>
      </p>
    </article>
  );
}
