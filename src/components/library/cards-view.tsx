"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import type { Translate } from "@/lib/i18n/translate";
import { LIBRARY_BRAND, LIBRARY_DISCLAIMER, healthCards } from "@/lib/library/catalog";

function downloadCard(title: string, text: string, slug: string, t: Translate) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, "#52288A");
  gradient.addColorStop(0.55, "#6A3DA8");
  gradient.addColorStop(1, "#23706A");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = "#EFE5FA";
  ctx.fillRect(72, 72, 72, 72);
  ctx.fillStyle = "#F9F7F2";
  ctx.font = "700 42px Georgia, serif";
  ctx.fillText("lifeZoi", 168, 122);
  ctx.font = "700 28px sans-serif";
  ctx.fillText(t("SHARE A HEALTHY IDEA"), 72, 220);
  ctx.font = "560 64px Georgia, serif";
  wrapFill(ctx, title, 72, 320, 936, 76);
  ctx.font = "400 36px sans-serif";
  wrapFill(ctx, text, 72, 560, 936, 48);
  ctx.font = "700 28px sans-serif";
  ctx.fillText(t(LIBRARY_BRAND), 72, 900);
  ctx.font = "400 24px sans-serif";
  ctx.fillText(t("No guaranteed results. Education only."), 72, 960);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${slug}.png`;
  link.click();
}

function wrapFill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  line: number,
) {
  const words = text.split(" ");
  let row = "";
  let cursor = y;
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (ctx.measureText(next).width > max) {
      ctx.fillText(row, x, cursor);
      row = word;
      cursor += line;
    } else {
      row = next;
    }
  }
  if (row) ctx.fillText(row, x, cursor);
}

export function CardsIndex() {
  const t = useT();
  return (
    <div className="library stack-lg">
      <p className="kicker">{t("Health Library")}</p>
      <h1>{t("SHARE A HEALTHY IDEA")}</h1>
      <p className="lede">{t("Download a square image, share the page, or open the guide. These cards do not promise a result.")}</p>
      <div className="library-grid">
        {healthCards.map((card) => (
          <article key={card.slug} className="idea-card">
            <p>{t("SHARE A HEALTHY IDEA")}</p>
            <h2>{t(card.title)}</h2>
            <p>{t(card.text)}</p>
            <p>{t(LIBRARY_BRAND)}</p>
            <p>{t("No guaranteed results.")}</p>
            <div className="actions">
              <Link className="btn btn-secondary" href={`/library/cards/${card.slug}`}>
                {t("Open")}
              </Link>
              <Link className="btn btn-secondary" href={card.href}>
                {t("Read more")}
              </Link>
            </div>
          </article>
        ))}
      </div>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
    </div>
  );
}

export function CardDetail({ slug }: { slug: string }) {
  const t = useT();
  const card = healthCards.find((item) => item.slug === slug);
  const [note, setNote] = useState<string | null>(null);
  if (!card) return null;
  const path = `/library/cards/${card.slug}`;

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: card ? t(card.title) : undefined, text: card ? t(card.text) : undefined, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote(t("Link copied."));
    } catch {
      setNote(url);
    }
  }

  return (
    <div className="library stack-lg">
      <article className="idea-card">
        <p>{t("SHARE A HEALTHY IDEA")}</p>
        <h1>{t(card.title)}</h1>
        <p>{t(card.text)}</p>
        <p>{t(LIBRARY_BRAND)}</p>
        <p>{t("No guaranteed results. Education only.")}</p>
      </article>
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={() => downloadCard(t(card.title), t(card.text), card.slug, t)}>
          {t("Download image")}
        </button>
        <button className="btn btn-secondary" type="button" onClick={share}>
          {t("Share")}
        </button>
        <Link className="btn btn-secondary" href={card.href}>
          {t("Read more")}
        </Link>
      </div>
      {note ? <p role="status">{note}</p> : null}
      <p className="hint">{t("The image is 1080 by 1080 pixels, drawn in your browser. No image service is called.")}</p>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
    </div>
  );
}
