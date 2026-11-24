# LifeZoi Health Encyclopedia and LifeZoi AI

Status on 2026-11-22: built on branch `claude/project-thread-ank8p5`, not merged, not deployed.

There are two separate entry points, and neither needs the other:

- `/encyclopedia` — the LifeZoi Health Encyclopedia. It is fully usable without AI.
- `/lifezoi-ai` — LifeZoi AI, a question-and-answer page whose answers come from encyclopedia articles.

They are linked. Every article has an optional "Ask LifeZoi AI about this article" button (`/lifezoi-ai?article=<slug>`). Every AI answer shows article cards that open in place, with "Back to the conversation". The encyclopedia's empty search offers `/lifezoi-ai?q=<search>`. Both are members-only pages under `src/app/(members)/`, like the rest of the app.

## What is built

| Part | Where |
| --- | --- |
| 12 categories, evidence labels, safety notes, disclaimer | `src/lib/encyclopedia/categories.ts` |
| 17 seeded articles | `src/lib/encyclopedia/articles/` |
| 60-year timeline (about 40 events, 1963 to 2025, plus three "In research" entries) | `src/lib/encyclopedia/timeline.ts` |
| Glossary (58 terms) | `src/lib/encyclopedia/glossary.ts` |
| Search, related articles, merging editorial versions | `src/lib/encyclopedia/catalog.ts` |
| Pages: home, article, category, timeline, Eastern & Western, My Library, glossary | `src/app/(members)/encyclopedia/`, `src/components/encyclopedia/` |
| Easy and Standard reading, four text sizes, Listen to Article (the existing `ReadAloud`, reading the article's own text) | `article-body.tsx`, `use-encyclopedia.ts` |
| My Library: saved articles use the existing companion favorites (`ency:<slug>`); recently viewed is kept in this browser per account | `pages-view.tsx` |
| Editor: create, edit, preview, save draft, send to review, publish, archive, references, image, review and dates | `/admin/encyclopedia`, `src/app/api/admin/encyclopedia/route.ts` |
| LifeZoi AI page, rules, and limits | `/lifezoi-ai`, `src/lib/encyclopedia/ai/`, `src/app/api/lifezoi-ai/route.ts` |
| Tests | `src/lib/encyclopedia/encyclopedia.test.ts`, `src/lib/encyclopedia/facts.test.ts` |
| Did You Know? health facts (45 facts in 15 categories, Fact of the Day, archive) | `src/lib/encyclopedia/facts.ts`, `src/components/encyclopedia/facts-view.tsx`, `/encyclopedia/facts` |

## Did You Know? — Amazing Health Facts

Added 2026-11-23. The encyclopedia homepage shows a Fact of the Day card with a "Discover More" button, a link to the related article when there is one, and "See All Facts". `/encyclopedia/facts` has search, a filter for the 15 categories, all facts as illustrated cards, and the Facts of the Day from the last 30 days. `/encyclopedia/facts/<id>` shows why it is interesting, how it works, what science says, history, related discoveries, sources, related articles and facts, Save to My Library (companion favorite `fact:<id>`), Share (the device's share sheet, or the link is copied), and "Ask LifeZoi AI to explain". Saved facts appear in My Library.

- Each fact is labelled Established science, Preliminary research, or Traditional practice, and links to the source it was checked against (Nobel Prize summary pages, NIH institutes, CDC, WHO, FDA, Cochrane, PubMed, HHS). Numbers appear only where the source states them. The wording was drafted with AI assistance and has not been reviewed by a health professional, and the pages say so.
- The Fact of the Day is computed, not stored: a fixed shuffle starting 2026-11-23, in the member's own time zone, so every fact is shown once before any repeats. Add new facts at the end of `FACTS` so earlier days do not change.
- Facts are in code, like the timeline, so there is no migration and the admin editor does not edit them. Fact text is English only; the menus, labels, and categories are translated.

## Real People. Real Stories.

Added 2026-11-24 (owner approved the list of stories). `/encyclopedia/stories` lists health stories with filters for condition, approach to care (Western, Eastern, integrative, lifestyle), theme, and kind of story. The homepage shows the first three. Each story page has the story, "What science says" with an evidence label on each point, "What this story does not show", sources, related articles, and a link to ask LifeZoi AI.

- **Real person** stories (Shigeaki Hinohara, B. K. S. Iyengar, Roosevelt and Brian from the CDC Tips From Former Smokers campaign, Henrietta Lacks) use only what the linked sources say. They were checked against those pages on 2026-11-24.
- **Composite** stories (stroke rehabilitation, prediabetes, back pain with acupuncture) say in the first sentence that the person is not real. Every step follows the linked NHS, CDC, or NCCIH page.
- Stories are in code (`src/lib/encyclopedia/stories.ts`), English only, with illustrations. No photographs or videos yet: add only licensed images and verified official embeddable videos (youtube-nocookie, like the movement library).

### Content rules

- Every seeded article was drafted with AI assistance from the sources it cites, and was checked against those sources (PubMed IDs, NIH, NCI, NCCIH, CDC, WHO, FDA, Cochrane, and Nobel Prize pages). Each one says "Not yet reviewed by a qualified health professional" until an editor publishes a version with a named reviewer and a review date.
- Each claim in the evidence check has one of four labels (Strong Scientific Evidence, Promising Research, Limited Evidence, Not Established) and the kind of study behind it.
- Cancer, fasting, diabetes, heart, herb, and mental-health articles show their safety notes. The mental-health note uses the United States 988 wording, which still needs review before launch, like the rest of the app.
- No article claims a cure, gives a dose, or gives a lifespan figure.
- The structure varies slightly by topic. Every article has a summary, sections, an evidence check, key takeaways, sources, dates, and a section on risks and limits or on when to see a professional. Some articles do not have separate "Why does it matter?" or "Practical information" sections.

### Images

The container could not download licensed photographs, so every article and category uses an original SVG illustration drawn for this feature (`illustrations.tsx`) with alt text. An editor can set an image URL. The editor requires alt text and a license for it. Adding real licensed photographs showing diverse people is still to do.

### Languages

Menus, buttons, labels, safety notes, the disclaimer, and the AI page's notices are translated into Ukrainian, Russian, and Greek (`src/lib/i18n/catalog/*/encyclopedia.json`). The article bodies, timeline entries, glossary, and AI answers are English only. A note says so on every article when the language is not English. The editor page is English only, like the other admin pages.

## The editorial workflow

The built-in articles are in code. The editor saves versions to the `encyclopedia_articles` table:

- `draft` and `in_review` are visible only to admins.
- `published` replaces the built-in article with the same slug, or adds a new article. The server refuses to publish without at least one reference and a review with a reviewer's name and a date that is not in the future.
- `archived` hides the article, including a built-in one.

AI never publishes. Text is stored as plain text: `<` and `>` and control characters are removed, and links must be `https`.

### Migration

`supabase/migrations/20261122160000_encyclopedia_articles.sql` creates one table, `public.encyclopedia_articles`. It is additive. It does not change or delete any existing table or data. Row level security is on and `public`, `anon`, and `authenticated` have no rights, so only the server's service role reads and writes it, after `requireMember` or `requireAdmin`. The same block is appended to `supabase/schema.sql`.

Under the project's rule, the Database migrations workflow applies it to production after the pull request is merged. Until then, or if the service-role key is missing, members still read every built-in article, and the editor says that storage is not set up.

## LifeZoi AI

### Two modes

**Cloudflare mode** (owner decision by Tetyana, 2026-11-22, Health Encyclopedia only, not LifeZoi Mind). It is on only when the server has `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_WORKERS_AI_TOKEN` (`src/lib/encyclopedia/ai/cloudflare.ts`):

- The server first finds the matching articles, exactly as in library mode. The articles are in English, so a question with non-English letters that finds nothing is first turned into English search words by one short model call (counted in the daily cap). If still nothing matches, no answer is written by the model and the honest "no dedicated article yet" answer is returned.
- It sends the free model `@cf/google/gemma-4-26b-a4b-it` the question, up to six earlier turns of the conversation (earlier answers are reduced to their topic), and up to 6,000 characters of the matching articles. No account, profile, assessment, or lab data is sent.
- The model is told to use only that text, write in the member's interface language, and not diagnose, mention medicine changes or doses, or add figures. A reply that names a dose or a percentage the articles do not contain is thrown away.
- Article cards and evidence labels still come from the articles. The answer says it was written by an AI model and can make mistakes.
- Urgent symptoms, medicine and diagnosis checks run before and around the model exactly as in library mode.
- At most 250 model calls per server instance per UTC day (about 25 Neurons each, well under the free 10,000 Neurons a day). On the Workers Free plan Cloudflare returns an error, not a charge, once the free allocation is used. Over the cap, on an error, after 12 seconds, or with an empty or refused reply, the library answer is returned. There is no paid fallback.
- The page asks `GET /api/lifezoi-ai` which mode is on, and its privacy list says that Cloudflare processes the question text only in Cloudflare mode.

Sources checked on 2026-11-22: Workers AI pricing (https://developers.cloudflare.com/workers-ai/platform/pricing/, "10,000 Neurons per day at no charge"; on Free, "further operations will fail with an error"), the 2026-07-28 changelog (some models need Workers Paid; gemma-4-26b-a4b-it is listed as still on Free), and Data usage (https://developers.cloudflare.com/workers-ai/platform/data-usage/: "Cloudflare does not use Customer Content processed by Workers AI to train AI models", and inputs and outputs are not kept after they are needed; operational metadata such as token counts is kept).

**Library mode** (the default, and the fallback). The route answers from encyclopedia articles only, with no outside model and no network call. It matches the question to articles, takes the most relevant sections, and returns a short or detailed answer with article cards and evidence labels. Follow-ups reuse the earlier question when the new one refers back ("Is it safe?"). When nothing matches, it says that no dedicated article exists yet and points to MedlinePlus, NIH, WHO, and a clinician.

`ENCYCLOPEDIA_AI_PROVIDER` may be empty (Cloudflare when both Cloudflare settings exist, otherwise library), `library` (model off), or `cloudflare`. Any other value is refused and the page shows a busy message. No call is made.

### Safety

- Urgent symptoms (the app's existing `isUrgentMessage`) get only the existing emergency notice, before any lookup.
- Questions about stopping, skipping, or changing medicine get a fixed "do not change your medicine on your own" note first.
- "Do I have …" questions get a fixed "LifeZoi AI cannot diagnose" note first.
- The disclaimer and the privacy notice are shown word for word as requested.

### Limits

Per member: 6 questions a minute and 80 a day. Per server instance: 3,000 a day. The counters are kept in memory only, with no question text. They reset when the server restarts, and each serverless instance counts separately, so they are a fair-use guard, not a strict quota. Questions are cut to 600 characters and 12 turns.

### Privacy, as built

- The conversation is kept in `sessionStorage` for the signed-in account. It disappears when the tab closes, or at once with "Delete this conversation". "New conversation" clears it too.
- The page sends the question text and up to 8 earlier turns to `POST /api/lifezoi-ai`. Earlier answers are reduced to their topic. It sends no profile, assessment, or lab data.
- The server does not store questions. The host may keep short request logs, as the page says.
- No HIPAA, GDPR, or other compliance is claimed.

### Free model options (researched 2026-11-22)

The request was for a free assistant. Library mode is free and has no third-party data flow, but it can only answer topics the encyclopedia covers.

**Google Gemini API, unpaid tier.** The Gemini API Additional Terms (archived version effective 2025-10-07, https://ai.google.dev/gemini-api/terms-archive/terms_10_07_25) say, for unpaid services:

- Google uses submitted content and responses "to provide, improve, and develop" its products, and "human reviewers may read, annotate, and process your API input and output". Google asks people not to submit sensitive or personal information.
- "You may use only Paid Services when making API Clients available to users in the European Economic Area", Switzerland, or the United Kingdom.
- "You may not use the Services in clinical practice, to provide medical advice," and the APIs require users to be 18 or older.

The rate-limits page (https://ai.google.dev/gemini-api/docs/rate-limits, updated 2026-10-28) does not publish fixed free-tier numbers. It points to the limits shown in Google AI Studio and says capacity is not guaranteed.

Because LifeZoi AI answers health questions, has Greek-language members who may be in the EU, and would send members' own words, the unpaid Gemini tier does not fit this feature. The same terms may also matter for the existing wellness page and photo reader, which use the unpaid tier today. The owner should check that.

**Self-hosted open-weight model.** An open-weight model run on a server LifeZoi controls would keep questions off third-party AI services. It is not free to run: it needs a GPU or CPU host, and the model's license must be checked. It is not built.

**Decision (2026-11-22).** Tetyana chose Cloudflare Workers AI on the free plan, described under Two modes above. Gemini stays limited to the wellness page and the photo reader.

## Configuration

| Setting | Needed for | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sign-in, as for the rest of the app | Already set |
| `SUPABASE_SERVICE_ROLE_KEY` (server only) | Reading published editorial versions and the editor | Already used by invitations |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_WORKERS_AI_TOKEN` (server only) | LifeZoi AI Cloudflare mode. Use the Workers Free plan; the token needs only Workers AI Read | Empty: library mode |
| `ENCYCLOPEDIA_AI_PROVIDER` | Optional. `library` turns the model off | Empty |

No paid services. The Cloudflare token is the only new secret, and it is optional.

## Still to do

- A qualified health professional must review the 17 seeded articles. Publishing a reviewed copy through the editor marks them as reviewed.
- Add licensed photographs with diverse people, and a way to upload images (the editor accepts a URL today).
- Write more articles, especially for categories with only one or two, and for the AI topics that have no dedicated article yet (women's health, men's health, hormonal health, the immune system).
- Translate article bodies, the timeline, and the glossary.
- Categories, the timeline, and the Did You Know? facts are edited in code, not in the editor. A medical reviewer should read the 45 facts.
- Use a shared store such as the database for rate limits if strict limits across server instances are needed.
- Check real answers in Cloudflare mode in each language once the key is set. Model answers were tested only with a stubbed Cloudflare response.
