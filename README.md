# The Iraqi Curator — القيّم العراقي

*The art class we didn't take at school / درس الفنية اللي ما اخذناه بالمدرسة*

A single Next.js app: the bilingual public site **and** the staff room (`/staff`) where the
curator manages everything. One repo, one deploy. Built and hosted by our technology partner
[The IDEA](https://theideaiq.com).

## What's inside

| Path | What it is |
| --- | --- |
| `/` · `/ar` | Home: hero, timetable, curriculum, pop quiz, seal room, contact form |
| `/timetable` | Exhibitions & workshops, with calendar (.ics) export |
| `/museum` | 3D room + index of the collection, with audio guides |
| `/blog` | Curations (essays) |
| `/syllabus` | Index of Iraqi artists |
| `/manifesto` | House rules + colophon |
| `/staff` | Staff room: museum, curations, syllabus, timetable, manifesto, quiz, partners, inbox, staff |

Content lives in Supabase (`curations`, `artworks`, `events`, `partners`, `syllabus_artists`,
`quiz_questions`, `manifesto_rules`, `notes`), all edited from the staff room. The syllabus, quiz and
manifesto live in `src/lib/content.ts`; the timetable falls back to the list there until the
`events` table has rows (partners likewise fall back to the list there).

## Brand

The mark is the original taped-samoon photograph, cut out onto a transparent background.
Files in `public/brand/`:

- `samoon.png`: full-resolution transparent cut-out (print, social, partners' posters)
- `samoon.webp`: the lightweight copy the site loads
- `samoon-badge.png`: the round sticker version (avatars)
- `lockup.png`: the mark above the "The Iraqi Curator" wordmark

## Email

The site lists **hello@theiraqicurator.org**. Set it up with Cloudflare Email Routing
(Email → Email Routing → Routing rules) forwarding to the curator's inbox.

## Run it

```bash
pnpm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
pnpm dev                     # http://localhost:3000, staff room at /staff
```

## Supabase setup (once)

1. Run `supabase/migrations/20261024000000_platform.sql` in the Supabase SQL editor. It adds
   the `events`, `partners`, `notes` and `staff` tables, row-level security, and the `museum-assets`
   storage bucket, and seeds the timetable and partners.
2. Staff are managed in the staff room at **/staff/team** (superadmins only): add someone, pick
   *editor* or *superadmin*, and they get an email invite to set a password. This needs
   `SUPABASE_SERVICE_ROLE_KEY` set on Vercel (server-only; never `NEXT_PUBLIC_`).
3. Turn off public sign-ups (Authentication → Providers → Email) — only invited staff need accounts.
4. For "email me a link" sign-in, add `https://<your-domain>/staff/auth/callback` to
   Authentication → URL Configuration → Redirect URLs.

## Deploy

Vercel, from the repo root (Framework preset: Next.js, no root directory). Set
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
