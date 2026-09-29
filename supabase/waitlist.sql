-- Gita Saransh waitlist
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- Design: the table is locked (RLS on, no policies), so the public anon key
-- can neither read nor write it directly. The website calls join_waitlist(),
-- which validates input and inserts or updates one row per email.

create table if not exists public.waitlist (
  id           bigint generated always as identity primary key,
  email        text not null,
  whatsapp     text,
  wa_consent   boolean not null default false,
  language     text not null default 'en',
  who          text[] not null default '{}',
  source       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint waitlist_email_format check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and length(email) <= 254),
  constraint waitlist_wa_format    check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$'),  -- E.164, any country
  constraint waitlist_language     check (language in ('en','hi','te','ta','kn','mr','bn','gu')),
  constraint waitlist_who          check (who <@ array['me','child','parents','family']::text[]),
  constraint waitlist_source_len   check (source is null or length(source) <= 200)
);

-- Upgrade from the first version (India-only numbers stored without +91). Safe to re-run.
alter table public.waitlist drop constraint if exists waitlist_wa_format;
update public.waitlist set whatsapp = '+91' || whatsapp where whatsapp ~ '^[6-9][0-9]{9}$';
alter table public.waitlist add constraint waitlist_wa_format
  check (whatsapp is null or whatsapp ~ '^\+[1-9][0-9]{7,14}$');

create unique index if not exists waitlist_email_key on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;

create or replace function public.join_waitlist(
  p_email      text,
  p_whatsapp   text default null,
  p_wa_consent boolean default false,
  p_language   text default 'en',
  p_who        text[] default '{}',
  p_source     text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  existed boolean;
begin
  select exists(select 1 from waitlist where lower(email) = lower(trim(p_email))) into existed;

  insert into waitlist (email, whatsapp, wa_consent, language, who, source)
  values (
    lower(trim(p_email)),
    nullif(p_whatsapp, ''),
    coalesce(p_wa_consent, false) and nullif(p_whatsapp, '') is not null,
    coalesce(p_language, 'en'),
    coalesce(p_who, '{}'),
    left(p_source, 200)
  )
  on conflict ((lower(email))) do update set
    whatsapp   = excluded.whatsapp,
    wa_consent = excluded.wa_consent,
    language   = excluded.language,
    who        = excluded.who,
    updated_at = now();

  return case when existed then 'updated' else 'joined' end;
end;
$$;

revoke all on function public.join_waitlist(text, text, boolean, text, text[], text) from public;
grant execute on function public.join_waitlist(text, text, boolean, text, text[], text) to anon;

-- Handy views for you (run in the SQL editor; not reachable with the anon key):
--   select count(*) from waitlist;
--   select language, count(*) from waitlist group by 1 order by 2 desc;
--   select email, whatsapp from waitlist where wa_consent order by created_at;
--   select substring(whatsapp from '^\+(1|7|[2-9][0-9]{1,2})') as dial_code, count(*) from waitlist where whatsapp is not null group by 1 order by 2 desc;
