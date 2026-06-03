-- Guest pipeline: track new people through R1 → R2 → R3 → Connected
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  logged_by uuid not null references profiles(id) on delete cascade,
  name text not null,
  first_visit_date date not null default current_date,
  current_r_stage text not null default 'r1'
    check (current_r_stage in ('r1', 'r2', 'r3', 'completed')),
  connect_card_done boolean not null default false,
  life_group_connected boolean not null default false,
  dna_started boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guests_logged_by_idx on guests (logged_by);
create index if not exists guests_stage_idx on guests (current_r_stage);

alter table guests enable row level security;

-- auth_zone(): mirrors auth_role() to avoid RLS recursion on profiles
create or replace function auth_zone()
returns text language sql stable security definer set search_path = public as $$
  select zone::text from profiles where id = auth.uid();
$$;

-- auto-stamp updated_at on every row update
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists guests_updated_at on guests;
create trigger guests_updated_at before update on guests
  for each row execute function touch_updated_at();

-- SELECT: own guests | zone leaders see zone | leads see all
drop policy if exists guests_select on guests;
create policy guests_select on guests for select to authenticated using (
  logged_by = auth.uid()
  or is_lead()
  or (
    auth_role() in ('gap_leader', 'area_lead', 'service_lead')
    and auth_zone() is not null
    and exists (
      select 1 from profiles p
      where p.id = logged_by and p.zone::text = auth_zone()
    )
  )
);

-- INSERT: any authenticated volunteer (must be the logger)
drop policy if exists guests_insert on guests;
create policy guests_insert on guests for insert to authenticated
  with check (logged_by = auth.uid());

-- UPDATE: logger, zone leaders, or leads
drop policy if exists guests_update on guests;
create policy guests_update on guests for update to authenticated
  using (
    logged_by = auth.uid()
    or is_lead()
    or (
      auth_role() in ('gap_leader', 'area_lead', 'service_lead')
      and auth_zone() is not null
      and exists (
        select 1 from profiles p
        where p.id = logged_by and p.zone::text = auth_zone()
      )
    )
  );

-- DELETE: leads only
drop policy if exists guests_delete on guests;
create policy guests_delete on guests for delete to authenticated
  using (is_lead());
