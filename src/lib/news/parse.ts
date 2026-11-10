/**
 * A small, dependency-free reader for RSS 2.0 and Atom feeds. It only pulls
 * out the title, link, date, and description of each item, and it treats the
 * feed as untrusted text: markup is stripped and only http(s) links survive.
 */

export type FeedItem = {
  title: string;
  link: string;
  summary: string;
  /** Milliseconds since the epoch, or null when the feed gave no readable date. */
  published: number | null;
};

const MAX_ITEMS = 40;
const SUMMARY_MAX = 260;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const value = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) && value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : "";
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

function unwrapCdata(text: string): string {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

/** Turns feed markup into plain text: CDATA, tags, and entities removed, spaces collapsed. */
export function toPlainText(raw: string): string {
  let text = unwrapCdata(raw);
  // Descriptions are often escaped HTML, so decode once, strip tags, then decode what is left.
  text = decodeEntities(text);
  text = text.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]*>/g, " ");
  text = decodeEntities(text);
  return text.replace(/\s+/g, " ").trim();
}

/** The first one or two sentences, capped so a long description stays a summary. */
export function shortSummary(text: string, max = SUMMARY_MAX): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+["”’)]*(\s|$)/g);
  let summary = sentences ? sentences.slice(0, 2).join("").trim() : text;
  if (!summary) summary = text;
  if (summary.length > max) {
    const cut = summary.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    summary = `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–—-]+$/, "")}…`;
  }
  return summary;
}

export function safeLink(raw: string): string | null {
  const value = decodeEntities(unwrapCdata(raw)).trim();
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function tag(block: string, name: string): string | null {
  const escaped = name.replace(":", "\\:");
  const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i"));
  return match ? match[1] : null;
}

function atomLink(block: string): string | null {
  const links = block.match(/<link\b[^>]*>/gi) ?? [];
  let fallback: string | null = null;
  for (const link of links) {
    const href = link.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const rel = link.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1] ?? "alternate";
    if (rel === "alternate") return href;
    fallback ??= href;
  }
  return fallback;
}

export function parseDate(raw: string | null): number | null {
  if (!raw) return null;
  const value = Date.parse(toPlainText(raw));
  return Number.isFinite(value) ? value : null;
}

/** Reads up to 40 items from an RSS or Atom document. Items without a title or a safe link are dropped. */
export function parseFeed(xml: string): FeedItem[] {
  if (typeof xml !== "string" || !xml) return [];
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = xml.match(isAtom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const items: FeedItem[] = [];
  for (const block of blocks.slice(0, MAX_ITEMS)) {
    const title = toPlainText(tag(block, "title") ?? "");
    const rawLink = isAtom ? atomLink(block) : (tag(block, "link") ?? tag(block, "guid"));
    const link = rawLink ? safeLink(rawLink) : null;
    if (!title || !link) continue;
    const description = isAtom
      ? (tag(block, "summary") ?? tag(block, "content"))
      : (tag(block, "description") ?? tag(block, "content:encoded"));
    const dateText = isAtom
      ? (tag(block, "published") ?? tag(block, "updated"))
      : (tag(block, "pubDate") ?? tag(block, "dc:date"));
    const summary = shortSummary(toPlainText(description ?? ""));
    items.push({ title, link, summary: summary === title ? "" : summary, published: parseDate(dateText) });
  }
  return items;
}
