"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useMessages } from "@/components/locale-provider";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { inviteTokenFromInput } from "@/lib/invitations/link";

/**
 * The public landing page, the only feature-free page a visitor sees.
 * Logo, an introductory image, a short description, Log in, and how to join by invitation.
 * It links to no feature: everything else needs a signed-in member.
 */
export function LandingView() {
  const m = useMessages();
  const h = m.home;
  const a = m.access;
  const router = useRouter();
  const fieldId = useId();
  const [value, setValue] = useState("");
  const [problem, setProblem] = useState("");

  return (
    <div className="home landing">
      <PublicHeader />
      <main id="main">
        <section className="page home-hero landing-hero">
          <div className="home-copy">
            <p className="home-kicker">{h.kicker}</p>
            <p className="script brand-line">{h.brandLine}</p>
            <h1>{a.landingTitle}</h1>
            <p className="home-support">{a.landingText}</p>
            <div className="home-actions">
              <Link className="home-btn home-btn-primary" href="/sign-in">
                <span>{a.logIn}</span>
              </Link>
              <a className="home-btn home-btn-secondary" href="#invitation">
                <span>{a.haveInvitation}</span>
              </a>
            </div>
            <p className="home-disclaimer" role="note">
              {a.membersOnly}
            </p>
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

        <section id="invitation" className="page landing-invite" aria-labelledby="landing-invite-title">
          <div className="card stack">
            <h2 id="landing-invite-title">{a.inviteTitle}</h2>
            <p>{a.inviteEmail}</p>
            <p>{a.inviteLink}</p>
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                const token = inviteTokenFromInput(value);
                if (!token) {
                  setProblem(a.inviteInvalid);
                  return;
                }
                setProblem("");
                router.push(`/welcome?invite=${encodeURIComponent(token)}`);
              }}
            >
              <label className="field" htmlFor={fieldId}>
                <span>{a.inviteLabel}</span>
                <input
                  id={fieldId}
                  autoComplete="off"
                  spellCheck={false}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </label>
              <div className="actions">
                <button className="btn btn-primary" type="submit">
                  {a.inviteGo}
                </button>
              </div>
              {problem ? (
                <p className="alert alert-error" role="alert">
                  {problem}
                </p>
              ) : null}
            </form>
            <p className="hint">{a.noPublicSignUp}</p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
