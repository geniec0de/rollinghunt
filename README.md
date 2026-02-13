# rollinghunt

**Private launch calendar for Rolling Dice Club** — schedule Product Hunt launch days, see who’s shipping next, and rally support as a community.

---

## Overview

The club coordinates launches via WhatsApp today. Rollinghunt is a members-only web app where founders **book a launch date** in advance, the **community sees the queue** (list + calendar), and everyone knows who to upvote on the big day. Invite-only sign-up, configurable daily cap, and optional “ask from founder” + short explanation for announcements.

---

## Features

| Area | What’s in place |
|------|-----------------|
| **Auth** | Invite-only sign-up (code), sign-in, sign-out. Profiles with email + display name; display name editable on Profile and shown as owner on launches. |
| **Book launch** | Form: project name, tagline, Product Hunt URL, **ask from founder**, **short explanation**, launch date, timezone. Launches allowed only **≥ 3 days ahead**; **daily cap** (e.g. 2/day) via `LAUNCHES_PER_DAY`. |
| **Dashboard** | Upcoming launches in **list** or **calendar** view; owner, date, timezone, ask, short explanation, link to PH. |
| **My launches** | List of the current user’s launches; **Edit** per launch (project + date/timezone) with same validation. |
| **Profile** | View email + display name; **update display name** (used as owner on dashboard). |
| **Routing** | Protected app routes (dashboard, projects); redirect to sign-in if unauthenticated; redirect to dashboard if signed in and hitting sign-in/sign-up. |

---

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4
- **Backend / DB:** Supabase (Auth, Postgres, RLS)
- **Validation:** Zod 4
- **Tooling:** TypeScript 5.9, ESLint 9

---

## Prerequisites

- **Node.js** 20+
- **pnpm** (recommended) or npm
- **Supabase project** (hosted or local) with migrations applied

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/geniec0de/rollinghunt.git
cd rollinghunt
pnpm install
```

### 2. Environment variables

Copy the example env and set your Supabase values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `LAUNCHES_PER_DAY` | No | Max launches per day (default: `2`) |

### 3. Supabase setup

- Create a project at [supabase.com](https://supabase.com) (or run Supabase locally).
- In the SQL editor, run the migrations in `supabase/migrations/` **in order** (oldest to newest).
- Configure Auth (email provider, site URL, redirect URLs) and, for invite-only sign-up, ensure `invite_codes` is populated and `register_with_invite` / `is_invite_code_valid` are in place (see migrations).

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use **sign-up** with a valid invite code, then **sign-in**.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## Project structure (high level)

```
app/
  (app)/          # Protected app: dashboard, my-launches, profile, projects
  (auth)/         # sign-in, sign-up
  actions/        # Server actions (auth, projects, launches)
components/
  auth/           # Sign-in, sign-up forms
  calendar/       # Month calendar, day panel
  dashboard/      # Today list (list + calendar toggle)
  profile/        # Display name form
  projects/       # Launch form, edit form
  ui/             # Button, Card, DatePicker, logo icon, etc.
lib/              # Supabase client, launch rules (min days, cap, timezone)
supabase/
  migrations/     # Schema, RLS, invite + profile logic
proxy.ts          # Auth proxy (replaces middleware in Next 16)
```

---

## Deploy (Netlify)

- **Build command:** `pnpm run build`
- **Publish:** use `@netlify/plugin-nextjs`; `publish` in `netlify.toml` is set to `.next`.
- Set the same env vars in Netlify (do **not** mark `NEXT_PUBLIC_*` as secret or the build will fail secrets scanning).

---

## License

Private — Rolling Dice Club.
