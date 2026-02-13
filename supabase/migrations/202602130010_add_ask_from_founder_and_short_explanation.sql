-- Add announcement fields to projects for moderator copy (link + ask + short explanation)
alter table public.projects
  add column if not exists ask_from_founder text,
  add column if not exists short_explanation text;

comment on column public.projects.ask_from_founder is 'One-line ask from the founder (e.g. what they want from the community)';
comment on column public.projects.short_explanation is 'Short explanation for the launch announcement';
