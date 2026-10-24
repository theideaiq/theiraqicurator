'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sessionStatus } from '@/lib/content';
import { rowToSession } from '@/lib/events';
import type { Tables } from '@/lib/supabase/types';
import { Pill, formatDate } from '@/components/staff/ui';

type Stats = {
  published: number;
  drafts: number;
  artworks: number;
  upcoming: number;
  unread: number;
  notes: Tables<'notes'>[];
};

function greeting() {
  const hour = Number(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Baghdad', hour: 'numeric', hour12: false }));
  if (hour < 5) return 'Burning the midnight oil';
  if (hour < 12) return 'Sabah al-khair';
  if (hour < 18) return 'Afternoon, class';
  return 'Masa al-khair';
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('curations').select('published'),
      supabase.from('artworks').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('*'),
      supabase.from('notes').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([curations, artworks, events, notes]) => {
      const rows = curations.data ?? [];
      setStats({
        published: rows.filter((r) => r.published).length,
        drafts: rows.filter((r) => !r.published).length,
        artworks: artworks.count ?? 0,
        upcoming: (events.data ?? []).filter((e) => ['upcoming', 'today'].includes(sessionStatus(rowToSession(e)))).length,
        unread: (notes.data ?? []).filter((n) => !n.read).length,
        notes: notes.data ?? [],
      });
    });
  }, []);

  const tiles = [
    { label: 'Published curations', value: stats?.published, href: '/staff/curations', tone: 'bg-rose' },
    { label: 'Drafts', value: stats?.drafts, href: '/staff/curations', tone: 'bg-paper' },
    { label: 'Works in the museum', value: stats?.artworks, href: '/staff/artworks', tone: 'bg-lapis text-paper' },
    { label: 'Upcoming sessions', value: stats?.upcoming, href: '/staff/timetable', tone: 'bg-saffron' },
    { label: 'Unread notes', value: stats?.unread, href: '/staff/inbox', tone: 'bg-teal text-paper' },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase text-brick">Overview</p>
      <h1 className="font-display italic text-5xl md:text-8xl leading-[0.85]">{greeting()}.</h1>
      <p className="mt-4 max-w-xl text-ink/70">Everything you publish here goes straight to the live site — no redeploys, no developer needed.</p>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {tiles.map((tile, i) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={`${tile.tone} border-2 border-ink hard-shadow p-5 flex flex-col gap-6 hover:-translate-y-1 transition-transform`}
            style={{ rotate: `${(i % 2 ? 1 : -1) * 0.8}deg` }}
          >
            <span className="font-mono text-[11px] uppercase">{tile.label}</span>
            <span className="font-display text-7xl leading-none">{tile.value ?? '·'}</span>
          </Link>
        ))}
      </div>

      <div className="mt-16 grid lg:grid-cols-[1fr_20rem] gap-10">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display italic text-3xl">Latest notes</h2>
            <Link href="/staff/inbox" className="font-mono text-xs uppercase underline underline-offset-4">
              Inbox →
            </Link>
          </div>
          {stats && stats.notes.length === 0 && <p className="text-ink/50">No notes passed yet.</p>}
          <ul className="border-t-2 border-ink">
            {stats?.notes.map((n) => (
              <li key={n.id} className="border-b-2 border-ink py-4 flex gap-4 items-start">
                {!n.read && <Pill tone="alert">New</Pill>}
                <div className="min-w-0">
                  <p className="font-bold">{n.name}</p>
                  <p dir="auto" className="text-sm text-ink/70 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase text-ink/50">{formatDate(n.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display italic text-3xl mb-4">Quick chalk</h2>
          <div className="flex flex-col gap-3">
            <Link href="/staff/curations/new" className="px-4 py-3 border-2 border-ink bg-paper hover:bg-saffron font-mono text-xs uppercase">
              + Write a curation
            </Link>
            <Link href="/staff/artworks/new" className="px-4 py-3 border-2 border-ink bg-paper hover:bg-saffron font-mono text-xs uppercase">
              + Hang an artwork
            </Link>
            <Link href="/staff/timetable/new" className="px-4 py-3 border-2 border-ink bg-paper hover:bg-saffron font-mono text-xs uppercase">
              + Schedule a session
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
