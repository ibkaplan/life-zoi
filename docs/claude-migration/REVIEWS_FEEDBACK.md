# Reviews & Feedback

Added 2026-11-22 at the owner's request. A main-menu section where members rate LifeZoi, write a review, send suggestions, and see what changed because of their feedback. Administrators moderate everything from one dashboard.

## Pages

| Path | What it is |
| --- | --- |
| `/feedback` | "Your Voice Matters!" welcome, the honest rating summary, the five-question review form, links to the other pages |
| `/feedback/members-say` | What our members say: published reviews only, average, total, five-star distribution, filter by stars |
| `/feedback/suggest` | LifeZoi listens to our members: nine suggestion topics, and the member's own suggestions with their status |
| `/feedback/listened` | You asked, we listened! Published announcements |
| `/admin/feedback` | Administrator only: Overview (analytics), Reviews, Suggestions, Announcements |

All are members-only pages (the site is invitation-only). The Dashboard shows an optional invitation (`ReviewInvitation`).

## Rules that must not be broken

- The average and distribution count published reviews whose author agreed to publication. Nothing is invented. With no reviews the page says so.
- A low rating is never a reason to flag, hide, or delete a review. Automatic checks only flag text for a person to read: the existing community word filter, links (spam), and email addresses or phone numbers (privacy).
- Nothing is public until an administrator presses "Approve and publish". A review without consent cannot be published (server check and database check constraint).
- A first name is kept only with consent and must be letters only. Anonymous reviews show "A LifeZoi member".
- The "features to add" answer and all suggestions are private. They are never on the public pages.
- Administrator notes, flags, and account ids never reach a member. The administrator sees a member code (`M-XXXXXX`, a hash of the account id), not an email.

## Storage and security

- Tables `feedback_reviews`, `feedback_suggestions`, `feedback_announcements` (migration `supabase/migrations/20261122000000_reviews_feedback.sql`, also in `schema.sql`).
- Row level security is on with no policy, and anon and authenticated have no grants. Only the server's service role reads and writes them, after `requireMember` or `requireAdmin`. `supabase/test/policies.sql` proves a signed-in member and a visitor cannot read or write them, that consent is enforced, and that deleting an account removes that person's rows (on delete cascade).
- Without `SUPABASE_SERVICE_ROLE_KEY` (local development) the server keeps feedback in memory and every page says so.
- Spam protection: hidden honeypot field (a filled form is answered normally and not saved), one review per member per 30 days, 10 suggestions per member per day, the same suggestion is refused for 30 days, and a per-form request id so a double click saves once.
- Announcement images must be a file already in `public/` (the admin picks from `/imagery/*.webp`). Outside addresses are refused in code and in the database.

## Invitation timing

Stored in the browser only (`lifezoi.feedback-invite.v1`: dates and a count). Shown after the member has used LifeZoi for 5 days and on 3 different days; never after a review (also checked on the server); "Maybe Later" hides it for 30 days; never shown after the second "Maybe Later".

## Verified

- `src/lib/feedback/feedback.test.ts`: 27 tests (rating maths, consent, publish/hide/restore, flags, duplicates, honeypot, statuses, themes, announcements, admin refusal, invitation timing).
- `scripts/test-schema.sh` and the migration applied twice over the previous schema on local Postgres 16, with `verify.sql` all ok.
- Every flow clicked through in a local browser with a sign-in bypass that was not committed (memory storage): screenshots in the project files folder `reviews-feedback/`.
- Not checked against the real Supabase project; the migration is applied only after merge.

## Not done

- Visitors who are not members cannot leave feedback, because the site is invitation-only. A public form would need a public API and the owner's decision.
- No image upload for announcements (upload is not implemented anywhere in LifeZoi).
- Desktop menu now wraps to two centered rows on common laptop widths (11 sections). The wrap was already the designed behavior.
