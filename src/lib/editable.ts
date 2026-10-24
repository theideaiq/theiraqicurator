'use client';

import { useEffect, useState } from 'react';
import {
  MANIFESTO,
  QUIZ,
  SYLLABUS,
  type Artist,
  type Bilingual,
  type Discipline,
  type QuizQuestion,
} from './content';
import { getSupabase } from './supabase';

/*
 * The syllabus, pop quiz and manifesto are edited from /staff. Each hook
 * starts with the built-in copy in content.ts and swaps in the database
 * rows once they load, so pages render instantly and still work if the
 * tables are empty or unreachable.
 */

type Table = 'syllabus_artists' | 'quiz_questions' | 'manifesto_rules';

function usePublished<T>(table: Table, fallback: T[], map: (row: Record<string, unknown>) => T | null): T[] {
  const [items, setItems] = useState<T[]>(fallback);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from(table)
      .select('*')
      .eq('published', true)
      .order('sort')
      .then(({ data }) => {
        if (cancelled || !data?.length) return;
        const mapped = (data as Record<string, unknown>[]).map(map).filter((x): x is T => x !== null);
        if (mapped.length) setItems(mapped);
      });
    return () => {
      cancelled = true;
    };
    // `map` is a module-level function; the table never changes per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return items;
}

const both = (en: unknown, ar: unknown): Bilingual => ({ en: String(en ?? ''), ar: String(ar || en || '') });

const toArtist = (row: Record<string, unknown>): Artist => ({
  id: String(row.id),
  name: both(row.name_en, row.name_ar),
  years: String(row.years ?? ''),
  disciplines: (row.disciplines as Discipline[] | null) ?? [],
  note: both(row.note_en, row.note_ar),
});

const toQuestion = (row: Record<string, unknown>): QuizQuestion | null => {
  const options = Array.isArray(row.options) ? (row.options as { en?: string; ar?: string }[]) : [];
  const answer = Number(row.answer ?? 0);
  // a question needs at least two choices and an answer that exists
  if (options.length < 2 || answer < 0 || answer >= options.length) return null;
  return {
    q: both(row.question_en, row.question_ar),
    options: options.map((o) => both(o.en, o.ar)),
    answer,
    why: both(row.why_en, row.why_ar),
  };
};

const toRule = (row: Record<string, unknown>): Bilingual => both(row.rule_en, row.rule_ar);

export const useSyllabus = () => usePublished('syllabus_artists', SYLLABUS, toArtist);
export const useQuiz = () => usePublished('quiz_questions', QUIZ, toQuestion);
export const useManifesto = () => usePublished('manifesto_rules', MANIFESTO, toRule);
