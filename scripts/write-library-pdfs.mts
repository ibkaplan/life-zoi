import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { libraryGuides } from "../src/lib/library/guides.ts";
import { buildGuidePdf } from "../src/lib/library/pdf.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const folder = join(root, "public/library/pdfs");
mkdirSync(folder, { recursive: true });

for (const guide of libraryGuides) {
  const bytes = buildGuidePdf({
    title: guide.title,
    sections: guide.sections.map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs,
      bullets: section.bullets,
    })),
    backPath: `/library/guides/${guide.slug}`,
  });
  writeFileSync(join(folder, `${guide.slug}.pdf`), bytes);
}

process.stdout.write(`${libraryGuides.length} pdfs\n`);
