'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, ErrorNote, Field, PageTitle, Toggle, inputClass, slugify } from '@/components/admin/ui';

const KINDS = ['exhibition', 'workshop', 'talk', 'screening'] as const;
const COLORS = [
  ['rose', 'bg-rose'],
  ['saffron', 'bg-saffron'],
  ['teal', 'bg-teal'],
  ['lapis', 'bg-lapis'],
  ['brick', 'bg-brick'],
] as const;

type Form = {
  slug: string;
  kind: string;
  color: string;
  title_en: string;
  title_ar: string;
  blurb_en: string;
  blurb_ar: string;
  venue_en: string;
  venue_ar: string;
  starts_local: string;
  duration_minutes: number;
  partners: string;
  link_url: string;
  published: boolean;
};

const BLANK: Form = {
  slug: '',
  kind: 'exhibition',
  color: 'saffron',
  title_en: '',
  title_ar: '',
  blurb_en: '',
  blurb_ar: '',
  venue_en: '',
  venue_ar: '',
  starts_local: '',
  duration_minutes: 120,
  partners: '',
  link_url: '',
  published: true,
};

// Times are entered and shown in Baghdad time (UTC+3, no daylight saving).
const toBaghdadInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + 3 * 3600_000);
  return d.toISOString().slice(0, 16);
};
const fromBaghdadInput = (local: string) => (local ? new Date(`${local}:00+03:00`).toISOString() : null);

export default function EventEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const [form, setForm] = useState<Form>(BLANK);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    createClient()
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        if (data)
          setForm({
            slug: data.slug,
            kind: data.kind,
            color: data.color,
            title_en: data.title_en,
            title_ar: data.title_ar,
            blurb_en: data.blurb_en,
            blurb_ar: data.blurb_ar,
            venue_en: data.venue_en,
            venue_ar: data.venue_ar,
            starts_local: toBaghdadInput(data.starts_at),
            duration_minutes: data.duration_minutes,
            partners: (data.partners ?? []).join(', '),
            link_url: data.link_url ?? '',
            published: data.published,
          });
        setLoading(false);
      });
  }, [id, isNew]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { starts_local, partners, link_url, ...rest } = form;
    const payload = {
      ...rest,
      slug: form.slug || slugify(form.title_en),
      starts_at: fromBaghdadInput(starts_local),
      partners: partners
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
      link_url: link_url || null,
    };
    const supabase = createClient();
    const { error } = isNew ? await supabase.from('events').insert(payload) : await supabase.from('events').update(payload).eq('id', id);
    setSaving(false);
    if (error) setError(error.code === '23505' ? 'That slug is already used by another session.' : error.message);
    else router.push('/admin/timetable');
  };

  const remove = async () => {
    if (!confirm('Delete this session from the timetable?')) return;
    await createClient().from('events').delete().eq('id', id);
    router.replace('/admin/timetable');
  };

  if (loading) return <p className="font-mono text-xs uppercase">Finding the chalk…</p>;

  const pair = (key: 'title' | 'blurb' | 'venue', label: string, multiline = false) => (
    <div className="grid md:grid-cols-2 gap-4">
      {(['en', 'ar'] as const).map((lang) => {
        const k = `${key}_${lang}` as const;
        return (
          <Field key={lang} label={`${label} · ${lang === 'en' ? 'English' : 'العربية'}`}>
            {(fid) =>
              multiline ? (
                <textarea id={fid} dir={lang === 'ar' ? 'rtl' : 'ltr'} rows={3} value={form[k]} onChange={(e) => set(k, e.target.value)} className={inputClass} />
              ) : (
                <input
                  id={fid}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  required={k === 'title_en'}
                  value={form[k]}
                  onChange={(e) => {
                    set(k, e.target.value);
                    if (k === 'title_en' && !slugTouched) set('slug', slugify(e.target.value));
                  }}
                  className={inputClass}
                />
              )
            }
          </Field>
        );
      })}
    </div>
  );

  return (
    <form onSubmit={save}>
      <PageTitle kicker={isNew ? 'New session' : 'Edit session'} title={form.title_en || 'Untitled'}>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/timetable')}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </PageTitle>
      <ErrorNote message={error} />

      <div className="grid xl:grid-cols-[1fr_20rem] gap-10 mt-4">
        <div className="flex flex-col gap-6">
          {pair('title', 'Title')}
          {pair('blurb', 'Blurb', true)}
          {pair('venue', 'Venue')}
          <Field label="Partners" hint="Comma separated.">
            {(fid) => <input id={fid} value={form.partners} onChange={(e) => set('partners', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Link (tickets, Instagram post…)">
            {(fid) => <input id={fid} type="url" value={form.link_url} onChange={(e) => set('link_url', e.target.value)} className={inputClass} />}
          </Field>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="border-2 border-ink bg-paper-2 p-4">
            <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Show on site" />
          </div>
          <Field label="Starts (Baghdad time)" hint="Leave empty for “date TBA”.">
            {(fid) => <input id={fid} type="datetime-local" value={form.starts_local} onChange={(e) => set('starts_local', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Duration (minutes)">
            {(fid) => (
              <input id={fid} type="number" min={15} step={15} value={form.duration_minutes} onChange={(e) => set('duration_minutes', Number(e.target.value))} className={inputClass} />
            )}
          </Field>
          <Field label="Kind">
            {(fid) => (
              <select id={fid} value={form.kind} onChange={(e) => set('kind', e.target.value)} className={inputClass}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <fieldset>
            <legend className="font-mono text-[11px] uppercase text-ink/70 mb-1.5">Colour</legend>
            <div className="flex gap-2">
              {COLORS.map(([name, cls]) => (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={form.color === name}
                  onClick={() => set('color', name)}
                  className={`w-10 h-10 rounded-full border-2 border-ink ${cls} ${form.color === name ? 'ring-4 ring-ink/30 scale-110' : ''}`}
                />
              ))}
            </div>
          </fieldset>
          <Field label="Slug">
            {(fid) => (
              <input
                id={fid}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                className={`${inputClass} font-mono`}
              />
            )}
          </Field>
          {!isNew && (
            <Button type="button" variant="danger" onClick={remove}>
              Delete session
            </Button>
          )}
        </aside>
      </div>
    </form>
  );
}
