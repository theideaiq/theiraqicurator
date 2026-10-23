'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { pick, sessionStatus } from '@/lib/content';
import { useSessions } from '@/lib/events';

const DISMISS_KEY = 'tic-now-showing-dismissed';
const SSR = '__server__';

/** A ticket stub that points at whatever is on next. */
export function NowShowing() {
  const t = useTranslations('NowShowing');
  const locale = useLocale();
  const sessions = useSessions();
  const pathname = usePathname();
  const [closedNow, setClosedNow] = useState(false);
  // stay out of the way until the visitor starts scrolling
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 500));
  const stored = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(DISMISS_KEY);
      } catch {
        return null;
      }
    },
    () => SSR
  );

  const next = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => ['upcoming', 'today'].includes(sessionStatus(s, now)))
      .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime())[0];
  }, [sessions]);

  if (!next || pathname.startsWith('/timetable')) return null;
  const dismissed = closedNow || stored === SSR || stored === next.id;
  const today = sessionStatus(next) === 'today';

  return (
    <AnimatePresence>
      {!dismissed && scrolled && (
        <motion.aside
          initial={{ y: 120, rotate: -8 }}
          animate={{ y: 0, rotate: -3 }}
          exit={{ y: 160, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
          className="fixed bottom-4 start-4 z-40 max-w-[17rem] bg-saffron text-ink border-2 border-ink hard-shadow"
        >
          <button
            type="button"
            onClick={() => {
              setClosedNow(true);
              try {
                sessionStorage.setItem(DISMISS_KEY, next.id);
              } catch {}
            }}
            aria-label={t('close')}
            className="absolute -top-3 -end-3 w-7 h-7 rounded-full bg-ink text-paper text-xs"
          >
            ✕
          </button>
          <Link href="/timetable" className="flex">
            <span className="flex items-center px-2 border-e-2 border-dashed border-ink font-mono text-[10px] uppercase [writing-mode:vertical-rl] rotate-180">
              {today ? t('today') : t('next')}
            </span>
            <span className="p-3">
              <span className="block font-display text-2xl leading-none">{pick(next.title, locale)}</span>
              <span className="block mt-1 font-mono text-[10px] uppercase">
                {new Date(next.startsAt!).toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
                  timeZone: 'Asia/Baghdad',
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <span className="block font-mono text-[10px] uppercase opacity-70">{pick(next.venue, locale)}</span>
            </span>
          </Link>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
