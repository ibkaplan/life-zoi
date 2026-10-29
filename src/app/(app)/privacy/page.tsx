import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How lifeZoi handles answers in development mode, and what it does not claim.",
};

export default function PrivacyPage() {
  return (
    <article className="stack-lg narrow">
      <div>
        <p className="kicker">Privacy</p>
        <h1>What stays in this browser</h1>
      </div>
      <section className="card stack">
        <h2>Development mode</h2>
        <p>
          This build has no accounts and no database. Assessment answers, WHAT IF? scenarios, goals, and check-ins are kept in this browser tab’s session storage. Closing the tab clears them. They are not encrypted at rest by lifeZoi, and they are not a secure health record.
        </p>
        <p>
          A suggestion or WHAT IF? request is sent to this app’s own server so the answers can be checked. The server does not store that request and does not send it to an AI service. No AI provider is configured.
        </p>
      </section>
      <section className="card stack">
        <h2>What is collected</h2>
        <p>
          Only what you type: an optional name and age range, sleep, movement, food and water, optional tobacco and alcohol answers, stress, mood, social connection, goals, notes, and check-ins. Sample data is labeled and is not your information.
        </p>
      </section>
      <section className="card stack">
        <h2>Deletion</h2>
        <p>
          Use Settings to clear data in this browser, or close the tab. There is no server account to delete. When Supabase is connected in a future build, account deletion will need to remove that user’s rows. The prepared database rules are in supabase/schema.sql and are not active here.
        </p>
        <Link href="/settings">Open settings</Link>
      </section>
      <section className="card stack">
        <h2>What this is not</h2>
        <p>
          lifeZoi does not claim HIPAA, GDPR, or any other compliance. It is not a medical device, it does not diagnose, and it does not predict how long someone will live. Production hosting on Vercel uses HTTPS. That does not by itself make the development-mode storage secure.
        </p>
      </section>
    </article>
  );
}
