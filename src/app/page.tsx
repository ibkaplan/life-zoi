import Link from "next/link";
import { DisclaimerBlock } from "@/components/ui";
import { Wordmark } from "@/components/wordmark";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-6 md:px-8">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-3 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="flex items-center justify-between gap-4">
        <Wordmark />
        <Link href="/privacy" className="min-h-11 rounded-full px-3 py-2 font-semibold text-forest">
          Privacy
        </Link>
      </header>
      <main id="main" className="grid flex-1 content-center gap-8 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-forest uppercase">Health and longevity, without false precision</p>
          <h1 className="mt-3 max-w-xl font-display text-5xl leading-tight text-ink sm:text-6xl">A calmer way to look at everyday habits.</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            lifeZoi helps you reflect on sleep, movement, food, and connection, explore a WHAT IF? change, and keep a record of what you try. It does not diagnose, score your body, or predict how long you will live.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 font-semibold text-surface">
              Enter lifeZoi
            </Link>
            <Link href="/what-if" className="inline-flex min-h-11 items-center rounded-full border border-forest px-5 font-semibold text-forest">
              Look at WHAT IF?
            </Link>
          </div>
        </div>
        <div className="grid gap-3">
          {[
            ["Lifestyle assessment", "A short questionnaire with a review step. Sensitive questions can be skipped."],
            ["WHAT IF?", "Compare a current routine with a proposed habit, using public health sources."],
            ["Progress", "Monthly check-ins you enter yourself. Empty until you record something."],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-3xl border border-line bg-surface p-5">
              <h2 className="font-display text-2xl">{title}</h2>
              <p className="mt-2 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </main>
      <footer className="pb-6">
        <DisclaimerBlock />
      </footer>
    </div>
  );
}
