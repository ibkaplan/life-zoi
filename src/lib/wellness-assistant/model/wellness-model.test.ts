import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAFETY_NOTICE, WITHHELD_MESSAGE } from "@/lib/assistant";
import { MODEL_NOT_CONFIGURED, MODEL_QUOTA, MODEL_UNAVAILABLE } from "@/lib/wellness-assistant/copy";
import { questionById, WELLNESS_QUESTIONS } from "@/lib/wellness-assistant/library";
import { clearLiveSession, loadWellnessMeter, readLiveTurns, writeLiveTurns } from "@/lib/wellness-assistant/live-session";
import { FREE_GEMINI_MODEL } from "@/lib/wellness-assistant/model/gemini";
import { describeWellnessModel, handleWellnessRequest } from "@/lib/wellness-assistant/model/handle";
import type { WellnessModelProvider } from "@/lib/wellness-assistant/model/types";
import { resetWellnessUsageForTests, WELLNESS_LIMITS } from "@/lib/wellness-assistant/model/usage";

const meterKey = "wellness-meter-123456";
const secret = "test-gemini-key-not-real";

function request(content: string, extra: Record<string, unknown> = {}, earlier: { role: "user" | "assistant"; content: string }[] = []) {
  return {
    meterKey,
    messages: [...earlier, { role: "user" as const, content }],
    ...extra,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function modelReply(text: string) {
  return jsonResponse({
    candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP" }],
  });
}

describe("free wellness model", () => {
  beforeEach(() => {
    resetWellnessUsageForTests();
  });

  it("uses a prepared answer and does not call the network when the model is not configured", async () => {
    const fetchSpy = vi.fn();
    const described = describeWellnessModel({});
    expect(described.configured).toBe(false);
    expect(described.model).toBeNull();
    expect(described.notice).toBe(MODEL_NOT_CONFIGURED);
    const result = await handleWellnessRequest(request("How can I sleep better?"), {}, { fetchImpl: fetchSpy });
    expect(result.status).toBe(200);
    expect(result.body.source).toBe("prepared");
    expect(result.body.notice).toBe(MODEL_NOT_CONFIGURED);
    expect(result.body.reply).toBe(questionById("sleep-better")?.answer);
    expect(result.body.preparedQuestionId).toBe("sleep-better");
    expect(WELLNESS_QUESTIONS).toHaveLength(50);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.body.suggestion).toContain("sleep");
  });

  it("sends only redacted session turns to the free model", async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return modelReply("A steady bedtime can make nights easier. This is general information, not a diagnosis or a medicine change.");
    });
    const result = await handleWellnessRequest(
      request("My HbA1c is 8.2 and I was diagnosed with diabetes. How can I sleep better?", {
        assessment: { habitNote: "private-lab-value-should-not-appear", a1c: 8.2 },
        labs: [{ name: "HbA1c", value: 8.2 }],
        diagnosis: "diabetes",
      }),
      { GEMINI_API_KEY: secret, GEMINI_MODEL: "gemini-4-argon" },
      { fetchImpl: fetchSpy },
    );
    expect(result.status).toBe(200);
    expect(result.body.source).toBe("model");
    expect(result.body.model).toBe(FREE_GEMINI_MODEL);
    expect(result.body.personalDataIgnored).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const call = fetchSpy.mock.calls[0];
    expect(call).toBeDefined();
    const url = String(call?.[0]);
    const init = call?.[1];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
    );
    expect(url).not.toContain(secret);
    expect(url).not.toContain("gemini-4-argon");
    const headers = init?.headers as Record<string, string>;
    expect(headers["x-goog-api-key"]).toBe(secret);
    const outbound = String(init?.body);
    expect(outbound).not.toContain(secret);
    expect(outbound).not.toContain("8.2");
    expect(outbound).not.toContain("private-lab-value-should-not-appear");
    expect(outbound).not.toContain("diagnosed with diabetes");
    expect(outbound).not.toContain("habitNote");
    expect(outbound).not.toContain('"tools"');
    expect(JSON.stringify(result.body)).not.toContain(secret);
    expect(result.body.usage?.sessionUsed).toBe(1);
    expect(result.body.usage?.processUsed).toBe(1);
  });

  it("keeps follow-up context from this session and suggests only from what was said", async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { contents: { role: string; parts: { text: string }[] }[] };
      expect(String(input)).toContain(FREE_GEMINI_MODEL);
      expect(body.contents.map((item) => item.parts[0].text).join("\n")).toContain("waking at night");
      return modelReply("Since you mentioned waking at night, a dimmer hour before bed is a gentle next step. This is not a diagnosis.");
    });
    const result = await handleWellnessRequest(
      request("What can I try tonight?", {}, [
        { role: "user", content: "I keep waking at night." },
        { role: "assistant", content: "A regular wind-down can help." },
      ]),
      { GEMINI_API_KEY: secret },
      { fetchImpl: fetchSpy },
    );
    expect(result.body.source).toBe("model");
    expect(result.body.suggestion).toContain("sleep");
    expect(result.body.suggestion?.toLowerCase()).not.toContain("blood pressure");
    expect(result.body.reply).toContain("waking at night");

    const quiet = await handleWellnessRequest(request("Hello there", {}, []), { GEMINI_API_KEY: secret }, {
      fetchImpl: vi.fn(async () => modelReply("Hello. I can talk about everyday habits such as sleep, meals, and movement. This is not a diagnosis.")),
    });
    expect(quiet.body.suggestion).toBeNull();
  });

  it("falls back to a prepared answer when the free tier quota fails", async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: { status: "RESOURCE_EXHAUSTED" } }, 429));
    const result = await handleWellnessRequest(request("How can I sleep better?"), { GEMINI_API_KEY: secret }, { fetchImpl: fetchSpy });
    expect(result.status).toBe(200);
    expect(result.body.source).toBe("quota");
    expect(result.body.notice).toBe(MODEL_QUOTA);
    expect(result.body.reply).toBe(questionById("sleep-better")?.answer);
    expect(JSON.stringify(result.body)).not.toContain(secret);
  });

  it("stops at the session rate limit without another model call", async () => {
    const fetchSpy = vi.fn(async () => modelReply("A short walk can be a gentle start. This is general information, not a diagnosis."));
    const now = new Date("2026-11-06T15:00:00Z");
    for (let sent = 0; sent < WELLNESS_LIMITS.requestsPerMinute; sent += 1) {
      const ok = await handleWellnessRequest(request("How can I sleep better?"), { GEMINI_API_KEY: secret }, {
        fetchImpl: fetchSpy,
        now,
      });
      expect(ok.body.source).toBe("model");
      expect(ok.body.usage?.sessionUsed).toBe(sent + 1);
    }
    const blocked = await handleWellnessRequest(request("How can I sleep better?"), { GEMINI_API_KEY: secret }, {
      fetchImpl: fetchSpy,
      now,
    });
    expect(blocked.body.source).toBe("quota");
    expect(blocked.body.notice).toBe(MODEL_QUOTA);
    expect(blocked.body.reply).toBe(questionById("sleep-better")?.answer);
    expect(fetchSpy).toHaveBeenCalledTimes(WELLNESS_LIMITS.requestsPerMinute);
  });

  it("withholds an unsafe model reply and does not repeat a thrown secret", async () => {
    const unsafe = await handleWellnessRequest(request("How can I sleep better?"), { GEMINI_API_KEY: secret }, {
      fetchImpl: vi.fn(async () => modelReply("Stop taking your dose. This prevents diabetes.")),
    });
    expect(unsafe.body.source).toBe("withheld");
    expect(unsafe.body.reply).toBe(WITHHELD_MESSAGE);
    expect(unsafe.body.reply).not.toContain("Stop taking");

    const thrown = await handleWellnessRequest(request("How can I sleep better?"), { GEMINI_API_KEY: secret }, {
      fetchImpl: vi.fn(async () => {
        throw new Error(`network down ${secret}`);
      }),
    });
    expect(thrown.body.source).toBe("unavailable");
    expect(thrown.body.notice).toBe(MODEL_UNAVAILABLE);
    expect(thrown.body.reply).toBe(questionById("sleep-better")?.answer);
    expect(JSON.stringify(thrown.body)).not.toContain(secret);
  });

  it("answers an emergency without calling the model", async () => {
    const fetchSpy = vi.fn();
    const result = await handleWellnessRequest(request("I have chest pain and cannot breathe"), { GEMINI_API_KEY: secret }, {
      fetchImpl: fetchSpy,
    });
    expect(result.body.source).toBe("safety");
    expect(result.body.reply).toBe(SAFETY_NOTICE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("can swap the provider without changing the route contract", async () => {
    const fixture: WellnessModelProvider = {
      id: "fixture",
      model: "fixture-model",
      async complete() {
        return {
          ok: true,
          text: "Gentle stretching is a general idea for the movement you mentioned. This is not a diagnosis.",
          providerId: "fixture",
          model: "fixture-model",
        };
      },
    };
    const result = await handleWellnessRequest(request("What gentle movement can I try?"), { GEMINI_API_KEY: secret }, {
      provider: fixture,
    });
    expect(result.body.source).toBe("model");
    expect(result.body.provider).toBe("fixture");
    expect(result.body.model).toBe("fixture-model");
    expect(result.body.reply).toContain("movement");
  });

  it("keeps the live thread in the storage that is passed in", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    };
    expect(loadWellnessMeter(storage, () => "meter-key-1234567890")).toBe("meter-key-1234567890");
    writeLiveTurns(storage, [
      { id: "1", role: "user", content: "How can I sleep better?" },
      { id: "2", role: "assistant", content: "A regular bedtime can help.", source: "prepared" },
    ]);
    expect(readLiveTurns(storage).map((turn) => turn.role)).toEqual(["user", "assistant"]);
    clearLiveSession(storage);
    expect(readLiveTurns(storage)).toEqual([]);
    expect(storage.getItem("lifezoi.wellness-assistant.meter.v1")).toBeNull();
  });
});
