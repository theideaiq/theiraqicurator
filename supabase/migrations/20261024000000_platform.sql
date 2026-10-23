-- The Iraqi Curator — single-app platform.
-- Safe to run more than once. Run it in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- Staff allowlist: only these emails can edit content from /admin.
-- After running, add yourselves:
--   insert into public.staff (email, name) values ('someone@example.com', 'Ali');
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  email text primary key,
  name text,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "staff can read staff" on public.staff;
create policy "staff can read staff" on public.staff for select using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Existing tables: columns the editor relies on
-- ---------------------------------------------------------------------------
alter table public.curations add column if not exists language text not null default 'both';
alter table public.curations add column if not exists updated_at timestamptz not null default now();
alter table public.artworks add column if not exists language text not null default 'both';

-- An earlier default stored the quotes literally ('both' with quote marks); normalise it.
alter table public.curations alter column language set default 'both';
alter table public.artworks alter column language set default 'both';
update public.curations set language = 'both' where language is null or language not in ('en', 'ar', 'both');
update public.artworks set language = 'both' where language is null or language not in ('en', 'ar', 'both');

-- The first dashboard let *any* signed-in user write. Policies are OR-ed, so
-- those must go for the staff allowlist below to mean anything.
drop policy if exists "Allow authenticated users full access to artworks" on public.artworks;
drop policy if exists "Allow public read access on artworks" on public.artworks;
drop policy if exists "Admins have full access to curations" on public.curations;
drop policy if exists "Public can read published curations" on public.curations;
drop policy if exists "Authenticated users can delete" on storage.objects;
drop policy if exists "Authenticated users can update" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Public Access" on storage.objects;

