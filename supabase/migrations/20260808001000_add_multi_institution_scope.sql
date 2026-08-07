create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  short_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.institutions (code, name, short_name) values
  ('KEVE', 'Banco Keve, S.A.', 'Keve'),
  ('BCI', 'Banco de Comércio e Indústria, S.A.', 'BCI');

alter table public.import_batches add column institution_id uuid references public.institutions(id);
alter table public.movements add column institution_id uuid references public.institutions(id);
alter table public.positions add column institution_id uuid references public.institutions(id);
alter table public.reconciliation_groups add column institution_id uuid references public.institutions(id);

create index import_batches_institution_id_idx on public.import_batches (institution_id);
create index movements_institution_state_idx on public.movements (institution_id, state, movement_date);
create index positions_institution_date_idx on public.positions (institution_id, position_date desc);

alter table public.institutions enable row level security;
revoke all on public.institutions from anon, authenticated;
create policy deny_client_access on public.institutions as restrictive for all to anon, authenticated using (false) with check (false);
