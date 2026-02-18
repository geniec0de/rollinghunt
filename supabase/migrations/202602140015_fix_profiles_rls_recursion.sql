-- Fix infinite recursion: policies that read from profiles to check admin role
-- cause recursion. Use a SECURITY DEFINER function so the check bypasses RLS.

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

comment on function public.is_current_user_admin() is 'Returns true if the current user has role admin. Used in RLS to avoid recursion.';

-- Drop the self-referential admin policy on profiles
drop policy if exists "profiles_select_admin" on public.profiles;

-- Admins can read any profile (using function to avoid recursion)
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_current_user_admin());

-- Update launches policy to use the same function (avoids reading profiles via RLS)
drop policy if exists "launches_select_authenticated" on public.launches;

create policy "launches_select_authenticated"
  on public.launches
  for select
  to authenticated
  using (
    status = 'passed'
    or created_by = auth.uid()
    or public.is_current_user_admin()
  );

-- Allow authenticated users to execute the helper (needed for RLS)
grant execute on function public.is_current_user_admin() to authenticated;
