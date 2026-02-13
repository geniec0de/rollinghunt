insert into public.invite_codes (
  code_hash,
  is_active,
  max_uses,
  used_count,
  expires_at,
  created_at
)
values (
  encode(digest('VAN_GOAT_SHIP_MOAT', 'sha256'), 'hex'),
  true,
  1,
  0,
  null,
  now()
);