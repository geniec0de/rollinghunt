create extension if not exists pgcrypto with schema extensions;

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
  v_normalized_code text;
begin
  v_normalized_code := upper(
    trim(
      both '_' from regexp_replace(trim(p_invite_code), '[^A-Za-z0-9]+', '_', 'g')
    )
  );

  update public.invite_codes
  set used_count = used_count + 1
  where code_hash = encode(extensions.digest(v_normalized_code, 'sha256'::text), 'hex')
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

create or replace function public.is_invite_code_valid(p_invite_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invite_codes
    where code_hash = encode(
      extensions.digest(
        upper(
          trim(
            both '_' from regexp_replace(trim(p_invite_code), '[^A-Za-z0-9]+', '_', 'g')
          )
        ),
        'sha256'::text
      ),
      'hex'
    )
      and is_active = true
      and used_count < max_uses
      and (expires_at is null or expires_at > now())
  );
$$;

grant execute on function public.register_with_invite(uuid, text, text, text) to anon, authenticated;
grant execute on function public.is_invite_code_valid(text) to anon, authenticated;

do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then
    null;
end
$$;
