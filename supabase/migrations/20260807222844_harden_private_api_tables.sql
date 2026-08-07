create index authentication_sessions_user_id_idx on public.authentication_sessions (user_id);
create index import_batches_imported_by_idx on public.import_batches (imported_by);
create index movements_source_batch_id_idx on public.movements (source_batch_id);
create index movements_reconciled_group_id_idx on public.movements (reconciled_group_id);

create policy deny_client_access on public.platform_users as restrictive for all to anon, authenticated using (false) with check (false);
create policy deny_client_access on public.authentication_sessions as restrictive for all to anon, authenticated using (false) with check (false);
create policy deny_client_access on public.authentication_attempts as restrictive for all to anon, authenticated using (false) with check (false);
create policy deny_client_access on public.import_batches as restrictive for all to anon, authenticated using (false) with check (false);
create policy deny_client_access on public.movements as restrictive for all to anon, authenticated using (false) with check (false);
create policy deny_client_access on public.positions as restrictive for all to anon, authenticated using (false) with check (false);
create policy deny_client_access on public.reconciliation_groups as restrictive for all to anon, authenticated using (false) with check (false);
