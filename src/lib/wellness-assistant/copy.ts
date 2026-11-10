import { msg } from "@/lib/i18n/translate";

export const WELLNESS_ASSISTANT_TITLE = msg("LIFEZOI WELLNESS ASSISTANT");

export const WELLNESS_ASSISTANT_SUBTITLE = msg("Your everyday companion for healthier living.");

export const WELLNESS_ASSISTANT_WELCOME =
  msg("How are you feeling today? Let's find a helpful next step together.");

export const WELLNESS_ASSISTANT_NOTE =
  msg("LifeZoi Wellness Assistant provides prepared educational information to support everyday wellness. It is not a live AI medical service and does not diagnose or treat health conditions.");

export const FEELING_HEADING = msg("I WANT TO TALK ABOUT HOW I FEEL");

export const WELLNESS_ASSISTANT_EMERGENCY =
  msg("If you have emergency symptoms, contact emergency services. If a symptom persists, talk with a healthcare professional.");

export const WELLNESS_ASSISTANT_KIND =
  msg("Fifty prepared answers stay on this page. A free wellness model replies only when the server is configured, and only from this session.");

export const MODEL_NOT_CONFIGURED =
  msg("The wellness model is not configured. Prepared answers from the LifeZoi library are used.");

export const MODEL_CONFIGURED_NOTE =
  msg("A free wellness model can reply to general questions in this session. It does not see account records, lab results, or diagnoses. Prepared answers stay available when it cannot reply.");

export const MODEL_QUOTA =
  msg("The free wellness model has reached its limit for now. Here is a prepared answer instead.");

export const MODEL_UNAVAILABLE =
  msg("The free wellness model could not answer just now. Here is a prepared answer instead.");

export const PREPARED_ANSWERS_REMAIN = msg("The 50 prepared answers stay available on this page.");

export const LIMITED_SET_MESSAGE =
  msg("I don't have a prepared answer for that exact question yet. Please choose one of the topics below.");

export const VOICE_PRIVACY_NOTE =
  msg("Ask by voice uses your browser’s speech recognition. That browser speech service may process the audio. LifeZoi does not receive the audio. You can edit the words before you confirm.");

export const NO_ENGLISH_VOICE_MESSAGE =
  msg("No English voice is available in this browser. You can still read the answer.");

/** Shown in Ukrainian, Russian, or Greek when the browser has no voice for that language. */
export const NO_LANGUAGE_VOICE_MESSAGE =
  msg("No voice for this language is available in this browser. You can still read the answer.");

export const SPEECH_UNSUPPORTED_MESSAGE =
  msg("This browser does not offer speech playback. You can still read the answer.");

export const RECOGNITION_UNSUPPORTED_MESSAGE =
  msg("Ask by voice is not available in this browser. You can search or choose a question button.");

export const RECOGNITION_DENIED_MESSAGE =
  msg("Microphone permission was denied. You can search or choose a question button.");

export const RECOGNITION_FAILED_MESSAGE =
  msg("Voice input could not start. You can search or choose a question button.");

/** Speech never starts on its own. A click on Listen to answer is required. */
export const SPEECH_STARTS_ONLY_FROM_CLICK = true;
