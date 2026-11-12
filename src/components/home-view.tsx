"use client";

import Image from "next/image";
import Link from "next/link";
import { HomeGauge } from "@/components/home-gauge";
import { Art, type ArtName } from "@/components/companion/art";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { StorageNote } from "@/components/storage-note";
import { useMessages, useT } from "@/components/locale-provider";
import { sources } from "@/lib/sources";

const cards = [
  {
    key: "today",
    href: "/assessment",
    src: "/home/card-today.webp",
    width: 1100,
    height: 825,
  },
  {
    key: "change",
    href: "/what-if",
    src: "/home/card-change.webp",
    width: 1100,
    height: 733,
  },
  {
    key: "food",
    href: "/academy/meals",
    src: "/home/card-food.webp",
    width: 1100,
    height: 733,
  },
  {
    key: "move",
    href: "/academy/move",
    src: "/home/card-move.webp",
    width: 1100,
    height: 733,
  },
] as const;

type CompanionKey = "plan" | "day" | "library" | "meals" | "breathe" | "music" | "books" | "games" | "checkin";

const companion: { key: CompanionKey; href: string; art: ArtName }[] = [
  { key: "plan", href: "/plan", art: "plan" },
  { key: "day", href: "/my-day", art: "day" },
  { key: "library", href: "/academy/move/library", art: "yoga" },
  { key: "meals", href: "/food-plan/today", art: "meal" },
  { key: "breathe", href: "/breathe", art: "music" },
  { key: "music", href: "/library/music", art: "music" },
  { key: "books", href: "/library/books", art: "book" },
  { key: "games", href: "/brain-quiz/games", art: "brain" },
  { key: "checkin", href: "/progress/weekly", art: "checkin" },
];

const steps = [
  { key: "assessment", href: "/assessment", number: "01" },
  { key: "outlook", href: "/outlook", number: "02" },
  { key: "whatIf", href: "/what-if", number: "03" },
  { key: "plan", href: "/plan", number: "04" },
] as const;

const footerLinks = [
  "/dashboard", "/my-health", "/assessment", "/outlook", "/plan", "/what-if", "/progress", "/wellness-coach", "/academy",
  "/academy/meals", "/academy/move", "/academy/move/resources", "/choices", "/urges", "/nature", "/ai-assistant",
  "/emotional-wellness", "/life-matters", "/change-lab", "/brain-quiz", "/habit-transformation", "/food-plan",
  "/academy/move/library", "/library/music", "/library/books", "/brain-quiz/games", "/focus", "/my-day", "/settings",
  "/profile", "/privacy",
] as const;

