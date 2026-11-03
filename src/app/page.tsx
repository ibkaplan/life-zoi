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
  {
    href: "/nature",
    title: "Bring more nature into your life",
    src: "/home/card-nature.webp",
    width: 1100,
    height: 732,
    alt: "Sunlight falls across a quiet forest path.",
  },
  {
    href: "/progress",
    title: "Your journey. Your progress. Your future.",
    src: "/home/card-journey.webp",
    width: 1100,
    height: 732,
    alt: "An older woman walks along a neighborhood sidewalk with a bouquet of flowers.",
  },
] as const;

const lifePhotos = [
  {
    src: "/home/life-seat.webp",
    width: 900,
    height: 1350,
    alt: "An older woman sits comfortably indoors beside a turquoise door.",
  },
  {
    src: "/home/life-art.webp",
    width: 900,
    height: 600,
    alt: "An older woman looks at pictures in a gallery.",
  },
  {
    src: "/home/card-food.webp",
    width: 1100,
    height: 733,
    alt: "Fresh herbs and apples.",
  },
  {
    src: "/home/card-nature.webp",
    width: 1100,
    height: 732,
    alt: "A sunlit forest path.",
  },
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
            <p className="home-brand">LIVE BETTER. MAKE LIFE MATTER.</p>
            <h1>YOUR LIFE. YOUR HEALTH. YOUR FUTURE.</h1>
            <p className="home-support">Have you ever wondered what your future health might look like?</p>
            <p className="home-intro">
              Your everyday choices matter more than you may realize. Discover your health and longevity outlook.
            </p>
            <div className="home-actions">
              <Link className="home-btn home-btn-primary" href="/assessment">
                <span>DISCOVER YOUR LIFE OUTLOOK</span>
                <small>Start your personal health and lifestyle assessment</small>
              </Link>
              <Link className="home-btn home-btn-secondary" href="/outlook">
                Your future is not a fixed number. Your choices matter.
              </Link>
            </div>
            <p className="home-disclaimer" role="note">
              LifeZoi provides educational information and statistical estimates. It cannot predict your exact lifespan, diagnose medical conditions, or replace professional medical advice.
            </p>
          </div>
          <figure className="home-hero-photo">
            <Image
              src="/home/hero-park.webp"
              width={1600}
              height={1063}
              priority
              sizes="(min-width: 860px) 46vw, 100vw"
              alt="Two adults smile together on a sunny lawn beneath trees."
            />
          </figure>
        </section>

        <section className="page home-features" aria-labelledby="home-paths-title">
          <div className="home-section-head">
            <h2 id="home-paths-title">Choose a path</h2>
            <p>Each card opens a part of lifeZoi that is already here. Sensitive questions can stay blank.</p>
          </div>
          <div className="home-grid">
            {cards.map((card) => (
              <Link key={card.href} className="home-photo-card" href={card.href}>
                <Image src={card.src} width={card.width} height={card.height} alt={card.alt} sizes="(min-width: 860px) 30vw, 100vw" />
                <span>{card.title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="page home-life" aria-labelledby="home-life-title">
          <div className="home-life-copy">
            <h2 id="home-life-title">LIFE IS MORE THAN A NUMBER</h2>
            <ul className="home-values">
              <li>YOUR HEALTH GIVES YOU POSSIBILITIES.</li>
              <li>YOUR CHOICES GIVE YOUR LIFE DIRECTION.</li>
              <li>YOUR KINDNESS GIVES THE WORLD SOMETHING VALUABLE.</li>
            </ul>
            <p>Disability or illness does not make a life less valuable.</p>
          </div>
          <ul className="home-life-photos">
            {lifePhotos.map((photo) => (
              <li key={photo.src + photo.alt}>
                <Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} sizes="(min-width: 860px) 22vw, 50vw" />
              </li>
            ))}
          </ul>
        </section>

        <HomeGauge />

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
                Couple on a lawn and woman walking: National Cancer Institute, public domain.{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Couple_walking_in_a_park.jpg">Couple walking in a park</a>
                {" · "}
                <a href="https://commons.wikimedia.org/wiki/File:Woman_power_walking.jpg">Woman power walking</a>
              </li>
              <li>
                Other photos are CC0, via Wikimedia Commons:{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Old_man_reading_newspaper_with_tea_(Unsplash).jpg">cafe window</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Sunrise_hiking_views_(Unsplash).jpg">sunrise ridge</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Fruits_and_Vegetables_(Unsplash).jpg">fruit and herbs</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Forest_path_at_sunset_(Unsplash).jpg">forest path</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Lady_with_a_floral_bouquet_(Unsplash).jpg">bouquet</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Portrait_of_elderly_woman_(Unsplash).jpg">seated portrait</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Elderly_woman_gazing_at_art_(Unsplash).jpg">gallery</a>.
              </li>
            </ul>
          </details>
        </footer>
      </main>
    </div>
  );
}
