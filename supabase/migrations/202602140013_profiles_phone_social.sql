-- Profile contact and social URLs
alter table public.profiles
  add column if not exists phone text,
  add column if not exists twitter_url text,
  add column if not exists linkedin_url text,
  add column if not exists github_url text;

comment on column public.profiles.phone is 'Contact phone number';
comment on column public.profiles.twitter_url is 'Twitter/X profile URL';
comment on column public.profiles.linkedin_url is 'LinkedIn profile URL';
comment on column public.profiles.github_url is 'GitHub profile URL';
