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
