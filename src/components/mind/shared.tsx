"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";
import { standingCrisisNotice } from "@/lib/emotional-wellness/crisis";
import { articleBySlug, type ArticleMotif } from "@/lib/mind/articles";
import { exerciseById } from "@/lib/mind/exercises";
import { OUTSIDE_US_LINE, STANDING_SAFETY_LINE, US_CRISIS_ACTIONS } from "@/lib/mind/safety";
import { bindMindOwner, getMindServerSnapshot, getMindSnapshot, subscribeMind } from "@/lib/mind/store";
import "./mind.css";

const TABS = [
  { href: "/mind", label: "Talk" },
  { href: "/mind/understand", label: "Understand yourself" },
  { href: "/mind/exercises", label: "Exercises" },
  { href: "/mind/plan", label: "7-day plan" },
  { href: "/mind/library", label: "Psychology Encyclopedia" },
  { href: "/mind/progress", label: "My progress" },
  { href: "/mind/privacy", label: "Privacy & safety" },
];

/** LifeZoi Mind is written in English for now. Each note is written in its own language. */
const ENGLISH_ONLY: Record<string, string> = {
  uk: "LifeZoi Mind поки що доступний лише англійською. Перекладені версії PHQ-9 та GAD-7 можна показувати лише в офіційних перекладах, і їх ще не додано.",
  ru: "LifeZoi Mind пока доступен только на английском. Переводы PHQ-9 и GAD-7 можно показывать только в официальных версиях, и они ещё не добавлены.",
  el: "Το LifeZoi Mind είναι προς το παρόν διαθέσιμο μόνο στα αγγλικά. Τα PHQ-9 και GAD-7 μπορούν να εμφανιστούν μόνο σε επίσημες μεταφράσεις, οι οποίες δεν έχουν προστεθεί ακόμη.",
};

export function useMindStore() {
  const account = useAccount();
  const owner = account.phase === "ready" ? account.userId : null;
  useEffect(() => {
    if (account.phase !== "loading") bindMindOwner(owner);
  }, [account.phase, owner]);
  return useSyncExternalStore(subscribeMind, getMindSnapshot, getMindServerSnapshot);
}

export function SafetyActions({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mind-safety-actions">
      {US_CRISIS_ACTIONS.filter((action) => !compact || action.href.startsWith("tel:") || action.href.startsWith("sms:")).map((action, index) => (
        <a key={action.href} href={action.href} className={index === 0 || action.href === "tel:911" ? "" : "secondary"} aria-label={`${action.label}: ${action.detail}`}>
          {action.label}
        </a>
      ))}
    </div>
  );
}

export function StandingSafety() {
  const t = useT();
  const { locale } = useLocale();
  return (
    <aside className="mind-safety" aria-label="Crisis support">
      <p>
        <strong>{STANDING_SAFETY_LINE}</strong>
      </p>
      {locale !== "en" ? <p lang={locale}>{standingCrisisNotice("us", t)}</p> : null}
      <SafetyActions compact />
      <p>{OUTSIDE_US_LINE}</p>
    </aside>
  );
}

export function MindShell({ title, intro, children, hero = false }: { title: string; intro?: string; children: React.ReactNode; hero?: boolean }) {
  const pathname = usePathname() ?? "/mind";
  const { locale } = useLocale();
  const current = TABS.filter((tab) => pathname === tab.href || (tab.href !== "/mind" && pathname.startsWith(`${tab.href}/`))).pop()?.href ?? (pathname === "/mind" ? "/mind" : null);
  return (
    <div className="mind" lang="en">
      <header className={hero ? "mind-hero" : "stack"}>
        <p className="kicker">LifeZoi Mind</p>
        <h1>{title}</h1>
        {intro ? <p className={hero ? "mind-hero-sub" : "lede"}>{intro}</p> : null}
      </header>
      <nav className="mind-tabs" aria-label="LifeZoi Mind sections">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} aria-current={current === tab.href ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </nav>
      {ENGLISH_ONLY[locale] ? (
        <p className="mind-note" lang={locale}>
          {ENGLISH_ONLY[locale]}
        </p>
      ) : null}
      {children}
      <StandingSafety />
      <p className="hint">
        LifeZoi Mind is an educational emotional wellness tool. It is not a licensed psychologist, psychiatrist, or medical provider, it does not diagnose or treat any condition, and it is not a substitute for therapy. It has not been reviewed by a licensed clinician.
      </p>
    </div>
  );
}

export function ExerciseLinks({ ids, why }: { ids: readonly string[]; why?: string | null }) {
  const list = ids.map((id) => exerciseById(id)).filter((entry) => entry !== null);
  if (list.length === 0) return null;
  return (
    <div className="mind-suggest">
      <p className="mind-suggest-title">Exercises you could try (optional)</p>
      <ul>
        {list.map((exercise) => (
          <li key={exercise.id}>
            <Link href={`/mind/exercises/${exercise.id}`}>{exercise.title}</Link> — {exercise.summary}
          </li>
        ))}
      </ul>
      {why ? <p className="hint">Why these may help: {why}</p> : null}
    </div>
  );
}

