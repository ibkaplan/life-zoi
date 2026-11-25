# Design system: colours, type, and the desktop menu

Owner request, 2026-11-25: keep the warm light look (ivory, Royal Purple, teal, navy, serif headings, large text, big phone buttons) but make it calmer and easier to read for younger and older members alike.

## Rules

- **Two accents.** Deep plum `--heading` (#4A2380) for every h1 and h2, and teal `--teal` (#1B5E58) for small labels (kickers), links, and the short brand lines. Royal Purple `--royal` stays for primary buttons, the logo, borders, and the current menu item. Gold is decoration only, never small text (`--gold-ink` #7A4F0B if gold text is ever needed).
- **Text colours.** Body text is navy `--ink` (#172554). Secondary paragraphs use `--muted` (#2E3A66, was #3E4E80): at least 9:1 on the Ivory, Calm Blue and Soft Rose backgrounds and 7.7:1 on lavender panels.
- **Banners.** Dark banners use one gradient (plum → Royal Purple → teal) with white text. Headings and kickers inside `.hero-panel` are white.
- **Fonts.** Fraunces for English headings, Noto Serif (not Noto Serif Display) for Russian, Ukrainian, and Greek headings, Source Sans 3 for everything else. The handwritten Caveat script is no longer loaded; `.script` / `.brand-line` lines are plain teal text.
- **Capitals.** Only the small kicker labels are set in capitals, by CSS. Titles, buttons, and slogans are written in normal case in all four languages (English source text and the RU/UK/EL catalogues were changed together). The branded Health Library PDFs keep their printed capitals.
- **Size floor.** No reading text below 0.95rem (15.2px). The only smaller items are the language code badge and the photo credit on a photo.
- **Desktop menu.** All eleven sections fit on one line from 1000px up in every language, using `messages.sectionsShort` (for example "Food", "Library", "Reviews", "Profile"). The full name is the link's tooltip and is still used in the phone menu, the section row, page titles, and the footer.
- **Section row.** The row of pages under the menu (for example the ten Brain & Mind pages) also stays on one line on wide screens. `WideSubnav` in `site-nav.tsx` measures each page name; the pages that fit are shown and the rest go into a "More" list at the end (`messages.shell.morePages`). The current page is always visible. Escape or a click outside closes the list. Checked at 1000, 1024, 1280 and 1440px in EN/RU/UK/EL on nine sections. Phones keep the fold-out list.
- **Illustrations.** The companion pictures in `src/components/companion/art.tsx` no longer repeat a gold sun; only "day" has one. Breathe for Life has its own picture (`breath`) instead of sharing the music one. Live photos must follow `src/lib/imagery/registry.ts` (local file, verified licence, credit in `docs/IMAGE_CREDITS.md`).

## How it was checked

A Playwright script measured the contrast of every visible text element on 30 members' pages in each of the three backgrounds (about 20,000 elements per run), including the colour stops of gradient banners. Before: 37 failures on plain backgrounds, more on banners (for example the Brain & Habit Quiz title, dark plum on purple), and about 1,170 text elements under 15px. After: no text below WCAG AA; the only remaining flags are decorative emoji and icons. `/mind` could not be measured headlessly (the page crashed the headless browser before and after this change). Text on photos was not measured.
