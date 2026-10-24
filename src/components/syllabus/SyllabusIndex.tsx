'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { DISCIPLINES, pick, type Discipline } from '@/lib/content';
import { useSyllabus } from '@/lib/editable';

const TINTS = ['bg-paper', 'bg-saffron/40', 'bg-rose/30', 'bg-teal/25', 'bg-lapis/15'];

export function SyllabusIndex() {
  const t = useTranslations('Syllabus');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<Discipline | 'all'>('all');
  const syllabus = useSyllabus();

  const artists = useMemo(() => {
    const q = query.trim().toLowerCase();
    return syllabus.filter((a) => {
      if (discipline !== 'all' && !a.disciplines.includes(discipline)) return false;
      if (!q) return true;
      return [a.name.en, a.name.ar, a.note.en, a.note.ar].some((s) => s.toLowerCase().includes(q));
    });
  }, [query, discipline, syllabus]);

  const wiki = (name: string) =>
    `https://${locale === 'ar' ? 'ar' : 'en'}.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between mb-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search')}
          aria-label={t('search')}
          className="w-full lg:max-w-md bg-transparent border-b-2 border-ink py-2 font-display text-3xl placeholder:text-ink/30 focus:outline-none focus:border-lapis"
        />
        <div className="flex flex-wrap gap-2 font-mono text-xs uppercase">
          {(['all', ...Object.keys(DISCIPLINES)] as (Discipline | 'all')[]).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={discipline === d}
              onClick={() => setDiscipline(d)}
              className={`px-3 py-1.5 rounded-full border-2 border-ink ${discipline === d ? 'bg-ink text-paper' : 'hover:bg-saffron'}`}
            >
              {d === 'all' ? t('all') : pick(DISCIPLINES[d], locale)}
            </button>
          ))}
        </div>
      </div>

      <p className="font-mono text-xs uppercase text-ink/60 mb-6" aria-live="polite">
        {artists.length} {t('count')}
      </p>

      <motion.ul layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {artists.map((a, i) => (
            <motion.li
              layout
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, rotate: ((i % 3) - 1) * 0.8 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ rotate: 0, y: -6 }}
              className={`relative border-2 border-ink ${TINTS[i % TINTS.length]} p-6 flex flex-col min-h-[17rem]`}
            >
              {/* index-card header line */}
              <div className="flex items-center justify-between font-mono text-[11px] uppercase border-b-2 border-brick/70 pb-2">
                <span>№ {String(syllabus.indexOf(a) + 1).padStart(2, '0')}</span>
                <span>{a.years}</span>
              </div>
              <h2 className="mt-4 font-display text-4xl leading-none">{pick(a.name, locale)}</h2>
              <p className="mt-1 font-arabic text-lg text-ink/60" lang={locale === 'ar' ? 'en' : 'ar'}>
                {locale === 'ar' ? a.name.en : a.name.ar}
              </p>
              <p className="mt-4 text-sm leading-relaxed">{pick(a.note, locale)}</p>
              <div className="mt-auto pt-5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {a.disciplines.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded-full border border-ink font-mono text-[10px] uppercase">
                      {pick(DISCIPLINES[d], locale)}
                    </span>
                  ))}
                </div>
                <a
                  href={wiki(pick(a.name, locale))}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-mono text-[11px] uppercase underline underline-offset-4 hover:text-lapis"
                >
                  {t('learn')} ↗
                </a>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {artists.length === 0 && <p className="py-16 font-display text-3xl italic text-ink/50">{t('no_match')}</p>}
    </div>
  );
}
