/**
 * Original line illustrations for the Health Encyclopedia, drawn for LifeZoi.
 * They use the brand colors through CSS variables, so no image file is loaded
 * and nothing is copied from another source. Each has a text description.
 */
import type { ReactNode } from "react";

const P = "var(--royal)";
const T = "var(--teal-brand)";
const G = "var(--gold)";
const L = "var(--lavender-brand)";
const S = "var(--sage-brand)";

const stroke = { fill: "none", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ART: Record<string, ReactNode> = {
  microscope: (
    <>
      <circle cx="120" cy="90" r="62" fill={L} opacity="0.25" />
      <path d="M95 40l30 50M88 44l12-7M110 92l16-10" stroke={P} {...stroke} strokeWidth={8} />
      <circle cx="132" cy="104" r="12" fill={T} />
      <path d="M70 140h100M120 140c0-24-12-38-30-44" stroke={P} {...stroke} strokeWidth={6} />
      <circle cx="170" cy="50" r="6" fill={G} />
      <circle cx="186" cy="68" r="4" fill={T} />
    </>
  ),
  cell: (
    <>
      <circle cx="80" cy="90" r="34" fill={S} opacity="0.55" />
      <circle cx="80" cy="90" r="12" fill={T} />
      <circle cx="150" cy="70" r="26" fill={S} opacity="0.55" />
      <circle cx="150" cy="70" r="9" fill={T} />
      <path d="M140 118c18-14 44-10 52 8s-6 38-26 40-40-8-42-22 4-18 16-26z" fill={L} opacity="0.8" />
      <circle cx="166" cy="140" r="11" fill={P} />
      <circle cx="152" cy="132" r="5" fill={G} />
    </>
  ),
  clock: (
    <>
      <circle cx="120" cy="90" r="64" fill={L} opacity="0.22" />
      <circle cx="120" cy="90" r="50" stroke={P} {...stroke} />
      <path d="M120 90V58M120 90l24 14" stroke={P} {...stroke} strokeWidth={5} />
      <path d="M120 40a50 50 0 0 1 50 50h-50z" fill={G} opacity="0.55" />
      <path d="M58 150c10 6 24 6 34 0" stroke={T} {...stroke} />
      <path d="M190 44a14 14 0 1 1-12 22 11 11 0 0 0 12-22z" fill={P} />
    </>
  ),
  plate: (
    <>
      <circle cx="120" cy="92" r="66" fill="#fff" stroke={L} strokeWidth="4" />
      <path d="M120 92V30a62 62 0 0 1 58 40z" fill={S} />
      <path d="M120 92l58-22a62 62 0 0 1-26 72z" fill={G} opacity="0.75" />
      <path d="M120 92l32 50a62 62 0 0 1-90-22z" fill={T} opacity="0.75" />
      <path d="M120 92L62 120a62 62 0 0 1 58-90z" fill={L} />
      <circle cx="98" cy="70" r="6" fill="#fff" />
      <circle cx="146" cy="58" r="5" fill="#fff" />
    </>
  ),
  brain: (
    <>
      <path d="M70 110c-20-6-24-34-6-44 0-22 26-32 40-20 10-16 38-14 44 4 20-4 34 16 26 32 16 12 6 38-14 38-6 16-30 20-42 8-14 10-40 4-48-18z" fill={L} opacity="0.7" />
      <path d="M120 50v84M96 70c8 6 8 18 0 24M146 70c-8 6-8 18 0 24M90 112c10-4 20 0 24 8M152 112c-10-4-20 0-24 8" stroke={P} {...stroke} />
      <circle cx="186" cy="48" r="6" fill={G} />
      <circle cx="54" cy="54" r="4" fill={T} />
    </>
  ),
  heart: (
    <>
      <path d="M120 156c-42-28-70-54-70-86 0-22 18-38 38-38 14 0 26 8 32 20 6-12 18-20 32-20 20 0 38 16 38 38 0 32-28 58-70 86z" fill={L} opacity="0.75" />
      <path d="M104 36V18M136 36V14M120 30V10" stroke={P} {...stroke} strokeWidth={6} />
      <path d="M30 96h46l10-22 14 44 12-30h98" stroke={T} {...stroke} strokeWidth={4} />
    </>
  ),
  gut: (
    <>
      <path d="M86 34c-14 0-18 18-6 26 12 8 8 22-6 22-24 0-28 34-4 38 30 6 70 2 96-4 22-6 20-36-2-36-18 0-24-16-10-24 12-8 6-24-10-22" stroke={T} {...stroke} strokeWidth={14} opacity="0.55" />
      <path d="M100 150c20 8 40 8 54 0" stroke={P} {...stroke} strokeWidth={8} />
      <circle cx="96" cy="100" r="5" fill={P} />
      <rect x="132" y="94" width="14" height="6" rx="3" fill={G} />
      <circle cx="160" cy="112" r="4" fill={P} />
      <rect x="110" y="60" width="12" height="5" rx="2.5" fill={G} />
    </>
  ),
  tree: (
    <>
      <circle cx="120" cy="72" r="50" fill={S} />
      <circle cx="86" cy="86" r="28" fill={S} opacity="0.8" />
      <circle cx="156" cy="90" r="30" fill={S} opacity="0.8" />
      <path d="M120 162V92M120 120l-20-16M120 110l18-14M120 162c-12 4-24 2-34-4M120 162c12 4 24 2 34-4" stroke={P} {...stroke} strokeWidth={6} />
      <circle cx="140" cy="54" r="6" fill={G} />
      <circle cx="96" cy="66" r="5" fill={G} />
    </>
  ),
  moon: (
    <>
      <rect x="20" y="18" width="200" height="144" rx="24" fill={L} opacity="0.25" />
      <path d="M150 34a40 40 0 1 0 30 66 32 32 0 1 1-30-66z" fill={G} />
      <circle cx="70" cy="44" r="3" fill={P} />
      <circle cx="100" cy="30" r="2" fill={P} />
      <circle cx="196" cy="128" r="3" fill={P} />
      <path d="M44 142c18-14 42-18 70-12 18 4 36 4 60-6" stroke={T} {...stroke} strokeWidth={5} />
    </>
  ),
  lotus: (
    <>
      <path d="M120 130c-14-24-14-52 0-80 14 28 14 56 0 80z" fill={L} />
      <path d="M118 132c-28-6-46-28-50-56 28 4 46 24 50 56zM122 132c28-6 46-28 50-56-28 4-46 24-50 56z" fill={L} opacity="0.75" />
      <path d="M116 134c-34 6-58-6-72-26 28-6 52 4 72 26zM124 134c34 6 58-6 72-26-28-6-52 4-72 26z" fill={S} />
      <path d="M50 156c20-8 40-8 70 0s50 8 70 0" stroke={T} {...stroke} />
    </>
  ),
  stethoscope: (
    <>
      <path d="M70 30v40a30 30 0 0 0 60 0V30" stroke={P} {...stroke} strokeWidth={6} />
      <path d="M100 100v20a40 40 0 0 0 80 0v-20" stroke={P} {...stroke} strokeWidth={6} />
      <circle cx="180" cy="90" r="14" fill={T} />
      <rect x="40" y="124" width="14" height="30" rx="3" fill={L} />
      <rect x="60" y="110" width="14" height="44" rx="3" fill={G} />
      <rect x="80" y="134" width="14" height="20" rx="3" fill={S} />
    </>
  ),
  dna: (
    <>
      <path d="M90 20c60 30 0 70 60 100s0 50 0 50M150 20c-60 30 0 70-60 100s0 50 0 50" stroke={P} {...stroke} strokeWidth={5} />
      <path d="M104 40h32M98 62h44M106 100h28M98 120h44M106 142h28" stroke={L} {...stroke} strokeWidth={5} />
      <rect x="92" y="74" width="56" height="20" rx="10" fill={G} opacity="0.7" />
    </>
  ),
  immune: (
    <>
      <circle cx="120" cy="90" r="28" fill={L} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const r = (angle * Math.PI) / 180;
        const x = 120 + Math.cos(r) * 40;
        const y = 90 + Math.sin(r) * 40;
        return <circle key={angle} cx={x} cy={y} r="5" fill={P} />;
      })}
      <path d="M44 40l10 10m0 0l-6 10m6-10l10-4M188 130l-10 10m0 0l6 10m-6-10l-10 4M186 40l-10 10m0 0l10 6m-10-6l-2-12" stroke={T} {...stroke} strokeWidth={4} />
    </>
  ),
  magnifier: (
    <>
      <circle cx="60" cy="60" r="10" fill={S} />
      <circle cx="90" cy="120" r="12" fill={S} />
      <circle cx="180" cy="50" r="9" fill={S} />
      <circle cx="110" cy="80" r="40" fill="#fff" stroke={P} strokeWidth="6" />
      <circle cx="104" cy="78" r="14" fill={G} />
      <path d="M140 110l40 40" stroke={P} {...stroke} strokeWidth={10} />
    </>
  ),
  balance: (
    <>
      <path d="M120 30v120M70 150h100M60 60h120" stroke={P} {...stroke} strokeWidth={5} />
      <path d="M60 60l-22 46h44zM180 60l-22 46h44z" stroke={T} {...stroke} />
      <path d="M60 100c-8-10-6-22 0-30 6 8 8 20 0 30z" fill={L} />
      <circle cx="180" cy="94" r="8" fill={G} />
    </>
  ),
  needle: (
    <>
      <path d="M120 20c-30 0-44 30-44 60s10 70 44 80c34-10 44-50 44-80s-14-60-44-60z" fill={L} opacity="0.4" />
      <path d="M120 40v110" stroke={P} {...stroke} strokeDasharray="4 8" />
      {[[100, 60], [140, 64], [108, 96], [132, 104], [116, 132]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={T} />
      ))}
      <path d="M170 40l20-20" stroke={G} {...stroke} strokeWidth={3} />
    </>
  ),
  leaf: (
    <>
      <path d="M60 140c0-60 40-100 100-100 0 60-40 100-100 100z" fill={S} />
      <path d="M60 140l70-70" stroke={P} {...stroke} />
      <rect x="150" y="96" width="40" height="56" rx="8" fill="#fff" stroke={P} strokeWidth="4" />
      <rect x="146" y="86" width="48" height="14" rx="4" fill={L} />
      <path d="M170 112v18M170 138v2" stroke={G} {...stroke} strokeWidth={5} />
    </>
  ),
  timeline: (
    <>
      <path d="M20 90h200" stroke={P} {...stroke} strokeWidth={4} />
      {[40, 80, 120, 160, 200].map((x, index) => (
        <circle key={x} cx={x} cy="90" r={index === 4 ? 10 : 7} fill={[L, T, G, S, P][index]} />
      ))}
      <path d="M80 70V48M160 110v22" stroke={T} {...stroke} />
    </>
  ),
  ai: (
    <>
      <rect x="40" y="30" width="130" height="80" rx="20" fill={L} opacity="0.7" />
      <path d="M70 110l-6 26 30-26" fill={L} opacity="0.7" />
      <path d="M70 62h70M70 82h46" stroke={P} {...stroke} strokeWidth={6} />
      <rect x="120" y="96" width="90" height="56" rx="16" fill="#fff" stroke={T} strokeWidth="4" />
      <path d="M138 116h54M138 132h34" stroke={T} {...stroke} />
      <circle cx="196" cy="40" r="8" fill={G} />
    </>
  ),
};

export function hasIllustration(name: string | undefined): boolean {
  return Boolean(name && ART[name]);
}

export function Illustration({ name, alt, className }: { name: string; alt?: string; className?: string }) {
  const art = ART[name] ?? ART.microscope;
  return (
    <svg className={`ency-art ${className ?? ""}`} viewBox="0 0 240 180" role={alt ? "img" : undefined} aria-label={alt} aria-hidden={alt ? undefined : true} focusable="false">
      {art}
    </svg>
  );
}
