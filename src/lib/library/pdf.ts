export type PdfSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type PdfGuideInput = {
  title: string;
  sections: PdfSection[];
  backPath: string;
};

const BRAND = "LIVE BETTER. MAKE LIFE MATTER.";

const PAGE_W = 612;
const MARGIN = 56;
const TOP = 718;
const BOTTOM = 92;
const MAX_W = PAGE_W - MARGIN * 2;

function ascii(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\n\x20-\x7E]/g, "");
}

function pdfText(text: string): string {
  return `(${ascii(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;
}

function charUnits(ch: string): number {
  if (ch === " ") return 280;
  if ("ijlI.,:;'`|!".includes(ch)) return 320;
  if ("mwMW@#%&".includes(ch)) return 840;
  if (ch >= "A" && ch <= "Z") return 680;
  return 540;
}

function textWidth(text: string, size: number): number {
  let width = 0;
  for (const ch of text) width += (charUnits(ch) / 1000) * size;
  return width;
}

function wrap(text: string, size: number, maxWidth: number): string[] {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  const pushLong = (word: string) => {
    let chunk = "";
    for (const ch of word) {
      if (textWidth(chunk + ch, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    current = chunk;
  };
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (textWidth(next, size) <= maxWidth) {
      current = next;
    } else if (!current && textWidth(word, size) > maxWidth) {
      pushLong(word);
    } else {
      if (current) lines.push(current);
      if (textWidth(word, size) > maxWidth) pushLong(word);
      else current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

type DrawLine = { text: string; font: "F1" | "F2"; size: number; y: number; indent: number };

function paginate(input: PdfGuideInput): DrawLine[][] {
  const pages: DrawLine[][] = [[]];
  let y = TOP;
  const add = (text: string, font: "F1" | "F2", size: number, gap: number, indent = 0) => {
    if (y - size < BOTTOM) {
      pages.push([]);
      y = TOP;
    }
    pages[pages.length - 1].push({ text, font, size, y, indent });
    y -= size + gap;
  };
  const block = (text: string, font: "F1" | "F2", size: number, gap: number, indent = 0) => {
    for (const line of wrap(text, size, MAX_W - indent)) add(line, font, size, gap, indent);
  };

  block(input.title, "F2", 18, 8);
  for (const section of input.sections) {
    y -= 6;
    block(section.heading, "F2", 13, 4);
    for (const paragraph of section.paragraphs) block(paragraph, "F1", 11, 3);
    for (const bullet of section.bullets ?? []) block(`- ${bullet}`, "F1", 11, 2, 12);
  }
  return pages.filter((page) => page.length > 0);
}

function paint(lines: DrawLine[], pageNumber: number, pageCount: number, backPath: string): string {
  const ops: string[] = [];
  ops.push("0.969 0.973 1 rg");
  ops.push("0 0 612 792 re f");
  ops.push("0.341 0.145 0.659 rg");
  ops.push("0 742 612 50 re f");
  ops.push("0.914 0.867 0.984 rg");
  ops.push("22 752 14 18 re f");
  ops.push("1 1 1 rg");
  ops.push("BT");
  ops.push("/F2 16 Tf");
  ops.push("1 0 0 1 44 762 Tm");
  ops.push(`${pdfText("lifeZoi")} Tj`);
  ops.push("/F1 9 Tf");
  ops.push("1 0 0 1 120 764 Tm");
  ops.push(`${pdfText(BRAND)} Tj`);
  ops.push("ET");
  ops.push("0.090 0.145 0.329 rg");
  ops.push("BT");
  for (const line of lines) {
    ops.push(`/${line.font} ${line.size} Tf`);
    ops.push(`1 0 0 1 ${MARGIN + line.indent} ${line.y.toFixed(1)} Tm`);
    ops.push(`${pdfText(line.text)} Tj`);
  }
  ops.push("ET");
  ops.push("0.243 0.306 0.502 rg");
  const footer = [
    "Educational only. lifeZoi does not diagnose, treat, or promise a result.",
    "It does not promise a longer life.",
    `Read it in lifeZoi: ${backPath}`,
  ];
  ops.push("BT");
  ops.push("/F1 8 Tf");
  footer.forEach((line, index) => {
    ops.push(`1 0 0 1 ${MARGIN} ${68 - index * 12} Tm`);
    ops.push(`${pdfText(line)} Tj`);
  });
  ops.push(`1 0 0 1 ${PAGE_W - MARGIN - 70} 28 Tm`);
  ops.push(`${pdfText(`${pageNumber} of ${pageCount}`)} Tj`);
  ops.push("ET");
  return ops.join("\n");
}

export function buildGuidePdf(input: PdfGuideInput): Uint8Array {
  const pages = paginate(input);
  const streams = pages.map((lines, index) => paint(lines, index + 1, pages.length, input.backPath));
  const fontId = 1;
  const boldId = 2;
  const pagesId = 3;
  const catalogId = 4 + streams.length * 2;
  const objects: string[] = new Array(catalogId);
  objects[0] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  const kids = streams.map((_, index) => `${4 + index * 2} 0 R`).join(" ");
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`;
  streams.forEach((stream, index) => {
    const pageId = 4 + index * 2;
    const contentId = pageId + 1;
    objects[pageId - 1] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    const length = Buffer.byteLength(stream, "latin1");
    objects[contentId - 1] = `<< /Length ${length} >>\nstream\n${stream}\nendstream`;
  });
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let out = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefAt = Buffer.byteLength(out, "latin1");
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  out += xref;
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  return Uint8Array.from(Buffer.from(out, "latin1"));
}
