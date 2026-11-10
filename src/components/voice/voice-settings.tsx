"use client";

import { useLocale, useT } from "@/components/locale-provider";
import { languageName, useSpeechSupport, useVoicePrefs, useVoiceState, VoiceChoices } from "@/components/voice/read-aloud";
import { LOCALES } from "@/lib/i18n/config";
import { player } from "@/lib/voice/engine";
import { segmentsFromText, type VoiceLang } from "@/lib/voice/voices";

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
      {order.map((lang) => {
        const trying = state.owner === OWNER && state.status !== "idle" && state.lang === lang;
        return (
          <div key={lang} className="voice-settings-lang stack">
            <h3>{languageName(t, lang)}</h3>
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
    </div>
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
