-- Lifted Church platform — Phase: Events / Info hub
-- Run in the Supabase SQL Editor (depends on 0001_init.sql for is_lead()/can_report()).

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  location text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists info_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

alter table events       enable row level security;
alter table event_rsvps  enable row level security;
alter table info_items   enable row level security;

-- events: everyone authenticated can read; reporters/leads manage.
drop policy if exists ev_select on events;
create policy ev_select on events for select to authenticated using (true);
drop policy if exists ev_insert on events;
create policy ev_insert on events for insert to authenticated with check (can_report());
drop policy if exists ev_update on events;
create policy ev_update on events for update to authenticated using (can_report()) with check (can_report());
drop policy if exists ev_delete on events;
create policy ev_delete on events for delete to authenticated using (is_lead());

-- event_rsvps: everyone can read (to show counts); you manage only your own.
drop policy if exists rsvp_select on event_rsvps;
create policy rsvp_select on event_rsvps for select to authenticated using (true);
drop policy if exists rsvp_insert on event_rsvps;
create policy rsvp_insert on event_rsvps for insert to authenticated with check (user_id = auth.uid());
drop policy if exists rsvp_delete on event_rsvps;
create policy rsvp_delete on event_rsvps for delete to authenticated using (user_id = auth.uid());

-- info_items: everyone reads; leads manage.
drop policy if exists info_select on info_items;
create policy info_select on info_items for select to authenticated using (true);
drop policy if exists info_insert on info_items;
create policy info_insert on info_items for insert to authenticated with check (is_lead());
drop policy if exists info_update on info_items;
create policy info_update on info_items for update to authenticated using (is_lead()) with check (is_lead());
drop policy if exists info_delete on info_items;
create policy info_delete on info_items for delete to authenticated using (is_lead());
