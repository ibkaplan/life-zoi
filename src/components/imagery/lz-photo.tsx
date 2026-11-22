"use client";

import Image from "next/image";
import { useT } from "@/components/locale-provider";
import { PHOTOS, type PhotoId } from "@/lib/imagery/registry";

type Variant = "tile" | "banner" | "card" | "inset";

const SIZES: Record<Variant, string> = {
  tile: "(min-width: 760px) 480px, 100vw",
  banner: "(min-width: 900px) 960px, 100vw",
  card: "(min-width: 900px) 260px, 50vw",
  inset: "(min-width: 760px) 360px, 100vw",
};

/**
 * A registered photo, stored locally and loaded lazily, with its credit.
 * The credit is small and sits on the photo, so it never pushes text around.
 */
export function LzPhoto({ id, variant = "banner", className }: { id: PhotoId; variant?: Variant; className?: string }) {
  const t = useT();
  const item = PHOTOS[id];
  return (
    <figure className={`lz-photo lz-photo-${variant}${className ? ` ${className}` : ""}`}>
      <Image
        src={item.src}
        alt={t(item.alt)}
        width={item.width}
        height={item.height}
        sizes={SIZES[variant]}
        loading="lazy"
        style={"focus" in item && item.focus ? { objectPosition: item.focus } : undefined}
      />
      <figcaption className="lz-photo-credit">
        <a href={item.credit.source} target="_blank" rel="noopener noreferrer">
          {t("Photo: {author}, {license}", { author: item.credit.author, license: item.credit.license === "Public domain" ? t("Public domain") : item.credit.license })}
        </a>
      </figcaption>
    </figure>
  );
}
