"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { RoutineSketch } from "@/components/wellness/free-exercise-sketches";
import { exerciseApps } from "@/lib/wellness/exercise-resources/apps";
import { categories, categoryBySlug } from "@/lib/wellness/exercise-resources/categories";
import {
  ASK_A_PROFESSIONAL,
  BRAND_LINE,
  FREE_EXERCISE_MESSAGE,
  FREE_EXERCISE_TITLE,
  LIFEZOI_ORIGIN,
  LINK_CHECKED,
  NOT_TREATMENT,
} from "@/lib/wellness/exercise-resources/copy";
import { guideBySlug, guideForRoutine, guides } from "@/lib/wellness/exercise-resources/guides";
import { linkById, linksByIds } from "@/lib/wellness/exercise-resources/links";
import { routineBySlug, routines } from "@/lib/wellness/exercise-resources/routines";
import { resolvedVideos, videoGroups } from "@/lib/wellness/exercise-resources/videos";

function insideLifeZoi(url: string): string | null {
  if (!url.startsWith(LIFEZOI_ORIGIN)) return null;
  return url.slice(LIFEZOI_ORIGIN.length) || "/";
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="free-url" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function SafetyBlock({ text }: { text: string }) {
  return (
    <aside className="free-safety" role="note">
      <h2>Safety</h2>
      <p>{text}</p>
    </aside>
  );
}

export function FreeExerciseSection() {
  return (
    <section className="free-move" aria-labelledby="free-exercise-title">
      <p className="kicker">Movement</p>
      <h2 id="free-exercise-title">{FREE_EXERCISE_TITLE}</h2>
      <p>{FREE_EXERCISE_MESSAGE}</p>
      <p className="free-brand">{BRAND_LINE}</p>
      <div className="actions">
        <Link className="btn btn-primary" href="/academy/move/resources">
          Open the resource center
        </Link>
        <Link className="btn btn-secondary" href="/academy/move/resources/guides">
          Printable guides
        </Link>
        <Link className="btn btn-secondary" href="/academy/move/resources/videos">
          Videos
        </Link>
      </div>
      <ul className="free-pills">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/academy/move/resources/categories/${category.slug}`}>{category.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResourceHub() {
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">Movement</p>
      <h1>{FREE_EXERCISE_TITLE}</h1>
      <p className="lede">{FREE_EXERCISE_MESSAGE}</p>
      <p className="free-brand">{BRAND_LINE}</p>
      <p>
        The routines and printable guides were written for lifeZoi. Outside videos and pages stay on their own sites.
        lifeZoi does not sell them and does not add a download fee.
      </p>
      <SafetyBlock text={`${ASK_A_PROFESSIONAL} ${NOT_TREATMENT}`} />
      <div className="free-hub-grid">
        <Link className="card learn-link" href="/academy/move/resources/videos">
          <h2>Videos and official pages</h2>
          <p>National Institute on Aging, MedlinePlus, and CDC links. A player appears only when that office already allows one.</p>
        </Link>
        <Link className="card learn-link" href="/academy/move/resources/guides">
          <h2>Printable guides</h2>
          <p>Free lifeZoi PDFs with a cover, large type, a safety note, and a link back.</p>
        </Link>
        <Link className="card learn-link" href="/academy/move/resources/apps">
          <h2>Free and low-cost exercise apps</h2>
          <p>An optional directory. lifeZoi does not depend on an outside app.</p>
        </Link>
      </div>
      <section className="stack" aria-labelledby="routine-list">
        <h2 id="routine-list">Original routines</h2>
        {routines.map((routine) => (
          <Link key={routine.slug} className="card learn-link" href={`/academy/move/resources/routines/${routine.slug}`}>
            <h3>{routine.title}</h3>
            <p>{routine.summary}</p>
          </Link>
        ))}
      </section>
      <section className="stack" aria-labelledby="category-list">
        <h2 id="category-list">Categories</h2>
        {categories.map((category) => (
          <Link key={category.slug} className="card learn-link" href={`/academy/move/resources/categories/${category.slug}`}>
            <h3>{category.title}</h3>
            <p>{category.intro}</p>
          </Link>
        ))}
      </section>
      <p>
        <Link href="/academy/move">Back to Movement</Link>
      </p>
    </div>
  );
}

export function CategoryPage({ slug }: { slug: string }) {
  const category = categoryBySlug(slug);
  if (!category) return null;
  const links = linksByIds(category.linkIds);
  const related = routines.filter((routine) => routine.categorySlug === category.slug);
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">Free exercise resources</p>
      <h1>{category.title}</h1>
      <p className="lede">{category.intro}</p>
      <ol className="free-steps">
        {category.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <SafetyBlock text={category.safety} />
      {related.length > 0 ? (
        <div className="stack">
          {related.map((routine) => (
            <Link key={routine.slug} className="btn btn-primary" href={`/academy/move/resources/routines/${routine.slug}`}>
              Open {routine.title}
            </Link>
          ))}
        </div>
      ) : null}
      <section className="stack" aria-labelledby="outside-links">
        <h2 id="outside-links">Outside pages</h2>
        <p>These links leave lifeZoi. The words on those sites belong to their publishers. Checked {LINK_CHECKED}.</p>
        <ul className="free-links">
          {links.map((link) => (
            <li key={link.id}>
              <OutLink href={link.url}>{link.title}</OutLink>
              <span>{link.source}</span>
            </li>
          ))}
        </ul>
      </section>
      <Link href="/academy/move/resources">All free exercise resources</Link>
    </div>
  );
}

export function RoutinePage({ slug }: { slug: string }) {
  const routine = routineBySlug(slug);
  if (!routine) return null;
  const guide = guideForRoutine(routine);
  const links = linksByIds(routine.linkIds);
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">Original lifeZoi routine</p>
      <h1>{routine.title}</h1>
      <RoutineSketch kind={routine.sketch} />
      <p>{routine.summary}</p>
      <p>
        <strong>Time.</strong> {routine.minutes}
      </p>
      {routine.moves.map((move) => (
        <section key={move.name} className="card stack">
          <h2>{move.name}</h2>
          <p>{move.how}</p>
          <p>
            <strong>How much.</strong> {move.dose}
          </p>
          <p>
            <strong>An easier way.</strong> {move.easier}
          </p>
        </section>
      ))}
      <SafetyBlock text={routine.safety} />
      {guide ? (
        <div className="actions">
          <Link className="btn btn-primary" href={`/academy/move/resources/guides/${guide.slug}`}>
            Preview and print the free PDF
          </Link>
        </div>
      ) : null}
      <ul className="free-links">
        {links.map((link) => (
          <li key={link.id}>
            <OutLink href={link.url}>{link.title}</OutLink>
            <span>{link.source}</span>
          </li>
        ))}
      </ul>
      <Link href={`/academy/move/resources/categories/${routine.categorySlug}`}>Category page</Link>
      <Link href="/academy/move/resources">All free exercise resources</Link>
    </div>
  );
}

export function GuideActions({ slug, title }: { slug: string; title: string }) {
  const [status, setStatus] = useState("");
  async function share() {
    const url = window.location.href;
    const payload = { title, text: "A free lifeZoi movement guide.", url };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        setStatus("Share opened.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      setStatus(url);
    }
  }
  return (
    <div className="actions no-print">
      <a className="btn btn-primary" href={`/academy/move/resources/guides/${slug}/pdf`}>
        Download PDF
      </a>
      <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
        Print
      </button>
      <button className="btn btn-secondary" type="button" onClick={() => void share()}>
        Share
      </button>
      {status ? <p role="status">{status}</p> : null}
    </div>
  );
}

export function GuideIndex() {
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">Free exercise resources</p>
      <h1>Printable guides</h1>
      <p className="lede">
        Every guide is free. Open a preview, then download, print, or share it. There is no paid download.
      </p>
      {guides.map((guide) => (
        <Link key={guide.slug} className="card learn-link" href={`/academy/move/resources/guides/${guide.slug}`}>
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
        </Link>
      ))}
      <Link href="/academy/move/resources">All free exercise resources</Link>
    </div>
  );
}

export function GuidePreview({ slug }: { slug: string }) {
  const guide = guideBySlug(slug);
  if (!guide) return null;
  return (
    <article className="learn free-guide stack-lg">
      <p className="kicker no-print">Preview</p>
      <p className="free-brand">{BRAND_LINE}</p>
      <h1>{guide.title}</h1>
      <p>LifeZoi free guide. The PDF uses these same words.</p>
      {guide.sketch ? <RoutineSketch kind={guide.sketch} /> : null}
      <p className="lede">{guide.summary}</p>
      <GuideActions slug={guide.slug} title={guide.title} />
      <SafetyBlock text={guide.safety} />
      {guide.sections.map((section) => (
        <section key={section.heading} className="stack">
          <h2>{section.heading}</h2>
          {section.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      ))}
      <section className="stack">
        <h2>Sources</h2>
        <ul className="free-links">
          {guide.links.map((link) => (
            <li key={link.url}>
              {insideLifeZoi(link.url) ? (
                <Link href={insideLifeZoi(link.url) ?? "/"}>{link.label}</Link>
              ) : (
                <OutLink href={link.url}>{link.label}</OutLink>
              )}
              <span>{link.source}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="no-print">
        <Link href="/academy/move/resources/guides">All printable guides</Link>
      </p>
    </article>
  );
}

export function VideoDirectory() {
  const items = resolvedVideos();
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">Free exercise resources</p>
      <h1>Videos and official pages</h1>
      <p className="lede">
        Players appear only for National Institute on Aging films whose YouTube player is allowed. Every other item is a link.
        If a player does not load, use the original page. lifeZoi does not host the video file.
      </p>
      {videoGroups.map((group) => (
        <section key={group.id} className="stack" aria-labelledby={`video-${group.id}`}>
          <h2 id={`video-${group.id}`}>{group.title}</h2>
          {items
            .filter((item) => item.group === group.id)
            .map((item) => (
              <article key={item.id} className="card stack">
                <h3>{item.title}</h3>
                <p>{item.source}</p>
                {item.duration ? (
                  <p>
                    <strong>Duration.</strong> {item.duration}
                  </p>
                ) : null}
                <p>{item.description}</p>
                <p>
                  <OutLink href={item.url}>Original page</OutLink>
                </p>
                {item.embedSrc ? (
                  <div className="video-frame">
                    <iframe
                      src={item.embedSrc}
                      title={item.title}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : null}
              </article>
            ))}
        </section>
      ))}
      <Link href="/academy/move/resources">All free exercise resources</Link>
    </div>
  );
}

export function AppDirectory() {
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">Free exercise resources</p>
      <h1>FREE AND LOW-COST EXERCISE APPS</h1>
      <p className="lede">
        This directory is optional. A free download is not the same as fully free functionality. lifeZoi does not depend on any app listed here.
      </p>
      {exerciseApps.map((app) => {
        const link = linkById(app.linkId);
        return (
          <article key={app.id} className="card stack">
            <h2>{link.title}</h2>
            <p>{app.summary}</p>
            <p>
              <OutLink href={link.url}>{link.title}</OutLink>
            </p>
            <p>{link.source}. Checked {LINK_CHECKED}.</p>
          </article>
        );
      })}
      <Link href="/academy/move/resources">All free exercise resources</Link>
    </div>
  );
}
