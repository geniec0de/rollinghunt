# Constraints

## Product constraints
- Premium, minimal UI.
- Calendar scheduling must be timezone-safe.
- Avoid over-engineering v0.

## Tech baseline (preferred)
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres + RLS

## Security
- Invite-only: only approved members can access.
- No secrets committed.

## Operational
- Start with simplest roles: member + admin.
- Keep deploy out of v0 scope (local dev only).
