import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/localized-text";
import { MindShell } from "@/components/mind/shared";
import { MIND_AREAS } from "@/lib/mind/areas";
import { MindTalk } from "@/components/mind/mind-talk";

export const metadata: Metadata = {
  title: "LifeZoi Mind",
  description: "LifeZoi Mind, your personal emotional wellness companion: talk by voice or text, optional self-assessments, guided exercises, a 7-day plan, and a psychology encyclopedia. Educational, not therapy.",
};


export default function MindPage() {
  return (
    <MindShell hero translated title="A place to talk, understand yourself, and find a healthier way forward" intro="Your personal emotional wellness companion. Speak or type about your day, explore your feelings, and discover practical, evidence-informed exercises. Free, private, and educational. It is not therapy.">
      <MindTalk />
      <section className="stack" aria-labelledby="mind-areas">
        <h2 id="mind-areas">
          <T text="More in LifeZoi Mind" />
        </h2>
        <div className="mind-grid">
          {MIND_AREAS.map((area) => (
            <Link key={area.href} href={area.href} className="mind-card">
              <h3>
                <T text={area.title} />
              </h3>
              <p>
                <T text={area.text} />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </MindShell>
  );
}
