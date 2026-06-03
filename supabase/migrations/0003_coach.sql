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
