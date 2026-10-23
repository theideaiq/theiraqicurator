'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { Empty, ErrorNote, PageTitle, Pill, Toggle, formatDate, inputClass } from '@/components/admin/ui';

type Curation = Tables<'curations'>;

export default function CurationsList() {
  const [rows, setRows] = useState<Curation[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchRows = () => createClient().from('curations').select('*').order('created_at', { ascending: false });
  const apply = ({ data, error }: Awaited<ReturnType<typeof fetchRows>>) => {
    if (error) setError(error.message);
    setRows(data ?? []);
  };
  const load = () => fetchRows().then(apply);

  useEffect(() => {
    fetchRows().then(apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) => !q || `${r.title} ${r.slug}`.toLowerCase().includes(q));
  }, [rows, query]);

  const setPublished = async (row: Curation, published: boolean) => {
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, published } : r)) ?? null);
    const { error } = await createClient().from('curations').update({ published }).eq('id', row.id);
    if (error) {
      setError(error.message);
      load();
    }
  };

  const remove = async (row: Curation) => {
    if (!confirm(`Delete “${row.title}”? This can’t be undone.`)) return;
    const { error } = await createClient().from('curations').delete().eq('id', row.id);
    if (error) setError(error.message);
    load();
  };

  return (
    <div>
      <PageTitle kicker="Lessons" title="Curations">
        <Link href="/admin/curations/new" className="px-4 py-2.5 rounded-full bg-ink text-paper font-mono text-xs uppercase hover:bg-lapis">
          + New curation
        </Link>
      </PageTitle>

      <input type="search" placeholder="Search titles…" value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} max-w-md mb-6`} />
      <ErrorNote message={error} />

      {rows && filtered.length === 0 && <Empty>{rows.length ? 'Nothing matches.' : 'The notebook is empty. Write the first lesson.'}</Empty>}

      <ul className="border-t-2 border-ink">
        {filtered.map((row) => (
          <li key={row.id} className="border-b-2 border-ink py-4 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] gap-4 items-center">
            <Link href={`/admin/curations/${row.id}`} className="min-w-0 group">
              <div className="flex flex-wrap gap-2 mb-1">
                <Pill tone={row.published ? 'live' : 'draft'}>{row.published ? 'Live' : 'Draft'}</Pill>
                <Pill tone="muted">{row.language}</Pill>
              </div>
              <p dir="auto" className="font-display text-2xl md:text-3xl leading-tight truncate group-hover:italic">
                {row.title}
              </p>
              <p className="font-mono text-[10px] uppercase text-ink/50">
                /{row.slug} · {formatDate(row.created_at)}
              </p>
            </Link>
            <div className="hidden md:block">
              <Toggle checked={!!row.published} onChange={(v) => setPublished(row, v)} label="Live" />
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/curations/${row.id}`} className="p-2 border-2 border-ink rounded-full hover:bg-saffron" aria-label="Edit">
                <Pencil size={16} />
              </Link>
              <button type="button" onClick={() => remove(row)} className="p-2 border-2 border-brick text-brick rounded-full hover:bg-brick hover:text-paper" aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
