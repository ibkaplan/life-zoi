import Link from "next/link";

export function LeafMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="#1e4636" />
      <path d="M16.2 6.5c1.8 3.6 5.3 5.6 5.3 9.8a5.5 5.5 0 1 1-11 0c0-4.2 3.5-6.2 5.7-9.8z" fill="#f4f1ea" />
      <path d="M16 14.2c.2 1.6-1.6 2.6-1.6 4.2" stroke="#1e4636" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ href = "/" }: { href?: "/" | "/dashboard" }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full">
      <LeafMark />
      <span className="font-display text-2xl tracking-tight text-ink">
        life<span className="text-forest">Zoi</span>
      </span>
    </Link>
  );
}
