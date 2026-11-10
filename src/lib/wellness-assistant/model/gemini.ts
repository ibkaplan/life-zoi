import {
  MODEL_QUOTA,
  MODEL_UNAVAILABLE,
} from "@/lib/wellness-assistant/copy";
import type {
  WellnessModelProvider,
  WellnessModelRequest,
  WellnessModelResult,
  WellnessTurn,
} from "@/lib/wellness-assistant/model/types";

export const FREE_GEMINI_MODEL = "gemini-3.5-flash-lite";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${FREE_GEMINI_MODEL}:generateContent`;

const LANGUAGE_NAME = { en: "English", uk: "Ukrainian", ru: "Russian", el: "Greek" } as const;

/** The instructions, with the reply written in the visitor's interface language. */
export function systemPrompt(language: keyof typeof LANGUAGE_NAME = "en"): string {
  if (language === "en") return SYSTEM_PROMPT;
  return SYSTEM_PROMPT.replace(
    "Reply in warm, plain English.",
    `Reply in warm, plain ${LANGUAGE_NAME[language]}, the language the visitor chose for LifeZoi, even if earlier messages are in another language.`,
  );
}

const SYSTEM_PROMPT = [
  "You are LifeZoi's wellness assistant. Reply in warm, plain English.",
  "Give general education about everyday habits such as sleep, food, movement, stress, and routines.",
  "Use only the details in this conversation. If the visitor did not say something, do not invent it.",
  "Do not invent lab results, diagnoses, medicines, weights, or measurements.",
  "Do not diagnose, change or suggest a medicine dose, or promise that a habit prevents, cures, or reverses disease.",
  "Do not estimate lifespan or use percentages.",
  "Write one short reply, under 120 words.",
  "If you offer a next step, make it one simple everyday action tied to a topic the visitor already mentioned.",
  "If the message sounds like an emergency, tell them to contact local emergency services. In the United States, call or text 988 for emotional distress.",
].join(" ");

type GeminiPart = { text?: string; thought?: boolean };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
};

function contentsFrom(messages: WellnessTurn[]) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  for (const message of messages) {
    const text = message.content.trim();
    if (!text) continue;
    const role = message.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text = `${last.parts[0].text}\n\n${text}`;
    else contents.push({ role, parts: [{ text }] });
  }
  if (contents[0]?.role === "model") contents.shift();
  return contents;
}

function readText(payload: GeminiResponse): string {
  const candidate = payload.candidates?.[0];
  if (!candidate || candidate.finishReason === "SAFETY" || payload.promptFeedback?.blockReason) return "";
  return (candidate.content?.parts ?? [])
    .filter((part) => part.thought !== true && typeof part.text === "string")
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function hideSecret(text: string, secret: string): string {
  if (!secret) return text;
  return text.split(secret).join("");
}

export function createGeminiProvider(options: {
  apiKey: string;
  fetchImpl?: typeof fetch;
}): WellnessModelProvider {
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiKey = options.apiKey.trim();
  return {
    id: "gemini",
    model: FREE_GEMINI_MODEL,
    async complete(request: WellnessModelRequest): Promise<WellnessModelResult> {
      const contents = contentsFrom(request.messages);
      if (!apiKey || contents.length === 0) {
        return { ok: false, reason: "not-configured", message: MODEL_UNAVAILABLE };
      }
      try {
        const response = await fetchImpl(GEMINI_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt(request.language) }] },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: request.maxOutputTokens,
            },
          }),
          signal: AbortSignal.timeout(12_000),
        });
        if (response.status === 429) return { ok: false, reason: "quota", message: MODEL_QUOTA };
        if (!response.ok) return { ok: false, reason: "unavailable", message: MODEL_UNAVAILABLE };
        const payload = (await response.json()) as GeminiResponse;
        const text = hideSecret(readText(payload), apiKey);
        if (!text) return { ok: false, reason: "unavailable", message: MODEL_UNAVAILABLE };
        return { ok: true, text, providerId: "gemini", model: FREE_GEMINI_MODEL };
      } catch {
        return { ok: false, reason: "unavailable", message: MODEL_UNAVAILABLE };
      }
    },
  };
}