-- ---------------------------------------------------------------------------
-- Timetable (exhibitions, workshops, talks)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null default 'exhibition' check (kind in ('exhibition', 'workshop', 'talk', 'screening')),
  title_en text not null,
  title_ar text not null default '',
  blurb_en text not null default '',
  blurb_ar text not null default '',
  venue_en text not null default '',
  venue_ar text not null default '',
  starts_at timestamptz,
  duration_minutes integer not null default 120,
  partners text[] not null default '{}',
  color text not null default 'saffron' check (color in ('rose', 'saffron', 'teal', 'lapis', 'brick')),
  link_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inbox: notes passed from the public contact form
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text check (email is null or char_length(email) <= 200),
  topic text not null default 'hi' check (topic in ('show', 'workshop', 'collab', 'hi')),
  message text not null check (char_length(message) between 1 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.curations enable row level security;
alter table public.artworks enable row level security;
alter table public.events enable row level security;
alter table public.notes enable row level security;

drop policy if exists "public reads published curations" on public.curations;
create policy "public reads published curations" on public.curations for select using (published = true or public.is_staff());
drop policy if exists "staff writes curations" on public.curations;
create policy "staff writes curations" on public.curations for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public reads artworks" on public.artworks;
create policy "public reads artworks" on public.artworks for select using (true);
drop policy if exists "staff writes artworks" on public.artworks;
create policy "staff writes artworks" on public.artworks for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "public reads published events" on public.events;
create policy "public reads published events" on public.events for select using (published = true or public.is_staff());
drop policy if exists "staff writes events" on public.events;
create policy "staff writes events" on public.events for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "anyone can pass a note" on public.notes;
create policy "anyone can pass a note" on public.notes for insert with check (read = false);
drop policy if exists "staff read notes" on public.notes;
create policy "staff read notes" on public.notes for select using (public.is_staff());
drop policy if exists "staff update notes" on public.notes;
create policy "staff update notes" on public.notes for update using (public.is_staff());
drop policy if exists "staff delete notes" on public.notes;
create policy "staff delete notes" on public.notes for delete using (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage for images and audio guides
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('museum-assets', 'museum-assets', true)
on conflict (id) do nothing;

drop policy if exists "public reads museum assets" on storage.objects;
create policy "public reads museum assets" on storage.objects for select using (bucket_id = 'museum-assets');
drop policy if exists "staff uploads museum assets" on storage.objects;
create policy "staff uploads museum assets" on storage.objects for insert with check (bucket_id = 'museum-assets' and public.is_staff());
drop policy if exists "staff edits museum assets" on storage.objects;
create policy "staff edits museum assets" on storage.objects for update using (bucket_id = 'museum-assets' and public.is_staff());
drop policy if exists "staff deletes museum assets" on storage.objects;
create policy "staff deletes museum assets" on storage.objects for delete using (bucket_id = 'museum-assets' and public.is_staff());

-- ---------------------------------------------------------------------------
-- Seed the timetable with what's already been announced
-- ---------------------------------------------------------------------------
insert into public.events (slug, kind, title_en, title_ar, blurb_en, blurb_ar, venue_en, venue_ar, starts_at, duration_minutes, color)
values
  ('aziza-namaa-alward', 'exhibition', 'Aziza — Namaa Alward', 'عزيزة — نماء الورد',
   'An art exhibition and breast-cancer awareness evening. When art makes room for awareness and hope.',
   'فعالية فنية توعوية بسرطان الثدي. حين يعطي الفن مساحة للوعي والأمل.',
   'The Station, Baghdad', 'المحطة، بغداد', '2026-10-24T16:00:00+03:00', 180, 'rose'),
  ('sealed-memories', 'workshop', 'Sealed Memories', 'ذكريات مختومة',
   'A heritage, culture & art workshop: carve your own Mesopotamian cylinder seal and roll out your memories in clay.',
   'ورشة تراثية، ثقافية، فنية: اصنع ختمك الرافديني واستكشف ذكرياتك.',
   'A library in Baghdad', 'مكتبة في بغداد', '2026-09-23T17:00:00+03:00', 120, 'saffron')
on conflict (slug) do nothing;

insert into public.events (slug, kind, title_en, title_ar, blurb_en, blurb_ar, venue_en, venue_ar, partners, color)
values
  ('interactive-exhibition', 'exhibition', 'The Interactive Exhibition', 'المعرض التفاعلي',
   'L’exposition interactive — touch, play and make with the work, in partnership with the Institut Français d’Irak.',
   'معرض تفاعلي تلمس فيه العمل وتلعب وتصنع، بالشراكة مع المعهد الفرنسي في العراق.',
   'Institut Français, Baghdad', 'المعهد الفرنسي، بغداد',
   array['Ambassade de France en Irak', 'Institut Français Irak', 'TotalEnergies'], 'lapis')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Partners ("classmates"): collaborators, sponsors and institutions
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null default '',
  kind text not null default 'creative' check (kind in ('creative', 'sponsor', 'institution', 'platform')),
  url text,
  note_en text not null default '',
  note_ar text not null default '',
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.partners enable row level security;

drop policy if exists "public reads published partners" on public.partners;
create policy "public reads published partners" on public.partners for select using (published = true or public.is_staff());
drop policy if exists "staff writes partners" on public.partners;
create policy "staff writes partners" on public.partners for all using (public.is_staff()) with check (public.is_staff());

insert into public.partners (name_en, name_ar, kind, url, note_en, note_ar, sort)
select * from (values
  ('Aziza', 'عزيزة', 'creative', 'https://www.instagram.com/aziza.iq/', 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 10),
  ('StageReads.iq', 'StageReads.iq', 'creative', 'https://www.instagram.com/stagereads.iq/', 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 20),
  ('Iraqi Zine', 'Iraqi Zine', 'creative', 'https://www.instagram.com/iraqizine/', 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 30),
  ('Iraqi Archive of Prints', 'الأرشيف العراقي للمطبوعات', 'creative', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 40),
  ('Poetry Hub', 'Poetry Hub', 'creative', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 50),
  ('Laheeb', 'لهيب', 'sponsor', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 60),
  ('Keys of Knowledge Agency', 'Keys of Knowledge', 'sponsor', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 70),
  ('Kalleh', 'كاله', 'sponsor', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 80),
  ('Shotsfresh', 'Shotsfresh', 'sponsor', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 90),
  ('Guru Camp', 'Guru Camp', 'sponsor', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 100),
  ('itel', 'itel', 'sponsor', null, 'Aziza art exhibition, 2026', 'معرض عزيزة الفني، ٢٠٢٦', 110),
  ('Institut Français d’Irak', 'المعهد الفرنسي في العراق', 'institution', null, 'The Interactive Exhibition', 'المعرض التفاعلي', 120),
  ('Ambassade de France en Irak', 'السفارة الفرنسية في العراق', 'institution', null, 'The Interactive Exhibition', 'المعرض التفاعلي', 130),
  ('TotalEnergies', 'توتال إنرجيز', 'institution', null, 'The Interactive Exhibition', 'المعرض التفاعلي', 140),
  ('The IDEA', 'IDEA', 'platform', 'https://theideaiq.com', 'Builds and runs this platform', 'تبني وتدير هذه المنصة', 150)
) as seed(name_en, name_ar, kind, url, note_en, note_ar, sort)
where not exists (select 1 from public.partners);
