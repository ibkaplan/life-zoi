"use client";

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Georgia, serif", padding: "2rem" }}>
        <h1>Something went wrong</h1>
        <p>lifeZoi could not open this view.</p>
        <button type="button" onClick={() => retry()}>
          Try again
        </button>
      </body>
    </html>
  );
}
