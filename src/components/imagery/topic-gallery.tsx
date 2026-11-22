"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { TopicGlyph } from "@/components/imagery/topic-glyph";
import { PHOTOS, TOPICS } from "@/lib/imagery/registry";

/**
 * Seven everyday wellness areas, each with its own photo and a small drawing.
 * The people shown range from their 30s to their 80s. Credits are listed under the grid.
 */
export function TopicGallery() {
  const t = useT();
  return (
    <section className="lz-topics" aria-labelledby="lz-topics-title">
      <div className="lz-topics-head">
        <p className="kicker">{t("Every stage of adulthood")}</p>
        <h2 id="lz-topics-title">{t("Feel well at 30, 50, 70 and beyond")}</h2>
        <p className="lz-topics-lede">{t("Choose an area to explore. Each one is educational and goes at your pace.")}</p>
      </div>
      <ul className="lz-topic-grid">
        {TOPICS.map((topic) => {
          const item = PHOTOS[topic.photo];
          return (
            <li key={topic.id} className={`lz-topic lz-topic-${topic.id}`}>
              <Link href={topic.href} className="lz-topic-link">
                <span className="lz-topic-media">
                  <Image
                    src={item.src}
                    alt={t(item.alt)}
                    width={item.width}
                    height={item.height}
                    sizes="(min-width: 1000px) 240px, (min-width: 640px) 33vw, 50vw"
                    loading="lazy"
                    style={"focus" in item && item.focus ? { objectPosition: item.focus } : undefined}
                  />
                  <span className="lz-topic-badge"><TopicGlyph id={topic.id} /></span>
                </span>
                <span className="lz-topic-body">
                  <span className="lz-topic-title">{t(topic.title)}</span>
                  <span className="lz-topic-text">{t(topic.text)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="lz-topics-credits">
        {t("Photos:")}{" "}
        {TOPICS.map((topic, index) => {
          const credit = PHOTOS[topic.photo].credit;
          return (
            <span key={topic.id}>
              {index > 0 ? " · " : null}
              <a href={credit.source} target="_blank" rel="noopener noreferrer">
                {credit.author}
              </a>{" "}
              ({credit.license === "Public domain" ? t("Public domain") : credit.license})
            </span>
          );
        })}
      </p>
    </section>
  );
}
