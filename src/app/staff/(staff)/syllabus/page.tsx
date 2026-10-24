'use client';

import { useState } from 'react';
import type { Tables } from '@/lib/supabase/types';
import { DISCIPLINES, type Discipline } from '@/lib/content';
import { useSortedRows } from '@/components/staff/useSortedRows';
import { RowControls } from '@/components/staff/RowControls';
import { Button, Empty, ErrorNote, Field, PageTitle, Pill, inputClass } from '@/components/staff/ui';

type Artist = Tables<'syllabus_artists'>;
type Form = Pick<Artist, 'name_en' | 'name_ar' | 'years' | 'disciplines' | 'note_en' | 'note_ar'>;
const BLANK: Form = { name_en: '', name_ar: '', years: '', disciplines: [], note_en: '', note_ar: '' };

export default function SyllabusAdmin() {
  const { rows, error, move, setPublished, remove, save } = useSortedRows<Artist>('syllabus_artists');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Form>(BLANK);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const edit = (row: Artist | null) => {
    setEditing(row ? row.id : 'new');
    setForm(row ? { name_en: row.name_en, name_ar: row.name_ar, years: row.years, disciplines: row.disciplines, note_en: row.note_en, note_ar: row.note_ar } : BLANK);
  };

  const toggleDiscipline = (d: Discipline) =>
    set('disciplines', form.disciplines.includes(d) ? form.disciplines.filter((x) => x !== d) : [...form.disciplines, d]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (await save(editing!, form)) setEditing(null);
    setSaving(false);
  };

  return (
    <div>
      <PageTitle kicker="Reading list" title="Syllabus">
        <a href="/syllabus" target="_blank" className="px-4 py-2.5 rounded-full border-2 border-ink font-mono text-xs uppercase hover:bg-saffron">
          View page ↗
        </a>
        <Button onClick={() => edit(null)}>+ Add artist</Button>
      </PageTitle>
      <ErrorNote message={error} />

      {editing && (
        <form onSubmit={submit} className="mb-10 border-2 border-ink bg-paper-2 hard-shadow p-5 md:p-8 grid md:grid-cols-2 gap-5">
          <Field label="Name · English">
            {(id) => <input id={id} required value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Name · العربية">
            {(id) => <input id={id} dir="rtl" value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Years" hint="e.g. 1919–1961, b. 1958, 13th c.">
            {(id) => <input id={id} value={form.years} onChange={(e) => set('years', e.target.value)} className={inputClass} />}
          </Field>
          <fieldset>
            <legend className="font-mono text-[11px] uppercase text-ink/70 mb-1.5">Disciplines</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DISCIPLINES) as Discipline[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={form.disciplines.includes(d)}
                  onClick={() => toggleDiscipline(d)}
                  className={`px-3 py-1.5 rounded-full border-2 border-ink font-mono text-xs uppercase ${form.disciplines.includes(d) ? 'bg-ink text-paper' : 'hover:bg-saffron'}`}
                >
                  {DISCIPLINES[d].en}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Note · English" hint="One or two sentences.">
            {(id) => <textarea id={id} rows={3} value={form.note_en} onChange={(e) => set('note_en', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Note · العربية">
            {(id) => <textarea id={id} dir="rtl" rows={3} value={form.note_ar} onChange={(e) => set('note_ar', e.target.value)} className={inputClass} />}
          </Field>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save artist'}</Button>
          </div>
        </form>
      )}

      {rows && rows.length === 0 && !error && <Empty>No artists in the database yet — the site shows its built-in syllabus.</Empty>}

      <ul className="border-t-2 border-ink">
        {rows?.map((row, i) => (
          <li key={row.id} className={`border-b-2 border-ink py-3 flex gap-4 items-center ${row.published ? '' : 'opacity-60'}`}>
            <span className="font-mono text-xs w-8 shrink-0">№{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1 mb-1">
                {!row.published && <Pill tone="draft">Hidden</Pill>}
                {row.disciplines.map((d) => (
                  <Pill key={d} tone="muted">{DISCIPLINES[d as Discipline]?.en ?? d}</Pill>
                ))}
              </div>
              <p className="font-display text-2xl leading-tight truncate">
                {row.name_en}
                {row.name_ar && <span className="font-arabic text-lg text-ink/60 ml-3" dir="rtl" lang="ar">{row.name_ar}</span>}
              </p>
              <p className="font-mono text-[10px] uppercase text-ink/50 truncate">{row.years}{row.note_en && ` · ${row.note_en}`}</p>
            </div>
            <RowControls
              index={i}
              count={rows.length}
              published={row.published}
              onMove={(d) => move(i, d)}
              onToggle={() => setPublished(row, !row.published)}
              onEdit={() => edit(row)}
              onDelete={() => remove(row, row.name_en)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
