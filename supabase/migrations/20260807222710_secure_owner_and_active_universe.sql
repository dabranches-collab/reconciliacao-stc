create extension if not exists pgcrypto;

create table public.platform_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username = lower(username) and username ~ '^[a-z0-9._-]{3,40}$'),
  display_name text not null,
  role text not null check (role in ('owner', 'supervisor', 'operator')),
  pin_salt text,
  pin_hash text,
  pin_iterations integer not null default 310000 check (pin_iterations >= 210000),
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.authentication_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.authentication_attempts (
  id bigint generated always as identity primary key,
  username text not null,
  succeeded boolean not null,
  source_fingerprint text,
  attempted_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_sha256 text not null unique,
  mode text not null check (mode in ('analysis_only', 'integrated')),
  status text not null check (status in ('validated', 'integrated', 'rejected')),
  period_start date,
  period_end date,
  movement_count integer not null check (movement_count >= 0),
  imported_by uuid references public.platform_users(id),
  imported_at timestamptz not null default now()
);

create table public.movements (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  source_batch_id uuid references public.import_batches(id),
  source_row integer,
  movement_date date not null,
  dc text,
  amount_minor bigint not null,
  operation text not null default '',
  description text not null default '',
  observation text not null default '',
  document_number text not null default '',
  ordering_party text not null default '',
  beneficiary text not null default '',
  iban text not null default '',
  bic text not null default '',
  state text not null default 'open' check (state in ('open', 'reconciled')),
  reconciled_group_id uuid,
  created_at timestamptz not null default now()
);

create index movements_active_lookup_idx on public.movements (movement_date, operation, amount_minor) where state = 'open';
create index movements_active_amount_idx on public.movements (amount_minor) where state = 'open';

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  position_date date not null unique,
  previous_pending_count integer not null,
  new_movement_count integer not null,
  reconciled_count integer not null,
  closing_pending_count integer not null,
  accounting_balance_minor bigint not null,
  closing_pending_balance_minor bigint not null,
  difference_minor bigint generated always as (closing_pending_balance_minor - accounting_balance_minor) stored,
  status text not null check (status in ('validated', 'open')),
  created_at timestamptz not null default now(),
  check (previous_pending_count + new_movement_count = reconciled_count + closing_pending_count)
);

create table public.reconciliation_groups (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.positions(id),
  sequence_number integer not null,
  movement_count integer not null check (movement_count > 0),
  balance_minor bigint not null check (balance_minor = 0),
  evidence_level text not null check (evidence_level in ('confirmed_result', 'confirmed_rule')),
  created_at timestamptz not null default now(),
  unique (position_id, sequence_number)
);

alter table public.movements
  add constraint movements_reconciled_group_fk foreign key (reconciled_group_id) references public.reconciliation_groups(id);

alter table public.platform_users enable row level security;
alter table public.authentication_sessions enable row level security;
alter table public.authentication_attempts enable row level security;
alter table public.import_batches enable row level security;
alter table public.movements enable row level security;
alter table public.positions enable row level security;
alter table public.reconciliation_groups enable row level security;

revoke all on public.platform_users, public.authentication_sessions, public.authentication_attempts,
  public.import_batches, public.movements, public.positions, public.reconciliation_groups from anon, authenticated;

insert into public.platform_users (username, display_name, role)
values ('dabranches', 'Diogo Abranches', 'owner');
