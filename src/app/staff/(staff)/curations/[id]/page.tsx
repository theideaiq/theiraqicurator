'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { readingMinutes } from '@/lib/supabase';
import { Upload } from '@/components/staff/Upload';
import { Button, ErrorNote, Field, PageTitle, Toggle, inputClass, slugify } from '@/components/staff/ui';

const BLANK = { title: '', slug: '', excerpt: '', content: '', image_url: '', language: 'both', published: false };

export default function CurationEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const [form, setForm] = useState(BLANK);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (isNew) return;
    createClient()
      .from('curations')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        if (data)
          setForm({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt ?? '',
            content: data.content,
            image_url: data.image_url ?? '',
            language: data.language ?? 'both',
            published: !!data.published,
          });
        setLoading(false);
      });
  }, [id, isNew]);

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = useCallback(
    async (overrides: Partial<typeof BLANK> = {}) => {
      const payload = { ...form, ...overrides, excerpt: form.excerpt || null, image_url: form.image_url || null, updated_at: new Date().toISOString() };
      if (!payload.title || !payload.slug || !payload.content) {
        setError('A curation needs a title, a slug and some content.');
        return;
      }
      setSaving(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = isNew
        ? await supabase.from('curations').insert(payload).select('id').single()
        : await supabase.from('curations').update(payload).eq('id', id).select('id').single();
      setSaving(false);
      if (error) {
        setError(error.code === '23505' ? 'That slug is already taken.' : error.message);
        return;
      }
      setForm((f) => ({ ...f, ...overrides }));
      setSavedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      if (isNew && data) router.replace(`/staff/curations/${data.id}`);
    },
    [form, id, isNew, router]
  );

  // ⌘S / Ctrl+S saves
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const remove = async () => {
    if (!confirm('Delete this curation for good?')) return;
    await createClient().from('curations').delete().eq('id', id);
    router.replace('/staff/curations');
  };

  if (loading) return <p className="font-mono text-xs uppercase">Opening the notebook…</p>;

  const words = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <PageTitle kicker={isNew ? 'New lesson' : form.published ? 'Live on the site' : 'Draft'} title={form.title || 'Untitled'}>
        {!isNew && form.published && (
          <a href={`/${form.language === 'ar' ? 'ar/' : ''}blog/${form.slug}`} target="_blank" className="px-4 py-2.5 rounded-full border-2 border-ink font-mono text-xs uppercase hover:bg-saffron">
            View ↗
          </a>
        )}
        <Button variant="ghost" onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="saffron" onClick={() => save({ published: !form.published })} disabled={saving}>
          {form.published ? 'Unpublish' : 'Publish'}
        </Button>
      </PageTitle>

      <ErrorNote message={error} />

      <div className="grid xl:grid-cols-[1fr_20rem] gap-10 mt-4">
        <div className="flex flex-col gap-6">
          <Field label="Title">
            {(fid) => (
              <input
                id={fid}
                dir="auto"
                value={form.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
                className={`${inputClass} font-display !text-3xl`}
              />
            )}
          </Field>
          <Field label="Excerpt" hint="One or two sentences shown on the list page.">
            {(fid) => <textarea id={fid} dir="auto" rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} className={inputClass} />}
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] uppercase text-ink/70">Content — blank line = new paragraph</span>
              <div className="flex rounded-full border-2 border-ink overflow-hidden font-mono text-[10px] uppercase">
                {(['Write', 'Preview'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setPreview(m === 'Preview')} className={`px-3 py-1 ${preview === (m === 'Preview') ? 'bg-ink text-paper' : ''}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {preview ? (
              <article dir="auto" className="border-2 border-ink bg-paper p-6 md:p-10 min-h-[24rem] space-y-5 text-lg leading-loose paper-lines">
                {form.content
                  .split(/\n{2,}/)
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
              </article>
            ) : (
              <textarea
                dir="auto"
                rows={22}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                className={`${inputClass} leading-8 text-base`}
                aria-label="Content"
              />
            )}
            <p className="mt-1 font-mono text-[10px] uppercase text-ink/50">
              {words} words · {readingMinutes(form.content)} min read
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="border-2 border-ink bg-paper-2 p-4 flex flex-col gap-4">
            <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Published" />
            <p className="font-mono text-[10px] uppercase text-ink/50">{savedAt ? `Saved at ${savedAt}` : '⌘S / Ctrl+S to save'}</p>
          </div>
          <Field label="Slug (URL)">
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
          <Field label="Shown on">
            {(fid) => (
              <select id={fid} value={form.language} onChange={(e) => set('language', e.target.value)} className={inputClass}>
                <option value="both">Both sites</option>
                <option value="en">English site</option>
                <option value="ar">Arabic site</option>
              </select>
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase text-ink/70">Cover image</span>
            <Upload kind="image" accept="image/*" folder="curations" value={form.image_url} onChange={(url) => set('image_url', url)} />
          </div>
          {!isNew && (
            <Button variant="danger" onClick={remove}>
              Delete curation
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
