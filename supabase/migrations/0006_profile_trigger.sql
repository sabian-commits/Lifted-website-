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
