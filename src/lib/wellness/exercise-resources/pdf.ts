import { BRAND_LINE, guidePublicUrl } from "@/lib/wellness/exercise-resources/copy";
import type { Guide } from "@/lib/wellness/exercise-resources/guides";

type RGB = readonly [number, number, number];

type PdfLine = {
  text: string;
  size: number;
  bold?: boolean;
  color?: RGB;
  gapAfter?: number;
  url?: string;
};

const INK: RGB = [23 / 255, 37 / 255, 84 / 255];
const PURPLE: RGB = [113 / 255, 54 / 255, 200 / 255];
const DEEP: RGB = [87 / 255, 37 / 255, 168 / 255];

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const MAX_W = PAGE_W - MARGIN * 2;

function sanitize(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, "");
}

function escapePdfText(text: string): string {
  return sanitize(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pieces(word: string, maxChars: number): string[] {
  if (word.length <= maxChars) return [word];
  const chunks: string[] = [];
  for (let index = 0; index < word.length; index += maxChars) chunks.push(word.slice(index, index + maxChars));
  return chunks;
}

function wrap(text: string, size: number, bold = false): string[] {
  const maxChars = Math.max(20, Math.floor(MAX_W / (size * (bold ? 0.56 : 0.5))));
  const words = sanitize(text).split(/\s+/).filter(Boolean).flatMap((word) => pieces(word, maxChars));
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

type BuiltLink = { x: number; y: number; w: number; h: number; url: string };
type BuiltPage = { stream: string; links: BuiltLink[] };

function rgb(color: RGB): string {
  return color.map((channel) => channel.toFixed(3)).join(" ");
}

function renderPages(blocks: PdfLine[]): BuiltPage[] {
  const pages: BuiltPage[] = [];
  let drawn: { text: string; size: number; bold: boolean; color: RGB; y: number }[] = [];
  let links: BuiltLink[] = [];
  let y = PAGE_H - 64;

  function flush() {
    const commands = [
      "q",
      `${rgb(PURPLE)} rg`,
      `0 ${PAGE_H - 36} ${PAGE_W} 36 re f`,
      "Q",
      `${rgb([1, 1, 1])} rg`,
      "BT",
      "/F2 12 Tf",
      `1 0 0 1 ${MARGIN} ${PAGE_H - 24} Tm`,
      `(${escapePdfText("LifeZoi")}) Tj`,
      "ET",
      `${rgb(INK)} rg`,
      "BT",
      "/F2 10 Tf",
      `1 0 0 1 ${MARGIN} 34 Tm`,
      `(${escapePdfText(BRAND_LINE)}) Tj`,
      "ET",
    ];
    for (const line of drawn) {
      commands.push(`${rgb(line.color)} rg`);
      commands.push("BT");
      commands.push(`${line.bold ? "/F2" : "/F1"} ${line.size} Tf`);
      commands.push(`1 0 0 1 ${MARGIN} ${line.y.toFixed(1)} Tm`);
      commands.push(`(${escapePdfText(line.text)}) Tj`);
      commands.push("ET");
    }
    pages.push({ stream: commands.join("\n"), links });
    drawn = [];
    links = [];
    y = PAGE_H - 64;
  }

  function ensure(height: number) {
    if (y - height < 64) flush();
  }

  for (const block of blocks) {
    const color = block.color ?? INK;
    const parts = wrap(block.text, block.size, block.bold);
    parts.forEach((part, index) => {
      const height = block.size * 1.4;
      ensure(height);
      const textY = y - block.size;
      drawn.push({ text: part, size: block.size, bold: Boolean(block.bold), color, y: textY });
      if (block.url && index === 0) {
        links.push({
          x: MARGIN,
          y: textY - 2,
          w: MAX_W,
          h: block.size + 6,
          url: block.url,
        });
      }
      y -= height;
    });
    y -= block.gapAfter ?? 8;
  }
  if (drawn.length > 0) flush();
  return pages.length > 0 ? pages : [{ stream: "", links: [] }];
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function assemble(pages: BuiltPage[]): Uint8Array {
  const objects: string[] = ["", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"];
  const pageIds: number[] = [];

  for (const page of pages) {
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${byteLength(page.stream)} >>\nstream\n${page.stream}\nendstream`);
    const annotIds: number[] = [];
    for (const link of page.links) {
      annotIds.push(objects.length + 1);
      const x2 = (link.x + link.w).toFixed(1);
      const y2 = (link.y + link.h).toFixed(1);
      objects.push(
        `<< /Type /Annot /Subtype /Link /Rect [${link.x.toFixed(1)} ${link.y.toFixed(1)} ${x2} ${y2}] /Border [0 0 0] /A << /S /URI /URI (${escapePdfText(link.url)}) >> >>`,
      );
    }
    pageIds.push(objects.length + 1);
    const annots = annotIds.length > 0 ? ` /Annots [${annotIds.map((id) => `${id} 0 R`).join(" ")}]` : "";
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R${annots} >>`,
    );
  }

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;

  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(byteLength(output));
    output += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefAt = byteLength(output);
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  output += xref;
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  return new TextEncoder().encode(output);
}

export function pdfPlainText(bytes: Uint8Array): string {
  const raw = new TextDecoder().decode(bytes);
  const parts: string[] = [];
  for (const match of raw.matchAll(/\(((?:\\.|[^\\)])*)\)/g)) {
    parts.push(match[1].replace(/\\([\\()])/g, "$1"));
  }
  return parts.join(" ");
}

export function buildGuidePdf(guide: Guide): Uint8Array {
  const home = guidePublicUrl(guide.slug);
  const blocks: PdfLine[] = [
    { text: "Free guide", size: 13, bold: true, color: PURPLE, gapAfter: 6 },
    { text: guide.title, size: 24, bold: true, color: DEEP, gapAfter: 8 },
    { text: BRAND_LINE, size: 13, bold: true, color: PURPLE, gapAfter: 12 },
    { text: guide.summary, size: 16, gapAfter: 12 },
    { text: "Safety", size: 18, bold: true, color: DEEP, gapAfter: 4 },
    { text: guide.safety, size: 15, gapAfter: 8 },
    { text: "These guides are not treatment.", size: 15, bold: true, gapAfter: 14 },
  ];
  for (const section of guide.sections) {
    blocks.push({ text: section.heading, size: 18, bold: true, color: DEEP, gapAfter: 4 });
    for (const line of section.lines) blocks.push({ text: line, size: 15, gapAfter: 3 });
    blocks.push({ text: " ", size: 8, gapAfter: 4 });
  }
  blocks.push({ text: "Open this guide in lifeZoi", size: 16, bold: true, color: DEEP, gapAfter: 4 });
  blocks.push({ text: home, size: 11, url: home, gapAfter: 10 });
  blocks.push({ text: "Sources linked, not copied", size: 16, bold: true, color: DEEP, gapAfter: 4 });
  for (const link of guide.links) {
    blocks.push({ text: `${link.label} (${link.source})`, size: 13, bold: true, gapAfter: 2 });
    blocks.push({ text: link.url, size: 10, url: link.url, gapAfter: 6 });
  }
  blocks.push({
    text: "LifeZoi wrote this guide. It does not copy an outside video, class, or PDF.",
    size: 12,
    gapAfter: 4,
  });
  return assemble(renderPages(blocks));
}
