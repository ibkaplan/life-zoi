#!/usr/bin/env node
/**
 * Chair Yoga Studio: check one or more YouTube links and print catalog entries.
 *
 *   npm run video:add -- https://www.youtube.com/watch?v=RjqME9aAOpA --section seated
 *
 * Uses YouTube's public oEmbed endpoint. No API key, no paid service.
 * oEmbed answers 200 for a public video that allows embedding, 401 or 403 when
 * the owner turned embedding off, and 404 when the video is private or gone.
 * It does not give the length, so `minutes` is read from the title when the
 * title says it, and otherwise left null for a person to fill in.
 *
 * Paste the printed lines into STUDIO_VIDEO_SEEDS in
 * src/lib/wellness-library/chair-yoga-videos.ts, check the guessed fields,
 * and open a pull request.
 */

const SECTIONS = ["seated", "standing", "gentle"];

function youtubeId(url) {
  const match = /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/.exec(url);
  return match ? match[1] : /^[A-Za-z0-9_-]{11}$/.test(url) ? url : null;
}

function minutesFromTitle(title) {
  const match = /(\d{1,2})\s*[- ]?\s*(?:min|minute)/i.exec(title);
  return match ? Number(match[1]) : null;
}

function guessSection(title) {
  if (/standing/i.test(title)) return "standing";
  if (/chair|seated|desk/i.test(title)) return "seated";
  return "gentle";
}

function guessPosition(title, section) {
  if (/standing\s*&\s*seated|seated\s*&\s*standing/i.test(title)) return "mixed";
  if (section === "standing") return /standing/i.test(title) ? "standing" : "mixed";
  if (section === "seated") return "seated";
  return /chair|desk|seated/i.test(title) ? "seated" : "mat";
}

function guessAudience(title) {
  if (/50\+|over 50/i.test(title)) return "50+";
  if (/senior|older|65|60\+|elderly/i.test(title)) return "60+";
  return "all";
}

function handleFrom(authorUrl) {
  const match = /youtube\.com\/@([^/?#]+)/.exec(authorUrl ?? "");
  return match ? decodeURIComponent(match[1]) : "";
}

const q = (text) => JSON.stringify(text);

async function check(url, sectionArg) {
  const id = youtubeId(url);
  if (!id) return { ok: false, line: `// ${url}: not a YouTube video link` };
  const watch = `https://www.youtube.com/watch?v=${id}`;
  let response;
  try {
    response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`, { headers: { Accept: "application/json" } });
  } catch (error) {
    return { ok: false, line: `// ${id}: request failed (${error instanceof Error ? error.message : "network error"}). Is this computer online?` };
  }
  if (response.status === 401 || response.status === 403) return { ok: false, line: `// ${id}: embedding is turned off by the owner. Link-only; do not add as PLAY VIDEO.` };
  if (response.status === 404) return { ok: false, line: `// ${id}: not found, private, or removed. Do not add.` };
  if (response.status !== 200) return { ok: false, line: `// ${id}: unexpected status ${response.status}.` };
  const body = await response.json();
  const title = String(body.title ?? "").trim();
  const channel = String(body.author_name ?? "").trim();
  const section = SECTIONS.includes(sectionArg) ? sectionArg : guessSection(title);
  const position = guessPosition(title, section);
  const minutes = minutesFromTitle(title);
  const balance = /balance|stability|steady/i.test(title);
  const line =
    `  v(${q(id)}, ${q(title)}, ${q(channel)}, ${q(handleFrom(body.author_url))}, ${q(section)}, ${q(position)}, ${minutes ?? "null"}, "beginner", ${q(guessAudience(title))},\n` +
    `    [/* topics */], "TODO: one neutral sentence from the title. No treatment claims."${balance ? ", true" : ""}),`;
  return { ok: true, line };
}

const args = process.argv.slice(2);
let section = "";
const urls = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--section") section = args[++i] ?? "";
  else urls.push(args[i]);
}
if (urls.length === 0) {
  console.error("Usage: npm run video:add -- <YouTube URL> [more URLs] [--section seated|standing|gentle]");
  process.exit(1);
}
let failed = 0;
console.log(`// Checked with YouTube oEmbed on ${new Date().toISOString().slice(0, 10)}. Update STUDIO_VERIFIED_ON if you re-check the list.`);
for (const url of urls) {
  const result = await check(url, section);
  if (!result.ok) failed += 1;
  console.log(result.line);
}
console.log(`// ${urls.length - failed} ready to paste, ${failed} not added. Level, audience, and position are guesses from the title: check them.`);
process.exit(failed > 0 && failed === urls.length ? 2 : 0);
