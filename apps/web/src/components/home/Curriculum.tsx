'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const SUBJECTS = [
  { href: '/museum', key: 'museum', color: 'bg-lapis text-paper', tilt: -3, glyph: '◎' },
  { href: '/blog', key: 'blog', color: 'bg-rose', tilt: 2, glyph: '✎' },
  { href: '/syllabus', key: 'syllabus', color: 'bg-teal text-paper', tilt: -1.5, glyph: '☰' },
  { href: '/timetable', key: 'timetable', color: 'bg-saffron', tilt: 3, glyph: '◷' },
] as const;

/** Four exercise-book covers, each a door into a section of the site. */
export function Curriculum() {
  const t = useTranslations('Curriculum');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
      {SUBJECTS.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 60, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: s.tilt }}
          whileHover={{ rotate: 0, y: -10 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 160, damping: 16, delay: i * 0.08 }}
        >
          <Link
            href={s.href}
            data-cursor="open"
            className={`relative flex flex-col aspect-[3/4] border-2 border-ink hard-shadow ${s.color} p-5 overflow-hidden`}
          >
            {/* binding */}
            <span className="absolute inset-y-0 start-0 w-4 bg-ink/20 border-e-2 border-ink" aria-hidden />
            <span className="font-mono text-[10px] uppercase ps-4">
              {t('subject')} 0{i + 1}
            </span>
            <span className="ms-4 mt-auto mb-6 text-7xl leading-none" aria-hidden>
              {s.glyph}
            </span>
            {/* the name label every school notebook has */}
            <span className="ms-4 bg-paper text-ink border-2 border-ink p-3 rounded-sm">
              <span className="block font-display text-3xl leading-none italic">{t(s.key)}</span>
              <span className="block mt-2 text-xs leading-snug text-ink/70">{t(`${s.key}_note`)}</span>
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
