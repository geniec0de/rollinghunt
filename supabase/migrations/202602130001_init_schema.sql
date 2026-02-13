create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.invite_codes (
  id bigint generated always as identity primary key,
  code_hash text not null unique,
  is_active boolean not null default true,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (max_uses >= 1),
  check (used_count >= 0),
  check (used_count <= max_uses)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  tagline text not null,
  product_hunt_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.launches (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  launch_date date not null,
  timezone text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_launches_launch_date on public.launches (launch_date);
create index if not exists idx_projects_owner_id on public.projects (owner_id);
create index if not exists idx_invite_codes_code_hash on public.invite_codes (code_hash);

create or replace function public.register_with_invite(
  p_user_id uuid,
  p_email text,
  p_display_name text,
  p_invite_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consumed bigint;
begin
  update public.invite_codes
  set used_count = used_count + 1
  where code_hash = encode(digest(trim(p_invite_code), 'sha256'), 'hex')
    and is_active = true
    and used_count < max_uses
    and (expires_at is null or expires_at > now())
  returning id into v_consumed;

  if v_consumed is null then
    return false;
  end if;

  insert into public.profiles (id, email, display_name)
  values (p_user_id, p_email, p_display_name)
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name;

  return true;
end;
$$;

grant execute on function public.register_with_invite(uuid, text, text, text) to anon, authenticated;
