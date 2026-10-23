'use client';

import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SOCIAL } from '@/lib/content';
import { Marquee } from '@/components/ui/Marquee';

export function Footer() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Navigation');
  const locale = useLocale();

  return (
    <footer className="relative bg-ink text-paper overflow-hidden">
      <Marquee
        className="bg-saffron text-ink border-y-2 border-ink py-2"
        items={[t('tagline'), 'بغداد', 'Baghdad', 'القيّم العراقي', 'The Iraqi Curator']}
      />

      <div className="grid gap-12 md:grid-cols-12 px-6 md:px-10 pt-16 pb-10">
        <div className="md:col-span-5">
          <p className="font-display text-4xl md:text-5xl leading-none italic">{t('tagline')}</p>
          <p className="mt-6 text-sm leading-relaxed text-paper/70 max-w-md">{t('about')}</p>
        </div>

        <div className="md:col-span-3 md:col-start-7 font-mono text-xs uppercase">
          <p className="text-paper/50 mb-4">{t('contact')}</p>
          <a href={`mailto:${SOCIAL.email}`} dir="ltr" className="rtl:text-right block normal-case text-base hover:text-saffron break-all">
            {SOCIAL.email}
          </a>
          <p className="text-paper/50 mt-8 mb-4">{t('follow')}</p>
          <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" dir="ltr" className="rtl:text-right block normal-case text-base hover:text-rose">
            Instagram {SOCIAL.instagramHandle} ↗
          </a>
        </div>

        <ul className="md:col-span-3 font-mono text-xs uppercase space-y-2">
          {(['timetable', 'museum', 'blog', 'syllabus', 'manifesto'] as const).map((key) => (
            <li key={key}>
              <Link href={key === 'blog' ? '/blog' : `/${key}`} className="hover:text-saffron">
                → {nav(key)}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <a href="#main" className="hover:text-saffron">{t('top')}</a>
          </li>
        </ul>
      </div>

      <div className="px-6 md:px-10 pb-6 flex flex-col md:flex-row justify-between gap-2 font-mono text-[10px] uppercase text-paper/50">
        <p>
          &copy; {new Date().getFullYear()} {locale === 'ar' ? 'القيّم العراقي' : 'The Iraqi Curator'} — {t('rights')}
        </p>
        <p>{t('location')} · 33.3152°N 44.3661°E</p>
        <span className="flex gap-4">
          <a href="https://theideaiq.com" target="_blank" rel="noreferrer" className="hover:text-paper">
            {t('partner')} ↗
          </a>
          <NextLink href="/admin" className="hover:text-paper">
            {t('staff')} →
          </NextLink>
        </span>
      </div>

      <motion.p
        aria-hidden
        initial={{ y: '40%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[26vw] leading-[0.75] text-center text-paper/10 select-none -mb-[4vw]"
      >
        {locale === 'ar' ? 'بغداد' : 'Baghdad'}
      </motion.p>
    </footer>
  );
}
