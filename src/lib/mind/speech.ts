/**
 * Microphone input for LifeZoi Mind through the browser's built-in Web Speech API.
 * It is free and needs no key. Where speech is turned into text depends on the browser:
 * some do it on the device, and some send the audio to the browser maker's service
 * (for example Google for Chrome, Apple for Safari). LifeZoi asks for permission before
 * the first use and asks for on-device recognition when the browser offers it.
 */

type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  processLocally?: boolean;
  onresult: ((event: { resultIndex: number; results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

type RecognitionCtor = (new () => Recognition) & {
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>;
};

function ctor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function listeningSupported(): boolean {
  return ctor() !== null;
}

/** "available" when this browser can turn speech into text on the device for this language. */
export async function onDeviceRecognition(lang: string): Promise<"available" | "not-available"> {
  const Ctor = ctor();
  if (!Ctor || typeof Ctor.available !== "function") return "not-available";
  try {
    const result = await Ctor.available({ langs: [lang], processLocally: true });
    return result === "available" ? "available" : "not-available";
  } catch {
    return "not-available";
  }
}

export type ListenError = "denied" | "site-blocked" | "service-blocked" | "no-speech" | "network" | "no-microphone" | "local-unavailable" | "other";

/** Every message `listenErrorMessage` can return, for the translation catalogs. */
export const LISTEN_ERRORS: readonly ListenError[] = ["denied", "site-blocked", "service-blocked", "no-speech", "network", "no-microphone", "local-unavailable", "other"];

export function listenErrorMessage(error: ListenError): string {
  switch (error) {
    case "denied":
      return "The browser did not give LifeZoi the microphone. Check the microphone icon in the address bar, or the site settings, and choose Allow, then reload the page. If it already says Allow, check that your computer or phone lets the browser use the microphone (on a Mac: System Settings, Privacy & Security, Microphone). You can keep typing in the meantime.";
    case "site-blocked":
      return "LifeZoi itself is blocking the microphone on this page, so your browser setting can't help. This is a problem on our side, not yours. Please type for now and let us know.";
    case "service-blocked":
      return "The microphone is allowed, but this browser's speech-to-text service is turned off or not available. You can type instead, or try voice in Chrome, Edge, or Safari.";
    case "no-speech":
      return "I didn't hear anything. Tap the microphone and try again, or type instead.";
    case "network":
      return "This browser's speech service could not be reached. Please check your connection, or type instead.";
    case "no-microphone":
      return "No microphone was found on this device. You can type instead.";
    case "local-unavailable":
      return "On-device speech recognition is not ready in this browser. You can type, or allow the browser's own speech service.";
    default:
      return "Voice input stopped unexpectedly. You can try again or type instead.";
  }
}

/** True when the page's own Permissions-Policy forbids the microphone (the browser setting can't override it). */
export function microphoneBlockedBySite(): boolean {
  if (typeof document === "undefined") return false;
  const d = document as unknown as {
    permissionsPolicy?: { allowsFeature(feature: string): boolean };
    featurePolicy?: { allowsFeature(feature: string): boolean };
  };
  const policy = d.permissionsPolicy ?? d.featurePolicy;
  try {
    return policy ? !policy.allowsFeature("microphone") : false;
  } catch {
    return false;
  }
}

export function mapError(code: string, local = false, siteBlocked = microphoneBlockedBySite()): ListenError {
  if (code === "not-allowed") return siteBlocked ? "site-blocked" : "denied";
  if (code === "no-speech") return "no-speech";
  if (code === "network") return "network";
  if (code === "audio-capture") return "no-microphone";
  if (code === "service-not-allowed") return local ? "local-unavailable" : "service-blocked";
  if (code === "language-not-supported") return "local-unavailable";
  return "other";
}

export type Listener = { stop(): void; abort(): void };

/** Listens for one spoken message. `onInterim` shows words as they are recognized. */
export function listenOnce(options: {
  lang: string;
  local: boolean;
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: ListenError) => void;
  onEnd: () => void;
}): Listener | null {
  const Ctor = ctor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = options.lang;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  if (options.local && "processLocally" in recognition) recognition.processLocally = true;
  let finalText = "";
  let delivered = false;
  recognition.onstart = () => options.onStart?.();
  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? "";
      if (result.isFinal) finalText += text;
      else interim += text;
    }
    options.onInterim?.(`${finalText}${interim}`.trim());
  };
  recognition.onerror = (event) => {
    if (event.error === "aborted") return;
    delivered = true;
    options.onError(mapError(event.error, options.local));
  };
  recognition.onend = () => {
    if (!delivered) {
      delivered = true;
      const text = finalText.trim();
      if (text) options.onFinal(text);
      else options.onError("no-speech");
    }
    options.onEnd();
  };
  try {
    recognition.start();
  } catch {
    options.onError("other");
    options.onEnd();
    return null;
  }
  return {
    stop: () => recognition.stop(),
    abort: () => {
      delivered = true;
      recognition.abort();
    },
  };
}
