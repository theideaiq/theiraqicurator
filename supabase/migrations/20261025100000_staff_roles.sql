-- Staff roles: superadmins manage the team from /staff/team; editors manage content.
-- Safe to run more than once.

alter table public.staff add column if not exists role text not null default 'editor';
alter table public.staff drop constraint if exists staff_role_check;
alter table public.staff add constraint staff_role_check check (role in ('superadmin', 'editor'));

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'superadmin'
  );
$$;

-- Everyone on staff can see the team; only superadmins can change it.
drop policy if exists "superadmins add staff" on public.staff;
create policy "superadmins add staff" on public.staff for insert with check (public.is_superadmin());
drop policy if exists "superadmins edit staff" on public.staff;
create policy "superadmins edit staff" on public.staff for update using (public.is_superadmin()) with check (public.is_superadmin());
drop policy if exists "superadmins remove staff" on public.staff;
create policy "superadmins remove staff" on public.staff for delete using (public.is_superadmin());

-- Emails are compared case-insensitively everywhere; store them that way.
update public.staff set email = lower(email) where email <> lower(email);

insert into public.staff (email, name, role) values
  ('shaheen.farjo@gmail.com', 'Shaheen', 'superadmin'),
  ('aliraediq888@gmail.com', 'Ali Raed', 'superadmin')
on conflict (email) do update set role = 'superadmin', name = coalesce(public.staff.name, excluded.name);
