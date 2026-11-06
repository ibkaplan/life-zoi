import { assistantReplyIsUnsafe, isUrgentMessage, SAFETY_NOTICE, WITHHELD_MESSAGE } from "@/lib/assistant";
import { LIMITED_SET_MESSAGE, MODEL_NOT_CONFIGURED, MODEL_QUOTA, MODEL_UNAVAILABLE } from "@/lib/wellness-assistant/copy";
import { questionById, WELLNESS_QUESTIONS } from "@/lib/wellness-assistant/library";
import { matchPreparedQuestions } from "@/lib/wellness-assistant/match";
import { createGeminiProvider, FREE_GEMINI_MODEL } from "@/lib/wellness-assistant/model/gemini";
import { personalFieldsPresent, redactTurns, suggestionFromSession } from "@/lib/wellness-assistant/model/session-text";
import type {
  PreparedPointer,
  WellnessChatBody,
  WellnessModelProvider,
  WellnessSource,
  WellnessTurn,
} from "@/lib/wellness-assistant/model/types";
import { authorizeWellnessUse, recordWellnessUse } from "@/lib/wellness-assistant/model/usage";

const METER_KEY = /^[a-zA-Z0-9-]{16,80}$/;
const MAX_TURNS = 8;
const MAX_CHARS = 800;
const MAX_OUTPUT_TOKENS = 320;

const PROMISE =
  /\b(?:prevents?|cures?|reverses?)\s+(?:disease|cancer|diabetes|heart disease|illness)\b|\bguaranteed\b/i;

type Env = Record<string, string | undefined>;

function pointers(ids: string[]): PreparedPointer[] {
  return ids.flatMap((id) => {
    const item = questionById(id);
    return item ? [{ id: item.id, question: item.question }] : [];
  });
}

function preparedFor(question: string): { reply: string; preparedQuestionId: string | null; related: PreparedPointer[] } {
  const match = matchPreparedQuestions(question);
  if (match.selectedId) {
    const item = questionById(match.selectedId);
    if (item) {
      return {
        reply: item.answer,
        preparedQuestionId: item.id,
        related: pointers(item.relatedIds.filter((id) => id !== item.id)),
      };
    }
  }
  const related = (match.matches.length > 0 ? match.matches : WELLNESS_QUESTIONS.slice(0, 3)).map((item) => ({
    id: item.id,
    question: item.question,
  }));
  return { reply: LIMITED_SET_MESSAGE, preparedQuestionId: null, related };
}

function parseTurns(input: unknown): { ok: true; messages: WellnessTurn[]; meterKey: string; personalDataIgnored: boolean } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "The request could not be read." };
  const record = input as Record<string, unknown>;
  if (!Array.isArray(record.messages) || record.messages.length === 0) {
    return { ok: false, error: "Enter a message before sending." };
  }
  if (record.messages.length > MAX_TURNS) {
    return { ok: false, error: "This conversation is too long for one request. Clear it and start again." };
  }
  const messages: WellnessTurn[] = [];
  for (const item of record.messages) {
    if (!item || typeof item !== "object") return { ok: false, error: "The request could not be read." };
    const turn = item as Record<string, unknown>;
    const role = turn.role === "assistant" ? "assistant" : turn.role === "user" ? "user" : null;
    const content = typeof turn.content === "string" ? turn.content.trim() : "";
    if (!role || !content || content.length > MAX_CHARS) {
      return { ok: false, error: "Use a shorter message, up to 800 characters." };
    }
    messages.push({ role, content });
  }
  if (messages[messages.length - 1]?.role !== "user") return { ok: false, error: "Enter a message before sending." };
  const meterKey = typeof record.meterKey === "string" ? record.meterKey.trim() : "";
  if (!METER_KEY.test(meterKey)) {
    return { ok: false, error: "This browser session could not be counted. Refresh the page and try again." };
  }
  return { ok: true, messages, meterKey, personalDataIgnored: personalFieldsPresent(record) };
}

function body(partial: WellnessChatBody): { status: number; body: WellnessChatBody } {
  return { status: 200, body: partial };
}