/** The homepage. A client component so the text follows the language picked in the header. */
export function HomeView() {
  const m = useMessages();
  const t = useT();
  const h = m.home;
  const footerLabel = (href: (typeof footerLinks)[number]) =>
    href === "/plan" ? h.improvementPlan : href === "/food-plan" ? h.foodWellness : (m.nav as Record<string, string>)[href];
  return (
    <div className="home">
      <SiteNav />
      <main id="main">
        <section className="page home-hero">
          <div className="home-copy">
            <p className="home-kicker">{h.kicker}</p>
            <p className="home-brand">{h.brand}</p>
            <p className="script brand-line">{h.brandLine}</p>
            <h1>{h.title}</h1>
            <p className="home-support">{h.support}</p>
            <p className="home-intro">{h.intro}</p>
            <div className="home-actions">
              <Link className="home-btn home-btn-primary" href="/assessment">
                <span>{h.cta}</span>
                <small>{h.ctaSub}</small>
              </Link>
              <Link className="home-btn home-btn-dashboard" href="/dashboard">
                <span>{h.dashboardCta}</span>
                <small>{h.dashboardCtaSub}</small>
              </Link>
            </div>
            <p className="home-disclaimer" role="note">
              {h.disclaimer}
            </p>
            <p>{h.dignity}</p>
          </div>
          <figure className="home-hero-photo">
            <Image
              src="/home/hero-meadow.webp"
              width={1600}
              height={1200}
              priority
              sizes="(min-width: 860px) 46vw, 100vw"
              alt={h.heroAlt}
            />
          </figure>
        </section>

        <section className="page home-companion" aria-labelledby="home-companion-title">
          <div className="home-section-head">
            <p className="script brand-line">{h.companionLine}</p>
            <h2 id="home-companion-title">{h.companionTitle}</h2>
            <p>{h.companionIntro}</p>
          </div>
          <div className="lz-grid home-companion-grid">
            {companion.map((item) => (
              <Link key={item.href} className="lz-card home-companion-card" href={item.href}>
                <Art name={item.art} />
                <strong>{h.companion[item.key].title}</strong>
                <span>{h.companion[item.key].text}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="page home-features" aria-labelledby="home-paths-title">
          <div className="home-section-head">
            <h2 id="home-paths-title">{h.pathsTitle}</h2>
            <p>{h.pathsIntro}</p>
          </div>
          <div className="home-grid">
            {cards.map((card) => (
              <Link key={card.href} className="home-photo-card" href={card.href}>
                <Image src={card.src} width={card.width} height={card.height} alt={h.cards[card.key].alt} sizes="(min-width: 860px) 40vw, 100vw" />
                <span>{h.cards[card.key].title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="page home-free-exercise" aria-labelledby="free-exercise-home">
          <h2 id="free-exercise-home">{h.freeExerciseTitle}</h2>
          <p>{h.freeExerciseText}</p>
          <Link className="home-btn home-btn-secondary" href="/academy/move/resources">
            {h.openInMovement}
          </Link>
        </section>

        {/* Life Outlook stays on the homepage, below the main content. */}
        <HomeGauge />

        <section className="page home-works" aria-labelledby="home-works-title">
          <div className="home-section-head">
            <h2 id="home-works-title">{h.worksTitle}</h2>
          </div>
          <ol className="home-steps">
            {steps.map((step) => (
              <li className="home-step" key={step.href}>
                <Link href={step.href}>
                  <span>{step.number}</span>
                  {h.steps[step.key]}
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <footer className="page home-footer">
          <StorageNote />
          <div className="home-footer-brand">
            <Logo tone="violet" />
            <p>{h.footerTagline}</p>
          </div>
          <nav className="home-footer-links" aria-label={h.footerNav}>
            {footerLinks.map((href) => (
              <Link key={href} href={href}>
                {footerLabel(href)}
              </Link>
            ))}
          </nav>
          <p>{m.shell.professionalNotice}</p>
          <p>
            {m.shell.crisisNotice}{" "}
            <a href={sources.samhsa988.url}>{m.shell.crisisLink}</a>
          </p>
          <details className="home-credits">
            <summary>{h.photoCredits}</summary>
            <ul>
              <li>{h.creditMeadow}</li>
              <li>
                {h.creditWalking}{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Woman_power_walking.jpg">{t("Woman power walking")}</a>
              </li>
              <li>
                {h.creditHomeCc0}{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Old_man_reading_newspaper_with_tea_(Unsplash).jpg">{t("cafe window")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Sunrise_hiking_views_(Unsplash).jpg">{t("sunrise ridge")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Fruits_and_Vegetables_(Unsplash).jpg">{t("fruit and herbs")}</a>.
              </li>
              <li>
                {h.creditSectionCc0}{" "}
                <a href="https://commons.wikimedia.org/wiki/File:Colorful_Wildflowers_(Unsplash).jpg">{t("wildflowers")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Mountains_by_the_lake_(Unsplash).jpg">{t("lake and mountains")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Walking_up_an_outdoor_path_(Unsplash).jpg">{t("split lane")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Vegetable_Salad_(Unsplash).jpg">{t("vegetable bowl")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Woman_walking_down_path_(Unsplash).jpg">{t("park path")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Elevating_view_of_forest_trees_(Unsplash).jpg">{t("forest trees")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Stepping_stone_staircase_(Unsplash).jpg">{t("stone steps")}</a>
                {", "}
                <a href="https://commons.wikimedia.org/wiki/File:Open_book_(Unsplash).jpg">{t("open book")}</a>.
              </li>
            </ul>
          </details>
        </footer>
      </main>
    </div>
  );
}
