"use client";

import "@/components/health-day/health-day.css";
import Link from "next/link";
import { useBackgroundMusic } from "@/components/background-music/provider";
import { useMessages, useT } from "@/components/locale-provider";
import type { DailyFeeling } from "@/lib/companion/state";
import { matchFeeling, type PartOfDay } from "@/lib/health-day/health-day";
import { CATEGORY_ICON } from "@/lib/music-library/catalog";

/**
 * Three small cards that match today's feeling with a breathing practice, a
 * music category, and a movement from the existing libraries. Fixed rules, no AI.
 * Used inside LifeZoi Daily's feeling panel and in My Health Day.
 */
export function FeelingMatches({ feeling, part, headingLevel = "h4" }: { feeling: DailyFeeling; part: PartOfDay; headingLevel?: "h3" | "h4" }) {
  const t = useT();
  const m = useMessages();
  const music = useBackgroundMusic();
  const match = matchFeeling(feeling, part);
  const Heading = headingLevel;
  const categoryName = m.music.categories[match.music.category].name;

  return (
    <div className="hd-matches" aria-label={t("Matched to how you feel")} role="group">
      <article className="hd-match">
        <p className="hd-match-kind">
          <span aria-hidden="true">🌬️ </span>
          {t("Breathing")}
        </p>
        <Heading>{t(match.breathing.title)}</Heading>
        <p>{t(match.breathing.note)}</p>
        <Link className="hd-match-go" href={match.breathing.href}>
          {t("Start breathing")}
        </Link>
      </article>
      <article className="hd-match">
        <p className="hd-match-kind">
          <span aria-hidden="true">{CATEGORY_ICON[match.music.category]} </span>
          {t("Music")}
        </p>
        <Heading>{categoryName}</Heading>
        <p>{t(match.music.note)}</p>
        <div className="hd-match-row">
          {music.ready ? (
            <button type="button" className="hd-match-go" onClick={() => music.selectCategory(match.music.category, true)}>
              ▶ {m.music.play}
            </button>
          ) : null}
          <Link href="/library/music">{t("My Music")}</Link>
        </div>
      </article>
      <article className="hd-match">
        <p className="hd-match-kind">
          <span aria-hidden="true">🚶 </span>
          {t("Movement")}
        </p>
        <Heading>{t(match.movement.title)}</Heading>
        <p>{t(match.movement.note)}</p>
        <Link className="hd-match-go" href={match.movement.href}>
          {t("Show me how")}
        </Link>
      </article>
    </div>
  );
}