export function describeWellnessModel(env: Env = process.env) {
  const configured = Boolean(env.GEMINI_API_KEY?.trim());
  return {
    configured,
    provider: configured ? "gemini" : "none",
    model: configured ? FREE_GEMINI_MODEL : null,
    notice: configured
      ? "A free wellness model can reply to general questions in this session. Prepared answers are used if it cannot reply."
      : MODEL_NOT_CONFIGURED,
  };
}

function resolveProvider(env: Env, fetchImpl?: typeof fetch): WellnessModelProvider | null {
  const apiKey = env.GEMINI_API_KEY?.trim() ?? "";
  if (!apiKey) return null;
  return createGeminiProvider({ apiKey, fetchImpl });
}

export async function handleWellnessRequest(
  input: unknown,
  env: Env = process.env,
  options: { now?: Date; fetchImpl?: typeof fetch; provider?: WellnessModelProvider | null } = {},
): Promise<{ status: number; body: WellnessChatBody }> {
  const parsed = parseTurns(input);
  if (!parsed.ok) {
    return {
      status: 400,
      body: {
        source: "prepared",
        configured: Boolean(env.GEMINI_API_KEY?.trim()),
        provider: null,
        model: null,
        reply: "",
        notice: null,
        suggestion: null,
        preparedQuestionId: null,
        related: [],
        personalDataIgnored: false,
        usage: null,
        error: parsed.error,
      },
    };
  }

  const latest = parsed.messages[parsed.messages.length - 1]?.content ?? "";
  const suggestion = suggestionFromSession(redactTurns(parsed.messages));
  const prepared = preparedFor(latest);
  const base = {
    suggestion,
    personalDataIgnored: parsed.personalDataIgnored,
    usage: null,
    error: null as string | null,
  };

  if (isUrgentMessage(latest)) {
    return body({
      ...base,
      source: "safety",
      configured: Boolean(env.GEMINI_API_KEY?.trim()),
      provider: null,
      model: null,
      reply: SAFETY_NOTICE,
      notice: SAFETY_NOTICE,
      preparedQuestionId: null,
      related: [],
    });
  }

  const provider = options.provider === undefined ? resolveProvider(env, options.fetchImpl) : options.provider;
  if (!provider) {
    return body({
      ...base,
      source: "prepared",
      configured: false,
      provider: null,
      model: null,
      reply: prepared.reply,
      notice: MODEL_NOT_CONFIGURED,
      preparedQuestionId: prepared.preparedQuestionId,
      related: prepared.related,
    });
  }

  const now = options.now ?? new Date();
  const allowed = authorizeWellnessUse(parsed.meterKey, now);
  if (!allowed.ok) {
    return body({
      ...base,
      source: "quota",
      configured: true,
      provider: provider.id,
      model: provider.model,
      reply: prepared.reply,
      notice: MODEL_QUOTA,
      preparedQuestionId: prepared.preparedQuestionId,
      related: prepared.related,
    });
  }

  const usage = recordWellnessUse(parsed.meterKey, now);
  const result = await provider.complete({
    messages: redactTurns(parsed.messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });
  if (!result.ok) {
    const source: WellnessSource = result.reason === "quota" ? "quota" : "unavailable";
    return body({
      ...base,
      source,
      configured: true,
      provider: provider.id,
      model: provider.model,
      reply: prepared.reply,
      notice: result.reason === "quota" ? MODEL_QUOTA : MODEL_UNAVAILABLE,
      preparedQuestionId: prepared.preparedQuestionId,
      related: prepared.related,
      usage,
    });
  }

  if (assistantReplyIsUnsafe(result.text) || PROMISE.test(result.text)) {
    return body({
      ...base,
      source: "withheld",
      configured: true,
      provider: result.providerId,
      model: result.model,
      reply: WITHHELD_MESSAGE,
      notice: WITHHELD_MESSAGE,
      preparedQuestionId: prepared.preparedQuestionId,
      related: prepared.related,
      usage,
    });
  }

  return body({
    ...base,
    source: "model",
    configured: true,
    provider: result.providerId,
    model: result.model,
    reply: result.text,
    notice: null,
    preparedQuestionId: prepared.preparedQuestionId,
    related: prepared.related,
    usage,
  });
}
