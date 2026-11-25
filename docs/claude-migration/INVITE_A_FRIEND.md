# Invite a Friend

Page: `/friends` (members only). Linked from My Profile (section menu and a card on the Profile page), the Get started page (`/start`), and Share the Care.

## What it does

1. **Personal invite link.** It reuses the existing Share the Care link (`care_invitations`, up to 3 registrations a link). The page shows the active link with a Copy button, or sends the member to Share the Care to create one. Invitation-only registration is unchanged.
2. **7-day Together challenge.** Seven everyday steps (walk, water with meals, slow breathing, a vegetable, gentle stretch, a calm half hour, share what helped). Step N opens on day N after the person starts, and a missed step stays open. No streaks, no numbers about health. Steps live in `src/lib/friends/challenge.ts`.
3. **Friend badges.** Care Sharer (a friend joined through your link) and Warm Welcome (you joined through a friend's link) appear for both people when the friend's login is created. Also Circle of Three, First Step Together, Seven Days Together, and Stronger Together (14 ticked steps between you and friends who share). Badges are computed from saved data; nothing extra is stored.

## Storage and privacy

- Migration `supabase/migrations/20261125120000_friend_challenge.sql` adds `friend_challenge` (one row per person: start date, ticked steps 1 to 7, share choice) with owner-only row level security, deleted with the account (cascade).
- `friend_circle_summary()` (security definer, signed-in only) returns counts: friends who joined through your links, whether you joined through a friend's link, how many linked friends share, and the shared total of ticked steps. It never returns a name, email, account id, or one friend's own steps. A friend's steps count only if that friend ticked "Add my ticked days to the shared total".
- Friends are linked only through `registration_invites` rows with `source = 'share_care'`.
- Until the migration is applied, the challenge is saved in the browser and the page says so; badges that need the summary stay "Not yet".
- No AI service, email service, or paid service is used.
