'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="relative min-h-screen paper-lines flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden text-center">
      <p aria-hidden className="absolute inset-0 flex items-center justify-center font-display italic text-[45vw] leading-none text-brick/10 select-none">
        404
      </p>

      <motion.div
        drag
        dragSnapToOrigin
        data-cursor="drag"
        initial={{ y: -300, rotate: -40 }}
        animate={{ y: 0, rotate: -12 }}
        transition={{ type: 'spring', stiffness: 120, damping: 9 }}
        className="relative z-10 cursor-grab active:cursor-grabbing touch-none"
      >
        <img src="/logo-samoon.png" alt="" draggable={false} className="w-40 md:w-56 mix-blend-multiply" />
      </motion.div>

      <div className="relative z-10 mt-10">
        <h1 className="font-display text-5xl md:text-7xl leading-none">{t('title')}</h1>
        <p className="mt-4 max-w-md mx-auto text-ink/70">{t('body')}</p>
        <Link href="/" className="inline-block mt-8 px-6 py-3 bg-ink text-paper rounded-full font-mono text-xs uppercase hover:bg-lapis">
          ← {t('cta')}
        </Link>
      </div>
    </div>
  );
}
