import type { Block, BlockKind } from "@/lib/voice/voices";

/** Put on anything a Listen button should not read: controls, banners, sources. */
export const VOICE_SKIP_ATTR = "data-voice-skip";

const READABLE = "h1,h2,h3,h4,h5,h6,p,li,dt,dd,figcaption,blockquote,summary,caption,tr,[data-voice-text]";
const SKIP = `[${VOICE_SKIP_ATTR}],nav,button,select,textarea,input,script,style,noscript,svg,.banner,footer,[aria-hidden="true"],[hidden]`;

function kindOf(element: Element, steps: boolean): BlockKind {
  const tag = element.tagName;
  if (/^H[1-6]$/.test(tag) || tag === "SUMMARY" || tag === "CAPTION") return "heading";
  if (tag === "LI") return steps && element.parentElement?.tagName === "OL" ? "step" : "item";
  if (tag === "TR" || tag === "DT" || tag === "DD") return "item";
  return "paragraph";
}

/** Visible text of an element without the parts marked to skip. */
function readableText(element: HTMLElement): string {
  const skipped = element.querySelectorAll(SKIP);
  if (skipped.length === 0) return element.innerText ?? element.textContent ?? "";
  // innerText follows what is shown (closed <details>, hidden blocks), so read a copy with the controls taken out.
  const states: { node: HTMLElement; display: string }[] = [];
  skipped.forEach((node) => {
    if (node instanceof HTMLElement) {
      states.push({ node, display: node.style.display });
      node.style.display = "none";
    }
  });
  const text = element.innerText ?? "";
  for (const { node, display } of states) node.style.display = display;
  return text;
}

/**
 * The text a person sees in `root`, in reading order, one block per heading,
 * paragraph, or list item. Controls, navigation, banners, and anything marked
 * `data-voice-skip` are left out. Because it reads what is on screen, it reads
 * the language the page is shown in.
 *
 * With `steps`, items of a numbered list become steps a guided session can wait after.
 */
export function blocksFromElement(root: HTMLElement, steps = false): Block[] {
  const blocks: Block[] = [];
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(READABLE));
  const chosen = new Set<HTMLElement>();
  for (const element of candidates) {
    if (element.closest(SKIP)) continue;
    // A paragraph inside a list item is read as part of that item.
    let parent = element.parentElement;
    let nested = false;
    while (parent && parent !== root) {
      if (chosen.has(parent)) {
        nested = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (nested) continue;
    // Closed <details>: only the summary is visible, and innerText of hidden content is empty anyway.
    if (element.getClientRects().length === 0 && element.tagName !== "SUMMARY") continue;
    chosen.add(element);
    // Table cells come back separated by tabs; read a row as one short list.
    const text = readableText(element).replace(/\t+/g, ", ").replace(/\s+/g, " ").trim();
    if (!text || !/[\p{L}\p{N}]/u.test(text)) continue;
    blocks.push({ text, kind: kindOf(element, steps) });
  }
  if (blocks.length === 0) {
    const text = readableText(root).replace(/\s+/g, " ").trim();
    if (text) blocks.push({ text, kind: "paragraph" });
  }
  return blocks;
}
