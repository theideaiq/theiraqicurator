-- Curations can point at an Instagram reel / video (replaces the hard-coded
-- "back-row notes" on the home page).
alter table public.curations add column if not exists video_url text;
