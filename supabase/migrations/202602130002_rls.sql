alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.projects enable row level security;
alter table public.launches enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "projects_select_own"
  on public.projects
  for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "projects_insert_own"
  on public.projects
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "projects_update_own"
  on public.projects
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "projects_delete_own"
  on public.projects
  for delete
  to authenticated
  using (auth.uid() = owner_id);

create policy "launches_select_authenticated"
  on public.launches
  for select
  to authenticated
  using (true);

create policy "launches_insert_own_project"
  on public.launches
  for insert
  to authenticated
  with check (
    auth.uid() = created_by
    and exists (
      select 1
      from public.projects
      where projects.id = launches.project_id
        and projects.owner_id = auth.uid()
    )
  );

create policy "launches_update_own_project"
  on public.launches
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = launches.project_id
        and projects.owner_id = auth.uid()
    )
  )
  with check (
    auth.uid() = created_by
    and exists (
      select 1
      from public.projects
      where projects.id = launches.project_id
        and projects.owner_id = auth.uid()
    )
  );

create policy "launches_delete_own_project"
  on public.launches
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = launches.project_id
        and projects.owner_id = auth.uid()
    )
  );
