/** A friendly drawing of two speech bubbles, a heart, and stars. Decorative only. */
export function FeedbackIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 180" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fb-ill-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B98EE5" />
          <stop offset="1" stopColor="#6A3DA8" />
        </linearGradient>
        <linearGradient id="fb-ill-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A8BFAE" />
          <stop offset="1" stopColor="#2F8F83" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="92" r="78" fill="#F3ECFB" />
      <path d="M44 40h104a18 18 0 0 1 18 18v40a18 18 0 0 1-18 18H86l-24 20v-20H44a18 18 0 0 1-18-18V58a18 18 0 0 1 18-18z" fill="url(#fb-ill-a)" />
      <g fill="#F2B65D">
        <path d="M58 70l4 8 9 1.3-6.5 6.3 1.5 8.9-8-4.2-8 4.2 1.5-8.9-6.5-6.3 9-1.3z" />
        <path d="M90 70l4 8 9 1.3-6.5 6.3 1.5 8.9-8-4.2-8 4.2 1.5-8.9-6.5-6.3 9-1.3z" />
        <path d="M122 70l4 8 9 1.3-6.5 6.3 1.5 8.9-8-4.2-8 4.2 1.5-8.9-6.5-6.3 9-1.3z" />
      </g>
      <path d="M128 92h76a16 16 0 0 1 16 16v30a16 16 0 0 1-16 16h-10v18l-20-18h-46a16 16 0 0 1-16-16v-30a16 16 0 0 1 16-16z" fill="url(#fb-ill-b)" />
      <path d="M166 140c-14-9-22-16-22-25a9 9 0 0 1 16-6l6 6 6-6a9 9 0 0 1 16 6c0 9-8 16-22 25z" fill="#F9F7F2" />
      <g fill="#F2B65D" opacity="0.9">
        <circle cx="206" cy="38" r="4" />
        <circle cx="30" cy="140" r="3" />
        <path d="M196 64l2 4 4.5.6-3.2 3.2.8 4.4-4.1-2.1-4 2.1.7-4.4-3.2-3.2 4.5-.6z" />
      </g>
    </svg>
  );
}
