alter table public.launches
alter column timezone set default 'Africa/Casablanca';

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_insert_own'
  ) then
    create policy "profiles_insert_own"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end
$$;

insert into public.profiles (id, email, display_name)
select
  u.id,
  coalesce(nullif(trim(u.email), ''), u.id::text || '@local.invalid'),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Member'
  )
from auth.users as u
where not exists (
  select 1
  from public.profiles as p
  where p.id = u.id
)
on conflict (id) do nothing;
