import { useId } from "react";

/**
 * The Wellness Assistant's own character: an original LifeZoi illustration,
 * drawn for this app. A friendly, calm helper robot in the LifeZoi palette
 * (royal purple, lavender, teal, sage, ivory and a touch of gold).
 * Decorative unless a label is given.
 */
export function AssistantMascot({ label, className, wave = true }: { label?: string; className?: string; wave?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;
  return (
    <svg
      viewBox="0 0 240 240"
      className={`lz-mascot${wave ? " lz-mascot-wave" : ""}${className ? ` ${className}` : ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <radialGradient id={id("halo")} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#EFE5FA" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#EFE5FA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("head")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1EAFB" />
        </linearGradient>
        <linearGradient id={id("screen")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#52288A" />
          <stop offset="100%" stopColor="#6A3DA8" />
        </linearGradient>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C5A2EC" />
          <stop offset="100%" stopColor="#8E63CC" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="124" r="112" fill={`url(#${id("halo")})`} />
      <ellipse cx="120" cy="226" rx="54" ry="6" fill="#6A3DA8" opacity="0.14" />

      {/* Antenna with a small sage leaf and a gold light */}
      <path d="M120 54 V32" stroke="#6A3DA8" strokeWidth="4" strokeLinecap="round" />
      <path d="M121 40 C 132 30, 144 32, 148 36 C 140 44, 130 46, 121 40 Z" fill="#A8BFAE" />
      <circle cx="120" cy="28" r="7" fill="#F2B65D" />
      <circle cx="118" cy="26" r="2.2" fill="#FFF6E5" />

      {/* Ear pods */}
      <rect x="49" y="84" width="16" height="30" rx="8" fill="#2F8F83" />
      <rect x="175" y="84" width="16" height="30" rx="8" fill="#2F8F83" />

      {/* Head and face screen */}
      <rect x="60" y="52" width="120" height="94" rx="42" fill={`url(#${id("head")})`} stroke="#DCCDF3" strokeWidth="2" />
      <rect x="74" y="70" width="92" height="58" rx="27" fill={`url(#${id("screen")})`} />
      <path d="M86 80 Q 96 74 110 75" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Smiling eyes */}
      <path d="M94 99 q9 -11 18 0" stroke="#8FE3D6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M128 99 q9 -11 18 0" stroke="#8FE3D6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M109 110 q11 8 22 0" stroke="#F2B65D" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="89" cy="111" r="4.5" fill="#B98EE5" opacity="0.7" />
      <circle cx="151" cy="111" r="4.5" fill="#B98EE5" opacity="0.7" />

      {/* Neck and body */}
      <rect x="106" y="143" width="28" height="11" rx="5" fill="#D9CCEF" />
      <rect x="74" y="150" width="92" height="70" rx="34" fill={`url(#${id("body")})`} />
      {/* Heart emblem with a calm pulse line */}
      <path d="M120 200 C 98 186, 101 166, 113 167 C 117 167.5, 119.5 170, 120 173 C 120.5 170, 123 167.5, 127 167 C 139 166, 142 186, 120 200 Z" fill="#F9F7F2" />
      <path d="M106 182 h8 l3.5 -7 l4.5 12 l3.5 -6 h9" stroke="#2F8F83" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Arms: one waving, one relaxed */}
      <g className="lz-mascot-arm">
        <path d="M80 168 C 64 160, 54 148, 50 134" stroke="#9B72D6" strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="49" cy="129" r="10" fill="#F9F7F2" stroke="#DCCDF3" strokeWidth="2" />
      </g>
      <path d="M160 170 C 172 180, 180 190, 184 200" stroke="#9B72D6" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="186" cy="204" r="10" fill="#F9F7F2" stroke="#DCCDF3" strokeWidth="2" />

      {/* Two small gold sparkles */}
      <path d="M30 104 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 z" fill="#F2B65D" opacity="0.9" />
      <path d="M196 54 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 z" fill="#F2B65D" opacity="0.75" />
    </svg>
  );
}
