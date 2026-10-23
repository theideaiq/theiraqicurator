'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { Empty, ErrorNote, PageTitle, Pill, formatDate } from '@/components/admin/ui';

type Note = Tables<'notes'>;

const TOPICS: Record<string, string> = { show: 'Show work', workshop: 'Workshop', collab: 'Collab', hi: 'Hi' };

export default function InboxPage() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setNotes(data ?? []);
      });
  }, []);

  const shown = useMemo(() => (notes ?? []).filter((n) => filter === 'all' || !n.read || n.id === open), [notes, filter, open]);

  const markRead = async (note: Note, read: boolean) => {
    setNotes((ns) => ns?.map((n) => (n.id === note.id ? { ...n, read } : n)) ?? null);
    await createClient().from('notes').update({ read }).eq('id', note.id);
  };

  const expand = (note: Note) => {
    setOpen(open === note.id ? null : note.id);
    if (!note.read) markRead(note, true);
  };

  const remove = async (note: Note) => {
    if (!confirm('Delete this note?')) return;
    setNotes((ns) => ns?.filter((n) => n.id !== note.id) ?? null);
    await createClient().from('notes').delete().eq('id', note.id);
  };

  const unread = (notes ?? []).filter((n) => !n.read).length;

  return (
    <div>
      <PageTitle kicker="Passed notes" title="Inbox">
        <div className="flex rounded-full border-2 border-ink overflow-hidden font-mono text-xs uppercase">
          {(['unread', 'all'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`px-4 py-2 ${filter === f ? 'bg-ink text-paper' : 'hover:bg-saffron'}`}>
              {f === 'unread' ? `Unread (${unread})` : 'All'}
            </button>
          ))}
        </div>
      </PageTitle>
      <ErrorNote message={error} />
      {notes && shown.length === 0 && <Empty>{filter === 'unread' ? 'All caught up. Go make some art.' : 'No notes yet.'}</Empty>}

      <ul className="flex flex-col gap-4">
        {shown.map((note, i) => (
          <li
            key={note.id}
            className={`border-2 border-ink ${note.read ? 'bg-paper' : 'bg-saffron/30'} ${open === note.id ? 'hard-shadow' : ''}`}
            style={{ rotate: open === note.id ? '0deg' : `${(i % 2 ? 1 : -1) * 0.4}deg` }}
          >
            <button type="button" onClick={() => expand(note)} className="w-full text-start p-4 grid grid-cols-[1fr_auto] gap-4" aria-expanded={open === note.id}>
              <span className="min-w-0">
                <span className="flex flex-wrap gap-2 mb-1">
                  {!note.read && <Pill tone="alert">New</Pill>}
                  <Pill tone="muted">{TOPICS[note.topic] ?? note.topic}</Pill>
                </span>
                <span className="block font-display text-2xl leading-tight">{note.name}</span>
                <span dir="auto" className={`block text-sm text-ink/70 ${open === note.id ? '' : 'truncate'}`}>
                  {open === note.id ? '' : note.message}
                </span>
              </span>
              <span className="font-mono text-[10px] uppercase text-ink/50 whitespace-nowrap">{formatDate(note.created_at)}</span>
            </button>
            {open === note.id && (
              <div className="px-4 pb-4">
                <p dir="auto" className="whitespace-pre-line leading-7 border-t-2 border-dashed border-ink/40 pt-4">
                  {note.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs uppercase">
                  {note.email && (
                    <a href={`mailto:${note.email}?subject=${encodeURIComponent('Re: your note to The Iraqi Curator')}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-paper hover:bg-lapis">
                      <Mail size={14} /> Reply to {note.email}
                    </a>
                  )}
                  <button type="button" onClick={() => markRead(note, false)} className="px-4 py-2 rounded-full border-2 border-ink hover:bg-saffron uppercase">
                    Mark unread
                  </button>
                  <button type="button" onClick={() => remove(note)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-brick text-brick hover:bg-brick hover:text-paper uppercase">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
