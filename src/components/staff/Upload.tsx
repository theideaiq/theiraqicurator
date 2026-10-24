'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, inputClass } from './ui';

const BUCKET = 'museum-assets';

/**
 * Uploads to the public `museum-assets` bucket and hands back the URL.
 * A pasted URL works too, for media hosted elsewhere.
 */
export function Upload({
  value,
  onChange,
  accept,
  folder,
  kind,
}: {
  value: string;
  onChange: (url: string) => void;
  accept: string;
  folder: string;
  kind: 'image' | 'audio';
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '31536000' });
    if (uploadError) {
      setError(uploadError.message);
    } else {
      onChange(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }
    setBusy(false);
  };

  return (
    <div className="border-2 border-ink bg-paper-2/60 p-3 flex flex-col gap-3">
      {value && kind === 'image' && (
        <img src={value} alt="" className="w-full max-h-64 object-contain bg-paper border-2 border-ink" />
      )}
      {value && kind === 'audio' && <audio controls src={value} className="w-full" />}
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-full bg-ink text-paper font-mono text-xs uppercase hover:bg-lapis">
          {busy ? 'Uploading…' : value ? `Replace ${kind}` : `Upload ${kind}`}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = '';
            }}
          />
        </label>
        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange('')}>
            Remove
          </Button>
        )}
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a URL"
        className={inputClass}
      />
      {error && <p className="text-xs text-brick">{error}</p>}
    </div>
  );
}
