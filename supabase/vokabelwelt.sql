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

-- ---------------------------------------------------------------------------
-- Portionen von anderen finden: öffentliche Kopien der Portionen, die ihr Besitzer
-- im Teilen-Fenster „In der Suche zeigen“ freigibt. Nur Name, Vokabeln und Bildauswahl
-- (keine eigenen Fotos, kein Übungsstand). Lesen darf jede Person, auch ohne Konto;
-- schreiben und löschen nur der Besitzer. Wer die Portion besitzt, sehen Fremde nicht.

create table if not exists public.vokabelwelt_public (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  set_id text not null check (char_length(set_id) between 1 and 40),
  name text not null check (char_length(name) between 1 and 200),
  words jsonb not null check (jsonb_typeof(words) = 'array' and jsonb_array_length(words) between 1 and 400 and octet_length(words::text) <= 200000),
  word_count integer generated always as (jsonb_array_length(words)) stored,
  search text not null default '' check (char_length(search) <= 20000),
  pic_style text not null default 'picto' check (pic_style in ('picto', 'clipart', 'emoji')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, set_id)
);
create index if not exists vokabelwelt_public_updated on public.vokabelwelt_public (updated_at desc);

alter table public.vokabelwelt_public enable row level security;
revoke all on public.vokabelwelt_public from anon, authenticated;
-- Lesen: alle Spalten außer dem Besitzer
grant select (set_id, name, words, word_count, search, pic_style, created_at, updated_at) on public.vokabelwelt_public to anon, authenticated;
-- Der Besitzer braucht seine eigene Spalte zum Speichern
grant select (user_id) on public.vokabelwelt_public to authenticated;
grant insert, update, delete on public.vokabelwelt_public to authenticated;

drop policy if exists "suche lesen" on public.vokabelwelt_public;
drop policy if exists "suche erstellen" on public.vokabelwelt_public;
drop policy if exists "suche ändern" on public.vokabelwelt_public;
drop policy if exists "suche löschen" on public.vokabelwelt_public;
create policy "suche lesen" on public.vokabelwelt_public for select to anon, authenticated using (true);
create policy "suche erstellen" on public.vokabelwelt_public for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "suche ändern" on public.vokabelwelt_public for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "suche löschen" on public.vokabelwelt_public for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.vokabelwelt_public_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.user_id := old.user_id;
  new.set_id := old.set_id;
  new.created_at := old.created_at;
  return new;
end;
$$;
drop trigger if exists vokabelwelt_public_touch on public.vokabelwelt_public;
create trigger vokabelwelt_public_touch before update on public.vokabelwelt_public
  for each row execute function public.vokabelwelt_public_touch();