export function ArticleLinks({ slugs, title = "From the LifeZoi Psychology Encyclopedia" }: { slugs: readonly string[]; title?: string }) {
  const list = slugs.map((slug) => articleBySlug(slug)).filter((entry) => entry !== null);
  if (list.length === 0) return null;
  return (
    <div className="mind-suggest">
      <p className="mind-suggest-title">{title}</p>
      <ul>
        {list.map((article) => (
          <li key={article.slug}>
            <Link href={`/mind/library/${article.slug}`}>{article.title}</Link> <span className="hint">· {article.minutes} min read</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MOTIF_PATHS: Record<ArticleMotif, React.ReactNode> = {
  heart: <path d="M60 92 C20 64 22 34 42 30 C52 28 58 36 60 42 C62 36 68 28 78 30 C98 34 100 64 60 92Z" fill="#B98EE5" />,
  brain: (
    <g fill="none" stroke="#6A3DA8" strokeWidth="5" strokeLinecap="round">
      <path d="M58 30 C40 26 28 38 32 52 C22 58 26 76 40 76 C44 88 58 88 60 80 L60 30" />
      <path d="M62 30 C80 26 92 38 88 52 C98 58 94 76 80 76 C76 88 62 88 60 80" />
    </g>
  ),
  wave: <path d="M14 64 Q30 44 46 64 T78 64 T110 64" fill="none" stroke="#2F8F83" strokeWidth="7" strokeLinecap="round" />,
  cloud: <path d="M34 78 C18 78 18 56 34 56 C36 40 58 36 64 50 C72 42 90 48 86 62 C100 62 100 78 86 78Z" fill="#A8BFAE" />,
  people: (
    <g fill="#6A3DA8">
      <circle cx="44" cy="44" r="11" />
      <circle cx="76" cy="44" r="11" />
      <path d="M24 88 C24 68 64 68 64 88Z" />
      <path d="M56 88 C56 68 96 68 96 88Z" opacity="0.7" />
    </g>
  ),
  mirror: (
    <g>
      <ellipse cx="60" cy="54" rx="24" ry="30" fill="#EFE5FA" stroke="#6A3DA8" strokeWidth="5" />
      <path d="M60 84 L60 96 M46 98 L74 98" stroke="#6A3DA8" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),
  lightbulb: (
    <g>
      <path d="M60 24 C40 24 32 46 44 60 C50 66 50 72 50 78 L70 78 C70 72 70 66 76 60 C88 46 80 24 60 24Z" fill="#F2B65D" />
      <rect x="50" y="82" width="20" height="8" rx="3" fill="#6A3DA8" />
    </g>
  ),
  home: <path d="M24 60 L60 30 L96 60 L86 60 L86 92 L34 92 L34 60Z" fill="#A8BFAE" stroke="#2F8F83" strokeWidth="4" strokeLinejoin="round" />,
  path: <path d="M20 96 C40 70 80 80 60 52 C46 32 76 24 100 24" fill="none" stroke="#B98EE5" strokeWidth="8" strokeLinecap="round" />,
  sprout: (
    <g>
      <path d="M60 96 L60 54" stroke="#2F8F83" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 60 C40 60 32 44 34 34 C48 34 60 44 60 60Z" fill="#A8BFAE" />
      <path d="M60 54 C78 54 88 40 86 28 C70 28 60 40 60 54Z" fill="#2F8F83" />
    </g>
  ),
  book: (
    <g>
      <path d="M20 34 L58 40 L58 92 L20 86Z" fill="#EFE5FA" stroke="#6A3DA8" strokeWidth="4" />
      <path d="M100 34 L62 40 L62 92 L100 86Z" fill="#EFE5FA" stroke="#6A3DA8" strokeWidth="4" />
    </g>
  ),
  leaf: <path d="M30 90 C30 50 60 26 96 26 C96 64 70 90 30 90Z M30 90 L72 46" fill="#A8BFAE" stroke="#2F8F83" strokeWidth="4" />,
  moon: <path d="M72 24 C48 28 36 50 42 70 C48 90 74 98 94 84 C70 84 54 62 72 24Z" fill="#6A3DA8" />,
  sun: (
    <g>
      <circle cx="60" cy="60" r="20" fill="#F2B65D" />
      <g stroke="#F2B65D" strokeWidth="5" strokeLinecap="round">
        <path d="M60 22 L60 32 M60 88 L60 98 M22 60 L32 60 M88 60 L98 60 M33 33 L40 40 M80 80 L87 87 M87 33 L80 40 M40 80 L33 87" />
      </g>
    </g>
  ),
  spark: <path d="M60 18 L68 52 L102 60 L68 68 L60 102 L52 68 L18 60 L52 52Z" fill="#F2B65D" stroke="#6A3DA8" strokeWidth="3" />,
};

export function MotifArt({ motif, className }: { motif: ArticleMotif; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">
      <rect width="120" height="120" rx="24" fill="#F9F7F2" />
      {MOTIF_PATHS[motif]}
    </svg>
  );
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso.slice(0, 10) : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
