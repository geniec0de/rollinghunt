-- Launch review status and admin comment
alter table public.launches
  add column if not exists status text not null default 'in_review'
    check (status in ('in_review', 'need_editing', 'passed')),
  add column if not exists admin_comment text;

comment on column public.launches.status is 'Review status: in_review, need_editing, passed';
comment on column public.launches.admin_comment is 'Comment from admin for the launch owner';

-- Allow admins to update any launch (status and admin_comment)
create policy "launches_update_admin"
  on public.launches
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
