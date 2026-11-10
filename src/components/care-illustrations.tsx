/**
 * Original lifeZoi illustrations for Share the Care.
 * Drawn for this page. They are not stock images.
 */

"use client";

import { useT } from "@/components/locale-provider";

export function CareShareArt() {
  const t = useT();
  return (
    <svg viewBox="0 0 640 420" role="img" aria-label={t("Two people sit together beside a small sprouting plant.")}>
      <defs>
        <linearGradient id="care-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EFE5FA" />
          <stop offset="0.55" stopColor="#F9F7F2" />
          <stop offset="1" stopColor="#F3ECFB" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="28" fill="url(#care-sky)" />
      <circle cx="520" cy="78" r="36" fill="#F9F7F2" />
      <circle cx="520" cy="78" r="24" fill="#FFE7A3" />
      <path d="M0 292 C120 250 180 270 280 286 C390 304 470 250 640 274 L640 420 L0 420 Z" fill="#D9C8F6" />
      <path d="M0 330 C150 300 230 346 360 328 C470 314 540 348 640 332 L640 420 L0 420 Z" fill="#C9B4F2" />
      <g fill="none" stroke="#6A3DA8" strokeWidth="8" strokeLinecap="round">
        <path d="M96 318 C150 250 168 250 196 318" />
        <path d="M430 318 C486 246 508 246 548 318" />
      </g>
      <circle cx="146" cy="214" r="28" fill="#F9F7F2" stroke="#172554" strokeWidth="6" />
      <circle cx="488" cy="208" r="28" fill="#F9F7F2" stroke="#172554" strokeWidth="6" />
      <path d="M118 250 Q146 242 174 250" fill="none" stroke="#172554" strokeWidth="4" strokeLinecap="round" />
      <path d="M460 244 Q488 236 516 244" fill="none" stroke="#172554" strokeWidth="4" strokeLinecap="round" />
      <rect x="228" y="286" width="184" height="18" rx="9" fill="#52288A" />
      <g fill="#0E7490">
        <rect x="308" y="246" width="8" height="42" rx="4" />
        <ellipse cx="300" cy="236" rx="16" ry="10" transform="rotate(-30 300 236)" />
        <ellipse cx="324" cy="232" rx="16" ry="10" transform="rotate(28 324 232)" />
        <circle cx="312" cy="214" r="8" fill="#23706A" />
      </g>
      <circle cx="86" cy="338" r="6" fill="#6A3DA8" opacity="0.45" />
      <circle cx="574" cy="348" r="7" fill="#23706A" opacity="0.5" />
    </svg>
  );
}

export function CareWelcomeArt() {
  const t = useT();
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label={t("A quiet path leads toward a soft sunrise.")}>
      <defs>
        <linearGradient id="welcome-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3ECFB" />
          <stop offset="1" stopColor="#F9F7F2" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" rx="28" fill="url(#welcome-sky)" />
      <circle cx="470" cy="120" r="48" fill="#FFE7A3" />
      <circle cx="470" cy="120" r="70" fill="#FFE7A3" opacity="0.28" />
      <path d="M40 250 C180 210 260 230 320 214 C420 190 500 230 610 206" fill="none" stroke="#6A3DA8" strokeWidth="10" strokeLinecap="round" />
      <circle cx="150" cy="236" r="10" fill="#52288A" />
      <circle cx="250" cy="220" r="8" fill="#23706A" />
      <circle cx="390" cy="208" r="8" fill="#0E7490" />
      <g fill="none" stroke="#172554" strokeWidth="6" strokeLinecap="round">
        <path d="M108 214 C128 168 146 168 164 214" />
      </g>
      <circle cx="136" cy="156" r="18" fill="#F9F7F2" stroke="#172554" strokeWidth="6" />
      <path d="M124 168 Q136 162 148 168" fill="none" stroke="#172554" strokeWidth="3" strokeLinecap="round" />
      <g fill="#0E7490">
        <rect x="520" y="188" width="7" height="36" rx="3" />
        <ellipse cx="514" cy="184" rx="14" ry="8" transform="rotate(-24 514 184)" />
        <ellipse cx="534" cy="180" rx="14" ry="8" transform="rotate(24 534 180)" />
      </g>
    </svg>
  );
}
