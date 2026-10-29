"use client";

export default function AppError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="card stack" role="alert">
      <h1>Something went wrong</h1>
      <p>This page could not be shown. If you had typed answers, they may still be in this browser tab.</p>
      <button className="btn btn-primary" type="button" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
