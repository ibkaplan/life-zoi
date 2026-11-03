import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  BRAND_LINE,
  BRAND_SUPPORT,
  CENTRAL_MESSAGE,
  DIRECTION_LINES,
  FOUNDATIONS,
  PROMISE_BOUNDARY,
  SUPPORTING_MESSAGE,
} from "@/lib/purpose";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE, sources } from "@/lib/sources";

function HomeArt() {
  return (
    <svg
      className="home-art-svg"
      viewBox="0 0 640 520"
      role="img"
      aria-label="Illustration of a sunrise over soft hills and a winding path"
    >
      <defs>
        <linearGradient id="home-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="48%" stopColor="#ecfeff" />
          <stop offset="100%" stopColor="#fce7f3" />
        </linearGradient>
        <linearGradient id="home-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
        <linearGradient id="home-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="home-hill-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="640" height="520" fill="url(#home-sky)" />
      <circle cx="470" cy="150" r="72" fill="url(#home-sun)" />
      <ellipse cx="150" cy="120" rx="70" ry="28" fill="#ffffff" opacity="0.72" />
      <ellipse cx="210" cy="108" rx="46" ry="20" fill="#fbcfe8" opacity="0.9" />
      <path d="M0 340c80-70 150-40 230-90 70-44 130-20 210 10 70 26 130 10 200-30v290H0V340z" fill="url(#home-hill-far)" opacity="0.9" />
      <path d="M0 400c90-50 160-20 250-70 80-44 140-16 230 18 60 22 110 16 160-8v180H0V400z" fill="url(#home-hill)" />
      <path d="M300 250c18 46 8 90-18 140" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
      <path d="M292 392c-36 18-70 22-112 16" fill="none" stroke="#fce7f3" strokeWidth="12" strokeLinecap="round" />
      <circle cx="168" cy="404" r="10" fill="#ffffff" />
      <path d="M430 286c8 16 22 22 36 18-8 14-28 22-46 12 2-12 4-22 10-30z" fill="#f5f3ff" />
      <path d="M448 292c10-16 24-22 34-14-12 6-22 16-26 28-6-4-8-8-8-14z" fill="#ddd6fe" />
    </svg>
  );
}

function MatterHomeArt() {
  return (
    <svg
      className="home-art-svg matter-float"
      viewBox="0 0 640 520"
      role="img"
      aria-label="Earth at sunrise, with trees and people of different generations"
    >
      <defs>
        <linearGradient id="matter-home-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="50%" stopColor="#cffafe" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </linearGradient>
        <linearGradient id="matter-home-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </linearGradient>
      </defs>
      <rect width="640" height="520" rx="28" fill="url(#matter-home-sky)" />
      <circle className="matter-sun" cx="470" cy="150" r="70" fill="url(#matter-home-sun)" />
      <circle cx="230" cy="300" r="92" fill="#5eead4" />
      <circle cx="200" cy="286" r="26" fill="#99f6e4" />
      <circle cx="258" cy="312" r="18" fill="#0f766e" opacity="0.35" />
      <path d="M70 360c22-62 36-62 58 0" fill="#0f766e" />
      <rect x="92" y="360" width="14" height="48" fill="#115e59" />
      <path d="M360 330c16-48 28-48 44 0" fill="#0d9488" />
      <rect x="376" y="330" width="12" height="40" fill="#115e59" />
      <circle cx="430" cy="300" r="18" fill="#5b21b6" />
      <rect x="418" y="318" width="24" height="48" rx="10" fill="#7c3aed" />
      <circle cx="490" cy="318" r="14" fill="#9d174d" />
      <rect x="480" y="332" width="20" height="38" rx="8" fill="#db2777" />
      <circle cx="548" cy="286" r="20" fill="#312e81" />
      <rect x="534" y="306" width="28" height="54" rx="10" fill="#4338ca" />
    </svg>
  );
}

function IconLifestyle() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 10v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconWhatIf() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 20c4-8 12-8 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 14h4M18 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="22" r="1.6" fill="currentColor" />
    </svg>
  );
}

function IconProgress() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 22h4v-6H7v6zm7 0h4V10h-4v12zm7 0h4v-9h-4v9z" fill="currentColor" />
    </svg>
  );
}

