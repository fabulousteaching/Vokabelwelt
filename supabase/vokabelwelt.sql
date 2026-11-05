-- Vokaboom: Tabelle und Zugriffsregeln für gespeicherte Vokabelportionen
-- In Supabase unter «SQL Editor» einfügen und auf «Run» klicken. Mehrmals ausführen schadet nicht.
-- Funktioniert in einem eigenen Projekt und auch im SmartSlots-Projekt (eigene Tabelle, nichts wird überschrieben).

create table if not exists public.vokabelwelt_sets (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  set_id text not null check (char_length(set_id) between 1 and 40),
  name text not null default '' check (char_length(name) <= 200),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 3000000),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, set_id)
);

-- Nur angemeldete Personen, und jede nur mit ihren eigenen Portionen
alter table public.vokabelwelt_sets enable row level security;
revoke all on public.vokabelwelt_sets from anon;
grant select, insert, update, delete on public.vokabelwelt_sets to authenticated;

drop policy if exists "vokabelwelt lesen" on public.vokabelwelt_sets;
drop policy if exists "vokabelwelt erstellen" on public.vokabelwelt_sets;
drop policy if exists "vokabelwelt ändern" on public.vokabelwelt_sets;
drop policy if exists "vokabelwelt löschen" on public.vokabelwelt_sets;
create policy "vokabelwelt lesen" on public.vokabelwelt_sets for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "vokabelwelt erstellen" on public.vokabelwelt_sets for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "vokabelwelt ändern" on public.vokabelwelt_sets for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vokabelwelt löschen" on public.vokabelwelt_sets for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Bei jeder Änderung: Zeit festhalten; ändern sich die Daten, zählt «version» hoch.
create or replace function public.vokabelwelt_sets_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.user_id := old.user_id;
  new.set_id := old.set_id;
  new.created_at := old.created_at;
  if new.data is distinct from old.data then
    new.version := old.version + 1;
  else
    new.version := old.version;
  end if;
  return new;
end;
$$;

drop trigger if exists vokabelwelt_sets_touch on public.vokabelwelt_sets;
create trigger vokabelwelt_sets_touch before update on public.vokabelwelt_sets
  for each row execute function public.vokabelwelt_sets_touch();
