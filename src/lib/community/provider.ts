import { PROVIDER_TIMEOUT_MS } from "@/lib/community/policy";

/**
 * Free OpenAI Moderations call only.
 * POST https://api.openai.com/v1/moderations
 * model omni-moderation-latest
 * This file does not call chat completions and does not select a paid model.
 *
 * Official free-tier limits for omni-moderation-latest, read 2026-11-06 from
 * https://developers.openai.com/api/docs/models/omni-moderation-latest :
 * 250 requests per minute, 5,000 requests per day, 10,000 tokens per minute.
 * The help center says the Moderations endpoint is free and does not count
 * toward monthly usage limits:
 * https://help.openai.com/en/articles/4936833-is-the-moderation-endpoint-free-to-use
 * A 429 response stays pending. There is no paid fallback.
 */
export const MODERATION_ENDPOINT = "https://api.openai.com/v1/moderations";
export const MODERATION_MODEL = "omni-moderation-latest";

const CATEGORY_PRIORITY = [
  "sexual/minors",
  "self-harm/instructions",
  "self-harm/intent",
  "self-harm",
  "hate/threatening",
  "harassment/threatening",
  "illicit/violent",
  "violence/graphic",
  "violence",
  "hate",
  "harassment",
  "sexual",
  "illicit",
] as const;

export type ProviderOutcome =
  | { kind: "not-configured" }
  | { kind: "clear" }
  | { kind: "flagged"; category: string }
  | { kind: "timeout" }
  | { kind: "quota" }
  | { kind: "error" };

export function mapProviderCategory(name: string): string {
  if (name.startsWith("sexual")) return "sexual";
  if (name.startsWith("self-harm")) return "self-harm";
  if (name.startsWith("hate")) return "hate";
  if (name === "harassment/threatening") return "threat";
  if (name.startsWith("harassment")) return "harassment";
  if (name.startsWith("violence")) return "violence";
  if (name.startsWith("illicit")) return "illicit";
  return "other";
}

function configuredKey(apiKey: string | undefined): string | null {
  const key = apiKey?.trim() ?? "";
  if (!key) return null;
  return key;
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

export async function moderateText(
  text: string,
  options: { apiKey: string | undefined; fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<ProviderOutcome> {
  const apiKey = configuredKey(options.apiKey);
  if (!apiKey) return { kind: "not-configured" };
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? PROVIDER_TIMEOUT_MS;
  let response: Response;
  try {
    response = await fetchImpl(MODERATION_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODERATION_MODEL, input: text }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (isAbort(error)) return { kind: "timeout" };
    return { kind: "error" };
  }
  if (response.status === 429) return { kind: "quota" };
  if (!response.ok) return { kind: "error" };
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { kind: "error" };
  }
  if (!payload || typeof payload !== "object") return { kind: "error" };
  const results = (payload as { results?: unknown }).results;
  const first = Array.isArray(results) ? results[0] : null;
  if (!first || typeof first !== "object") return { kind: "error" };
  const flagged = (first as { flagged?: unknown }).flagged;
  if (typeof flagged !== "boolean") return { kind: "error" };
  if (!flagged) return { kind: "clear" };
  const categories = (first as { categories?: unknown }).categories;
  const flaggedNames =
    categories && typeof categories === "object"
      ? Object.entries(categories)
          .filter((entry) => entry[1] === true)
          .map((entry) => entry[0])
      : [];
  const ordered = CATEGORY_PRIORITY.find((name) => flaggedNames.includes(name)) ?? flaggedNames[0] ?? "other";
  return { kind: "flagged", category: mapProviderCategory(ordered) };
}
