# Health tips (public blog)

Added 2026-11-25. Public pages that anyone can read without an account.

| | |
| --- | --- |
| Index | `/blog` (`src/app/(public)/blog/page.tsx`) |
| Article | `/blog/<slug>` (static, `generateStaticParams`) |
| Content | `src/lib/blog/articles.ts` |
| Video links | `src/lib/blog/video-link.ts` |
| Views | `src/components/blog/blog-views.tsx` |
| Search files | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/blog/seo.ts` |
| Translations | `src/lib/i18n/catalog/{uk,ru,el}/blog.json`, checked by `catalog.test.ts` |

## Access

`src/lib/auth/public-paths.ts` opens `/blog` and everything under it (`PUBLIC_PAGE_PREFIXES`) plus `/sitemap.xml` and `/robots.txt` (`PUBLIC_FILES`). Nothing else changes: `/blogs`, `/blog-admin`, and every API stay members-only (tested in `public-paths.test.ts`). The pages read no account data and call no API.

## Where it is linked

- Visitors: a "Health tips" link in the public header (hidden under 480 px wide), a card on the landing page, and the public footer.
- Members: the Wellness Library section row (inside its More list when the row is full) and the members' footer. The main menu is unchanged and stays on one line.

## Content rules

- General wellness education only. No diagnosis, treatment, medication advice, risk figures, percentages, or lifespan claims (`articles.test.ts` rejects common forms).
- A number appears only when the cited public source states it (WHO 150 minutes, NHLBI 7 to 9 hours, CDC SPF 15).
- Every article cites sources from `src/lib/sources.ts` and ends with three small things to try.
- Each article has a safety line telling the reader when to talk with a clinician.
- English is the source text. Add the Ukrainian, Russian, and Greek text to `blog.json` in the same change, or the catalog test fails.

## Videos

Videos are added by link only (YouTube or Vimeo; `parseVideoLink` refuses anything else). Nothing is hosted by lifeZoi and nothing loads from the video site until the reader presses Play. YouTube uses the no-cookie player, Vimeo uses `dnt=1`. The current four films are National Institute on Aging films already verified for the Movement Studio (`lessonById`). To add one, add `{ link, title, publisher, note }` to `BLOG_VIDEOS` or an article's `video`, and translate the `note`.

## Sharing and search

- Share buttons are plain links (WhatsApp, Telegram, Facebook, X, email, copy link, and the phone's own share sheet). No share script or tracking pixel is loaded.
- Each page has a title, description, canonical address, Open Graph and Twitter card tags, and the article page has schema.org `Article` data.
- **Indexing is still off.** The root layout `robots: noindex` and the `X-Robots-Tag: noindex, nofollow` header apply to these pages too, as CLAUDE.md requires until the privacy notice matches the real system. Search engines will not list the blog until the owner approves turning indexing on for `/blog` only (change the header source in `next.config.ts` and override `robots` in the blog pages).
- The page's first HTML is English. Ukrainian, Russian, and Greek are switched in the browser like the rest of the site, so search engines see English only.
