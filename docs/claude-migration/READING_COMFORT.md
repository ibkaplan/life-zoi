# Reading comfort: text size and calm layout

Added 2026-11-25 for older members. Two choices, in Settings ("Text size and layout") and behind the "Aa" button in the header on every page, public pages included.

- **Text size**: Normal (100%), Large (112.5%), Extra large (125%). It raises the root font size, so everything sized in rem grows together. The page width grows by the same factor (1080px → 1215px / 1350px).
- **Calm, simple layout**: hides decorative pictures, photos and page backdrops, stops animations and transitions, adds space between parts, gives cards a clearer edge with no shadow, and underlines plain links inside text. No page, link, or feature is removed. Instructional drawings (movement-break illustrations, library cards with labels) stay.

Neither choice changes a text colour, so the contrast ratios from the 2026-11-25 design pass (AA or better) are unchanged.

## One-line desktop menu (PRs #98/#99)

At Normal size the eleven-section row appears at 1000px and steps up at 1160px. With larger text both points move up by the same factor (Large: 1125px and 1305px; Extra large: 1250px and 1450px), and the page is widened by that factor too, so the row has the same room it has at Normal and never wraps. Below those widths, larger text uses the Home, Dashboard, Movement, Menu bar that phones and tablets use. The section row underneath keeps its measured "More" list.

## Where it is saved

- `localStorage` key `lifezoi-display` (`{ textSize, calm, updatedAt }`). A boot script in the root layout sets `<html data-text>` and `<html data-calm>` before paint, so there is no flash of small text.
- For a signed-in member, also `companion_state.state.display`, so it follows them to another device. Whichever copy changed last wins. No new table or migration.
- Sample mode keeps it in the browser only.

Code: `src/lib/display-prefs.ts`, `src/components/display-prefs.tsx`, the "Reading comfort" block at the end of `src/app/globals.css`. Tests: `src/lib/display-prefs.test.ts`.

## Not yet checked

Members' pages need a Supabase sign-in, which the build machine does not have, so the screenshots in the project folder `reading-comfort/` show the public pages (landing and sign-in). The members' header, dashboard, and Settings with Large and Extra large still need a look on a preview or with a test account.
