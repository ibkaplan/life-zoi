// Draws the installable-app icons from the same drop mark as src/app/icon.svg.
// Run with: node scripts/make-app-icons.mjs (uses sharp, which Next already installs).
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

/** The drop and stem, drawn in a 32-unit box, scaled to `size` inside a canvas of `canvas`. */
function mark(canvas, size, rounded) {
  const offset = (canvas - size) / 2;
  const k = size / 32;
  const rx = rounded ? 8 * (canvas / 32) : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">
  <rect width="${canvas}" height="${canvas}" rx="${rx}" fill="#7136C8"/>
  <g transform="translate(${offset} ${offset}) scale(${k})">
    <path d="M16 6.5c2.2 4.2 7 6.4 7 11.2a7 7 0 1 1-14 0c0-4.8 4.8-7 7-11.2z" fill="#E9DDFB"/>
    <path d="M16 12.5v10" stroke="#7136C8" stroke-width="1.6" stroke-linecap="round"/>
  </g>
</svg>`;
}

const jobs = [
  // Ordinary icons keep the rounded square of the tab icon.
  ["icon-192.png", mark(192, 192, true)],
  ["icon-512.png", mark(512, 512, true)],
  // Maskable: full-bleed colour, the drop inside the central safe zone, so any mask shape works.
  ["maskable-512.png", mark(512, 360, false)],
  // Apple adds its own rounded corners and ignores transparency.
  ["apple-touch-icon.png", mark(180, 150, false)],
];

for (const [name, svg] of jobs) {
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}`);
  console.log("wrote", `${OUT}/${name}`);
}
