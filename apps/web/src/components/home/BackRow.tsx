'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { SOCIAL } from '@/lib/content';

// Short lessons from the Instagram grid, rendered as risograph posters.
const NOTES = [
  { ar: 'فلسفة السبايكي', en: 'The philosophy of the spiky haircut', bg: 'bg-teal', fg: 'text-saffron', tilt: -2 },
  { ar: 'ما اريد اكون CEO', en: 'I don’t want to be a CEO', bg: 'bg-saffron', fg: 'text-ink', tilt: 1.5 },
  { ar: 'ذكريات مختومة', en: 'Sealed memories', bg: 'bg-clay', fg: 'text-paper', tilt: -1 },
  { ar: 'باية باية', en: 'Step by step', bg: 'bg-rose', fg: 'text-ink', tilt: 2.5 },
];

export function BackRow() {
  const t = useTranslations('Feed');

  return (
    <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
      {NOTES.map((note, i) => (
        <motion.a
          key={note.en}
          href={SOCIAL.instagram}
          target="_blank"
          rel="noreferrer"
          data-cursor="watch"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0, rotate: note.tilt }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className={`relative snap-center shrink-0 w-64 md:w-auto aspect-[4/5] border-2 border-ink ${note.bg} p-5 flex flex-col overflow-hidden`}
        >
          <span className="absolute top-3 end-3 w-9 h-9 rounded-full bg-paper border-2 border-ink flex items-center justify-center text-sm" aria-hidden>
            ▶
          </span>
          <span className={`mt-auto font-arabic text-4xl md:text-5xl leading-[1.1] ${note.fg}`} lang="ar" dir="rtl">
            {note.ar}
          </span>
          <span className="mt-3 font-mono text-[11px] uppercase">{note.en}</span>
          <span className="mt-4 pt-3 border-t-2 border-current font-mono text-[10px] uppercase opacity-80">
            {t('watch')} ↗
          </span>
        </motion.a>
      ))}
    </div>
  );
}
