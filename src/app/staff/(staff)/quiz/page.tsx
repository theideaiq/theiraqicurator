'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Tables } from '@/lib/supabase/types';
import { useSortedRows } from '@/components/staff/useSortedRows';
import { RowControls } from '@/components/staff/RowControls';
import { Button, Empty, ErrorNote, Field, PageTitle, Pill, inputClass } from '@/components/staff/ui';

type Question = Tables<'quiz_questions'>;
type Option = { en: string; ar: string };
type Form = { question_en: string; question_ar: string; options: Option[]; answer: number; why_en: string; why_ar: string };

const BLANK: Form = {
  question_en: '',
  question_ar: '',
  options: [
    { en: '', ar: '' },
    { en: '', ar: '' },
  ],
  answer: 0,
  why_en: '',
  why_ar: '',
};
const LETTERS = ['A', 'B', 'C', 'D'];

const asOptions = (value: unknown): Option[] =>
  Array.isArray(value) ? value.map((o) => ({ en: String(o?.en ?? ''), ar: String(o?.ar ?? '') })) : [];

export default function QuizAdmin() {
  const { rows, error, setError, move, setPublished, remove, save } = useSortedRows<Question>('quiz_questions');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Form>(BLANK);
  const [saving, setSaving] = useState(false);

  const edit = (row: Question | null) => {
    setEditing(row ? row.id : 'new');
    setForm(
      row
        ? { question_en: row.question_en, question_ar: row.question_ar, options: asOptions(row.options), answer: row.answer, why_en: row.why_en, why_ar: row.why_ar }
        : BLANK
    );
  };

  const setOption = (i: number, key: keyof Option, value: string) =>
    setForm((f) => ({ ...f, options: f.options.map((o, j) => (j === i ? { ...o, [key]: value } : o)) }));

  const removeOption = (i: number) =>
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, j) => j !== i),
      // keep the same option marked correct, or fall back to the first
      answer: f.answer === i ? 0 : f.answer > i ? f.answer - 1 : f.answer,
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = form.options.filter((o) => o.en.trim());
    if (options.length < 2) return setError('A question needs at least two choices.');
    if (!form.options[form.answer]?.en.trim()) return setError('Pick which choice is correct.');
    setSaving(true);
    const answer = options.indexOf(form.options[form.answer]);
    if (await save(editing!, { ...form, options, answer })) setEditing(null);
    setSaving(false);
  };

  return (
    <div>
      <PageTitle kicker="Pop quiz" title="Quiz">
        <a href="/#quiz" target="_blank" className="px-4 py-2.5 rounded-full border-2 border-ink font-mono text-xs uppercase hover:bg-saffron">
          Take it ↗
        </a>
        <Button onClick={() => edit(null)}>+ Add question</Button>
      </PageTitle>
      <ErrorNote message={error} />

      {editing && (
        <form onSubmit={submit} className="mb-10 border-2 border-ink bg-paper-2 hard-shadow p-5 md:p-8 flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Question · English">
              {(id) => <input id={id} required value={form.question_en} onChange={(e) => setForm({ ...form, question_en: e.target.value })} className={inputClass} />}
            </Field>
            <Field label="Question · العربية">
              {(id) => <input id={id} dir="rtl" value={form.question_ar} onChange={(e) => setForm({ ...form, question_ar: e.target.value })} className={inputClass} />}
            </Field>
          </div>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase text-ink/70 mb-2">Choices — tick the correct one</legend>
            <div className="flex flex-col gap-2">
              {form.options.map((o, i) => (
                <div key={i} className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-2 items-center p-2 border-2 ${form.answer === i ? 'border-teal bg-teal/10' : 'border-transparent'}`}>
                  <label className="flex items-center gap-2 font-mono text-xs cursor-pointer">
                    <input type="radio" name="answer" checked={form.answer === i} onChange={() => setForm({ ...form, answer: i })} className="w-4 h-4 accent-teal" />
                    {LETTERS[i]}
                  </label>
                  <input aria-label={`Choice ${LETTERS[i]} in English`} placeholder="English" value={o.en} onChange={(e) => setOption(i, 'en', e.target.value)} className={inputClass} />
                  <input aria-label={`Choice ${LETTERS[i]} in Arabic`} placeholder="العربية" dir="rtl" value={o.ar} onChange={(e) => setOption(i, 'ar', e.target.value)} className={`${inputClass} col-start-2 md:col-start-auto`} />
                  <button type="button" onClick={() => removeOption(i)} disabled={form.options.length <= 2} className="p-2 disabled:opacity-20 row-start-1 col-start-3 md:row-auto md:col-auto" aria-label={`Remove choice ${LETTERS[i]}`}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {form.options.length < 4 && (
              <button type="button" onClick={() => setForm({ ...form, options: [...form.options, { en: '', ar: '' }] })} className="mt-2 inline-flex items-center gap-1 font-mono text-xs uppercase underline underline-offset-4">
                <Plus size={14} /> Add a choice
              </button>
            )}
          </fieldset>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Why · English" hint="Shown after answering.">
              {(id) => <textarea id={id} rows={2} value={form.why_en} onChange={(e) => setForm({ ...form, why_en: e.target.value })} className={inputClass} />}
            </Field>
            <Field label="Why · العربية">
              {(id) => <textarea id={id} dir="rtl" rows={2} value={form.why_ar} onChange={(e) => setForm({ ...form, why_ar: e.target.value })} className={inputClass} />}
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save question'}</Button>
          </div>
        </form>
      )}

      {rows && rows.length === 0 && !error && <Empty>No questions in the database yet — the site shows its built-in quiz.</Empty>}

      <ol className="flex flex-col gap-3">
        {rows?.map((row, i) => {
          const options = asOptions(row.options);
          return (
            <li key={row.id} className={`border-2 border-ink bg-paper p-4 flex gap-4 items-start ${row.published ? '' : 'opacity-60'}`}>
              <span className="font-mono text-xs w-8 shrink-0 pt-1">Q{i + 1}</span>
              <div className="min-w-0 flex-1">
                {!row.published && <Pill tone="draft">Hidden</Pill>}
                <p className="font-display text-2xl leading-tight">{row.question_en}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {options.map((o, j) => (
                    <li key={j} className={`px-2 py-0.5 rounded-full border font-mono text-[11px] ${j === row.answer ? 'bg-teal text-paper border-teal' : 'border-ink/30'}`}>
                      {LETTERS[j]}. {o.en}
                    </li>
                  ))}
                </ul>
              </div>
              <RowControls
                index={i}
                count={rows.length}
                published={row.published}
                onMove={(d) => move(i, d)}
                onToggle={() => setPublished(row, !row.published)}
                onEdit={() => edit(row)}
                onDelete={() => remove(row, row.question_en)}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
