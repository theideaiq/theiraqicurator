'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Upload } from '@/components/staff/Upload';
import { Button, ErrorNote, Field, PageTitle, Toggle, inputClass } from '@/components/staff/ui';

type Form = {
  title: string;
  artist: string;
  description: string;
  image_url: string;
  audio_url: string;
  language: string;
  is_featured: boolean;
  position_x: string;
  position_y: string;
  position_z: string;
};

const BLANK: Form = {
  title: '',
  artist: '',
  description: '',
  image_url: '',
  audio_url: '',
  language: 'both',
  is_featured: false,
  position_x: '',
  position_y: '',
  position_z: '',
};

const num = (v: string) => (v.trim() === '' ? null : Number(v));

export default function ArtworkEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const [form, setForm] = useState<Form>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    createClient()
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        if (data)
          setForm({
            title: data.title,
            artist: data.artist,
            description: data.description ?? '',
            image_url: data.image_url,
            audio_url: data.audio_url ?? '',
            language: data.language ?? 'both',
            is_featured: !!data.is_featured,
            position_x: data.position_x?.toString() ?? '',
            position_y: data.position_y?.toString() ?? '',
            position_z: data.position_z?.toString() ?? '',
          });
        setLoading(false);
      });
  }, [id, isNew]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      setError('Every work needs an image.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title,
      artist: form.artist,
      description: form.description || null,
      image_url: form.image_url,
      audio_url: form.audio_url || null,
      language: form.language,
      is_featured: form.is_featured,
      position_x: num(form.position_x),
      position_y: num(form.position_y),
      position_z: num(form.position_z),
    };
    const supabase = createClient();
    const { error } = isNew ? await supabase.from('artworks').insert(payload) : await supabase.from('artworks').update(payload).eq('id', id);
    setSaving(false);
    if (error) setError(error.message);
    else router.push('/staff/artworks');
  };

  const remove = async () => {
    if (!confirm('Take this work off the wall for good?')) return;
    await createClient().from('artworks').delete().eq('id', id);
    router.replace('/staff/artworks');
  };

  if (loading) return <p className="font-mono text-xs uppercase">Fetching the ladder…</p>;

  return (
    <form onSubmit={save}>
      <PageTitle kicker={isNew ? 'New acquisition' : 'Wall label'} title={form.title || 'Untitled'}>
        <Button type="button" variant="ghost" onClick={() => router.push('/staff/artworks')}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Hanging…' : 'Save'}
        </Button>
      </PageTitle>
      <ErrorNote message={error} />

      <div className="grid lg:grid-cols-2 gap-10 mt-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase text-ink/70">Image *</span>
            <Upload kind="image" accept="image/*" folder="artworks" value={form.image_url} onChange={(url) => set('image_url', url)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase text-ink/70">Audio guide (plays when a visitor clicks the work)</span>
            <Upload kind="audio" accept="audio/*" folder="audio" value={form.audio_url} onChange={(url) => set('audio_url', url)} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Field label="Title">
            {(fid) => <input id={fid} dir="auto" required value={form.title} onChange={(e) => set('title', e.target.value)} className={`${inputClass} font-display !text-2xl`} />}
          </Field>
          <Field label="Artist">
            {(fid) => <input id={fid} dir="auto" required value={form.artist} onChange={(e) => set('artist', e.target.value)} className={inputClass} />}
          </Field>
          <Field label="Curatorial description">
            {(fid) => <textarea id={fid} dir="auto" rows={8} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} leading-7`} />}
          </Field>
          <div className="flex flex-wrap gap-6 items-center">
            <Toggle checked={form.is_featured} onChange={(v) => set('is_featured', v)} label="Featured" />
            <Field label="Shown on" className="min-w-40">
              {(fid) => (
                <select id={fid} value={form.language} onChange={(e) => set('language', e.target.value)} className={inputClass}>
                  <option value="both">Both sites</option>
                  <option value="en">English site</option>
                  <option value="ar">Arabic site</option>
                </select>
              )}
            </Field>
          </div>
          <fieldset className="border-2 border-dashed border-ink/50 p-4">
            <legend className="font-mono text-[11px] uppercase px-1">Position in the 3D room (optional)</legend>
            <p className="text-xs text-ink/60 mb-3">
              Leave all three empty and the work is hung on a ring automatically. Set them on every work to compose the room by hand (the viewer
              stands at z = 15).
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['position_x', 'position_y', 'position_z'] as const).map((k) => (
                <Field key={k} label={k.slice(-1).toUpperCase()}>
                  {(fid) => <input id={fid} type="number" step="0.1" value={form[k]} onChange={(e) => set(k, e.target.value)} className={inputClass} />}
                </Field>
              ))}
            </div>
          </fieldset>
          {!isNew && (
            <Button type="button" variant="danger" onClick={remove}>
              Delete artwork
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
