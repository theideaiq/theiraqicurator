'use client';

import { useState } from 'react';
import type { Tables } from '@/lib/supabase/types';
import { useSortedRows } from '@/components/staff/useSortedRows';
import { RowControls } from '@/components/staff/RowControls';
import { Button, Empty, ErrorNote, Field, PageTitle, Pill, inputClass } from '@/components/staff/ui';

type Rule = Tables<'manifesto_rules'>;
const BLANK = { rule_en: '', rule_ar: '' };

export default function ManifestoAdmin() {
  const { rows, error, move, setPublished, remove, save } = useSortedRows<Rule>('manifesto_rules');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const edit = (row: Rule | null) => {
    setEditing(row ? row.id : 'new');
    setForm(row ? { rule_en: row.rule_en, rule_ar: row.rule_ar } : BLANK);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (await save(editing!, form)) setEditing(null);
    setSaving(false);
  };

  return (
    <div>
      <PageTitle kicker="House rules" title="Manifesto">
        <a href="/manifesto" target="_blank" className="px-4 py-2.5 rounded-full border-2 border-ink font-mono text-xs uppercase hover:bg-saffron">
          View page ↗
        </a>
        <Button onClick={() => edit(null)}>+ Add rule</Button>
      </PageTitle>
      <ErrorNote message={error} />

      {editing && (
        <form onSubmit={submit} className="mb-10 border-2 border-ink bg-paper-2 hard-shadow p-5 md:p-8 grid md:grid-cols-2 gap-5">
          <Field label="Rule · English">
            {(id) => <textarea id={id} required rows={3} value={form.rule_en} onChange={(e) => setForm({ ...form, rule_en: e.target.value })} className={`${inputClass} font-display !text-2xl`} />}
          </Field>
          <Field label="Rule · العربية">
            {(id) => <textarea id={id} dir="rtl" rows={3} value={form.rule_ar} onChange={(e) => setForm({ ...form, rule_ar: e.target.value })} className={`${inputClass} font-arabic !text-xl`} />}
          </Field>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save rule'}</Button>
          </div>
        </form>
      )}

      {rows && rows.length === 0 && !error && <Empty>No rules in the database yet — the site shows its built-in manifesto.</Empty>}

      <ol className="flex flex-col gap-3">
        {rows?.map((row, i) => (
          <li key={row.id} className={`border-2 border-ink bg-paper p-4 flex gap-4 items-start ${row.published ? '' : 'opacity-60'}`}>
            <span className="font-display text-4xl leading-none w-12 shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              {!row.published && <Pill tone="draft">Hidden</Pill>}
              <p className="font-display text-2xl leading-tight">{row.rule_en}</p>
              {row.rule_ar && <p className="mt-1 font-arabic text-lg text-ink/60" dir="rtl" lang="ar">{row.rule_ar}</p>}
            </div>
            <RowControls
              index={i}
              count={rows.length}
              published={row.published}
              onMove={(d) => move(i, d)}
              onToggle={() => setPublished(row, !row.published)}
              onEdit={() => edit(row)}
              onDelete={() => remove(row, row.rule_en)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
