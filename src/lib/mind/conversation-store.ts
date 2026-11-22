import { initialConversation, type ConversationState, type MindReply } from "@/lib/mind/conversation";
import { MIND_CONVERSATION_KEY } from "@/lib/mind/store";

export type MindTurn = { id: string; role: "person" | "mind"; text: string; reply?: MindReply; via?: "voice" | "text" };

export type StoredConversation = { turns: MindTurn[]; state: ConversationState };

const MAX_TURNS = 80;

export function readConversation(): StoredConversation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(MIND_CONVERSATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConversation;
    if (!parsed || !Array.isArray(parsed.turns) || typeof parsed.state !== "object") return null;
    const turns = parsed.turns
      .filter((turn) => turn && (turn.role === "person" || turn.role === "mind") && typeof turn.text === "string" && typeof turn.id === "string")
      .slice(-MAX_TURNS);
    return { turns, state: { ...initialConversation(), ...parsed.state } };
  } catch {
    return null;
  }
}

export function writeConversation(value: StoredConversation) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MIND_CONVERSATION_KEY, JSON.stringify({ turns: value.turns.slice(-MAX_TURNS), state: value.state }));
  } catch {
    // Storage full or blocked: the conversation still works in memory.
  }
}

export function clearConversation() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(MIND_CONVERSATION_KEY);
  } catch {
    // ignore
  }
}
