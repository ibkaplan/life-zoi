import type { IconName } from "@/lib/brain-quiz/activities";

export function Icon({ name }: { name: IconName | string }) {
  const common = { viewBox: "0 0 64 64", className: "quiz-icon", "aria-hidden": true as const };
  if (name === "eye") {
    return <svg {...common}><ellipse cx="32" cy="32" rx="22" ry="12" fill="none" stroke="#172554" strokeWidth="3" /><circle cx="32" cy="32" r="6" fill="#6A3DA8" /></svg>;
  }
  if (name === "sun") {
    return <svg {...common}><circle cx="32" cy="32" r="10" fill="#23706A" /><g stroke="#52288A" strokeWidth="3">{[0, 45, 90, 135].map((deg) => <line key={deg} x1="32" y1="8" x2="32" y2="16" transform={`rotate(${deg} 32 32)`} />)}</g></svg>;
  }
  if (name === "moon") {
    return <svg {...common}><path d="M36 12a16 16 0 1 0 0 40 18 18 0 1 1 0-40z" fill="#6A3DA8" /></svg>;
  }
  if (name === "rain") {
    return <svg {...common}><path d="M18 36h28a10 10 0 0 0-4-19 14 14 0 0 0-26 6 8 8 0 0 0 2 13z" fill="#23706A" /><path d="M24 42l-4 10M32 42l-4 10M40 42l-4 10" stroke="#0E7490" strokeWidth="3" /></svg>;
  }
  if (name === "book") {
    return <svg {...common}><path d="M12 16h18a8 8 0 0 1 8 8v24H20a8 8 0 0 0-8 8zM52 16H34a8 8 0 0 0-8 8v24h18a8 8 0 0 1 8 8z" fill="#EFE5FA" stroke="#52288A" strokeWidth="2" /></svg>;
  }
  if (name === "star") {
    return <svg {...common}><polygon points="32,8 38,24 56,24 42,34 47,52 32,42 17,52 22,34 8,24 26,24" fill="#6A3DA8" /></svg>;
  }
  if (name === "tree") {
    return <svg {...common}><polygon points="32,8 50,36 14,36" fill="#0E7490" /><rect x="28" y="36" width="8" height="16" fill="#52288A" /></svg>;
  }
  if (name === "heart") {
    return <svg {...common}><path d="M32 52s-18-11-18-24a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 13-18 24-18 24z" fill="#6A3DA8" /></svg>;
  }
  if (name === "hand") {
    return <svg {...common}><path d="M24 30V16a4 4 0 0 1 8 0v12M32 28V12a4 4 0 0 1 8 0v16M40 30V16a4 4 0 0 1 8 0v20c0 12-8 18-16 18h-6c-8 0-12-6-12-12v-8a4 4 0 0 1 8 0v6" fill="none" stroke="#172554" strokeWidth="3" /></svg>;
  }
  if (name === "foot") {
    return <svg {...common}><ellipse cx="28" cy="40" rx="12" ry="10" fill="#52288A" /><circle cx="22" cy="22" r="4" fill="#52288A" /><circle cx="30" cy="16" r="4" fill="#52288A" /><circle cx="38" cy="20" r="3.5" fill="#52288A" /></svg>;
  }
  if (name === "clock") {
    return <svg {...common}><circle cx="32" cy="32" r="18" fill="white" stroke="#172554" strokeWidth="3" /><path d="M32 32V18M32 32l10 6" stroke="#6A3DA8" strokeWidth="3" /></svg>;
  }
  return <ShapeGlyph shape={name} color="#6A3DA8" />;
}

export function ShapeGlyph({ shape, color }: { shape: string; color: string }) {
  if (shape === "square") return <svg viewBox="0 0 64 64" className={"quiz-icon"} aria-hidden><rect x="14" y="14" width="36" height="36" rx="6" fill={color} /></svg>;
  if (shape === "triangle") return <svg viewBox="0 0 64 64" className={"quiz-icon"} aria-hidden><polygon points="32,10 56,52 8,52" fill={color} /></svg>;
  if (shape === "tree") return <Icon name="tree" />;
  if (shape === "house") {
    return <svg viewBox="0 0 64 64" className={"quiz-icon"} aria-hidden><polygon points="32,10 56,32 8,32" fill={color} /><rect x="20" y="32" width="24" height="20" fill={color} /></svg>;
  }
  if (shape === "star") return <Icon name="star" />;
  return <svg viewBox="0 0 64 64" className={"quiz-icon"} aria-hidden><circle cx="32" cy="32" r="16" fill={color} /></svg>;
}
