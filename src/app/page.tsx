import Image from "next/image";
import Link from "next/link";
import { HomeGauge } from "@/components/home-gauge";
import { Logo } from "@/components/logo";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE, sources } from "@/lib/sources";

const nav = [
  { href: "/", label: "Home" },
  { href: "/outlook", label: "Life outlook" },
  { href: "/what-if", label: "WHAT IF" },
  { href: "/academy/meals", label: "Nutrition" },
  { href: "/academy/move", label: "Movement" },
  { href: "/nature", label: "Nature" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
] as const;

const cards = [
  {
    href: "/assessment",
    title: "Know where you stand today",
    src: "/home/card-today.webp",
    width: 1100,
    height: 825,
    alt: "An older man sits by a bright cafe window with a cup of tea.",
  },
  {
    href: "/what-if",
    title: "What if you made a change?",
    src: "/home/card-change.webp",
    width: 1100,
    height: 733,
    alt: "A person stands on a grassy ridge under a peach and blue sunrise.",
  },
  {
    href: "/academy/meals",
    title: "Eat well. Feel better.",
    src: "/home/card-food.webp",
    width: 1100,
    height: 733,
    alt: "Green herbs and a crate of apples at a market.",
  },
  {
    href: "/academy/move",
    title: "Movement is life",
    src: "/home/card-move.webp",
    width: 1100,
    height: 733,
    alt: "An older woman smiles while walking outdoors in a red jacket.",
  },
] as const;

const steps = [
  { href: "/assessment", number: "01", title: "Fill out your assessment" },
  { href: "/outlook", number: "02", title: "Get your life outlook" },
  { href: "/what-if", number: "03", title: "Explore WHAT IF? scenarios" },
  { href: "/plan", number: "04", title: "Build your personal plan" },
] as const;

export default function HomePage() {
  return (
    <div className="home">
      <header className="page home-bar">
        <Logo tone="violet" />
        <nav className="home-nav" aria-label="Homepage">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main">
        <section className="page home-hero">
          <div className="home-copy">
            <p className="home-kicker">LIFEZOI</p>
            <h1>YOUR LIFE. YOUR HEALTH. YOUR FUTURE.</h1>
            <p className="home-support">Have you ever wondered what your future health might look like?</p>
            <p className="home-intro">
              Your everyday choices matter more than you may realize. Your future is not a fixed number.
            </p>
            <div className="home-actions">
              <Link className="home-btn home-btn-primary" href="/assessment">
                <span>FILL OUT YOUR ASSESSMENT</span>
                <small>Get your personal health and longevity outlook</small>
              </Link>
            </div>
            <p className="home-disclaimer" role="note">
              LifeZoi provides educational information and statistical estimates. It cannot predict your exact lifespan, diagnose medical conditions, or replace professional medical advice.
            </p>
            <p>Disability or illness does not make a life less valuable.</p>
          </div>
          <figure className="home-hero-photo">
            <Image
              src="/home/hero-hike.webp"
              width={1600}
              height={1067}
              priority
              sizes="(min-width: 860px) 46vw, 100vw"
              alt="A woman and a girl stand together on a sunny mountain trail."
            />
          </figure>
        </section>

        <HomeGauge />

        <section className="page home-features" aria-labelledby="home-paths-title">
          <div className="home-section-head">
            <h2 id="home-paths-title">Choose a path</h2>
            <p>Each card opens a part of lifeZoi that is already here. Sensitive questions can stay blank.</p>
          </div>
          <div className="home-grid">
            {cards.map((card) => (
              <Link key={card.href} className="home-photo-card" href={card.href}>
                <Image src={card.src} width={card.width} height={card.height} alt={card.alt} sizes="(min-width: 860px) 40vw, 100vw" />
                <span>{card.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="page home-works" aria-labelledby="home-works-title">
          <div className="home-section-head">
            <h2 id="home-works-title">HOW LIFEZOI WORKS</h2>
          </div>
          <ol className="home-steps">
            {steps.map((step) => (
              <li className="home-step" key={step.href}>
                <Link href={step.href}>
                  <span>{step.number}</span>
                  {step.title}
                </Link>
              </li>
            ))}
          </ol>
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
            <Link href="/outlook">Life outlook</Link>
            <Link href="/plan">Improvement plan</Link>
            <Link href="/what-if">WHAT IF?</Link>
            <Link href="/progress">Progress</Link>
            <Link href="/wellness-coach">Wellness coach</Link>
            <Link href="/academy">Academy</Link>
            <Link href="/academy/meals">Nutrition</Link>
            <Link href="/academy/move">Movement</Link>
            <Link href="/choices">Daily choices</Link>
            <Link href="/urges">Urges</Link>
            <Link href="/nature">Nature</Link>
            <Link href="/ai-assistant">AI Health Assistant</Link>
            <Link href="/life-matters">Your Life Matters</Link>
            <Link href="/change-lab">Change Lab</Link>
            <Link href="/settings">Settings</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <p>{PROFESSIONAL_NOTICE}</p>
          <p>
            {CRISIS_NOTICE}{" "}
            <a href={sources.samhsa988.url}>SAMHSA: 988 Suicide & Crisis Lifeline</a>
          </p>
          <details className="home-credits">
            <summary>Photo credits</summary>
            <ul>
              <li>
                Woman and girl on a trail: Ronald Laubenstein, U.S. Fish and Wildlife Service, public domain.{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Woman_and_girl_hike_in_nature.jpg">Woman and girl hike in nature</a>
              </li>
              <li>
                Woman walking: National Cancer Institute, public domain.{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Woman_power_walking.jpg">Woman power walking</a>
              </li>
              <li>
                Other photos are CC0, via Wikimedia Commons:{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Old_man_reading_newspaper_with_tea_(Unsplash).jpg">cafe window</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Sunrise_hiking_views_(Unsplash).jpg">sunrise ridge</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Fruits_and_Vegetables_(Unsplash).jpg">fruit and herbs</a>.
              </li>
            </ul>
          </details>
        </footer>
      </main>
    </div>
  );
}
