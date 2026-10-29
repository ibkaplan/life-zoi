import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-4 py-16">
      <p className="text-sm font-semibold tracking-[0.14em] text-forest uppercase">lifeZoi</p>
      <h1 className="mt-2 font-display text-5xl">That page is not here</h1>
      <p className="mt-3 text-lg text-muted">The link may be mistyped. Your saved notes were not changed.</p>
      <Link href="/dashboard" className="mt-6 inline-flex min-h-11 w-fit items-center rounded-full bg-forest px-4 font-semibold text-surface">
        Go to the dashboard
      </Link>
    </main>
  );
}
