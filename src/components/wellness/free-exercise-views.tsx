"use client";

import { ListenToSteps } from "@/components/voice/read-aloud";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { msg, type Translate } from "@/lib/i18n/translate";
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

/** A short note, shown only outside English, that outside material is in English. */
function InEnglish({ text }: { text: string }) {
  const { locale } = useLocale();
  const t = useT();
  if (locale === "en") return null;
  return <span className="hint">{t(text)}</span>;
}

/** Guide lines built from a routine read "How much: …" and "An easier way: …". */
function guideLine(t: Translate, line: string): string {
  if (line.startsWith("How much: ")) return t("How much: {dose}", { dose: t(line.slice("How much: ".length)) });
  if (line.startsWith("An easier way: ")) return t("An easier way: {easier}", { easier: t(line.slice("An easier way: ".length)) });
  return t(line);
}

function SafetyBlock({ text }: { text: string }) {
  const t = useT();
  return (
    <aside className="free-safety" role="note">
      <h2>{t("Safety")}</h2>
      <p>{text}</p>
    </aside>
  );
}

export function FreeExerciseSection() {
  const t = useT();
  return (
    <section className="free-move" aria-labelledby="free-exercise-title">
      <p className="kicker">{t("Movement")}</p>
      <h2 id="free-exercise-title">{t(FREE_EXERCISE_TITLE)}</h2>
      <p>{t(FREE_EXERCISE_MESSAGE)}</p>
      <p className="free-brand">{t(BRAND_LINE)}</p>
      <div className="actions">
        <Link className="btn btn-primary" href="/academy/move/resources">
          {t("Open the resource center")}
        </Link>
        <Link className="btn btn-secondary" href="/academy/move/resources/guides">
          {t("Printable guides")}
        </Link>
        <Link className="btn btn-secondary" href="/academy/move/resources/videos">
          {t("Videos")}
        </Link>
      </div>
      <ul className="free-pills">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/academy/move/resources/categories/${category.slug}`}>{t(category.title)}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ResourceHub() {
  const t = useT();
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">{t("Movement")}</p>
      <h1>{t(FREE_EXERCISE_TITLE)}</h1>
      <p className="lede">{t(FREE_EXERCISE_MESSAGE)}</p>
      <p className="free-brand">{t(BRAND_LINE)}</p>
      <p>
        {t("The routines and printable guides were written for lifeZoi. Outside videos and pages stay on their own sites. lifeZoi does not sell them and does not add a download fee.")}
      </p>
      <SafetyBlock text={`${t(ASK_A_PROFESSIONAL)} ${t(NOT_TREATMENT)}`} />
      <div className="free-hub-grid">
        <Link className="card learn-link" href="/academy/move/resources/videos">
          <h2>{t("Videos and official pages")}</h2>
          <p>{t("National Institute on Aging, MedlinePlus, and CDC links. A player appears only when that office already allows one.")}</p>
        </Link>
        <Link className="card learn-link" href="/academy/move/resources/guides">
          <h2>{t("Printable guides")}</h2>
          <p>{t("Free lifeZoi PDFs with a cover, large type, a safety note, and a link back.")}</p>
        </Link>
        <Link className="card learn-link" href="/academy/move/resources/apps">
          <h2>{t("Free and low-cost exercise apps")}</h2>
          <p>{t("An optional directory. lifeZoi does not depend on an outside app.")}</p>
        </Link>
      </div>
      <section className="stack" aria-labelledby="routine-list">
        <h2 id="routine-list">{t("Original routines")}</h2>
        {routines.map((routine) => (
          <Link key={routine.slug} className="card learn-link" href={`/academy/move/resources/routines/${routine.slug}`}>
            <h3>{t(routine.title)}</h3>
            <p>{t(routine.summary)}</p>
          </Link>
        ))}
      </section>
      <section className="stack" aria-labelledby="category-list">
        <h2 id="category-list">{t("Categories")}</h2>
        {categories.map((category) => (
          <Link key={category.slug} className="card learn-link" href={`/academy/move/resources/categories/${category.slug}`}>
            <h3>{t(category.title)}</h3>
            <p>{t(category.intro)}</p>
          </Link>
        ))}
      </section>
      <p>
        <Link href="/academy/move">{t("Back to Movement")}</Link>
      </p>
    </div>
  );
}

export function CategoryPage({ slug }: { slug: string }) {
  const t = useT();
  const category = categoryBySlug(slug);
  if (!category) return null;
  const links = linksByIds(category.linkIds);
  const related = routines.filter((routine) => routine.categorySlug === category.slug);
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">{t("Free exercise resources")}</p>
      <h1>{t(category.title)}</h1>
      <p className="lede">{t(category.intro)}</p>
      <ListenToSteps title={t(category.title)} intro={t(category.intro)} steps={category.steps.map((step) => t(step))} closing={[t(category.safety)]} />
      <ol className="free-steps">
        {category.steps.map((step) => (
          <li key={step}>{t(step)}</li>
        ))}
      </ol>
      <SafetyBlock text={t(category.safety)} />
      {related.length > 0 ? (
        <div className="stack">
          {related.map((routine) => (
            <Link key={routine.slug} className="btn btn-primary" href={`/academy/move/resources/routines/${routine.slug}`}>
              {t("Open {title}", { title: t(routine.title) })}
            </Link>
          ))}
        </div>
      ) : null}
      <section className="stack" aria-labelledby="outside-links">
        <h2 id="outside-links">{t("Outside pages")}</h2>
        <p>
          {t("These links leave lifeZoi. The words on those sites belong to their publishers. Checked {date}.", { date: LINK_CHECKED })}{" "}
          <InEnglish text={msg("These pages are in English.")} />
        </p>
        <ul className="free-links">
          {links.map((link) => (
            <li key={link.id}>
              <OutLink href={link.url}>{link.title}</OutLink>
              <span>{link.source}</span>
            </li>
          ))}
        </ul>
      </section>
      <Link href="/academy/move/resources">{t("All free exercise resources")}</Link>
    </div>
  );
}

export function RoutinePage({ slug }: { slug: string }) {
  const t = useT();
  const routine = routineBySlug(slug);
  if (!routine) return null;
  const guide = guideForRoutine(routine);
  const links = linksByIds(routine.linkIds);
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">{t("Original lifeZoi routine")}</p>
      <h1>{t(routine.title)}</h1>
      <RoutineSketch kind={routine.sketch} />
      <p>{t(routine.summary)}</p>
      <p>
        <strong>{t("Time.")}</strong> {t(routine.minutes)}
      </p>
      {routine.moves.map((move) => (
        <section key={move.name} className="card stack">
          <h2>{t(move.name)}</h2>
          <p>{t(move.how)}</p>
          <p>
            <strong>{t("How much.")}</strong> {t(move.dose)}
          </p>
          <p>
            <strong>{t("An easier way.")}</strong> {t(move.easier)}
          </p>
        </section>
      ))}
      <SafetyBlock text={t(routine.safety)} />
      {guide ? (
        <div className="actions">
          <Link className="btn btn-primary" href={`/academy/move/resources/guides/${guide.slug}`}>
            {t("Preview and print the free PDF")}
          </Link>
        </div>
      ) : null}
      <InEnglish text={msg("These pages are in English.")} />
      <ul className="free-links">
        {links.map((link) => (
          <li key={link.id}>
            <OutLink href={link.url}>{link.title}</OutLink>
            <span>{link.source}</span>
          </li>
        ))}
      </ul>
      <Link href={`/academy/move/resources/categories/${routine.categorySlug}`}>{t("Category page")}</Link>
      <Link href="/academy/move/resources">{t("All free exercise resources")}</Link>
    </div>
  );
}

export function GuideActions({ slug, title }: { slug: string; title: string }) {
  const t = useT();
  const [status, setStatus] = useState("");
  async function share() {
    const url = window.location.href;
    const payload = { title, text: t("A free lifeZoi movement guide."), url };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        setStatus(t("Share opened."));
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus(t("Link copied."));
    } catch {
      setStatus(url);
    }
  }
  return (
    <div className="actions no-print">
      <a className="btn btn-primary" href={`/academy/move/resources/guides/${slug}/pdf`}>
        {t("Download PDF")}
      </a>
      <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
        {t("Print")}
      </button>
      <button className="btn btn-secondary" type="button" onClick={() => void share()}>
        {t("Share")}
      </button>
      {status ? <p role="status">{status}</p> : null}
    </div>
  );
}

export function GuideIndex() {
  const t = useT();
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">{t("Free exercise resources")}</p>
      <h1>{t("Printable guides")}</h1>
      <p className="lede">
        {t("Every guide is free. Open a preview, then download, print, or share it. There is no paid download.")}
      </p>
      {guides.map((guide) => (
        <Link key={guide.slug} className="card learn-link" href={`/academy/move/resources/guides/${guide.slug}`}>
          <h2>{t(guide.title)}</h2>
          <p>{t(guide.summary)}</p>
        </Link>
      ))}
      <Link href="/academy/move/resources">{t("All free exercise resources")}</Link>
    </div>
  );
}

export function GuidePreview({ slug }: { slug: string }) {
  const t = useT();
  const guide = guideBySlug(slug);
  if (!guide) return null;
  return (
    <article className="learn free-guide stack-lg">
      <p className="kicker no-print">{t("Preview")}</p>
      <p className="free-brand">{t(BRAND_LINE)}</p>
      <h1>{t(guide.title)}</h1>
      <p>{t("LifeZoi free guide. The PDF uses these same words.")}</p>
      {guide.sketch ? <RoutineSketch kind={guide.sketch} /> : null}
      <p className="lede">{t(guide.summary)}</p>
      <GuideActions slug={guide.slug} title={t(guide.title)} />
      <SafetyBlock text={t(guide.safety)} />
      {guide.sections.map((section) => (
        <section key={section.heading} className="stack">
          <h2>{t(section.heading)}</h2>
          {section.lines.map((line) => (
            <p key={line}>{guideLine(t, line)}</p>
          ))}
        </section>
      ))}
      <section className="stack">
        <h2>{t("Sources")}</h2>
        <InEnglish text={msg("Outside sources are in English.")} />
        <ul className="free-links">
          {guide.links.map((link) => (
            <li key={link.url}>
              {insideLifeZoi(link.url) ? (
                <Link href={insideLifeZoi(link.url) ?? "/"}>{t(link.label)}</Link>
              ) : (
                <OutLink href={link.url}>{link.label}</OutLink>
              )}
              <span>{link.source}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="no-print">
        <Link href="/academy/move/resources/guides">{t("All printable guides")}</Link>
      </p>
    </article>
  );
}

export function VideoDirectory() {
  const t = useT();
  const items = resolvedVideos();
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">{t("Free exercise resources")}</p>
      <h1>{t("Videos and official pages")}</h1>
      <p className="lede">
        {t("Players appear only for National Institute on Aging films whose YouTube player is allowed. Every other item is a link. If a player does not load, use the original page. lifeZoi does not host the video file.")}
      </p>
      {videoGroups.map((group) => (
        <section key={group.id} className="stack" aria-labelledby={`video-${group.id}`}>
          <h2 id={`video-${group.id}`}>{t(group.title)}</h2>
          {items
            .filter((item) => item.group === group.id)
            .map((item) => (
              <article key={item.id} className="card stack">
                <h3>{item.title}</h3>
                <p>
                  {item.source} <InEnglish text={msg("In English.")} />
                </p>
                {item.duration ? (
                  <p>
                    <strong>{t("Duration.")}</strong> {t(item.duration)}
                  </p>
                ) : null}
                <p>{t(item.description)}</p>
                <p>
                  <OutLink href={item.url}>{t("Original page")}</OutLink>
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
      <Link href="/academy/move/resources">{t("All free exercise resources")}</Link>
    </div>
  );
}

export function AppDirectory() {
  const t = useT();
  return (
    <div className="learn free-guide stack-lg">
      <p className="kicker">{t("Free exercise resources")}</p>
      <h1>{t("FREE AND LOW-COST EXERCISE APPS")}</h1>
      <p className="lede">
        {t("This directory is optional. A free download is not the same as fully free functionality. lifeZoi does not depend on any app listed here.")}
      </p>
      {exerciseApps.map((app) => {
        const link = linkById(app.linkId);
        return (
          <article key={app.id} className="card stack">
            <h2>{link.title}</h2>
            <p>{t(app.summary)}</p>
            <p>
              <OutLink href={link.url}>{link.title}</OutLink>
            </p>
            <p>
              {t("{source}. Checked {date}.", { source: link.source, date: LINK_CHECKED })} <InEnglish text={msg("The app and its site are in English.")} />
            </p>
          </article>
        );
      })}
      <Link href="/academy/move/resources">{t("All free exercise resources")}</Link>
    </div>
  );
}
