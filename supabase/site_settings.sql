-- Gita Saransh site settings
-- Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
--
-- Afterwards, change the website's text in Table Editor > site_settings:
-- edit the "value" column and reload the site. No code changes needed.
-- Leave a value empty to show the built-in fallback wording instead.

create table if not exists public.site_settings (
  key         text primary key check (key ~ '^[a-z_]+$'),
  value       text,
  description text,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Anyone can read the settings (they are shown on the public site); only you
-- can change them, from the Supabase dashboard.
drop policy if exists "site settings are public" on public.site_settings;
create policy "site settings are public" on public.site_settings
  for select to anon, authenticated using (true);

revoke insert, update, delete on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;

create or replace function public.touch_site_settings() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_site_settings();

-- The keys the website uses. Values start empty; fill them in the Table Editor.
insert into public.site_settings (key, value, description) values
  ('launch_month',    null, 'When the app launches, e.g. "January 2027". Hero pill and FAQ. Empty: "coming soon".'),
  ('founding_perk',   null, 'Founding member perk, e.g. "your first month free". Sign-up card and FAQ.'),
  ('founding_spots',  null, 'How many families get the perk, e.g. "500". Needs founding_perk too.'),
  ('price',           null, 'Monthly price in India, e.g. "₹99". Hero and FAQ. Needs trial_length too.'),
  ('price_intl',      null, 'Monthly price for visitors outside India, e.g. "$4.99". Leave empty to show no price abroad.'),
  ('prices',          null, 'Optional per-country prices as JSON, e.g. {"GB":"£3.99","AE":"AED 19","CA":"CA$6.99"}. Overrides price_intl for those countries.'),
  ('trial_length',    null, 'Free trial length, e.g. "7-day". FAQ. Needs price too.'),
  ('contact_email',   null, 'Contact address, e.g. "hello@gitasaransh.app". Footer link and privacy page.'),
  ('city',            null, 'Footer: "Made with devotion in {city}".'),
  ('site_url',        null, 'Public site address, e.g. "https://gitasaransh.app". Used in the WhatsApp share message.'),
  ('privacy_updated', null, 'Date shown on the privacy page, e.g. "1 October 2026".')
on conflict (key) do update set description = excluded.description;
