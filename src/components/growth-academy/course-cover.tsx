import type { CSSProperties } from "react";
import type { CoverArt, GrowthCourse } from "@/lib/growth-academy/types";

/**
 * Original cover art for each course, drawn in SVG from the course colours.
 * No photographs, so there are no licences or credits to track, and the art
 * stays sharp at any size.
 */
function Art({ art, c1 }: { art: CoverArt; c1: string }) {
  switch (art) {
    case "sunrise":
      return (
        <>
          <circle cx="320" cy="150" r="70" fill={c1} opacity="0.85" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={i} x1="320" y1="150" x2={320 + Math.cos(Math.PI + (i * Math.PI) / 6) * 120} y2={150 + Math.sin(Math.PI + (i * Math.PI) / 6) * 120} stroke={c1} strokeWidth="6" strokeLinecap="round" opacity="0.45" />
          ))}
          <path d="M0 150 Q160 118 320 150 T640 150 V280 H0Z" fill={c1} opacity="0.35" />
          <path d="M0 190 Q200 160 380 192 T640 186 V280 H0Z" fill={c1} opacity="0.55" />
        </>
      );
    case "ripples":
      return (
        <>
          {[30, 62, 96, 132, 170].map((r, i) => (
            <ellipse key={r} cx="320" cy="150" rx={r * 1.9} ry={r * 0.62} fill="none" stroke={c1} strokeWidth={6 - i} opacity={0.75 - i * 0.12} />
          ))}
          <circle cx="320" cy="150" r="12" fill={c1} />
        </>
      );
    case "bridge":
      return (
        <>
          <path d="M40 200 Q320 30 600 200" fill="none" stroke={c1} strokeWidth="10" strokeLinecap="round" />
          <line x1="40" y1="200" x2="600" y2="200" stroke={c1} strokeWidth="8" strokeLinecap="round" />
          {[110, 180, 250, 320, 390, 460, 530].map((x) => (
            <line key={x} x1={x} y1="200" x2={x} y2={200 - (1 - ((x - 320) / 280) ** 2) * 85} stroke={c1} strokeWidth="4" opacity="0.6" />
          ))}
          <circle cx="170" cy="120" r="26" fill={c1} opacity="0.35" />
          <circle cx="470" cy="120" r="26" fill={c1} opacity="0.55" />
          <path d="M0 230 Q320 205 640 230 V280 H0Z" fill={c1} opacity="0.3" />
        </>
      );
    case "heart":
      return (
        <>
          <path d="M320 235 C220 170 190 120 230 85 C265 55 305 75 320 105 C335 75 375 55 410 85 C450 120 420 170 320 235Z" fill={c1} opacity="0.8" />
          <path d="M150 150 H215 L235 120 L255 180 L272 150 H300" fill="none" stroke={c1} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path d="M340 150 H368 L385 120 L405 180 L425 150 H490" fill="none" stroke={c1} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </>
      );
    case "mountain":
      return (
        <>
          <path d="M60 240 L230 70 L330 170 L400 110 L580 240Z" fill={c1} opacity="0.7" />
          <path d="M230 70 L270 110 L250 105 L230 125 L210 108 L192 110Z" fill="#fff" opacity="0.8" />
          <path d="M120 240 C200 200 240 230 300 200 S430 180 480 150" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="10 10" strokeLinecap="round" opacity="0.85" />
          <circle cx="480" cy="150" r="9" fill="#fff" />
          <circle cx="510" cy="70" r="28" fill={c1} opacity="0.35" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M200 230 C200 120 300 60 440 60 C440 190 350 240 200 230Z" fill={c1} opacity="0.75" />
          <path d="M210 222 C280 170 340 130 420 78" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        </>
      );
    default:
      return (
        <>
          <path d="M40 250 C200 200 260 120 340 120 S520 60 600 40" fill="none" stroke={c1} strokeWidth="12" strokeLinecap="round" opacity="0.7" />
          {[120, 260, 400, 540].map((x, i) => (
            <circle key={x} cx={x} cy={240 - i * 60} r="12" fill={c1} />
          ))}
        </>
      );
  }
}

export function CourseCover({ course, className }: { course: GrowthCourse; className?: string }) {
  const [c1, c2] = course.colors;
  return (
    <svg className={`ga-cover ${className ?? ""}`} viewBox="0 0 640 280" role="presentation" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice" style={{ background: c2 } as CSSProperties}>
      <defs>
        <radialGradient id={`ga-glow-${course.id}`} cx="85%" cy="10%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="280" fill={c2} />
      <rect width="640" height="280" fill={`url(#ga-glow-${course.id})`} />
      <Art art={course.cover} c1={c1} />
    </svg>
  );
}

/** CSS variables for a course's colours, for the progress bar and accents. */
export function courseStyle(course: GrowthCourse): CSSProperties {
  return { "--ga-c1": course.colors[0], "--ga-c2": course.colors[1] } as CSSProperties;
}
