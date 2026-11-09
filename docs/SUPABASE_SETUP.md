# Supabase setup for lifeZoi accounts

These are the steps a person with access to the Supabase dashboard and the Vercel project does by hand. Claude sessions do not have those credentials and must not run SQL against the live project. Nothing here needs a service-role key.

Time needed: about 20 minutes. Use a test email address and made-up answers for every check. Do not use real health information.

## 1. See what the live database has today

1. Open the Supabase project, then **SQL Editor**, then **New query**.
2. Paste the whole of [`supabase/verify.sql`](../supabase/verify.sql) and press **Run**.

The check only reads the database catalog. It does not read or change anyone's rows. Each line says `ok = true` or `false`. Before step 2, expect the five account tables to be `true` and the Share the Care and Community lines to be `false`.

## 2. Apply the schema

1. In **SQL Editor**, open a new query.
2. Paste the whole of [`supabase/schema.sql`](../supabase/schema.sql) and press **Run**.

The file is safe to run more than once. It uses `if not exists`, replaces functions in place, and drops and re-creates its own policies and triggers. It does not delete rows. It was tested by running it twice in a row on a local Postgres with a stand-in for Supabase's `auth` schema (`scripts/test-schema.sh`).

Running the whole file also creates:

- `care_invitations`, so Share the Care can create invitation links and show counts. A row holds a random token and three counts. It does not hold a name, an email address, or health information.
- The five Community tables. The browser cannot read them. Community keeps using in-process storage until `SUPABASE_SERVICE_ROLE_KEY` is set on the server, which is a separate decision. Applying the tables alone does not turn that on.

If you do not want Share the Care or Community tables yet, stop and say so before running the file. The account tables and the password changes in this guide do not depend on them.

## 3. Check again

Run `supabase/verify.sql` again. Every line should now say `ok = true`. If a line is `false`, copy the result (it has no personal data) and share it in the project.

## 4. Authentication settings

In **Authentication**:

1. **Sign In / Providers → Email**: keep **Email** on and **Confirm email** on. The app expects confirmation and tells people to check their email.
2. **URL Configuration**:
   - **Site URL**: `https://life-zoi.vercel.app`
   - **Redirect URLs**: add `https://life-zoi.vercel.app/reset-password` and `http://localhost:3000/reset-password`. If you want reset links to work on Vercel preview deployments too, add a pattern for the preview addresses that ends in `/reset-password`.

   The app asks Supabase to send people back to `/reset-password` on the same site. If that address is not in the list, Supabase sends them to the Site URL instead and the reset does not finish.
3. **Multi-Factor**: keep **TOTP** (authenticator app) on. Settings uses it.
4. **Emails → SMTP Settings**: Supabase's built-in sender is for testing. It sends only a few emails an hour, and only to addresses on your Supabase team. Real people will not get confirmation or reset emails until you set a custom SMTP sender. Choosing a provider is your call. Several have free tiers, but check the current terms before you sign up. Keep the sender address on a domain you control.
5. **Emails → Templates**: the default **Reset Password** and **Confirm signup** templates work as they are. If you edit them, keep `{{ .ConfirmationURL }}` as the link.

## 5. Vercel environment

In the Vercel project, under **Settings → Environment Variables**, make sure these two exist for **Production** (and **Preview** if you want accounts on previews):

| Name | Value comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase **Project Settings → API → Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **Project Settings → API → anon public key** |

Do not add the service-role key under a `NEXT_PUBLIC_` name. Next.js copies `NEXT_PUBLIC_` values into the page at build time, so a change only takes effect after the next deployment. Deploying is your decision.

Afterwards, `https://life-zoi.vercel.app/api/status` should report `"authentication":"supabase"` and `"persistence":"account"`.

## 6. Try it with a test account

Use a test email address you can read, with made-up answers.

1. **Settings → Create account**. Confirm the email, then sign in.
2. Take the assessment. Sign out, sign in again, and check that the answers are still there.
3. **Settings → Forgot password?** (while signed out). Open the emailed link **in the same browser**. Choose a new password on the **Set a new password** page, then sign in with it.
4. Signed in, use **Change password** in Settings.
5. Optional: **Set up authenticator app**, sign out, and sign in again with the 6-digit code. Then try **Forgot password?** again. The reset page asks for the code before it accepts a new password.
6. Open a used or old reset link. The page should say the link expired and offer a new one.
7. **Delete account**. The login and its rows are removed.
8. With a second test account in another browser, check that neither account can see the other's answers.

## Notes

- The reset link uses Supabase's PKCE flow. It works only in the browser that asked for it, because that browser holds the matching one-time code. The page explains this if the link is opened somewhere else.
- The reset and resend forms answer the same way whether or not an account exists, so they cannot be used to find out who has signed up.
- lifeZoi never receives or stores passwords. The browser sends them straight to Supabase Auth.
