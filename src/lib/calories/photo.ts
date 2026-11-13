import { isLocale, type Locale } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { bestLocalMatch } from "@/lib/calories/local-foods";
import { parseGrams } from "@/lib/calories/math";
import type { PhotoGuess } from "@/lib/calories/types";
import { FREE_GEMINI_MODEL } from "@/lib/wellness-assistant/model/gemini";

/**
 * Photo of a plate → a list of foods with rough grams, from Google's free Gemini tier
 * (the same server key and model as the wellness assistant). Only the photo, which the
 * browser has already shrunk and re-encoded without its metadata, and the interface
 * language are sent. The photo is not stored: it lives in this request only.
 * Calories always come from the food databases, never from the model.
 */
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${FREE_GEMINI_MODEL}:generateContent`;

export const PHOTO_MAX_BASE64 = 2_000_000;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_LIMITS = { perMinute: 3, memberDaily: 15, processDaily: 120 } as const;
const MAX_ITEMS = 8;

export const PHOTO_NOT_CONFIGURED = msg("Photo recognition is not switched on here. Search for each food instead.");
export const PHOTO_QUOTA = msg("The free photo service has reached its limit for now. Search for each food instead.");
export const PHOTO_UNAVAILABLE = msg("The photo could not be read just now. Search for each food instead.");
export const PHOTO_NO_FOOD = msg("No food was recognised in this photo. Try another photo or search for each food.");
export const PHOTO_BAD_IMAGE = msg("Use a JPEG, PNG, or WebP photo.");

const LANGUAGE_NAME: Record<Locale, string> = { en: "English", uk: "Ukrainian", ru: "Russian", el: "Greek" };

export function photoPrompt(language: Locale): string {
  return [
    "This is a photo of a meal. List each separate food you can see, at most 8.",
    "For each food give: name, a short common English food name with how it looks cooked, such as \"broccoli, boiled\" or \"buckwheat porridge\";",
    `label, the same name in ${LANGUAGE_NAME[language]};`,
    "grams, your rough estimate of the edible weight on the plate, as a whole number.",
    "Do not give calories, nutrients, health advice, or comments about people.",
    "If there is no food in the photo, return an empty list.",
  ].join(" ");
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    foods: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, label: { type: "STRING" }, grams: { type: "INTEGER" } },
        required: ["name", "label", "grams"],
      },
    },
  },
  required: ["foods"],
} as const;

export type PhotoInput = { data: string; mimeType: (typeof PHOTO_TYPES)[number]; language: Locale };

export function parsePhotoBody(value: unknown): { ok: true; input: PhotoInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: PHOTO_BAD_IMAGE };
  const record = value as Record<string, unknown>;
  const mimeType = PHOTO_TYPES.find((type) => type === record.mimeType);
  const data = typeof record.data === "string" ? record.data : "";
  if (!mimeType || data.length < 100 || data.length > PHOTO_MAX_BASE64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    return { ok: false, error: PHOTO_BAD_IMAGE };
  }
  return { ok: true, input: { data, mimeType, language: isLocale(record.language) ? record.language : "en" } };
}

const clean = (value: unknown, max = 80) =>
  typeof value === "string" ? value.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

/** The model's JSON → editable guesses, each matched to a database food where one is close. */
export function readGuesses(text: string): PhotoGuess[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }
  const foods = (parsed as { foods?: unknown })?.foods;
  if (!Array.isArray(foods)) return [];
  const out: PhotoGuess[] = [];
  for (const item of foods.slice(0, MAX_ITEMS)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const name = clean(record.name);
    if (!name) continue;
    const grams = parseGrams(typeof record.grams === "number" ? record.grams : String(record.grams ?? "")) ?? 100;
    out.push({ name, label: clean(record.label) || name, grams, match: bestLocalMatch(name) });
  }
  return out;
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
};

export type PhotoResult =
  | { ok: true; guesses: PhotoGuess[] }
  | { ok: false; reason: "not-configured" | "quota" | "unavailable"; message: string };

export async function recognisePlate(
  input: PhotoInput,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PhotoResult> {
  const key = apiKey.trim();
  if (!key) return { ok: false, reason: "not-configured", message: PHOTO_NOT_CONFIGURED };
  try {
    const response = await fetchImpl(GEMINI_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ inlineData: { mimeType: input.mimeType, data: input.data } }, { text: photoPrompt(input.language) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (response.status === 429) return { ok: false, reason: "quota", message: PHOTO_QUOTA };
    if (!response.ok) return { ok: false, reason: "unavailable", message: PHOTO_UNAVAILABLE };
    const payload = (await response.json()) as GeminiResponse;
    const candidate = payload.candidates?.[0];
    if (!candidate || candidate.finishReason === "SAFETY" || payload.promptFeedback?.blockReason) {
      return { ok: false, reason: "unavailable", message: PHOTO_UNAVAILABLE };
    }
    const text = (candidate.content?.parts ?? [])
      .filter((part) => part.thought !== true && typeof part.text === "string")
      .map((part) => part.text ?? "")
      .join("")
      .split(key)
      .join("");
    return { ok: true, guesses: readGuesses(text) };
  } catch {
    return { ok: false, reason: "unavailable", message: PHOTO_UNAVAILABLE };
  }
}

// In-memory limits per server instance, like the wellness assistant's, so one member cannot use up the free quota.
type Bucket = { day: string; daily: number; minuteStart: number; minuteCount: number };
let processDay = "";
let processCount = 0;
const buckets = new Map<string, Bucket>();

export function resetPhotoLimitsForTests() {
  processDay = "";
  processCount = 0;
  buckets.clear();
}

export function takePhotoTurn(memberId: string, now = new Date()): boolean {
  const day = now.toISOString().slice(0, 10);
  if (processDay !== day) {
    processDay = day;
    processCount = 0;
  }
  if (processCount >= PHOTO_LIMITS.processDaily) return false;
  let bucket = buckets.get(memberId);
  if (!bucket || bucket.day !== day) {
    bucket = { day, daily: 0, minuteStart: now.getTime(), minuteCount: 0 };
    buckets.set(memberId, bucket);
    if (buckets.size > 500) buckets.delete(buckets.keys().next().value as string);
  }
  if (now.getTime() - bucket.minuteStart >= 60_000) {
    bucket.minuteStart = now.getTime();
    bucket.minuteCount = 0;
  }
  if (bucket.minuteCount >= PHOTO_LIMITS.perMinute || bucket.daily >= PHOTO_LIMITS.memberDaily) return false;
  bucket.minuteCount += 1;
  bucket.daily += 1;
  processCount += 1;
  return true;
}
