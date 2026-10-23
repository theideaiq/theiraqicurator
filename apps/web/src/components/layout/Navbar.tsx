'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { BaghdadClock } from './BaghdadClock';

const LINKS = [
  { href: '/timetable', key: 'timetable', n: '01' },
  { href: '/museum', key: 'museum', n: '02' },
  { href: '/blog', key: 'blog', n: '03' },
  { href: '/syllabus', key: 'syllabus', n: '04' },
] as const;

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const [open, setOpen] = useState(false);

  const nextLocale = locale === 'en' ? 'ar' : 'en';

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur-sm">
        <nav className="flex items-center justify-between gap-4 px-4 md:px-8 h-14">
          <Link href="/" className="group flex items-center gap-2 shrink-0" aria-label="The Iraqi Curator">
            <img
              src="/logo-samoon.png"
              alt=""
              className="w-8 h-8 object-contain mix-blend-multiply transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110"
            />
            <span className="font-display text-xl leading-none italic">
              {locale === 'ar' ? 'القيّم العراقي' : 'The Iraqi Curator'}
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-1 font-mono text-xs uppercase">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-full border-2 transition-colors ${
                    isActive(link.href)
                      ? 'border-ink bg-ink text-paper'
                      : 'border-transparent hover:border-ink'
                  }`}
                >
                  <sup className="me-1 text-[9px] opacity-60">{link.n}</sup>
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline">
              <BaghdadClock label={t('baghdad')} locale={locale} />
            </span>
            <Link
              href={pathname}
              locale={nextLocale}
              className="h-9 min-w-9 px-2 rounded-full border-2 border-ink flex items-center justify-center text-xs font-bold hover:bg-saffron transition-colors"
            >
              {t('switch_lang')}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden h-9 px-3 rounded-full bg-ink text-paper font-mono text-xs uppercase"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {t('menu')}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[70] bg-lapis text-paper flex flex-col px-6 pt-5 pb-10"
          >
            <div className="flex items-center justify-between">
              <BaghdadClock label={t('baghdad')} locale={locale} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-3 rounded-full bg-paper text-ink font-mono text-xs uppercase"
              >
                {t('close')}
              </button>
            </div>
            <ul className="mt-auto flex flex-col gap-2">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                >
                  <Link href={link.href} className="flex items-baseline gap-3 font-display text-6xl sm:text-7xl leading-[0.95] hover:text-saffron">
                    <span className="font-mono text-xs">{link.n}</span>
                    {t(link.key)}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
