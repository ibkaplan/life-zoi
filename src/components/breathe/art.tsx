"use client";

import { useT } from "@/components/locale-provider";

/**
 * Original illustrations for Breathe for Life, drawn as SVG in the LifeZoi palette.
 * They are pictures to explain ideas, not measurements or results.
 */

const P = {
  royal: "#6A3DA8",
  lavender: "#B98EE5",
  teal: "#2F8F83",
  sage: "#A8BFAE",
  gold: "#F2B65D",
  ivory: "#F9F7F2",
  skin: "#E8B48F",
  ink: "#3B2462",
};

export function BreatheHeroArt() {
  return (
    <svg viewBox="0 0 320 220" className="lz-art" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3ECFB" />
          <stop offset="1" stopColor={P.ivory} />
        </linearGradient>
      </defs>
      <rect width="320" height="220" rx="18" fill="url(#bf-sky)" />
      <circle cx="262" cy="52" r="26" fill={P.gold} opacity="0.85" />
      <path d="M0 176 C 70 150, 130 196, 200 170 S 300 150, 320 166 L320 220 L0 220 Z" fill={P.sage} opacity="0.7" />
      {/* breath waves */}
      <g fill="none" strokeLinecap="round" strokeWidth="4">
        <path d="M188 92 q 14 -10 28 0 t 28 0" stroke={P.teal} opacity="0.85" />
        <path d="M192 110 q 14 -10 28 0 t 28 0" stroke={P.lavender} />
        <path d="M188 128 q 14 -10 28 0 t 28 0" stroke={P.royal} opacity="0.55" />
      </g>
      {/* seated person, eyes closed */}
      <ellipse cx="128" cy="186" rx="64" ry="12" fill={P.royal} opacity="0.15" />
      <path d="M80 182 q 48 -30 96 0 z" fill={P.royal} />
      <path d="M104 178 q 24 -76 48 0 z" fill={P.lavender} />
      <circle cx="128" cy="86" r="22" fill={P.skin} />
      <path d="M106 82 q 22 -30 44 0 q -4 -24 -22 -24 q -18 0 -22 24z" fill={P.ink} />
      <path d="M118 90 q 4 3 8 0 M131 90 q 4 3 8 0" stroke={P.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M124 99 q 4 3 8 0" stroke={P.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M104 140 q -18 18 4 30 M152 140 q 18 18 -4 30" stroke={P.skin} strokeWidth="9" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Two blood vessels side by side: a relaxed, flexible one and a stiffer, narrower one. */
export function VesselArt() {
  const t = useT();
  return (
    <svg
      viewBox="0 0 340 200"
      className="lz-art"
      role="img"
      aria-label={t(
        "Illustration of two blood vessels. On the left, a younger vessel is wide and flexible with many nitric oxide signals. On the right, an older vessel has a thicker wall, fewer nitric oxide signals, and more oxidative stress.",
      )}
    >
      <rect width="340" height="200" rx="18" fill={P.ivory} />
      <text x="85" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={P.royal}>{t("Younger vessel")}</text>
      <text x="255" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={P.royal}>{t("Older vessel")}</text>
      {/* younger */}
      <circle cx="85" cy="108" r="62" fill="#F4D3D8" stroke="#C97A86" strokeWidth="6" />
      <circle cx="85" cy="108" r="46" fill="#C2414F" opacity="0.9" />
      {[[-20, -18], [16, -22], [24, 12], [-14, 20], [0, 0], [-30, 4]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={85 + x} cy={108 + y} r="7" fill={P.teal} />
          <text x={85 + x} y={108 + y + 3.5} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">NO</text>
        </g>
      ))}
      {/* older */}
      <circle cx="255" cy="108" r="62" fill="#EBCBD0" stroke="#9C5A66" strokeWidth="14" />
      <circle cx="255" cy="108" r="32" fill="#C2414F" opacity="0.9" />
      {[[-10, -8], [12, 10]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={255 + x} cy={108 + y} r="7" fill={P.teal} />
          <text x={255 + x} y={108 + y + 3.5} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">NO</text>
        </g>
      ))}
      {[[-40, -40], [40, -36], [44, 34], [-42, 38]].map(([x, y], i) => (
        <g key={`o${i}`}>
          <circle cx={255 + x} cy={108 + y} r="8" fill={P.gold} />
          <text x={255 + x} y={108 + y + 3.5} textAnchor="middle" fontSize="7" fontWeight="700" fill={P.ink}>O₂⁻</text>
        </g>
      ))}
      <text x="85" y="190" textAnchor="middle" fontSize="11" fill={P.ink}>{t("Wide, flexible, more NO signaling")}</text>
      <text x="255" y="190" textAnchor="middle" fontSize="11" fill={P.ink}>{t("Stiffer, more oxidative stress")}</text>
    </svg>
  );
}
