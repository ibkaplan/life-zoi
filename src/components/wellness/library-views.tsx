"use client";

import Link from "next/link";
import { ChallengePanel } from "@/components/wellness/challenge-panel";
import { challenges } from "@/lib/wellness/challenges";
import { wellnessSources } from "@/lib/wellness/sources";

export function HabitsHome() {
  return (
    <div className="learn stack-lg">
      <p className="kicker">Shared challenges</p>
      <h1>Practice one small step</h1>
      <p className="lede">
        The coach, academy, urges, and nature sections share this list. Check-ins stay in this browser tab. A missed day is not a failure.
      </p>
      {challenges.map((challenge) => (
        <Link key={challenge.id} className="card learn-link" href={`/habits/${challenge.id}`}>
          <h2>{challenge.title}</h2>
          <p>{challenge.summary}</p>
        </Link>
      ))}
    </div>
  );
}

export function HabitDetail({ id }: { id: string }) {
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">Challenge</p>
      <h1>{challenge.title}</h1>
      <ChallengePanel challenge={challenge} />
    </div>
  );
}

export function SourceRegistry() {
  return (
    <div className="learn stack-lg">
      <p className="kicker">Nutrition & Fitness Academy</p>
      <h1>Source registry</h1>
      <p className="lede">
        Every dataset and page used for these lessons is listed here. Long text is linked. Food numbers come from the USDA download described below. No paid database was used.
      </p>
      {wellnessSources.map((source) => (
        <article key={source.id} className="card stack">
          <h2>{source.name}</h2>
          <p><strong>Publisher.</strong> {source.publisher}</p>
          <p>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              Original page
            </a>
          </p>
          <p><strong>License.</strong> {source.license}</p>
          <p><strong>Commercial reuse.</strong> {source.commercialReuse === "permitted" ? "Permitted, with the attribution requested by the publisher." : "Not clearly granted on the page that was read, so the app links out and uses original wording."}</p>
          <p><strong>Access.</strong> {source.accessMethod}</p>
          <p><strong>Attribution.</strong> {source.attribution}</p>
          <p><strong>Last checked.</strong> {source.lastChecked}</p>
          <p><strong>Data or page update.</strong> {source.dataUpdated ?? "Not listed on the page that was opened."}</p>
        </article>
      ))}
    </div>
  );
}
