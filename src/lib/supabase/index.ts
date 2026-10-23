import { createClient } from './client';

/**
 * Supabase is optional for local previews: without the public env vars the
 * pages render their empty states instead of crashing.
 */
export function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient();
}

export function readingMinutes(text: string | null | undefined) {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
