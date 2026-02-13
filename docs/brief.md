# rollinghunt brief

## What we are building
A private, members-only web app for Rolling Dice Club where community members can schedule Product Hunt launch days for their projects.

Today the group coordinates launches via a WhatsApp group (posting 1–2 projects/day to upvote). rollinghunt will replace the WhatsApp scheduling chaos with a clean calendar and a modern dashboard so everyone knows who is launching when and where to focus community attention.

## Non-negotiables
- Match Rolling Dice Club branding: clean, modern, premium, minimal.
- Reuse the same theme language and UI feel (fonts, shadows, spacing, buttons).
- Private access: only community members via an INVITE CODE (no admin approval flow in v1).

## Core user flows (V1)
- User signs up by entering a valid INVITE CODE and creating an account.
- User creates a Project entry and requests a launch date from a calendar.
- System enforces rules: max launches per day (1–2) and timezone-safe dates.
- All users can see the upcoming approved launches in a clean, modern dashboard (no private approvals required in V1).
- Admin-only actions are out of scope for V1.

## References
- Website copy: `references/markdown/rollingdiceclub-site-copy.md`
- Style tokens + head: `references/raw/rollingdiceclub-extracted/*`
- Landing screenshot: `references/screenshots/rollingdiceclub/*`
