import type { TopicId } from "@/lib/imagery/registry";

/** Small original line drawings, one per wellness topic. Decorative. */
const PATHS: Record<TopicId, React.ReactNode> = {
  energy: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
    </>
  ),
  nutrition: (
    <>
      <path d="M12 7.5c-3.6-1.8-7 .6-7 4.6 0 4.3 3.1 8.4 5.4 8.4.7 0 1.1-.4 1.6-.4s.9.4 1.6.4c2.3 0 5.4-4.1 5.4-8.4 0-4-3.4-6.4-7-4.6z" />
      <path d="M12 7.5c0-2 .9-3.6 2.8-4.5M12 7c-1.6-1.9-3.6-2-4.6-1.3 1.2 1.6 2.9 1.9 4.6 1.3z" />
    </>
  ),
  movement: (
    <>
      <circle cx="14" cy="4.6" r="1.9" />
      <path d="M9 21l3-6.2 3 2.7v3.5M6.4 11.6l3.5-3.4 4.5.4 2.4 3.4 2.8.6M12 14.8l-1-6.4" />
    </>
  ),
  sleep: (
    <>
      <path d="M19.5 14.5A7.8 7.8 0 019.5 4.5a7.8 7.8 0 1010 10z" />
      <path d="M15 4h3.4L15 7.6h3.4" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5.2c-1-1.6-3.8-1.8-5 0-1.8.1-3 1.8-2.6 3.5-1.6 1-1.7 3.6 0 4.7-.5 1.9.9 3.7 2.8 3.6.8 1.7 3.6 2.1 4.8.3V5.2z" />
      <path d="M12 5.2c1-1.6 3.8-1.8 5 0 1.8.1 3 1.8 2.6 3.5 1.6 1 1.7 3.6 0 4.7.5 1.9-.9 3.7-2.8 3.6-.8 1.7-3.6 2.1-4.8.3" />
      <path d="M8 9.5c1 .2 1.8.9 2 2M16 9.5c-1 .2-1.8.9-2 2" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.6C19.5 15.4 12 20 12 20z" />
      <path d="M7 12.5h2.6l1.3-2.4 2 4.4 1.3-2h2.8" />
    </>
  ),
  longevity: (
    <>
      <path d="M12 21v-7.5M12 13.5c-3.8 0-6.3-2.4-6.3-5.4S8.2 3 12 3s6.3 2.1 6.3 5.1-2.5 5.4-6.3 5.4z" />
      <path d="M12 16.5l-3-2M12 15l2.6-1.8M8.5 21h7" />
    </>
  ),
};

export function TopicGlyph({ id }: { id: TopicId }) {
  return (
    <svg className="lz-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[id]}
    </svg>
  );
}
