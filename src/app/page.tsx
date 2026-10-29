import Link from "next/link";
import { Logo } from "@/components/logo";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE } from "@/lib/sources";
import { sources } from "@/lib/sources";

export default function HomePage() {
  return (
    <>
      <header className="page landing-bar">
        <Logo />
        <Link href="/privacy">Privacy</Link>
      </header>
      <main id="main" className="page stack-lg">
        <section className="hero">
          <div className="hero-panel">
            <p className="kicker">lifeZoi</p>
            <h1>A calmer way to look at everyday health.</h1>
            <p className="lede">
              Reflect on sleep, movement, food, stress, and connection. Explore a WHAT IF? change. Keep a simple record of what you try. lifeZoi is a companion for reflection, not a clinic and not a fitness score.
            </p>
            <div className="actions">
              <Link className="btn btn-primary" href="/dashboard">
                Enter lifeZoi
              </Link>
              <Link className="btn btn-secondary" href="/privacy">
                How your data is handled
              </Link>
            </div>
          </div>
          <p className="banner">
            Development mode: there is no account. Answers stay in this browser tab until you close it. They are not securely stored.
          </p>
        </section>
        <section className="feature-grid">
          <article className="card stack">
            <h2>Lifestyle assessment</h2>
            <p>A short, optional-where-it-matters questionnaire. You can leave sensitive questions blank and change answers later.</p>
          </article>
          <article className="card stack">
            <h2>WHAT IF?</h2>
            <p>Compare a current routine with a possible habit change. Benefits stay tied to public sources, and uncertain outcomes stay uncertain.</p>
          </article>
          <article className="card stack">
            <h2>Progress</h2>
            <p>Monthly check-ins and a history of assessments and scenarios. Charts appear only after you have recorded enough days.</p>
          </article>
        </section>
        <footer className="footer-note">
          <p>{PROFESSIONAL_NOTICE}</p>
          <p>
            {CRISIS_NOTICE}{" "}
            <a href={sources.samhsa988.url}>SAMHSA: 988 Suicide & Crisis Lifeline</a>
          </p>
        </footer>
      </main>
    </>
  );
}
