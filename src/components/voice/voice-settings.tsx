"use client";

import { useLocale, useT } from "@/components/locale-provider";
import { NaturalVoiceRow } from "@/components/voice/natural-voice";
import { languageName, useSpeechSupport, useVoicePrefs, useVoiceState, VoiceChoices } from "@/components/voice/read-aloud";
import { LOCALE_META, LOCALES } from "@/lib/i18n/config";
import { player, saveVoicePrefs } from "@/lib/voice/engine";
import { segmentsFromText, VOICE_TONES, type VoiceLang, type VoiceTone } from "@/lib/voice/voices";
import type { Translate } from "@/lib/i18n/translate";

function toneLabel(t: Translate, tone: VoiceTone): string {
  if (tone === "soft") return t("Soft female voice (recommended)");
  if (tone === "deep") return t("Male voice");
  return t("Any voice, most natural first");
}



/** A short greeting in each language, written in that language, for trying a voice. */
const SAMPLE: Record<VoiceLang, string> = {
  en: "Hello, I am your lifeZoi voice. Let's take a slow breath together. Breathe in through your nose, and gently breathe out.",
  uk: "Привіт, я ваш голос lifeZoi. Давайте разом зробимо повільний вдих. Вдихніть через ніс і м'яко видихніть.",
  ru: "Здравствуйте, я ваш голос lifeZoi. Давайте вместе сделаем медленный вдох. Вдохните через нос и мягко выдохните.",
  el: "Γεια σας, είμαι η φωνή σας στο lifeZoi. Ας πάρουμε μαζί μια αργή ανάσα. Εισπνεύστε από τη μύτη και εκπνεύστε απαλά.",
};

const OWNER = "voice-settings";

/** Settings: speaking speed, and the voice for each language with a button to hear it. */
export function VoiceSettings() {
  const t = useT();
  const { locale } = useLocale();
  const prefs = useVoicePrefs();
  const state = useVoiceState();
  const supported = useSpeechSupport();
  const order: VoiceLang[] = [locale, ...LOCALES.filter((lang) => lang !== locale)];

  if (supported === false) return <p>{t("This browser cannot read aloud. The written instructions are all here.")}</p>;

  return (
    <div className="stack voice-settings">
      <p>{t("Every Listen button uses these choices. They are saved in this browser only.")}</p>
      <label className="voice-tone">
        {t("Voice type")}
        <select value={prefs.tone} onChange={(event) => saveVoicePrefs({ tone: event.target.value as VoiceTone })}>
          {VOICE_TONES.map((tone) => (
            <option key={tone} value={tone}>
              {toneLabel(t, tone)}
            </option>
          ))}
        </select>
      </label>
      <p className="hint">{t("Changing the voice type picks the best matching voice for every language again. You can still choose a voice by name below.")}</p>
      {order.map((lang) => {
        const trying = state.owner === OWNER && state.status !== "idle" && state.lang === lang;
        return (
          <div key={lang} className="voice-settings-lang stack">
            <h3>{LOCALE_META[lang].nativeName}</h3>
            <NaturalVoiceRow lang={lang} />
            <VoiceChoices lang={lang} steps={lang === locale} rate={prefs.rate} stepWait={prefs.stepWait} />
            <div className="voice-buttons">
              {trying ? (
                <button className="btn btn-secondary" type="button" onClick={() => player.stop(OWNER)}>
                  {t("Stop")}
                </button>
              ) : (
                <button className="btn btn-secondary" type="button" onClick={() => player.play(OWNER, segmentsFromText(SAMPLE[lang], lang), { stepWait: 0 })}>
                  {t("Try this voice")}
                </button>
              )}
            </div>
            {state.owner === OWNER && state.problem === "no-voice" && state.problemLang === lang ? (
              <p className="voice-note" role="alert">
                {t("This device has no {language} voice yet.", { language: languageName(t, lang) })}
              </p>
            ) : null}
          </div>
        );
      })}
      <BetterVoicesHelp />
    </div>
  );
}

/** Free ways to add warmer, more natural voices to the device itself. */
function BetterVoicesHelp() {
  const t = useT();
  return (
    <details className="voice-help">
      <summary>{t("How to add more pleasant voices for free")}</summary>
      <div className="stack">
        <p>{t("lifeZoi reads with the voices your device already has. Most devices can download better female voices at no cost. After adding one, reload this page and choose it above.")}</p>
        <ul>
          <li>
            <strong>{t("iPhone and iPad")}</strong>: {t("Settings, Accessibility, Spoken Content, Voices. Choose the language and download a voice marked Enhanced or Premium, for example Ava (English), Milena (Russian), or Lesya (Ukrainian).")}
          </li>
          <li>
            <strong>{t("Mac")}</strong>: {t("System Settings, Accessibility, Spoken Content, System voice, Manage Voices. Download Ava, Zoe, Milena, or Lesya.")}
          </li>
          <li>
            <strong>{t("Windows")}</strong>: {t("Settings, Time and language, Speech, Add voices. In the Edge browser you also get free natural voices such as Aria, Jenny, Svetlana (Russian), and Polina (Ukrainian), marked online.")}
          </li>
          <li>
            <strong>{t("Android")}</strong>: {t("Settings, Accessibility, Text-to-speech output. Choose Speech Services by Google, open its settings, Install voice data, and pick a female voice for each language.")}
          </li>
        </ul>
        <p className="hint">{t("Voices marked online send the words being read to your browser's provider. LifeZoi Mind never uses online voices, because your conversation stays on your device.")}</p>
        <p className="hint">{t("The lifeZoi natural voices are free Piper voices. The voice file comes from huggingface.co and the speech program from cdn.jsdelivr.net, once. The voice then runs in this browser, and the words being read stay on this device.")}</p>
      </div>
    </details>
  );
}

export function VoiceSettingsSection() {
  const t = useT();
  return (
    <section className="card stack" aria-labelledby="voice-settings-title">
      <h2 id="voice-settings-title">{t("Read-aloud voice")}</h2>
      <VoiceSettings />
    </section>
  );
}
