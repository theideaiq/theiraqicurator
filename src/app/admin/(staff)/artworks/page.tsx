'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { Empty, ErrorNote, PageTitle, Pill } from '@/components/admin/ui';

export default function ArtworksList() {
  const [rows, setRows] = useState<Tables<'artworks'>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setRows(data ?? []);
      });
  }, []);

  return (
    <div>
      <PageTitle kicker="Digital museum" title="The Collection">
        <a href="/museum" target="_blank" className="px-4 py-2.5 rounded-full border-2 border-ink font-mono text-xs uppercase hover:bg-saffron">
          Walk the room ↗
        </a>
        <Link href="/admin/artworks/new" className="px-4 py-2.5 rounded-full bg-ink text-paper font-mono text-xs uppercase hover:bg-lapis">
          + Hang a work
        </Link>
      </PageTitle>
      <ErrorNote message={error} />
      {rows && rows.length === 0 && <Empty>Bare walls. Hang the first work.</Empty>}

      <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {rows?.map((art, i) => (
          <li key={art.id} style={{ rotate: `${((i % 3) - 1) * 1}deg` }}>
            <Link href={`/admin/artworks/${art.id}`} className="group block bg-paper border-2 border-ink p-3 pb-4 hard-shadow hover:-translate-y-1 transition-transform">
              <span className="block aspect-square overflow-hidden bg-paper-2 border-2 border-ink">
                <img src={art.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </span>
              <span className="mt-3 flex flex-wrap gap-1">
                {art.is_featured && <Pill tone="draft">★ Featured</Pill>}
                {art.audio_url && <Pill tone="muted">♪ Audio</Pill>}
              </span>
              <span dir="auto" className="mt-1 block font-display text-2xl leading-tight truncate">
                {art.title}
              </span>
              <span dir="auto" className="block font-mono text-[10px] uppercase text-ink/60 truncate">
                {art.artist}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
