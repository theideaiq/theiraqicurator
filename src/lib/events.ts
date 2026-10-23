'use client';

import { useEffect, useState } from 'react';
import { TIMETABLE, type ClassSession } from './content';
import { getSupabase } from './supabase';
import type { Tables } from './supabase/types';

export function rowToSession(row: Tables<'events'>): ClassSession {
  return {
    id: row.slug,
    kind: row.kind as ClassSession['kind'],
    title: { en: row.title_en, ar: row.title_ar || row.title_en },
    blurb: { en: row.blurb_en, ar: row.blurb_ar || row.blurb_en },
    venue: { en: row.venue_en, ar: row.venue_ar || row.venue_en },
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    partners: row.partners?.length ? row.partners : undefined,
    color: row.color as ClassSession['color'],
    link: row.link_url,
  };
}

/**
 * The timetable lives in Supabase (`events`) and is edited from /admin.
 * Until that table has rows, the built-in list keeps the page populated.
 */
export function useSessions() {
  const [sessions, setSessions] = useState<ClassSession[]>(TIMETABLE);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .then(({ data }) => {
        if (!cancelled && data && data.length > 0) setSessions(data.map(rowToSession));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return sessions;
}
