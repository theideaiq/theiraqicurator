'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sessionStatus } from '@/lib/content';
import { rowToSession } from '@/lib/events';
import type { Tables } from '@/lib/supabase/types';
import { Empty, ErrorNote, PageTitle, Pill, formatDate } from '@/components/admin/ui';

const SWATCH: Record<string, string> = { rose: 'bg-rose', saffron: 'bg-saffron', teal: 'bg-teal', lapis: 'bg-lapis', brick: 'bg-brick' };

export default function TimetableList() {
  const [rows, setRows] = useState<Tables<'events'>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from('events')
      .select('*')
      .order('starts_at', { ascending: false, nullsFirst: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setRows(data ?? []);
      });
  }, []);

  return (
    <div>
      <PageTitle kicker="Exhibitions · workshops · talks" title="Timetable">
        <Link href="/admin/timetable/new" className="px-4 py-2.5 rounded-full bg-ink text-paper font-mono text-xs uppercase hover:bg-lapis">
          + New session
        </Link>
      </PageTitle>
      <ErrorNote message={error} />
      {rows && rows.length === 0 && !error && <Empty>No sessions yet. The site shows its built-in list until you add one.</Empty>}

      <ul className="border-t-2 border-ink">
        {rows?.map((row) => {
          const status = sessionStatus(rowToSession(row));
          return (
            <li key={row.id}>
              <Link href={`/admin/timetable/${row.id}`} className="group grid grid-cols-[1rem_1fr] gap-4 border-b-2 border-ink py-4 items-center">
                <span className={`w-4 h-full min-h-12 border-2 border-ink ${SWATCH[row.color] ?? 'bg-paper'}`} />
                <span className="min-w-0">
                  <span className="flex flex-wrap gap-2 mb-1">
                    <Pill tone="muted">{row.kind}</Pill>
                    {!row.published && <Pill tone="draft">Hidden</Pill>}
                    {status === 'today' && <Pill tone="alert">Today</Pill>}
                    {status === 'upcoming' && <Pill tone="live">Upcoming</Pill>}
                    {status === 'archive' && <Pill tone="muted">Archive</Pill>}
                    {status === 'tba' && <Pill tone="muted">TBA</Pill>}
                  </span>
                  <span className="block font-display text-2xl md:text-3xl leading-tight group-hover:italic">
                    {row.title_en}
                    {row.title_ar && (
                      <span className="font-arabic text-xl text-ink/60 ml-3" dir="rtl" lang="ar">
                        {row.title_ar}
                      </span>
                    )}
                  </span>
                  <span className="block font-mono text-[10px] uppercase text-ink/50">
                    {formatDate(row.starts_at)} · {row.venue_en || '—'}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
