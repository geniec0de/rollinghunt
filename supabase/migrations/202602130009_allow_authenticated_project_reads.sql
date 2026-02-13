do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'projects'
      and policyname = 'projects_select_authenticated'
  ) then
    create policy "projects_select_authenticated"
      on public.projects
      for select
      to authenticated
      using (true);
  end if;
end
$$;
