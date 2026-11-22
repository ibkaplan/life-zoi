import { isUrgentMessage, SAFETY_NOTICE } from "@/lib/assistant";
import type { Answer, AnswerLength, ChatTurn } from "@/lib/encyclopedia/ai/answer";
import { isModelLanguage } from "@/lib/encyclopedia/ai/cloudflare";
import type { AnswerProvider, ProviderChoice } from "@/lib/encyclopedia/ai/provider";
import type { Article } from "@/lib/encyclopedia/types";
import { msg } from "@/lib/i18n/translate";

export const AI_LIMITS = {
  /** Per member. */
  perMinute: 6,
  perDay: 80,
  /** Per server instance, a backstop against automated use. */
  processPerDay: 3000,
  questionChars: 600,
  turns: 12,
} as const;

export const LIMIT_TEXT = msg("You have asked a lot of questions in a short time. Please wait a minute and try again. LifeZoi AI stays free, so it has a fair-use limit.");
export const DAILY_LIMIT_TEXT = msg("You have reached today's free question limit for LifeZoi AI. It resets tomorrow. You can keep reading the Health Encyclopedia in the meantime.");
export const BUSY_TEXT = msg("LifeZoi AI is very busy right now. Please try again later. The Health Encyclopedia is still open to read.");
export const MEDICATION_TEXT = msg("Please do not stop, start, or change any prescribed medicine on your own. Talk with the doctor or pharmacist who knows your health first. LifeZoi AI cannot give advice about your medicines.");
export const DIAGNOSIS_TEXT = msg("LifeZoi AI cannot tell you whether you have a condition. It shares general education only. A doctor can look at your symptoms and history and give you a diagnosis.");

const MEDICATION = /\b(stop|quit|skip|come off|reduce|lower|change|double|increase)\b.{0,30}\b(medicine|medication|meds|pills?|tablets?|insulin|statins?|dose|chemo|chemotherapy|treatment|blood thinner|antidepressants?)\b/i;
const MEDICATION_LOCAL = /кинути (ліки|пити ліки)|перестати (пити|приймати)|бросить (лекарств|пить таблетки)|перестать (пить|принимать)|σταματησω (το φαρμακο|τα φαρμακα)/i;
const DIAGNOSIS = /\b(do i have|have i got|am i (?:having|getting)|is it (?:cancer|diabetes|a tumou?r|a stroke|a heart attack)|diagnose me|what do i have)\b/i;

type Bucket = { day: string; daily: number; minuteStart: number; minuteCount: number };
type Memory = { day: string; processCount: number; members: Map<string, Bucket> };

let memory: Memory = { day: "", processCount: 0, members: new Map() };

export function resetAiUsageForTests() {
  memory = { day: "", processCount: 0, members: new Map() };
}

/** Counts a question for this member. In memory only: no question text is kept. */
export function takeQuestion(memberId: string, now: Date): "ok" | "minute" | "day" | "busy" {
  const day = now.toISOString().slice(0, 10);
  if (memory.day !== day) memory = { day, processCount: 0, members: new Map() };
  if (memory.processCount >= AI_LIMITS.processPerDay) return "busy";
  let bucket = memory.members.get(memberId);
  if (!bucket) {
    bucket = { day, daily: 0, minuteStart: now.getTime(), minuteCount: 0 };
    memory.members.set(memberId, bucket);
  }
  if (now.getTime() - bucket.minuteStart >= 60_000) {
    bucket.minuteStart = now.getTime();
    bucket.minuteCount = 0;
  }
  if (bucket.daily >= AI_LIMITS.perDay) return "day";
  if (bucket.minuteCount >= AI_LIMITS.perMinute) return "minute";
  bucket.daily += 1;
  bucket.minuteCount += 1;
  memory.processCount += 1;
  return "ok";
}

export function cleanTurns(value: unknown): ChatTurn[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-AI_LIMITS.turns)
    .map((item) => {
      const row = (item && typeof item === "object" ? item : {}) as { role?: unknown; text?: unknown };
      const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
      const text = typeof row.text === "string" ? row.text.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, AI_LIMITS.questionChars) : "";
      return role && text ? { role, text } : null;
    })
    .filter((turn): turn is ChatTurn => turn !== null);
}

export type AiResult = { status: number; body: Record<string, unknown> };

/**
 * One question. Safety checks run before any answer is built: urgent symptoms get
 * emergency guidance first; questions about stopping medicine or "do I have"
 * get a clear limit, with the education that follows still grounded in articles.
 */
export async function handleQuestion(
  input: { memberId: string; turns: unknown; length: unknown; focusSlug: unknown; language?: unknown },
  deps: { choice: ProviderChoice; articles: readonly Article[]; now?: Date },
): Promise<AiResult> {
  const turns = cleanTurns(input.turns);
  const latest = turns[turns.length - 1];
  if (!latest || latest.role !== "user") return { status: 400, body: { error: msg("Type a question first.") } };
  if (!deps.choice.ok) return { status: 503, body: { code: "provider-refused", error: BUSY_TEXT } };
  const usage = takeQuestion(input.memberId, deps.now ?? new Date());
  if (usage === "minute") return { status: 429, body: { code: "minute", error: LIMIT_TEXT } };
  if (usage === "day") return { status: 429, body: { code: "day", error: DAILY_LIMIT_TEXT } };
  if (usage === "busy") return { status: 503, body: { code: "busy", error: BUSY_TEXT } };

  const length: AnswerLength = input.length === "detailed" ? "detailed" : "short";
  const focusSlug = typeof input.focusSlug === "string" && /^[a-z0-9-]{1,80}$/.test(input.focusSlug) ? input.focusSlug : undefined;
  const language = isModelLanguage(input.language) ? input.language : "en";
  const provider: AnswerProvider = deps.choice.provider;

  if (isUrgentMessage(latest.text)) {
    const answer: Answer = {
      source: "library",
      safety: "urgent",
      noArticle: true,
      topic: "",
      articles: [],
      blocks: [{ kind: "paragraph", text: SAFETY_NOTICE }],
    };
    return { status: 200, body: { answer, provider: provider.id } };
  }

  let answer: Answer;
  try {
    answer = await provider.answer({ turns, length, articles: deps.articles, focusSlug, language });
  } catch {
    return { status: 503, body: { code: "unavailable", error: BUSY_TEXT } };
  }
  if (MEDICATION.test(latest.text) || MEDICATION_LOCAL.test(latest.text)) {
    answer = { ...answer, safety: "medication", blocks: [{ kind: "paragraph", text: MEDICATION_TEXT }, ...answer.blocks] };
  } else if (DIAGNOSIS.test(latest.text)) {
    answer = { ...answer, safety: "diagnosis", blocks: [{ kind: "paragraph", text: DIAGNOSIS_TEXT }, ...answer.blocks] };
  }
  return { status: 200, body: { answer, provider: provider.id } };
}
