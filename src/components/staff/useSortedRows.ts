'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Table = 'syllabus_artists' | 'quiz_questions' | 'manifesto_rules';
type Row = { id: string; sort: number; published: boolean };

/** Load a hand-ordered table and offer the list actions every staff page needs. */
export function useSortedRows<T extends Row>(table: Table) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await createClient().from(table).select('*').order('sort');
    if (error) setError(error.message);
    setRows((data as unknown as T[] | null) ?? []);
  }, [table]);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .from(table)
      .select('*')
      .order('sort')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        setRows((data as unknown as T[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [table]);

  /** Swap a row with its neighbour. */
  const move = async (index: number, delta: -1 | 1) => {
    const list = rows ?? [];
    const a = list[index];
    const b = list[index + delta];
    if (!a || !b) return;
    const supabase = createClient();
    // equal sort values can't be swapped meaningfully, so spread them first
    const [sa, sb] = a.sort === b.sort ? [a.sort + delta, a.sort] : [b.sort, a.sort];
    await Promise.all([
      supabase.from(table).update({ sort: sa }).eq('id', a.id),
      supabase.from(table).update({ sort: sb }).eq('id', b.id),
    ]);
    load();
  };

  const setPublished = async (row: T, published: boolean) => {
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, published } : r)) ?? null);
    const { error } = await createClient().from(table).update({ published }).eq('id', row.id);
    if (error) {
      setError(error.message);
      load();
    }
  };

  const remove = async (row: T, label: string) => {
    if (!confirm(`Delete “${label}”? This can’t be undone.`)) return;
    const { error } = await createClient().from(table).delete().eq('id', row.id);
    if (error) setError(error.message);
    load();
  };

  /** Insert (when id is 'new') or update one row. Returns true on success. */
  const save = async (id: string | 'new', payload: Record<string, unknown>) => {
    const supabase = createClient();
    const { error } =
      id === 'new'
        ? await supabase.from(table).insert({ ...payload, sort: ((rows ?? []).at(-1)?.sort ?? 0) + 10 } as never)
        : await supabase.from(table).update(payload as never).eq('id', id);
    if (error) {
      setError(error.message);
      return false;
    }
    setError(null);
    load();
    return true;
  };

  return { rows, error, setError, move, setPublished, remove, save };
}
