import Link from "next/link";

export function LeafMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1d3f31" />
      <path
        d="M16 6.5c2.2 4.2 7 6.4 7 11.2a7 7 0 1 1-14 0c0-4.8 4.8-7 7-11.2z"
        fill="#e7f3ea"
      />
      <path d="M16 12.5v10" stroke="#1d3f31" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="wordmark">
      <LeafMark />
      <span>lifeZoi</span>
    </Link>
  );
}
