'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';
import { Button, Empty, ErrorNote, Field, PageTitle, Pill, Toggle, inputClass } from '@/components/staff/ui';

type Row = Tables<'partners'>;
type Form = Pick<Row, 'name_en' | 'name_ar' | 'kind' | 'note_en' | 'note_ar' | 'published'> & { url: string };

const KINDS = [
  ['creative', 'Creative partner'],
  ['sponsor', 'Sponsor'],
  ['institution', 'Institution'],
  ['platform', 'Platform'],
] as const;

const BLANK: Form = { name_en: '', name_ar: '', kind: 'creative', url: '', note_en: '', note_ar: '', published: true };

export default function PartnersPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Form>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRows = () => createClient().from('partners').select('*').order('sort');
  const apply = ({ data, error }: Awaited<ReturnType<typeof fetchRows>>) => {
    if (error) setError(error.message);
    setRows(data ?? []);
  };
  const load = () => fetchRows().then(apply);

  useEffect(() => {
    fetchRows().then(apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const edit = (row: Row | null) => {
    setError(null);
    setEditing(row ? row.id : 'new');
    setForm(row ? { name_en: row.name_en, name_ar: row.name_ar, kind: row.kind, url: row.url ?? '', note_en: row.note_en, note_ar: row.note_ar, published: row.published } : BLANK);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = { ...form, url: form.url || null };
    const { error } =
      editing === 'new'
        ? await supabase.from('partners').insert({ ...payload, sort: ((rows ?? []).at(-1)?.sort ?? 0) + 10 })
        : await supabase.from('partners').update(payload).eq('id', editing!);
    setSaving(false);
    if (error) return setError(error.message);
    setEditing(null);
    load();
  };

  const move = async (index: number, delta: -1 | 1) => {
    const list = rows ?? [];
    const a = list[index];
    const b = list[index + delta];
    if (!a || !b) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from('partners').update({ sort: b.sort }).eq('id', a.id),
      supabase.from('partners').update({ sort: a.sort }).eq('id', b.id),
    ]);
    load();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Remove ${row.name_en} from the partners?`)) return;
    await createClient().from('partners').delete().eq('id', row.id);
    load();
  };

  return (
    <div>
      <PageTitle kicker="Classmates" title="Partners">
        <Button onClick={() => edit(null)}>+ Add partner</Button>
      </PageTitle>
      <ErrorNote message={error} />

      {editing && (
        <form onSubmit={save} className="mb-10 border-2 border-ink bg-paper-2 hard-shadow p-5 md:p-8 grid md:grid-cols-2 gap-5">
          <Field label="Name · English">
            {(id) => <input id={id} required value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Name · العربية">
            {(id) => <input id={id} dir="rtl" value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Kind">
            {(id) => (
              <select id={id} value={form.kind} onChange={(e) => set('kind', e.target.value)} className={inputClass}>
                {KINDS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Link (website or Instagram)">
            {(id) => <input id={id} type="url" value={form.url} onChange={(e) => set('url', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Note · English" hint="e.g. which exhibition they supported">
            {(id) => <input id={id} value={form.note_en} onChange={(e) => set('note_en', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Note · العربية">
            {(id) => <input id={id} dir="rtl" value={form.note_ar} onChange={(e) => set('note_ar', e.target.value)} className={inputClass} />}
          </Field>
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
            <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Show on site" />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save partner'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {rows && rows.length === 0 && !error && <Empty>No partners in the database yet — the site shows its built-in list.</Empty>}

      <ul className="border-t-2 border-ink">
        {rows?.map((row, i) => (
          <li key={row.id} className="border-b-2 border-ink py-3 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-20" aria-label="Move up">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="p-1 disabled:opacity-20" aria-label="Move down">
                <ArrowDown size={14} />
              </button>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2 mb-1">
                <Pill tone="muted">{KINDS.find(([k]) => k === row.kind)?.[1] ?? row.kind}</Pill>
                {!row.published && <Pill tone="draft">Hidden</Pill>}
              </div>
              <p className="font-display text-2xl leading-tight truncate">
                {row.name_en}
                {row.name_ar && row.name_ar !== row.name_en && (
                  <span className="font-arabic text-lg text-ink/60 ml-3" dir="rtl" lang="ar">
                    {row.name_ar}
                  </span>
                )}
              </p>
              <p className="font-mono text-[10px] uppercase text-ink/50 truncate">{[row.note_en, row.url].filter(Boolean).join(' · ') || '—'}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => edit(row)} className="p-2 border-2 border-ink rounded-full hover:bg-saffron" aria-label="Edit">
                <Pencil size={16} />
              </button>
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
