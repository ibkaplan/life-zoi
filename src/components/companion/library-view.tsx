"use client";

import Link from "next/link";
import { useState } from "react";
import { FavoriteButton, RatingControl, SaveNote, VideoPlayer } from "@/components/companion/shared";
import { MovementFinder, MovementPreferences } from "@/components/companion/movement-finder";
import { useProfile } from "@/components/companion/use-profile";
import { ChairYogaBanner } from "@/components/wellness/movement-studio-views";
import { useAccount } from "@/lib/account-store";
import { formatTimestamp } from "@/lib/dates";
import { COST_TEXT, reviewQueue, SOURCES, VIDEOS, visibleVideos, type VideoItem } from "@/lib/wellness-library/catalog";
import { CATEGORY_INFO, LIBRARY_CATEGORIES, type LibraryCategory } from "@/lib/wellness-library/moves";

export function WellnessLibraryView() {
  const { ready, companion } = useProfile();
  const [category, setCategory] = useState<LibraryCategory>("pilates");
  if (!ready) return <p className="hint">Loading the library…</p>;
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
        <p className="kicker">Movement · Wellness Library</p>
        <h1>Wellness Library</h1>
        <p>Choose an activity and how long you have. Your session plays right here.</p>
        <p className="hint">Suggestions follow your level, experience, mobility, and any limits you reported. Age alone never makes a session harder.</p>
      </div>
      <SaveNote />
      <ChairYogaBanner />
      <div className="lz-tabs" role="group" aria-label="Library category">
        {LIBRARY_CATEGORIES.map((value) => (
          <button key={value} type="button" className="lz-tab" aria-pressed={value === category} onClick={() => setCategory(value)}>
            {CATEGORY_INFO[value].title}
          </button>
        ))}
      </div>
      <section className="card stack">
        <h2>{info.title}</h2>
        <p>{info.summary}</p>
        {category === "brain-training" ? (
          <div className="stack">
            <p>Brain games live in the Brain &amp; Habit Quiz section. They are for enjoyment and focus, not a medical or cognitive test.</p>
            <div className="lz-buttons">
              <Link className="btn btn-primary" href="/brain-quiz/games">
                Open brain games
              </Link>
              <Link className="btn btn-secondary" href="/brain-quiz">
                Brain &amp; Habit Quiz
              </Link>
            </div>
          </div>
        ) : (
          <MovementFinder key={category} activityId={`library-${category}`} initialCategory={category} choices={[category]} compact />
        )}
        {inCategory.length > 0 ? (
          <details>
            <summary>
              {info.title} videos in the catalog ({inCategory.length})
            </summary>
            <div className="lz-grid">
              {inCategory.map((video) => (
                <article key={video.id} className="lz-card">
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                  <VideoPlayer video={video} />
                  <RatingControl id={`video:${video.id}`} />
                  <FavoriteButton id={`video:${video.id}`} label="this video" />
                </article>
              ))}
            </div>
          </details>
        ) : category !== "brain-training" ? (
          <p className="hint">No approved {info.title.toLowerCase()} video is in the catalog yet, so LifeZoi&apos;s own guided session is shown. New videos appear here after an administrator approves them.</p>
        ) : null}
      </section>
      <MovementPreferences />
      {favorites.length > 0 ? (
        <section className="card stack">
          <h2>My favorite videos</h2>
          <div className="lz-grid">
            {favorites.map((video) => (
              <article key={video.id} className="lz-card">
                <h3>{video.title}</h3>
                <VideoPlayer video={video} />
                <FavoriteButton id={`video:${video.id}`} label="this video" />
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {recent.length > 0 ? (
        <section className="card stack">
          <h2>Recently watched</h2>
          <ul className="record-list">
            {recent.map((item) => {
              const video = byId.get(item.id);
              const label = video ? video.title : item.id.startsWith("session:") ? `LifeZoi session (${item.id.split("-").slice(1, 3).join(", ")} min)` : item.id;
              return (
                <li key={item.id}>
                  <strong>{label}</strong> · {formatTimestamp(item.at)}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <p className="hint">
        <Link href="/academy/move/library/manage">Content sources and approvals</Link>
      </p>
    </div>
  );
}

/** Read-only management view: sources, approval status, and items that need checking. */
export function LibraryManageView() {
  const account = useAccount();
  const queue = reviewQueue();
  return (
    <div className="stack-lg">
      <div>
        <p className="kicker">Wellness Library</p>
        <h1>Content sources and approvals</h1>
        <p className="lede">
          New sources and videos start as pending and are not shown to members. An administrator approves them in a reviewed change to the catalog file.
          Availability and embedding are checked with <code>npm run check:library</code>, which uses YouTube&apos;s public oEmbed endpoint and needs no key.
        </p>
        {account.isAdmin ? <p className="alert alert-ok">You are signed in as the administrator.</p> : <p className="hint">Approval changes are made by an administrator.</p>}
      </div>
      <section className="card stack">
        <h2>Sources</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Last check</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((source) => (
                <tr key={source.id}>
                  <td>
                    {source.homepage.startsWith("http") ? (
                      <a href={source.homepage} target="_blank" rel="noopener noreferrer">
                        {source.name}
                      </a>
                    ) : (
                      source.name
                    )}
                  </td>
                  <td>{source.approval}</td>
                  <td>{COST_TEXT[source.cost]}</td>
                  <td>{source.lastChecked || "Never"}</td>
                  <td>{source.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card stack">
        <h2>Needs a person ({queue.length})</h2>
        <ul className="record-list">
          {queue.map((issue, index) => (
            <li key={`${issue.id}-${index}`}>
              <strong>{issue.id}</strong>: {issue.problem}
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>Catalog ({VIDEOS.length} videos)</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Level</th>
                <th>Length</th>
                <th>Approval</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {VIDEOS.map((video) => (
                <tr key={video.id}>
                  <td>{video.title}</td>
                  <td>{CATEGORY_INFO[video.category].title}</td>
                  <td>{video.level}</td>
                  <td>{video.durationSeconds === null ? "Not checked" : `${Math.round(video.durationSeconds / 60)} min`}</td>
                  <td>{video.approval}</td>
                  <td>{COST_TEXT[video.cost]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
