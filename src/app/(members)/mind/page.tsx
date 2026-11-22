import type { Metadata } from "next";
import Link from "next/link";
import { MindShell } from "@/components/mind/shared";
import { MindTalk } from "@/components/mind/mind-talk";

export const metadata: Metadata = {
  title: "LifeZoi Mind",
  description: "LifeZoi Mind, your personal emotional wellness companion: talk by voice or text, optional self-assessments, guided exercises, a 7-day plan, and a psychology encyclopedia. Educational, not therapy.",
};

const AREAS = [
  { href: "/mind/understand", title: "Understand yourself", text: "Optional questionnaires: the validated GAD-7 and PHQ-9, plus short self-reflections." },
  { href: "/mind/exercises", title: "Guided exercises", text: "Breathing, relaxation, grounding, thought reframing, boundaries, sleep, and more, read aloud step by step." },
  { href: "/mind/plan", title: "7-day wellness plan", text: "An optional, flexible week of small practices that you choose." },
  { href: "/mind/library", title: "Psychology Encyclopedia", text: "Plain-language articles with sources and evidence labels." },
  { href: "/mind/progress", title: "My progress", text: "Optional, private, and deletable. Off unless you turn it on." },
  { href: "/mind/privacy", title: "Privacy & safety", text: "What happens to your words, and what LifeZoi Mind can and cannot do." },
];

export default function MindPage() {
  return (
    <MindShell hero title="A place to talk, understand yourself, and find a healthier way forward" intro="Your personal emotional wellness companion. Speak or type about your day, explore your feelings, and discover practical, evidence-informed exercises. Free, private, and educational. It is not therapy.">
      <MindTalk />
      <section className="stack" aria-labelledby="mind-areas">
        <h2 id="mind-areas">More in LifeZoi Mind</h2>
        <div className="mind-grid">
          {AREAS.map((area) => (
            <Link key={area.href} href={area.href} className="mind-card">
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </MindShell>
  );
}