const features = [
  {
    href: "/assessment",
    title: "Understand Your Lifestyle",
    text: "Discover how your everyday habits affect your health and well-being.",
    icon: <IconLifestyle />,
    tone: "violet",
  },
  {
    href: "/what-if",
    title: "Explore What If?",
    text: "See how possible lifestyle changes could influence your future health.",
    icon: <IconWhatIf />,
    tone: "turquoise",
  },
  {
    href: "/progress",
    title: "Track Your Progress",
    text: "Follow your habits, goals, and personal progress over time.",
    icon: <IconProgress />,
    tone: "pink",
  },
] as const;

export default function HomePage() {
  return (
    <div className="home">
      <header className="page home-bar">
        <Logo tone="violet" />
        <nav className="home-nav" aria-label="Homepage">
          <Link href="/#your-life-matters">Your Life Matters</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <main id="main">
        <section className="page home-hero">
          <div className="home-copy">
            <p className="home-kicker">lifeZoi</p>
            <h1>Your Life. Your Health. Your Future.</h1>
            <p className="home-support">Small changes today can help you build a healthier tomorrow.</p>
            <p className="home-intro">
              Welcome. lifeZoi is a calm place to reflect on everyday habits, look at one possible change, and keep a simple record of what you try. It is educational. It does not diagnose, recommend medication changes, or predict how long you will live.
            </p>
            <div className="home-actions">
              <Link className="home-btn home-btn-primary" href="/assessment">
                Explore Your Health
              </Link>
              <Link className="home-btn home-btn-secondary" href="/what-if">
                Discover What If?
              </Link>
            </div>
          </div>
          <div className="home-art">
            <HomeArt />
          </div>
        </section>

        <section className="page home-features" aria-labelledby="home-features-title">
          <div className="home-section-head">
            <h2 id="home-features-title">A welcoming place to begin</h2>
            <p>Choose one path. You can leave sensitive questions blank, and nothing here is a medical instruction.</p>
          </div>
          <div className="home-grid">
            {features.map((feature) => (
              <Link key={feature.href} className="home-card" href={feature.href}>
                <span className={`home-icon home-icon-${feature.tone}`}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="page home-matters" id="your-life-matters" aria-labelledby="life-matters-title">
          <div className="home-matters-copy">
            <p className="home-kicker">Your Life Matters</p>
            <h2 id="life-matters-title">{CENTRAL_MESSAGE}</h2>
            <p>{SUPPORTING_MESSAGE}</p>
            <ul className="matter-lines">
              {DIRECTION_LINES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="matter-foundations">
              {FOUNDATIONS.map((item) => (
                <article key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <p className="matter-brand">{BRAND_LINE}</p>
            <p>{BRAND_SUPPORT}</p>
            <p>{PROMISE_BOUNDARY}</p>
            <Link className="home-btn home-btn-primary" href="/life-matters">
              Begin your reflection
            </Link>
          </div>
          <MatterHomeArt />
        </section>

        <section className="page home-cta" aria-labelledby="home-cta-title">
          <div>
            <h2 id="home-cta-title">Start with one reflection</h2>
            <p>Open the lifestyle assessment, or look at a WHAT IF? illustration. Both stay on this site.</p>
          </div>
          <div className="home-actions">
            <Link className="home-btn home-btn-primary" href="/assessment">
              Explore Your Health
            </Link>
            <Link className="home-btn home-btn-secondary" href="/progress">
              Track Your Progress
            </Link>
          </div>
        </section>

        <footer className="page home-footer">
          <p className="home-note">
            Development mode: there is no account. Answers stay in this browser tab until you close it. They are not securely stored.
          </p>
          <div className="home-footer-brand">
            <Logo tone="violet" />
            <p>Educational habit reflection for everyday life.</p>
          </div>
          <nav className="home-footer-links" aria-label="Footer">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/assessment">Lifestyle assessment</Link>
            <Link href="/what-if">WHAT IF?</Link>
            <Link href="/progress">Progress</Link>
            <Link href="/ai-assistant">AI Health Assistant</Link>
            <Link href="/life-matters">Your Life Matters</Link>
            <Link href="/change-lab">Change Lab</Link>
            <Link href="/settings">Settings</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <p>{PROFESSIONAL_NOTICE}</p>
          <p>
            {CRISIS_NOTICE}{" "}
            <a href={sources.samhsa988.url}>SAMHSA: 988 Suicide & Crisis Lifeline</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
