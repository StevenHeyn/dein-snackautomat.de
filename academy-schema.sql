-- Vending Academy / Setup 1:0 – im Supabase SQL Editor ausführen.
-- Nur entitlements, die von berechtigten Administratoren SERVERSEITIG vergeben werden.
-- Diese Datei enthält keine privaten Zugangsdaten.

create table if not exists public.academy_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('basic_lifetime','course')),
  course_slug text,
  granted_at timestamptz not null default now(),
  source text not null default 'manual',
  granted_by uuid references auth.users(id) on delete set null,
  constraint academy_entitlement_scope_check
    check ((scope='basic_lifetime' and course_slug is null)
        or (scope='course' and course_slug is not null and length(course_slug) between 2 and 100))
);
create unique index if not exists academy_basic_unique on public.academy_entitlements(user_id) where scope='basic_lifetime';
create unique index if not exists academy_course_unique on public.academy_entitlements(user_id,course_slug) where scope='course';
create index if not exists academy_entitlements_user_idx on public.academy_entitlements(user_id);

alter table public.academy_entitlements enable row level security;

-- eingeloggte Nutzer dürfen ausschließlich die eigenen Berechtigungen LESEN.
drop policy if exists academy_entitlements_read_self on public.academy_entitlements;
create policy academy_entitlements_read_self on public.academy_entitlements
  for select to authenticated using ((select auth.uid())=user_id);

-- Keinerlei INSERT/UPDATE/DELETE-Policy für Besucher oder eingeloggte Nutzer!
-- Gewährung erfolgt zunächst MANUELL über den SQL-Editor; später über gesicherte
-- Serverfunktion (Edge Function) mit Authentifizierung und Admin-Rechteprüfung.
revoke all on public.academy_entitlements from anon;
revoke insert,update,delete on public.academy_entitlements from authenticated;
grant select on public.academy_entitlements to authenticated;

-- Beispiel einer manuellen Freischaltung nach echter Prüfung von Kauf und Benutzer-ID.
-- Hier NICHT unverändert ausführen, sondern UUID im Supabase-Dashboard nachsehen:
-- insert into public.academy_entitlements (user_id,scope,source)
-- values ('HIER-DIE-GEPRÜFTE-USER-UUID','basic_lifetime','verified_machine_purchase');

-- Derzeit KEIN Video-URL-Feld in öffentlichen Tabellen.
-- Videos später privat hosten und nach serverseitiger Prüfung kurzlebige Playback-Tokens ausgeben.
-- Eine Frontend-Abfrage allein stellt KEINEN sicheren Videoschutz dar.
