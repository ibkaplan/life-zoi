import { findLabCode, type LabCode } from "@/lib/references/catalog";

export const LOINC_SYSTEM = "2.16.840.1.113883.6.1";
export const CONNECT_ENDPOINT = "https://connect.medlineplus.gov/service";
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const OUTBOUND_LIMIT_PER_MINUTE = 20;
const EXCERPT_LIMIT = 320;

export type ReferenceMatch = {
  matched: boolean;
  loinc: string;
  topic: string | null;
  title: string | null;
  url: string | null;
  excerpt: string | null;
  attribution: string;
  cached: boolean;
  message: string;
};

type CacheEntry = { expiresAt: number; match: ReferenceMatch };

const cache = new Map<string, CacheEntry>();
const outboundTimes: number[] = [];

export function resetMedlinePlusForTests() {
  cache.clear();
  outboundTimes.length = 0;
}

export function connectUrl(loinc: string): string {
  const params = new URLSearchParams({
    "mainSearchCriteria.v.cs": LOINC_SYSTEM,
    "mainSearchCriteria.v.c": loinc,
    knowledgeResponseType: "application/json",
    "informationRecipient.languageCode.c": "en",
  });
  return `${CONNECT_ENDPOINT}?${params.toString()}`;
}

export function excerptFromHtml(html: string): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= EXCERPT_LIMIT) return text;
  return `${text.slice(0, EXCERPT_LIMIT - 1).trimEnd()}…`;
}

function textValue(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const record = node as { _value?: unknown };
  return typeof record._value === "string" ? record._value : "";
}

export function parseConnectPayload(payload: unknown, loinc: string): ReferenceMatch {
  const feed = payload && typeof payload === "object" ? (payload as { feed?: unknown }).feed : null;
  const entryNode = feed && typeof feed === "object" ? (feed as { entry?: unknown }).entry : null;
  const entry = Array.isArray(entryNode) ? entryNode[0] : entryNode;
  if (!entry || typeof entry !== "object") {
    return {
      matched: false,
      loinc,
      topic: findLabCode(loinc)?.topic ?? null,
      title: null,
      url: null,
      excerpt: null,
      attribution: "U.S. National Library of Medicine, MedlinePlus",
      cached: false,
      message: "MedlinePlus Connect did not return a page for this code. The code may still be a real LOINC code.",
    };
  }
  const record = entry as { title?: unknown; link?: unknown; summary?: unknown };
  const links = Array.isArray(record.link) ? record.link : [];
  const href = links.find((link) => link && typeof link === "object" && typeof (link as { href?: unknown }).href === "string") as
    | { href: string }
    | undefined;
  const summary = textValue(record.summary);
  const title = textValue(record.title);
  if (!title || !href?.href.startsWith("https://medlineplus.gov/")) {
    return {
      matched: false,
      loinc,
      topic: findLabCode(loinc)?.topic ?? null,
      title: null,
      url: null,
      excerpt: null,
      attribution: "U.S. National Library of Medicine, MedlinePlus",
      cached: false,
      message: "MedlinePlus Connect responded, but the page link was not usable.",
    };
  }
  return {
    matched: true,
    loinc,
    topic: findLabCode(loinc)?.topic ?? null,
    title,
    url: href.href,
    excerpt: excerptFromHtml(summary),
    attribution: "Information from MedlinePlus.gov, a service of the National Library of Medicine.",
    cached: false,
    message: "Educational reference only. It does not interpret this person's result.",
  };
}

function allowOutbound(now: number): boolean {
  const recent = outboundTimes.filter((time) => now - time < 60_000);
  outboundTimes.length = 0;
  outboundTimes.push(...recent);
  if (outboundTimes.length >= OUTBOUND_LIMIT_PER_MINUTE) return false;
  outboundTimes.push(now);
  return true;
}

export async function lookupLabReference(
  loinc: string,
  options: {
    fetch?: typeof fetch;
    now?: number;
  } = {},
): Promise<{ status: number; body: ReferenceMatch }> {
  const code: LabCode | null = findLabCode(loinc);
  if (!code) {
    return {
      status: 200,
      body: {
        matched: false,
        loinc: loinc.trim(),
        topic: null,
        title: null,
        url: null,
        excerpt: null,
        attribution: "U.S. National Library of Medicine, MedlinePlus",
        cached: false,
        message: "lifeZoi does not look up codes it has not verified. No request was sent.",
      },
    };
  }
  const now = options.now ?? Date.now();
  const cached = cache.get(code.loinc);
  if (cached && cached.expiresAt > now) {
    return { status: 200, body: { ...cached.match, cached: true } };
  }
  if (!allowOutbound(now)) {
    return {
      status: 429,
      body: {
        matched: false,
        loinc: code.loinc,
        topic: code.topic,
        title: null,
        url: null,
        excerpt: null,
        attribution: "U.S. National Library of Medicine, MedlinePlus",
        cached: false,
        message: "lifeZoi paused new MedlinePlus requests to stay inside the published rate guidance. Try again shortly.",
      },
    };
  }
  const fetchImpl = options.fetch ?? fetch;
  try {
    const response = await fetchImpl(connectUrl(code.loinc), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        status: 502,
        body: {
          matched: false,
          loinc: code.loinc,
          topic: code.topic,
          title: null,
          url: null,
          excerpt: null,
          attribution: "U.S. National Library of Medicine, MedlinePlus",
          cached: false,
          message: "MedlinePlus Connect did not answer successfully. The saved library links are still available.",
        },
      };
    }
    const match = parseConnectPayload(await response.json(), code.loinc);
    if (match.matched) {
      cache.set(code.loinc, { expiresAt: now + CACHE_TTL_MS, match });
    }
    return { status: 200, body: match };
  } catch {
    return {
      status: 502,
      body: {
        matched: false,
        loinc: code.loinc,
        topic: code.topic,
        title: null,
        url: null,
        excerpt: null,
        attribution: "U.S. National Library of Medicine, MedlinePlus",
        cached: false,
        message: "MedlinePlus Connect could not be reached. No personal result was sent.",
      },
    };
  }
}
