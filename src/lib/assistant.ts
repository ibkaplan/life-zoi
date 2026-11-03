export const ASSISTANT_STORAGE_KEY = "lifezoi.assistant.v1";

export const WELCOME_MESSAGE =
  "Hello! I'm your LifeZoi AI Health Assistant. I can help you understand your health habits, explore wellness topics, and make informed lifestyle choices. What would you like to discuss today?";

export const SUGGESTED_QUESTIONS = [
  "How can I improve my sleep?",
  "How can I reduce my sugar cravings?",
  "What exercises can improve my balance?",
  "How can I build healthier eating habits?",
  "How can I improve my energy?",
  "What small changes can I make this week?",
] as const;

export const METER_STORAGE_KEY = "lifezoi.meter.v1";

export const DEVELOPMENT_MESSAGE =
  "Development mock mode. Replies are prepared on this server for testing. No paid AI service is contacted, and lifestyle assessment answers are not sent to an AI provider.";

export const UNAVAILABLE_MESSAGE =
  "The AI service is unavailable. No reply was created, and the conversation was not saved in a database.";

export const WITHHELD_MESSAGE =
  "That reply was withheld because it did not stay within lifeZoi's educational limits. No diagnosis, medication change, or lifespan estimate is available. A qualified clinician can help with personal medical decisions.";

export const SAFETY_NOTICE =
  "This may need urgent medical care. If you are in immediate danger, contact local emergency services now. If you are in the United States and in emotional distress, call or text 988.";

const URGENT_PATTERN =
  /\b(suicid|kill myself|want to die|end my life|overdose|chest pain|cannot breathe|can't breathe|trouble breathing|shortness of breath|stroke|face droop|slurred speech|severe bleeding|unconscious|not breathing)\b/i;

const UNSAFE_REPLY =
  /stop taking|change (?:your|the) dose|increase (?:your|the) dose|decrease (?:your|the) dose|\btake \d+\s*(?:mg|mcg|milligrams)\b|you have (?:diabetes|cancer|hypertension|heart disease|depression)/i;

export type AssistantRole = "user" | "assistant";

export type AssistantTurn = {
  role: AssistantRole;
  content: string;
};

export type StoredAssistantTurn = AssistantTurn & { id: string };

export function isUrgentMessage(text: string): boolean {
  return URGENT_PATTERN.test(text);
}

export function assistantReplyIsUnsafe(text: string): boolean {
  return (
    /\bdate of death\b|\byou will die\b|\blife expectancy\b|\blifespan\b|\byears of life\b|\byears gained\b|\b\d+\s*%|\bpercent\b/i.test(
      text,
    ) || UNSAFE_REPLY.test(text)
  );
}

export function parseAssistantRequest(input: unknown):
  | {
      ok: true;
      messages: AssistantTurn[];
      meterKey: string;
      personalDataIgnored: boolean;
    }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "The request could not be read." };
  }
  const record = input as Record<string, unknown>;
  if (!Array.isArray(record.messages) || record.messages.length === 0) {
    return { ok: false, error: "Enter a message before sending." };
  }
  if (record.messages.length > 16) {
    return { ok: false, error: "This conversation is too long for one request. Clear the chat and start again." };
  }
  const messages: AssistantTurn[] = [];
  for (const item of record.messages) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "The request could not be read." };
    }
    const turn = item as Record<string, unknown>;
    const role = turn.role === "assistant" ? "assistant" : turn.role === "user" ? "user" : null;
    const content = typeof turn.content === "string" ? turn.content.trim() : "";
    if (!role || !content || content.length > 1500) {
      return { ok: false, error: "Use a shorter message, up to 1500 characters." };
    }
    messages.push({ role, content });
  }
  if (messages[messages.length - 1]?.role !== "user") {
    return { ok: false, error: "Enter a message before sending." };
  }
  const meterKey = typeof record.meterKey === "string" ? record.meterKey.trim() : "";
  const personalDataIgnored = "assessment" in record && record.assessment != null;
  return { ok: true, messages, meterKey, personalDataIgnored };
}

export function loadMeterKey(storage: Pick<Storage, "getItem" | "setItem"> | null): string {
  if (!storage) return "";
  const existing = storage.getItem(METER_STORAGE_KEY) ?? "";
  if (/^[a-zA-Z0-9-]{16,80}$/.test(existing)) return existing;
  const created = crypto.randomUUID();
  storage.setItem(METER_STORAGE_KEY, created);
  return created;
}

export function loadAssistantThread(storage: Pick<Storage, "getItem"> | null): StoredAssistantTurn[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(ASSISTANT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { messages?: unknown };
    if (!Array.isArray(parsed.messages)) return [];
    return parsed.messages.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const turn = item as Record<string, unknown>;
      const role: AssistantRole | null =
        turn.role === "assistant" || turn.role === "user" ? turn.role : null;
      const content = typeof turn.content === "string" ? turn.content.trim() : "";
      const id = typeof turn.id === "string" && turn.id ? turn.id : "";
      if (!role || !content || !id) return [];
      return [{ id, role, content: content.slice(0, 1500) }];
    }).slice(-16);
  } catch {
    return [];
  }
}

export function saveAssistantThread(
  storage: Pick<Storage, "setItem"> | null,
  messages: StoredAssistantTurn[],
) {
  if (!storage) return;
  storage.setItem(
    ASSISTANT_STORAGE_KEY,
    JSON.stringify({ version: 1, messages: messages.slice(-16) }),
  );
}

export function clearAssistantThread(storage: Pick<Storage, "removeItem"> | null) {
  storage?.removeItem(ASSISTANT_STORAGE_KEY);
  storage?.removeItem(METER_STORAGE_KEY);
  if (storage && typeof window !== "undefined" && storage === window.sessionStorage) {
    clientMessages = [];
    listeners.forEach((listener) => listener());
  }
}

const listeners = new Set<() => void>();
let clientMessages: StoredAssistantTurn[] = [];
let storageReady = false;
const serverMessages: StoredAssistantTurn[] = [];

function ensureAssistantStore() {
  if (storageReady || typeof window === "undefined") return;
  storageReady = true;
  clientMessages = loadAssistantThread(window.sessionStorage);
}

export function subscribeAssistantThread(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAssistantThread(): StoredAssistantTurn[] {
  ensureAssistantStore();
  return clientMessages;
}

export function getAssistantServerThread(): StoredAssistantTurn[] {
  return serverMessages;
}

export function setAssistantThread(messages: StoredAssistantTurn[]) {
  ensureAssistantStore();
  clientMessages = messages.slice(-16);
  saveAssistantThread(typeof window === "undefined" ? null : window.sessionStorage, clientMessages);
  listeners.forEach((listener) => listener());
}
