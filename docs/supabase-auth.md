# Supabase Auth setup for rollinghunt

## Email confirmation: disable (auto-confirm)

Because access is invite-only, there is no need for users to confirm their email. You should **disable "Confirm email"** in Supabase so that sign-ups are immediately active and users are redirected to sign in after registering.

1. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers** → **Email**.
2. Turn **off** "Confirm email" (or set "Enable email confirmations" to **false**).
3. Save.

After this, when a user signs up with a valid invite code they are created immediately; the app then redirects them to the sign-in page with a success message so they can log in.
