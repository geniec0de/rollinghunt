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
      digest(
        upper(
          trim(
            both '_' from regexp_replace(trim(p_invite_code), '[^A-Za-z0-9]+', '_', 'g')
          )
        ),
        'sha256'
      ),
      'hex'
    )
      and is_active = true
      and used_count < max_uses
      and (expires_at is null or expires_at > now())
  );
$$;

grant execute on function public.is_invite_code_valid(text) to anon, authenticated;

do $$
begin
  perform pg_notify('pgrst', 'reload schema');
exception
  when others then
    null;
end
$$;
