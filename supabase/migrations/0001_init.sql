-- Lifted Church platform — Phase 1 schema (Volunteer Portal / Serve Honor System)
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Static config (ladder levels, trainings, zones) lives in app code (src/lib/ministry.ts);
-- this schema holds the dynamic, per-person data — all protected by Row-Level Security.

-- ---------- Enums ----------
do $$ begin
  create type role_type as enum ('volunteer','gap_leader','area_lead','service_lead','ministry_lead','pastor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type zone_type as enum ('parking','breezeway','patio','doors');
exception when duplicate_object then null; end $$;

do $$ begin
  create type training_type as enum ('inauguration','leader_foundations','zone_leadership','service_operations');
exception when duplicate_object then null; end $$;

do $$ begin
  create type award_status as enum ('pending','approved','auto_approved','denied');
exception when duplicate_object then null; end $$;

do $$ begin
  create type escalation_response as enum ('keep','move','remove');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role role_type not null default 'volunteer',
  zone zone_type,
  current_stars int not null default 0,
  language_pref text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists training_completions (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references profiles(id) on delete cascade,
  training training_type not null,
  date timestamptz not null default now(),
  facilitator text not null default '',
  notes text,
  unique (volunteer_id, training)
);

create table if not exists star_awards (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references profiles(id) on delete cascade,
  stars int not null,
  status award_status not null default 'pending',
  requested_date timestamptz not null default now(),
  decided_date timestamptz,
  approver text,
  conversation_held boolean
);

create table if not exists recognitions (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references profiles(id) on delete cascade,
  month text not null,
  behavior text not null,
  value text not null default '',
  confirmed boolean not null default false,
  nominated_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  zone zone_type not null,
  week_of timestamptz not null default now(),
  attendance_count int not null default 0,
  star_distribution text not null default '',
  consistency_flag text not null default '',
  observation text not null default '',
  ask text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists weak_link_flags (
  id uuid primary key default gen_random_uuid(),
  zone zone_type not null,
  week_of timestamptz not null default now(),
  description text not null,
  resolved boolean not null default false,
  flagged_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references profiles(id) on delete cascade,
  response escalation_response not null,
  situation text not null,
  follow_up text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Role helper (SECURITY DEFINER avoids RLS recursion on profiles) ----------
create or replace function auth_role()
returns role_type
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_lead()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_role() in ('ministry_lead','pastor'), false);
$$;

-- Roles allowed to file reports / nominations / see ministry-wide operational data.
create or replace function can_report()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_role() in ('gap_leader','area_lead','service_lead','ministry_lead','pastor'), false);
$$;

-- ---------- Auto-create a profile when a user signs up ----------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, language_pref)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), 'en')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Enable RLS ----------
alter table profiles            enable row level security;
alter table training_completions enable row level security;
alter table star_awards         enable row level security;
alter table recognitions        enable row level security;
alter table weekly_reports      enable row level security;
alter table weak_link_flags     enable row level security;
alter table escalations         enable row level security;

-- ---------- Policies ----------
-- profiles: see your own row or (if a lead) all rows. Update your own prefs; leads update anyone.
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or is_lead());

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles for update to authenticated
  using (id = auth.uid() or is_lead()) with check (id = auth.uid() or is_lead());

-- training_completions: own or lead can read; insert your own or (lead) for anyone.
drop policy if exists tc_select on training_completions;
create policy tc_select on training_completions for select to authenticated
  using (volunteer_id = auth.uid() or is_lead());
drop policy if exists tc_insert on training_completions;
create policy tc_insert on training_completions for insert to authenticated
  with check (volunteer_id = auth.uid() or is_lead());

-- star_awards: own or lead read; volunteer requests own (pending); only leads decide (update).
drop policy if exists sa_select on star_awards;
create policy sa_select on star_awards for select to authenticated
  using (volunteer_id = auth.uid() or is_lead());
drop policy if exists sa_insert on star_awards;
create policy sa_insert on star_awards for insert to authenticated
  with check (volunteer_id = auth.uid() and status = 'pending');
drop policy if exists sa_update on star_awards;
create policy sa_update on star_awards for update to authenticated
  using (is_lead()) with check (is_lead());

-- recognitions: own (read) or lead; reporters nominate; leads confirm (update).
drop policy if exists rec_select on recognitions;
create policy rec_select on recognitions for select to authenticated
  using (volunteer_id = auth.uid() or can_report());
drop policy if exists rec_insert on recognitions;
create policy rec_insert on recognitions for insert to authenticated
  with check (can_report());
drop policy if exists rec_update on recognitions;
create policy rec_update on recognitions for update to authenticated
  using (is_lead()) with check (is_lead());

-- weekly_reports: reporters & leads read; reporters insert.
drop policy if exists wr_select on weekly_reports;
create policy wr_select on weekly_reports for select to authenticated
  using (can_report());
drop policy if exists wr_insert on weekly_reports;
create policy wr_insert on weekly_reports for insert to authenticated
  with check (can_report());

-- weak_link_flags: reporters & leads read; reporters insert; leads resolve (update).
drop policy if exists wl_select on weak_link_flags;
create policy wl_select on weak_link_flags for select to authenticated
  using (can_report());
drop policy if exists wl_insert on weak_link_flags;
create policy wl_insert on weak_link_flags for insert to authenticated
  with check (can_report());
drop policy if exists wl_update on weak_link_flags;
create policy wl_update on weak_link_flags for update to authenticated
  using (is_lead()) with check (is_lead());

-- escalations: leads only (sensitive).
drop policy if exists esc_select on escalations;
create policy esc_select on escalations for select to authenticated using (is_lead());
drop policy if exists esc_insert on escalations;
create policy esc_insert on escalations for insert to authenticated with check (is_lead());
