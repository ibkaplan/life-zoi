import { describe, expect, it } from "vitest";
import { assistantReplyIsUnsafe, isUrgentMessage } from "@/lib/assistant";
import uk from "@/lib/i18n/catalog/uk";
import { questionById } from "@/lib/wellness-assistant/library";
import { localQuestionText, matchPreparedQuestions } from "@/lib/wellness-assistant/match";
import { createGeminiProvider, systemPrompt } from "@/lib/wellness-assistant/model/gemini";
import { handleWellnessRequest } from "@/lib/wellness-assistant/model/handle";
import { redactSessionText, suggestionFromSession } from "@/lib/wellness-assistant/model/session-text";

const meterKey = "test-meter-key-0000000001";

describe("the wellness assistant in Ukrainian, Russian, and Greek", () => {
  it("keeps the English instructions unchanged and names the chosen language otherwise", () => {
    expect(systemPrompt()).toContain("Reply in warm, plain English.");
    expect(systemPrompt("uk")).toContain("Reply in warm, plain Ukrainian");
    expect(systemPrompt("ru")).toContain("Russian");
    expect(systemPrompt("el")).toContain("Greek");
    expect(systemPrompt("el")).toContain("Do not diagnose");
  });

  it("asks the free model to reply in the interface language and sends nothing else new", async () => {
    let sent: { systemInstruction?: { parts: { text: string }[] }; contents?: unknown[] } = {};
    const fetchImpl = (async (_url: string, init?: RequestInit) => {
      sent = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Спробуйте лягати спати в один і той самий час." }] } }] }), { status: 200 });
    }) as unknown as typeof fetch;
    const provider = createGeminiProvider({ apiKey: "test-key", fetchImpl });
    const result = await handleWellnessRequest(
      { meterKey, language: "uk", messages: [{ role: "user", content: "Як краще спати?" }] },
      { GEMINI_API_KEY: "test-key" },
      { provider },
    );
    expect(result.body.source).toBe("model");
    expect(sent.systemInstruction?.parts[0]?.text).toContain("Ukrainian");
    expect(Object.keys(sent).sort()).toEqual(["contents", "generationConfig", "systemInstruction"]);
  });

  it("finds a prepared answer from a question typed in the chosen language", async () => {
    const question = questionById("sleep-better");
    expect(question).not.toBeNull();
    const translated = uk[question!.question];
    expect(translated).toBeTruthy();
    const match = matchPreparedQuestions(translated, localQuestionText((text) => uk[text] || text));
    expect(match.selectedId).toBe("sleep-better");
    const result = await handleWellnessRequest({ meterKey, language: "uk", messages: [{ role: "user", content: translated }] }, {});
    expect(result.body.preparedQuestionId).toBe("sleep-better");
  });

  it("treats urgent messages as urgent in every language", () => {
    expect(isUrgentMessage("У мене сильний біль у грудях")).toBe(true);
    expect(isUrgentMessage("Не могу дышать")).toBe(true);
    expect(isUrgentMessage("Έχω πόνο στο στήθος")).toBe(true);
    expect(isUrgentMessage("Думаю про суїцид")).toBe(true);
    expect(isUrgentMessage("Як краще спати?")).toBe(false);
  });

  it("withholds unsafe replies written in another language", () => {
    expect(assistantReplyIsUnsafe("Припиніть приймати ці ліки.")).toBe(true);
    expect(assistantReplyIsUnsafe("Это увеличит продолжительность жизни.")).toBe(true);
    expect(assistantReplyIsUnsafe("Σταματήστε να παίρνετε το φάρμακο.")).toBe(true);
    expect(assistantReplyIsUnsafe("Спробуйте коротку прогулянку після обіду.")).toBe(false);
  });

  it("leaves out personal results and diagnoses written in another language", () => {
    const text = redactSessionText("У мене діабет, глюкоза 7,2, приймаю 500 мг");
    expect(text).not.toContain("7,2");
    expect(text).not.toContain("500");
    expect(text).not.toContain("діабет");
  });

  it("offers a simple step for a topic named in another language", () => {
    expect(suggestionFromSession([{ role: "user", content: "Я погано сплю вночі" }])).toContain("bedtime");
    expect(suggestionFromSession([{ role: "user", content: "Νιώθω πολύ άγχος" }])).toContain("slow breaths");
  });
});
