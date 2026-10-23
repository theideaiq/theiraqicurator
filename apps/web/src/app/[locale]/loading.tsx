'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('Loading');

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-paper paper-grid">
      <motion.img
        src="/logo-samoon.png"
        alt=""
        animate={{ rotate: [0, 12, -12, 0], y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        className="w-28 h-28 object-contain mix-blend-multiply"
      />
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brick" role="status">
        {t('text')}
      </p>
    </div>
  );
}
