-- Lifted Church platform — Phase: Lifted Coach (AI companion)
-- Run in the Supabase SQL Editor (depends on 0001_init.sql).
-- Stores each person's private conversation with the Lifted Coach.

create table if not exists coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists coach_messages_user_idx on coach_messages (user_id, created_at);

alter table coach_messages enable row level security;

-- Strictly private: each person can only see and add to their own conversation.
drop policy if exists coach_select on coach_messages;
create policy coach_select on coach_messages for select to authenticated
  using (user_id = auth.uid());
drop policy if exists coach_insert on coach_messages;
create policy coach_insert on coach_messages for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists coach_delete on coach_messages;
create policy coach_delete on coach_messages for delete to authenticated
  using (user_id = auth.uid());
-- Lifted Church platform — Phase: MULTIPLY (Leaders Who Create Leaders)
-- Encodes Section 5 of the lifted_ministry_playbook: the "5 Into 1" model and
-- "The Rivers" multiplication channels. Run in the Supabase SQL Editor
-- (depends on 0001_init.sql for auth_role()/is_lead()/can_report()).
--
-- 5 Into 1: every leader is intentionally shaping up to five people. The test of
-- real multiplication is not "did you teach them?" but "can they teach it without
-- you?" — so each relationship moves shaping → transferred → multiplying.
-- The Rivers: the channel through which the multiplication flows.

create table if not exists multiply_relationships (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid not null references profiles(id) on delete cascade,
  disciple_id uuid not null references profiles(id) on delete cascade,
  -- which multiplication channel this relationship flows through
  river text not null default 'see_team'
    check (river in ('small_group', 'see_team', 'gap_network')),
  -- what is being transferred (the thing they must be able to teach without you)
  focus text not null default '',
  -- shaping = actively developing; transferred = they have it but can't yet teach it;
  -- multiplying = they can teach it without the leader in the room (true multiplication)
  status text not null default 'shaping'
    check (status in ('shaping', 'transferred', 'multiplying')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (leader_id, disciple_id)
);

create index if not exists multiply_leader_idx on multiply_relationships (leader_id);
create index if not exists multiply_disciple_idx on multiply_relationships (disciple_id);

alter table multiply_relationships enable row level security;

-- A leader sees & manages their own 5-into-1 relationships; the person being
-- shaped can see that they are being developed; leads see the whole map
-- (Guide the Ship oversight).
drop policy if exists multiply_select on multiply_relationships;
create policy multiply_select on multiply_relationships for select to authenticated
  using (leader_id = auth.uid() or disciple_id = auth.uid() or is_lead());

drop policy if exists multiply_insert on multiply_relationships;
create policy multiply_insert on multiply_relationships for insert to authenticated
  with check (leader_id = auth.uid() or is_lead());

drop policy if exists multiply_update on multiply_relationships;
create policy multiply_update on multiply_relationships for update to authenticated
  using (leader_id = auth.uid() or is_lead())
  with check (leader_id = auth.uid() or is_lead());

drop policy if exists multiply_delete on multiply_relationships;
create policy multiply_delete on multiply_relationships for delete to authenticated
  using (leader_id = auth.uid() or is_lead());
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
-- Auto-create a minimal profile row whenever a new auth user signs up.
-- This ensures the app never gets into a state where a user is authenticated
-- but has no profile, which would cause a silent loading failure.
-- The Admin can then edit the volunteer's name/zone/role via Admin → Roster.

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role, current_stars, language_pref)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'volunteer',
    0,
    'en'
  )
  on conflict (id) do nothing;  -- invite flow already created it; don't overwrite
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
