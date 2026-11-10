"use client";

import Link from "next/link";
import { useState } from "react";
import { FavoriteButton, RatingControl, SaveNote, VideoPlayer } from "@/components/companion/shared";
import { MovementFinder, MovementPreferences } from "@/components/companion/movement-finder";
import { useProfile } from "@/components/companion/use-profile";
import { useLocale, useT } from "@/components/locale-provider";
import { ChairYogaBanner } from "@/components/wellness/movement-studio-views";
import { useAccount } from "@/lib/account-store";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import { msg, type Translate } from "@/lib/i18n/translate";
import { COST_TEXT, reviewQueue, SOURCES, VIDEOS, visibleVideos, type VideoItem } from "@/lib/wellness-library/catalog";
import { CATEGORY_INFO, LIBRARY_CATEGORIES, type LibraryCategory } from "@/lib/wellness-library/moves";

/** Same output as formatTimestamp in English, in the chosen language otherwise. */
function shownTimestamp(iso: string, locale: Locale, t: Translate): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return t("Unknown date");
  const tag = locale === "en" ? "en-US" : LOCALE_META[locale].htmlLang;
  return new Intl.DateTimeFormat(tag, { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

const APPROVAL_TEXT: Record<string, string> = {
  approved: msg("approved"),
  pending: msg("pending"),
  rejected: msg("rejected"),
};

const LEVEL_TEXT: Record<string, string> = {
  beginner: msg("beginner"),
  intermediate: msg("intermediate"),
  advanced: msg("advanced"),
};

/** Review notes are built in English; the one with an id inside is rebuilt here. */
function shownProblem(problem: string, t: Translate): string {
  const same = /^Same video as (.+)\.$/.exec(problem);
  return same ? t("Same video as {id}.", { id: same[1] ?? "" }) : t(problem);
}

export function WellnessLibraryView() {
  const { t, locale } = useLocale();
  const { ready, companion } = useProfile();
  const [category, setCategory] = useState<LibraryCategory>("pilates");
  if (!ready) return <p className="hint">{t("Loading the library…")}</p>;
  const videos = visibleVideos();
  const inCategory = videos.filter((video) => video.category === category);
  const byId = new Map(VIDEOS.map((video) => [`video:${video.id}`, video]));
  const favorites = companion.media.favorites.map((id) => byId.get(id)).filter((video): video is VideoItem => Boolean(video));
  const recent = companion.media.recent
    .filter((item) => item.id.startsWith("video:") || item.id.startsWith("session:"))
    .slice(0, 6);
  const info = CATEGORY_INFO[category];
  return (
    <div className="stack-lg">
      <div className="lz-hello">
        <p className="kicker">
          {t("Movement")} · {t("Wellness Library")}
        </p>
        <h1>{t("Wellness Library")}</h1>
        <p>{t("Choose an activity and how long you have. Your session plays right here.")}</p>
        <p className="hint">
          {t("Suggestions follow your level, experience, mobility, and any limits you reported. Age alone never makes a session harder.")}
        </p>
      </div>
      <SaveNote />
      <ChairYogaBanner />
      <div className="lz-tabs" role="group" aria-label={t("Library category")}>
        {LIBRARY_CATEGORIES.map((value) => (
          <button key={value} type="button" className="lz-tab" aria-pressed={value === category} onClick={() => setCategory(value)}>
            {t(CATEGORY_INFO[value].title)}
          </button>
        ))}
      </div>
      <section className="card stack">
        <h2>{t(info.title)}</h2>
        <p>{t(info.summary)}</p>
        {category === "brain-training" ? (
          <div className="stack">
            <p>{t("Brain games live in the Brain & Habit Quiz section. They are for enjoyment and focus, not a medical or cognitive test.")}</p>
            <div className="lz-buttons">
              <Link className="btn btn-primary" href="/brain-quiz/games">
                {t("Open brain games")}
              </Link>
              <Link className="btn btn-secondary" href="/brain-quiz">
                {t("Brain & Habit Quiz")}
              </Link>
            </div>
          </div>
        ) : (
          <MovementFinder key={category} activityId={`library-${category}`} initialCategory={category} choices={[category]} compact />
        )}
        {inCategory.length > 0 ? (
          <details>
            <summary>
              {t("{category} videos in the catalog ({count})", { category: t(info.title), count: inCategory.length })}
            </summary>
            <div className="lz-grid">
              {inCategory.map((video) => (
                <article key={video.id} className="lz-card">
                  <h3>{video.title}</h3>
                  <p>{t(video.description)}</p>
                  <VideoPlayer video={video} />
                  <RatingControl id={`video:${video.id}`} />
                  <FavoriteButton id={`video:${video.id}`} label={msg("this video")} />
                </article>
              ))}
            </div>
          </details>
        ) : category !== "brain-training" ? (
          <p className="hint">
            {t(
              "No approved {category} video is in the catalog yet, so LifeZoi's own guided session is shown. New videos appear here after an administrator approves them.",
              { category: t(info.title).toLocaleLowerCase(LOCALE_META[locale].htmlLang) },
            )}
          </p>
        ) : null}
      </section>
      <MovementPreferences />
      {favorites.length > 0 ? (
        <section className="card stack">
          <h2>{t("My favorite videos")}</h2>
          <div className="lz-grid">
            {favorites.map((video) => (
              <article key={video.id} className="lz-card">
                <h3>{video.title}</h3>
                <VideoPlayer video={video} />
                <FavoriteButton id={`video:${video.id}`} label={msg("this video")} />
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {recent.length > 0 ? (
        <section className="card stack">
          <h2>{t("Recently watched")}</h2>
          <ul className="record-list">
            {recent.map((item) => {
              const video = byId.get(item.id);
              const label = video
                ? video.title
                : item.id.startsWith("session:")
                  ? t("LifeZoi session ({details} min)", { details: item.id.split("-").slice(1, 3).join(", ") })
                  : item.id;
              return (
                <li key={item.id}>
                  <strong>{label}</strong> · {shownTimestamp(item.at, locale, t)}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <p className="hint">
        <Link href="/academy/move/library/manage">{t("Content sources and approvals")}</Link>
      </p>
    </div>
  );
}

/** Read-only management view: sources, approval status, and items that need checking. */
export function LibraryManageView() {
  const t = useT();
  const account = useAccount();
  const queue = reviewQueue();
  const [checkBefore, checkAfter = ""] = t(
    "Availability and embedding are checked with {command}, which uses YouTube's public oEmbed endpoint and needs no key.",
  ).split("{command}");
  return (
    <div className="stack-lg">
      <div>
        <p className="kicker">{t("Wellness Library")}</p>
        <h1>{t("Content sources and approvals")}</h1>
        <p className="lede">
          {t("New sources and videos start as pending and are not shown to members. An administrator approves them in a reviewed change to the catalog file.")}{" "}
          {checkBefore}
          <code>npm run check:library</code>
          {checkAfter}
        </p>
        {account.isAdmin ? (
          <p className="alert alert-ok">{t("You are signed in as the administrator.")}</p>
        ) : (
          <p className="hint">{t("Approval changes are made by an administrator.")}</p>
        )}
      </div>
      <section className="card stack">
        <h2>{t("Sources")}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Source")}</th>
                <th>{t("Status")}</th>
                <th>{t("Cost")}</th>
                <th>{t("Last check")}</th>
                <th>{t("Notes")}</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((source) => (
                <tr key={source.id}>
                  <td>
                    {source.homepage.startsWith("http") ? (
                      <a href={source.homepage} target="_blank" rel="noopener noreferrer">
                        {t(source.name)}
                      </a>
                    ) : (
                      t(source.name)
                    )}
                  </td>
                  <td>{t(APPROVAL_TEXT[source.approval] ?? source.approval)}</td>
                  <td>{t(COST_TEXT[source.cost])}</td>
                  <td>{source.lastChecked || t("Never")}</td>
                  <td>{t(source.notes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card stack">
        <h2>{t("Needs a person ({count})", { count: queue.length })}</h2>
        <ul className="record-list">
          {queue.map((issue, index) => (
            <li key={`${issue.id}-${index}`}>
              <strong>{issue.id}</strong>: {shownProblem(issue.problem, t)}
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>{t("Catalog ({count} videos)", { count: VIDEOS.length })}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("Title")}</th>
                <th>{t("Category")}</th>
                <th>{t("Level")}</th>
                <th>{t("Length")}</th>
                <th>{t("Approval")}</th>
                <th>{t("Cost")}</th>
              </tr>
            </thead>
            <tbody>
              {VIDEOS.map((video) => (
                <tr key={video.id}>
                  <td>{video.title}</td>
                  <td>{t(CATEGORY_INFO[video.category].title)}</td>
                  <td>{t(LEVEL_TEXT[video.level] ?? video.level)}</td>
                  <td>
                    {video.durationSeconds === null
                      ? t("Not checked")
                      : t("{minutes} min", { minutes: Math.round(video.durationSeconds / 60) })}
                  </td>
                  <td>{t(APPROVAL_TEXT[video.approval] ?? video.approval)}</td>
                  <td>{t(COST_TEXT[video.cost])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
