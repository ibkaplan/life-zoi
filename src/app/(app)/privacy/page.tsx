import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How lifeZoi stores answers for an account, what stays in this browser, and what it does not claim.",
};

export default function PrivacyPage() {
  return (
    <article className="stack-lg narrow">
      <div>
        <p className="kicker">Privacy</p>
        <h1>How answers are stored</h1>
      </div>
      <section className="card stack">
        <h2>Accounts</h2>
        <p>
          When account sign-in is configured, an account uses an email address and a password. New accounts are not open yet. Supabase Auth stores that login. After you sign in, assessment answers, WHAT IF? scenarios, habit goals, check-ins, the in-progress assessment, and the reassessment choice are saved in your rows in profiles, assessments, scenarios, habit_goals, and check_ins. A weekly check-in and any weight measurements you choose to enter are saved in the same profile session. They are not a diagnosis.
        </p>
        <p>
          Row level security allows a row only when auth.uid() matches user_id. If an authenticator app is confirmed for the account, those rows also stay closed until the sign-in includes that 6-digit code. The browser uses the public anon key and your session. It does not use the service role key.
        </p>
        <p>
          Without an account, or when Supabase is not configured, assessment answers, scenarios, goals, check-ins, the weekly check-in, and optional weight measurements stay in this browser tab’s session storage. Closing the tab clears that tab copy. lifeZoi does not encrypt that tab storage, and it is not a secure health record.
        </p>
        <p>
          A suggestion or WHAT IF? request is still sent to this app’s own server so the answers can be checked. The server does not store that request and does not send it to an AI service. The wellness assistant keeps 50 prepared answers in the app. If you type a question there and the server has a free-tier Gemini key, that question and earlier turns from this browser tab are sent to Google’s Gemini API. Lab results, diagnoses, and account health records are not included. Google’s free tier may use those prompts to improve its products. If the key is missing or the free tier cannot answer, a prepared answer is shown instead. Nothing from that chat is written to your account. Listening uses the browser’s own speech playback and does not send the answer text to LifeZoi or a speech service. Ask by voice is optional. If you use it, the browser’s speech service may process the audio. LifeZoi does not receive that audio. Recently selected questions stay in this browser tab. A lab reference request sends only a verified LOINC code to MedlinePlus Connect. Change Lab answers, Your Life Matters reflections, and wellness notes stay in this browser tab. A host or Supabase may still log requests.
        </p>
      </section>
      <section className="card stack">
        <h2>Authenticator app</h2>
        <p>
          You can enroll a time-based one-time code, the same kind of code Google Authenticator and similar apps create. Setup shows a QR code and a secret. You confirm a 6-digit code. Later sign-ins ask for a new code before saved answers open. This uses Supabase Auth’s built-in authenticator support. It is not a paid Supabase add-on. The authenticator secret is stored by Supabase Auth, not in the lifeZoi answer tables.
        </p>
        <p>
          The project’s existing email confirmation stays on. If creating an account asks you to confirm email, use that message before the first sign-in.
        </p>
      </section>
      <section className="card stack">
        <h2>What is collected</h2>
        <p>
          The account email, the password held by Supabase Auth, and an optional authenticator factor. In the answer tables: an optional name and age range, sleep, movement, food and water, optional tobacco and alcohol answers, stress, mood, social connection, goals, an optional hope for what health could help you experience, notes, check-ins, and the in-progress assessment. The weekly check-in can include an energy choice from 1 to 5, items you mark, and a short note. Weight measurements are optional numbers you type, with no goal weight. Sample data is labeled “Sample visitor” and is not written into an account.
        </p>
        <p>
          One email address is the admin account. The database sets that role when the profile is saved. The screen cannot grant admin.
        </p>
      </section>
      <section className="card stack">
        <h2>Deletion</h2>
        <p>
          Settings can clear the saved rows for the signed-in account, or delete the account. Deleting the account removes the login and that person’s rows. Closing the tab clears only the copy kept in the tab. Clearing data does not promise that a host or Supabase has erased every backup or log.
        </p>
        <Link href="/settings">Open settings</Link>
      </section>
      <section className="card stack">
        <h2>Community</h2>
        <p>
          Community posts and comments are checked before anyone else can see them. Submitted message text may be processed by an external moderation provider. Do not post identifying information. Do not post health records or questionnaire answers. The check receives only the community message you type. It does not receive assessment answers, check-ins, lab notes, or other health information.
        </p>
        <p>
          Other members see the community name you choose. They do not see your email, your legal name, the name from a lifestyle assessment, or your account id. You can report a message, block or mute another member, remove your own message, or appeal a message that was not published. An appeal asks a person to look again. It is not sent to the moderation provider.
        </p>
        <p>
          Rejected messages, messages you remove, and closed reports are kept for 30 days so a review or appeal can finish, then deleted. A published message stays until you remove it. The moderation record keeps the chosen name, the message text while it still exists, a short category, the decision, and the time. It does not keep an email address, a legal name, a health record, or a questionnaire answer. The server keeps the signed-in account’s internal id so it can tell your own messages apart, apply a block or mute, and delete them with your account. That id is not shown to other members.
        </p>
        <p>
          If the moderation service times out, returns an error, or reaches its quota, the message stays in review and is not published. One uncertain result does not permanently ban anyone. Repeated confirmed abuse can pause posting for 72 hours. That limit ends on its own.
        </p>
        <p>
          When shared community storage is configured, the server stores those rows with a server-only key. That key is not used to read assessment or health rows, and it is not sent to the browser. Without it, messages stay in the server process and can disappear when that process restarts. They are still checked before they are public.
        </p>
      </section>
      <section className="card stack">
        <h2>Sharing a link</h2>
        <p>
          Share the Care can save an invitation code for the signed-in account, plus three numbers: links created, opens, and registrations. The shared web address contains only that code. It does not contain a name, an email address, a user id, or health information. The person who opens the link can create a separate account from Settings. lifeZoi does not open a contact list or send the message.
        </p>
        <Link href="/share-the-care">Share the Care</Link>
      </section>
      <section className="card stack">
        <h2>What this is not</h2>
        <p>
          lifeZoi does not claim HIPAA, GDPR, or any other compliance. It is not a medical device, it does not diagnose, and it does not predict how long someone will live. HTTPS and row level security do not by themselves make this a complete health record.
        </p>
      </section>
    </article>
  );
}
