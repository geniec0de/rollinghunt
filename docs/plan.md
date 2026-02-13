1) Scope
- In scope:
- Invite-only access using a valid invite code at signup.
- Member authentication (Supabase Auth) and private app access.
- Create a project and request/book one Product Hunt launch date.
- Enforce max launches per day (1-2) with timezone-safe date handling.
- View upcoming scheduled launches in a shared dashboard.
- Apply Rolling Dice Club visual language (minimal/premium, existing tokens/fonts).
- Out of scope:
- Admin moderation/approval UI and admin workflows in v1.
- Public marketing pages and open registration.
- Notifications, analytics, integrations, or deployment/CI.
- Advanced role/permission system beyond baseline member/admin fields.

2) Architecture (minimal)
- Pages/routes
- `app/(auth)/sign-up/page.tsx` (email + password/OTP + invite code)
- `app/(auth)/sign-in/page.tsx`
- `app/(app)/layout.tsx` (authenticated shell)
- `app/(app)/dashboard/page.tsx` (upcoming launches list)
- `app/(app)/projects/new/page.tsx` (create project + pick launch date)
- Key components
- `components/auth/sign-up-form.tsx`
- `components/projects/project-launch-form.tsx`
- `components/launches/upcoming-launches.tsx`
- `components/ui/date-picker.tsx`
- Data model (tables + relationships)
- `profiles`: `id` (FK `auth.users.id`), `email`, `display_name`, `role` (`member|admin`), `created_at`.
- `invite_codes`: `id`, `code_hash`, `is_active`, `max_uses`, `used_count`, `expires_at`, `created_at`.
- `projects`: `id`, `owner_id` (FK `profiles.id`), `name`, `tagline`, `product_hunt_url`, `created_at`.
- `launches`: `id`, `project_id` (FK `projects.id`), `launch_date` (`date`), `timezone` (`text`), `created_by` (FK `profiles.id`), `created_at`; unique on `project_id`.
- Relationships: one profile -> many projects; one project -> one launch (v1); one profile -> many launches.
- Supabase auth approach (minimal)
- Supabase Auth email sign-up/sign-in.
- Server action validates invite code, creates profile, and consumes one invite use atomically.
- Middleware blocks unauthenticated users from `(app)` routes.
- RLS enforces member ownership access; no admin UI endpoints in v1.

3) Implementation checklist
1. Bootstrap Next.js App Router + Tailwind + TypeScript baseline.
- Create/modify: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
2. Add Supabase client/server wiring and env scaffolding.
- Create/modify: `.env.example`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts`
3. Add auth pages and invite-code sign-up flow.
- Create/modify: `app/(auth)/sign-up/page.tsx`, `app/(auth)/sign-in/page.tsx`, `components/auth/sign-up-form.tsx`, `app/actions/auth.ts`
4. Add authenticated app shell and dashboard route.
- Create/modify: `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `components/launches/upcoming-launches.tsx`
5. Add project + launch booking form with timezone-safe input.
- Create/modify: `app/(app)/projects/new/page.tsx`, `components/projects/project-launch-form.tsx`, `components/ui/date-picker.tsx`, `app/actions/projects.ts`
6. Add server-side booking guard for daily launch cap (1-2) and conflict checks.
- Create/modify: `lib/launch-rules.ts`, `app/actions/launches.ts`
7. Apply Rolling Dice Club branding tokens minimally (Oxanium headings, hard-shadow CTA style, spacing/colors).
- Create/modify: `app/globals.css`, `tailwind.config.ts`
8. Add Supabase SQL migrations and RLS policies.
- Create/modify: `supabase/migrations/202602130001_init_schema.sql`, `supabase/migrations/202602130002_rls.sql`

4) DB migrations
- `supabase/migrations/202602130001_init_schema.sql`
- Create `profiles`, `invite_codes`, `projects`, `launches`.
- Add FKs, unique/index constraints (`launches.launch_date`, `projects.owner_id`, `invite_codes.code_hash`).
- Add DB-level checks for valid role values and non-negative invite usage counters.
- `supabase/migrations/202602130002_rls.sql`
- Enable RLS on all app tables.
- Policies plan (high level):
- `profiles`: user can read/update own profile.
- `projects`: user can CRUD own projects.
- `launches`: user can CRUD launches tied to own projects; all authenticated users can read upcoming launches.
- `invite_codes`: no direct client read/write; consume/validate through server action/RPC only.

5) Commands
- `pnpm dlx create-next-app@latest . --ts --tailwind --app --use-pnpm --yes`
- `pnpm add @supabase/supabase-js @supabase/ssr zod date-fns`
- `pnpm add -D supabase`
- `pnpm supabase init`
- `pnpm supabase start`
- `pnpm supabase db push`
- `pnpm dev`

6) Risks / Questions
- Is invite code usage single-use per member, or can one code be reused up to `max_uses`?
- Who creates invite codes in v1 (manual SQL seed only, or simple script)?
- Which canonical timezone should define launch-day capacity checks (UTC or a club timezone)?
- Should per-day capacity be fixed (2) or configurable via env/DB in v1?
- Should a member be allowed to edit/reschedule a booked launch date after creation?

## Blockers
- `pnpm install` failed on February 13, 2026 because the environment cannot access `https://registry.npmjs.org` (`EACCES` / `ERR_PNPM_META_FETCH_FAIL`), so dependencies could not be installed and runtime validation (`pnpm dev` / `pnpm build`) could not be executed.
