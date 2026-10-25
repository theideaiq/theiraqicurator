-- Fixes for the Supabase security & performance advisors.
-- Safe to run more than once.
--
-- * One policy per role per action (no "multiple permissive policies"):
--   visitors (anon) read published rows; signed-in users read published rows
--   or everything if on staff; staff write via separate insert/update/delete.
-- * is_staff()/is_superadmin() wrapped in (select …) so they run once per
--   query, not once per row (auth_rls_initplan).
-- * Visitors no longer call the SECURITY DEFINER helpers at all, so anon can
--   lose EXECUTE on them. Signed-in users keep it: RLS and the staff room need it.
-- * The public bucket keeps serving files by URL, but can no longer be listed.

-- ---------------------------------------------------------------------------
-- Content tables with a `published` flag
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['curations', 'events', 'partners', 'syllabus_artists', 'quiz_questions', 'manifesto_rules'] loop
    execute format('drop policy if exists %I on public.%I', 'public reads published ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'staff writes ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'visitors read published ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'members read ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'staff add ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'staff edit ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'staff remove ' || t, t);

    execute format('create policy %I on public.%I for select to anon using (published = true)',
      'visitors read published ' || t, t);
    execute format('create policy %I on public.%I for select to authenticated using (published = true or (select public.is_staff()))',
      'members read ' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_staff()))',
      'staff add ' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))',
      'staff edit ' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_staff()))',
      'staff remove ' || t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Artworks: everything is public
-- ---------------------------------------------------------------------------
drop policy if exists "public reads artworks" on public.artworks;
drop policy if exists "staff writes artworks" on public.artworks;
drop policy if exists "everyone reads artworks" on public.artworks;
drop policy if exists "staff add artworks" on public.artworks;
drop policy if exists "staff edit artworks" on public.artworks;
drop policy if exists "staff remove artworks" on public.artworks;
create policy "everyone reads artworks" on public.artworks for select to anon, authenticated using (true);
create policy "staff add artworks" on public.artworks for insert to authenticated with check ((select public.is_staff()));
create policy "staff edit artworks" on public.artworks for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "staff remove artworks" on public.artworks for delete to authenticated using ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Inbox
-- ---------------------------------------------------------------------------
drop policy if exists "staff read notes" on public.notes;
create policy "staff read notes" on public.notes for select to authenticated using ((select public.is_staff()));
drop policy if exists "staff update notes" on public.notes;
create policy "staff update notes" on public.notes for update to authenticated using ((select public.is_staff()));
drop policy if exists "staff delete notes" on public.notes;
create policy "staff delete notes" on public.notes for delete to authenticated using ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Team
-- ---------------------------------------------------------------------------
drop policy if exists "staff can read staff" on public.staff;
create policy "staff can read staff" on public.staff for select to authenticated using ((select public.is_staff()));
drop policy if exists "superadmins add staff" on public.staff;
create policy "superadmins add staff" on public.staff for insert to authenticated with check ((select public.is_superadmin()));
drop policy if exists "superadmins edit staff" on public.staff;
create policy "superadmins edit staff" on public.staff for update to authenticated using ((select public.is_superadmin())) with check ((select public.is_superadmin()));
drop policy if exists "superadmins remove staff" on public.staff;
create policy "superadmins remove staff" on public.staff for delete to authenticated using ((select public.is_superadmin()));

-- ---------------------------------------------------------------------------
-- Storage: public URLs still work; only staff can list (uploads need it too)
-- ---------------------------------------------------------------------------
drop policy if exists "public reads museum assets" on storage.objects;
drop policy if exists "staff lists museum assets" on storage.objects;
create policy "staff lists museum assets" on storage.objects for select to authenticated using (bucket_id = 'museum-assets' and (select public.is_staff()));
drop policy if exists "staff uploads museum assets" on storage.objects;
create policy "staff uploads museum assets" on storage.objects for insert to authenticated with check (bucket_id = 'museum-assets' and (select public.is_staff()));
drop policy if exists "staff edits museum assets" on storage.objects;
create policy "staff edits museum assets" on storage.objects for update to authenticated using (bucket_id = 'museum-assets' and (select public.is_staff()));
drop policy if exists "staff deletes museum assets" on storage.objects;
create policy "staff deletes museum assets" on storage.objects for delete to authenticated using (bucket_id = 'museum-assets' and (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Function permissions
-- ---------------------------------------------------------------------------
revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.is_superadmin() from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_superadmin() to authenticated;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Indexes for the orderings the site uses
-- ---------------------------------------------------------------------------
create index if not exists partners_sort_idx on public.partners (sort);
create index if not exists quiz_questions_sort_idx on public.quiz_questions (sort);
create index if not exists syllabus_artists_sort_idx on public.syllabus_artists (sort);
create index if not exists manifesto_rules_sort_idx on public.manifesto_rules (sort);
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists curations_created_at_idx on public.curations (created_at);
create index if not exists artworks_created_at_idx on public.artworks (created_at);
create index if not exists notes_created_at_idx on public.notes (created_at);

-- ---------------------------------------------------------------------------
-- `posts` is left over from the first version and nothing reads it. Its
-- policies and unindexed foreign key are the remaining advisor warnings.
-- Check it's empty (select count(*) from public.posts;), then uncomment:
-- drop table if exists public.posts;
-- ---------------------------------------------------------------------------
