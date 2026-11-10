"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { ChallengePanel } from "@/components/wellness/challenge-panel";
import { challenges } from "@/lib/wellness/challenges";
import { wellnessSources } from "@/lib/wellness/sources";

export function HabitsHome() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Shared challenges")}</p>
      <h1>{t("Practice one small step")}</h1>
      <p className="lede">
        {t("The coach, academy, urges, and nature sections share this list. Check-ins stay in this browser tab. A missed day is not a failure.")}
      </p>
      {challenges.map((challenge) => (
        <Link key={challenge.id} className="card learn-link" href={`/habits/${challenge.id}`}>
          <h2>{t(challenge.title)}</h2>
          <p>{t(challenge.summary)}</p>
        </Link>
      ))}
    </div>
  );
}

export function HabitDetail({ id }: { id: string }) {
  const t = useT();
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Challenge")}</p>
      <h1>{t(challenge.title)}</h1>
      <ChallengePanel challenge={challenge} />
    </div>
  );
}

export function SourceRegistry() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Nutrition & Fitness Academy")}</p>
      <h1>{t("Source registry")}</h1>
      <p className="lede">
        {t("Every dataset and page used for these lessons is listed here. Long text is linked. Food numbers come from the USDA download described below. No paid database was used.")}
      </p>
      {wellnessSources.map((source) => (
        <article key={source.id} className="card stack">
          <h2>{source.name}</h2>
          <p><strong>{t("Publisher.")}</strong> {source.publisher}</p>
          <p>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {t("Original page")}
            </a>
          </p>
          <p><strong>{t("License.")}</strong> {t(source.license)}</p>
          <p><strong>{t("Commercial reuse.")}</strong> {source.commercialReuse === "permitted" ? t("Permitted, with the attribution requested by the publisher.") : t("Not clearly granted on the page that was read, so the app links out and uses original wording.")}</p>
          <p><strong>{t("Access.")}</strong> {t(source.accessMethod)}</p>
          <p><strong>{t("Attribution.")}</strong> {source.attribution}</p>
          <p><strong>{t("Last checked.")}</strong> {source.lastChecked}</p>
          <p><strong>{t("Data or page update.")}</strong> {source.dataUpdated ?? t("Not listed on the page that was opened.")}</p>
        </article>
      ))}
    </div>
  );
}
