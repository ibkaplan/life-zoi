import Link from "next/link";
import { EVALUATED_PROVIDERS, NOT_SUITABLE_NOTE, RULES_PROVIDER } from "@/lib/mind/provider";

export function MindPrivacy() {
  return (
    <div className="stack-lg">
      <section className="card stack">
        <h2>What LifeZoi Mind is, and is not</h2>
        <ul className="mind-list">
          <li>It is an educational emotional wellness tool. It is not a licensed psychologist, psychiatrist, therapist, or medical provider.</li>
          <li>It does not diagnose conditions, prescribe or change medication, or treat any disorder. It will never tell you to stop a treatment.</li>
          <li>Questionnaire results are screening information, not a diagnosis.</li>
          <li>It is not a crisis service and cannot contact anyone for you. In the United States, call or text 988, or call 911 in an emergency.</li>
          <li>It has not been reviewed by a licensed clinician yet.</li>
        </ul>
      </section>

      <section className="card stack">
        <h2>How the conversation works today</h2>
        <p>
          <strong>{RULES_PROVIDER.info.label}.</strong> {RULES_PROVIDER.info.notes}
        </p>
        <p>
          It runs inside your browser. What you type is not sent to LifeZoi or to any AI service. It can recognize common situations such as criticism at work, worry, low mood, sleep, loneliness, grief, relationships, family, anger, boundaries, and self-criticism. It asks one question at a time, offers a balanced perspective, and suggests exercises and articles. It cannot truly understand everything you write, and when it does not recognize something it will ask you to say more rather than pretend.
        </p>
        <p>Safety checks run first, before any other reply. If you mention suicide, self-harm, immediate danger, or harming someone, it stops the ordinary conversation and shows crisis resources. The check looks for phrases; it can miss things, so please reach out directly if you need help.</p>
      </section>

      <section className="card stack">
        <h2>Where your information goes</h2>
        <ul className="mind-list">
          <li>
            <strong>Conversation:</strong> kept in this browser tab only (session storage) so you can open articles and come back. It is cleared when you close the tab, or when you start a new conversation.
          </li>
          <li>
            <strong>Questionnaires:</strong> scored in your browser. Individual answers are never stored. Totals are kept only if you turn saving on.
          </li>
          <li>
            <strong>Progress:</strong> off by default. When you turn it on, it is kept in this browser&apos;s local storage under your account&apos;s key, not on LifeZoi&apos;s servers. It is not encrypted by the app. You can delete it at any time in <Link href="/mind/progress">My progress</Link>.
          </li>
          <li>
            <strong>Microphone:</strong> LifeZoi never records your voice. Your browser&apos;s built-in speech recognition turns speech into text. Depending on the browser, audio may be processed on your device or sent to the browser maker&apos;s speech service (for example Google or Apple) under their terms. LifeZoi asks before the first use and asks for on-device recognition when the browser offers it.
          </li>
          <li>
            <strong>Reading aloud:</strong> uses voices that run on your device for your conversation, so the text is not sent to an online voice.
          </li>
          <li>LifeZoi does not sell psychological data and does not use your conversations to train AI.</li>
          <li>Only signed-in members can open LifeZoi Mind. Like any website, the hosting provider may keep standard technical logs of page visits.</li>
        </ul>
        <p className="hint">LifeZoi does not claim HIPAA or any other regulatory compliance. These statements describe how the app is built today and will be reviewed before public launch.</p>
      </section>

      <section className="card stack">
        <h2>Free AI options under review</h2>
        <p>LifeZoi Mind is designed so an AI model can be added later without rebuilding it. No AI service is connected now, and none will be turned on without the owner&apos;s approval and a clear notice to you before anything you write is sent.</p>
        <ul className="mind-list">
          {EVALUATED_PROVIDERS.map((provider) => (
            <li key={provider.id}>
              <strong>{provider.label}</strong> — runs on {provider.runsWhere.toLowerCase()}. {provider.cost} {provider.notes}
            </li>
          ))}
          <li>{NOT_SUITABLE_NOTE}</li>
        </ul>
        <p>If a free service ever reaches its limit, LifeZoi Mind will say so and continue with its written replies. It will never switch you to a paid service.</p>
      </section>
    </div>
  );
}
