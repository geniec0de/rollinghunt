1) Scope
- In scope:
  - Invite-only authentication for Rolling Dice Club members using Supabase Auth.
  - Member role can create and manage their own project entries.
  - Member role can request a Product Hunt launch date via calendar-driven date selection.
  - Admin role can review pending launch requests, approve requests, and resolve date conflicts.
  - Daily view showing approved launches for a selected day ("What are we supporting today?").
  - Enforcement of per-day launch capacity (1-2 launches/day) with timezone-safe date handling.
  - Reuse Rolling Dice Club visual language (minimal, premium, Oxanium headlines, hard-shadow CTA style).
- Out of scope:
  - Public marketing pages or open signup.
  - Payments, subscriptions, or monetization workflows.
  - Advanced role hierarchy beyond member and admin.
  - Notifications (email/WhatsApp/Slack), analytics dashboards, or automations.
  - Deployment/CI/CD setup (local development only for v0).

2) Architecture (minimal)
- Pages/routes
  - `app/(auth)/sign-in/page.tsx`: email magic-link or OTP sign-in.
  - `app/(app)/layout.tsx`: authenticated shell + nav.
  - `app/(app)/projects/page.tsx`: member project list.
  - `app/(app)/projects/new/page.tsx`: create project form.
  - `app/(app)/schedule/page.tsx`: member launch request calendar/form.
  - `app/(app)/today/page.tsx`: approved launches for current day.
  - `app/(app)/admin/requests/page.tsx`: admin queue to approve/reject requests.
- Key components
  - `components/auth/auth-guard.tsx`: route/session gate for private app sections.
  - `components/projects/project-form.tsx`: create/edit project form.
  - `components/schedule/request-launch-form.tsx`: date request + notes input.
  - `components/schedule/day-launch-list.tsx`: approved launches list by day.
  - `components/admin/request-review-table.tsx`: pending requests + approve/reject actions.
  - `components/ui/calendar.tsx`: minimal date picker wrapper.
- Data model (tables + relationships)
  - `profiles`: `id` (uuid, FK to `auth.users.id`), `email`, `display_name`, `role` (`member|admin`), timestamps.
  - `projects`: `id`, `owner_id` (FK `profiles.id`), `name`, `tagline`, `product_hunt_url` (nullable until launch), timestamps.
  - `launch_requests`: `id`, `project_id` (FK `projects.id`), `requested_by` (FK `profiles.id`), `launch_date` (date), `status` (`pending|approved|rejected`), `reviewed_by` (FK `profiles.id`, nullable), `review_note` (nullable), timestamps.
  - Relationships: one profile -> many projects; one project -> many launch requests; one admin profile -> many reviewed requests.
- Supabase auth approach (minimal)
  - Use Supabase email auth (magic link/OTP) with allowlist enforced in app + DB policy checks.
  - On first successful login, create/update `profiles` row; deny app access unless profile exists and is approved.
  - Role checks come from `profiles.role`; server actions/route handlers enforce admin-only review actions.

3) Implementation checklist
- 1. Bootstrap Next.js app in repo root with TypeScript + Tailwind and base config:
  - create/modify: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- 2. Add Supabase local config and environment scaffolding:
  - create/modify: `supabase/config.toml`, `.env.example`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/auth/session.ts`
- 3. Implement schema migrations (profiles, projects, launch_requests, constraints, indexes):
  - create: `supabase/migrations/202602130001_init_schema.sql`
- 4. Implement RLS and role-based policies for member/admin access patterns:
  - create: `supabase/migrations/202602130002_rls_policies.sql`
- 5. Implement auth flow and private app shell:
  - create/modify: `app/(auth)/sign-in/page.tsx`, `app/(app)/layout.tsx`, `middleware.ts`, `components/auth/auth-guard.tsx`
- 6. Implement member project CRUD (create + list for v0):
  - create/modify: `app/(app)/projects/page.tsx`, `app/(app)/projects/new/page.tsx`, `components/projects/project-form.tsx`, `app/actions/projects.ts`
- 7. Implement launch request flow with timezone-safe date handling:
  - create/modify: `app/(app)/schedule/page.tsx`, `components/schedule/request-launch-form.tsx`, `app/actions/launch-requests.ts`
- 8. Implement admin review/approval flow and conflict handling:
  - create/modify: `app/(app)/admin/requests/page.tsx`, `components/admin/request-review-table.tsx`, `app/actions/admin-review.ts`
- 9. Implement daily support page for approved launches:
  - create/modify: `app/(app)/today/page.tsx`, `components/schedule/day-launch-list.tsx`
- 10. Apply Rolling Dice Club visual tokens minimally across typography/buttons:
  - modify: `tailwind.config.ts`, `app/globals.css`, `components/ui/button.tsx` (or equivalent)
- 11. Add basic validation and smoke tests for core flows (optional minimal):
  - create/modify: `lib/validation/projects.ts`, `lib/validation/launch-requests.ts`

4) DB migrations
- `supabase/migrations/202602130001_init_schema.sql`
  - Create `profiles`, `projects`, `launch_requests`.
  - Add FK relationships, status/role checks, and indexes on `launch_date`, `status`, `owner_id`.
  - Add constraint strategy for approved-launch capacity checks at approval time (enforced via transaction/query path).
- `supabase/migrations/202602130002_rls_policies.sql`
  - Enable RLS on all app tables.
  - Policies plan (high level):
    - `profiles`: users can read/update own profile; admins can read all.
    - `projects`: members can CRUD own projects; admins can read all.
    - `launch_requests`: members can create/read own project requests; admins can read/update all for moderation.
  - Restrict direct client-side approval updates to admin role only.

5) Commands
- `pnpm dlx create-next-app@latest . --ts --tailwind --eslint --app --use-pnpm --yes`
- `pnpm add @supabase/supabase-js @supabase/ssr zod date-fns`
- `pnpm add -D supabase`
- `pnpm supabase init`
- `pnpm supabase start`
- `pnpm supabase db push`
- `pnpm dev`

6) Risks / Questions
- Should daily launch capacity be fixed at 1, fixed at 2, or configurable by admin?
- Which timezone is canonical for launch-day validation (UTC vs a club-specific timezone)?
- How is invite-only membership sourced: Supabase Auth invite links only, or explicit email/domain allowlist table?
- Can members edit/cancel pending requests after submission, or only admins can resolve changes?
- Is moderator role intentionally excluded from v0 (brief mentions admin/mod in flow, constraints specify member+admin only)?
