'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { MANIFESTO, pick } from '@/lib/content';

const STYLES = [
  'bg-saffron',
  'bg-paper',
  'bg-teal text-paper',
  'bg-rose',
  'bg-lapis text-paper',
  'bg-paper-2',
  'bg-brick text-paper',
  'bg-paper',
];

export function ManifestoRules() {
  const t = useTranslations('Manifesto');
  const locale = useLocale();

  return (
    <ol className="flex flex-col gap-6">
      {MANIFESTO.map((rule, i) => {
        const other = locale === 'ar' ? rule.en : rule.ar;
        return (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: i % 2 ? 80 : -80, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: i % 2 ? 1.2 : -1.2 }}
            whileHover={{ rotate: 0, scale: 1.01 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className={`relative border-2 border-ink hard-shadow ${STYLES[i % STYLES.length]} p-6 md:p-10 grid md:grid-cols-[8rem_1fr] gap-4 md:gap-8 items-baseline ${
              i % 2 ? 'md:ms-[12%]' : 'md:me-[12%]'
            }`}
          >
            <span className="font-mono text-xs uppercase">
              {t('rule')} <span className="font-display not-italic text-6xl md:text-7xl block leading-none">{String(i + 1).padStart(2, '0')}</span>
            </span>
            <div>
              <p className="font-display text-4xl md:text-6xl leading-[0.95]">{pick(rule, locale)}</p>
              <p
                className={`mt-4 text-lg md:text-xl opacity-70 ${locale === 'ar' ? 'font-display italic' : 'font-arabic'}`}
                lang={locale === 'ar' ? 'en' : 'ar'}
                dir={locale === 'ar' ? 'ltr' : 'rtl'}
              >
                {other}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
