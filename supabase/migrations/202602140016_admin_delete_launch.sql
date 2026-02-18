-- Allow admins to delete any launch (for admin panel)
create policy "launches_delete_admin"
  on public.launches
  for delete
  to authenticated
  using (public.is_current_user_admin());
