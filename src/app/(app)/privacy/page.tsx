import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="grid max-w-3xl gap-5 text-lg leading-relaxed">
      <PageHeader
        eyebrow="Privacy"
        title="How lifeZoi handles your notes"
        lede="This page describes the version you are running. It is not a legal determination of HIPAA, GDPR, or any other law."
      />
      <section>
        <h2 className="font-display text-3xl">What you can enter</h2>
        <p className="mt-2 text-muted">
          A display name, lifestyle assessment answers, WHAT IF? notes, habits, and check-ins. The assessment can include an age range, sleep, movement, eating, tobacco, alcohol, stress, mood, and social contact. Sensitive items can be answered with Prefer not to say.
        </p>
      </section>
      <section>
        <h2 className="font-display text-3xl">Where it lives in this version</h2>
        <p className="mt-2 text-muted">
          In local development mode, notes stay in this browser under a lifeZoi storage key. They are not uploaded to an account. The app does not encrypt them beyond what the browser and device already do. Anyone who can use this browser profile can open them.
        </p>
        <p className="mt-2 text-muted">
          Saving an assessment, scenario, or check-in sends the entry to this app’s validation route so the server can reject malformed input. That route does not write a database row. A hosting provider may still keep request logs. Do not put this deployment on the public internet until that risk is reviewed.
        </p>
      </section>
      <section>
        <h2 className="font-display text-3xl">Deletion and export</h2>
        <p className="mt-2 text-muted">
          Settings can download a JSON file or delete the browser key. Deletion does not affect another device, because there is no server copy. Removing the site’s browser data has the same effect.
        </p>
      </section>
      <section>
        <h2 className="font-display text-3xl">If Supabase is added later</h2>
        <p className="mt-2 text-muted">
          The repository includes a SQL file with Row Level Security policies so each account would be limited to its own rows. This version does not connect to Supabase, even if public keys are present. Turning that on needs a server adapter, a private service role key that never reaches the browser, and a separate privacy review.
        </p>
      </section>
      <section>
        <h2 className="font-display text-3xl">Health claims</h2>
        <p className="mt-2 text-muted">
          lifeZoi is general wellness education. It is not a medical record, a diagnostic tool, or an emergency service. If you might act on thoughts of suicide, call or text 988 in the United States, or contact local emergency services.
        </p>
      </section>
      <p>
        <Link className="font-semibold text-forest" href="/settings">
          Go to Settings
        </Link>
      </p>
    </article>
  );
}
