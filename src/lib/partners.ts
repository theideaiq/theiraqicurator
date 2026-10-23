'use client';

import { useEffect, useState } from 'react';
import { PARTNERS, type Partner, type PartnerKind } from './content';
import { getSupabase } from './supabase';

/** Partners from Supabase, falling back to the built-in list until the table has rows. */
export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('partners')
      .select('*')
      .eq('published', true)
      .order('sort')
      .then(({ data }) => {
        if (cancelled || !data?.length) return;
        setPartners(
          data.map((row) => ({
            id: row.id,
            name: { en: row.name_en, ar: row.name_ar || row.name_en },
            kind: row.kind as PartnerKind,
            url: row.url,
            note: { en: row.note_en, ar: row.note_ar || row.note_en },
          }))
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return partners;
}
