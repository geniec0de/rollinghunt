-- Launches: only passed visible to all; in_review/need_editing visible to owner and admins
drop policy if exists "launches_select_authenticated" on public.launches;

create policy "launches_select_authenticated"
  on public.launches
  for select
  to authenticated
  using (
    status = 'passed'
    or created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Profile timezone for showing launch time in user's local time
alter table public.profiles
  add column if not exists timezone text;

comment on column public.profiles.timezone is 'IANA timezone (e.g. America/New_York) for displaying launch times in user local time';

-- Admins can read any profile (e.g. for member launch history page)
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
