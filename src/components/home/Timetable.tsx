'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { pick, sessionStatus, type ClassSession, type SessionStatus } from '@/lib/content';
import { useSessions } from '@/lib/events';
import { downloadIcs } from '@/lib/ics';

const COLOR: Record<ClassSession['color'], string> = {
  rose: 'bg-rose',
  saffron: 'bg-saffron',
  teal: 'bg-teal text-paper',
  lapis: 'bg-lapis text-paper',
  brick: 'bg-brick text-paper',
};

type Filter = 'all' | 'upcoming' | 'archive';

const order = (s: ClassSession) => (s.startsAt ? new Date(s.startsAt).getTime() : -Infinity);

export function Timetable({ filterable = false, limit }: { filterable?: boolean; limit?: number }) {
  const t = useTranslations('Timetable');
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>('all');
  const timetable = useSessions();

  const sessions = useMemo(() => {
    const now = new Date();
    const withStatus = timetable.map((s) => ({ session: s, status: sessionStatus(s, now) }));
    const live = (st: SessionStatus) => st === 'upcoming' || st === 'today';
    const filtered = withStatus.filter(({ status }) =>
      filter === 'all' ? true : filter === 'upcoming' ? live(status) : !live(status)
    );
    // upcoming first (soonest first), then the archive (newest first)
    filtered.sort((a, b) => {
      const la = live(a.status), lb = live(b.status);
      if (la !== lb) return la ? -1 : 1;
      return la ? order(a.session) - order(b.session) : order(b.session) - order(a.session);
    });
    return limit ? filtered.slice(0, limit) : filtered;
  }, [filter, limit, timetable]);

  const dateParts = (iso: string) => {
    const d = new Date(iso);
    const loc = locale === 'ar' ? 'ar-IQ' : 'en-GB';
    const tz = { timeZone: 'Asia/Baghdad' } as const;
    return {
      day: d.toLocaleDateString(loc, { ...tz, day: 'numeric' }),
      month: d.toLocaleDateString(loc, { ...tz, month: 'short' }),
      weekday: d.toLocaleDateString(loc, { ...tz, weekday: 'long' }),
      year: d.toLocaleDateString(loc, { ...tz, year: 'numeric' }),
      time: d.toLocaleTimeString(loc, { ...tz, hour: 'numeric', minute: '2-digit' }),
    };
  };

  return (
    <div>
      {filterable && (
        <div role="tablist" className="flex gap-2 mb-8 font-mono text-xs uppercase">
          {(['all', 'upcoming', 'archive'] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full border-2 border-ink transition-colors ${
                filter === f ? 'bg-ink text-paper' : 'hover:bg-saffron'
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>
      )}

      <ol className="border-t-2 border-ink">
        <AnimatePresence initial={false} mode="popLayout">
          {sessions.map(({ session, status }, i) => {
            const date = session.startsAt ? dateParts(session.startsAt) : null;
            const canExport = status === 'upcoming' || status === 'today';
            return (
              <motion.li
                layout
                key={session.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06 }}
                className="group grid grid-cols-[5.5rem_1fr] md:grid-cols-[9rem_1fr_auto] border-b-2 border-ink"
              >
                <div className={`${COLOR[session.color]} border-e-2 border-ink flex flex-col items-center justify-center py-6 text-center`}>
                  {date ? (
                    <>
                      <span className="font-display text-5xl md:text-7xl leading-none">{date.day}</span>
                      <span className="font-mono text-xs uppercase mt-1">{date.month} {date.year}</span>
                    </>
                  ) : (
                    <span className="font-display text-5xl md:text-6xl leading-none">?</span>
                  )}
                </div>

                <div className="p-5 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase">
                    <span className="px-2 py-0.5 border border-ink rounded-full">{t(`kinds.${session.kind}`)}</span>
                    {status === 'today' && <span className="px-2 py-0.5 bg-brick text-paper rounded-full animate-pulse">● {t('today')}</span>}
                    {status === 'upcoming' && <span className="px-2 py-0.5 bg-teal text-paper rounded-full">{t('upcoming')}</span>}
                    {status === 'archive' && <span className="px-2 py-0.5 bg-ink/10 rounded-full">{t('archive')}</span>}
                    {status === 'tba' && <span className="px-2 py-0.5 bg-ink/10 rounded-full">{t('tba')}</span>}
                    {date && <span className="text-ink/60">{date.weekday} · {date.time}</span>}
                  </div>
                  <h3 className="mt-3 font-display text-3xl md:text-5xl leading-none group-hover:italic transition-all">
                    {pick(session.title, locale)}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm md:text-base leading-relaxed text-ink/80">{pick(session.blurb, locale)}</p>
                  <p className="mt-3 font-mono text-xs uppercase text-ink/60">⌖ {pick(session.venue, locale)}</p>
                  {session.partners && (
                    <p className="mt-1 font-mono text-[11px] uppercase text-ink/50">
                      {t('partners')}: {session.partners.join(' · ')}
                    </p>
                  )}
                  {session.link && (
                    <a
                      href={session.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-4 me-2 font-mono text-[11px] uppercase underline underline-offset-4 hover:text-lapis"
                    >
                      {t('details')} ↗
                    </a>
                  )}
                  {canExport && (
                    <button
                      type="button"
                      onClick={() => downloadIcs(session, locale)}
                      className="md:hidden mt-4 px-4 py-2 border-2 border-ink rounded-full font-mono text-[11px] uppercase hover:bg-saffron"
                    >
                      + {t('add_calendar')}
                    </button>
                  )}
                </div>

                <div className="hidden md:flex items-center pe-8">
                  {canExport && (
                    <button
                      type="button"
                      onClick={() => downloadIcs(session, locale)}
                      className="px-4 py-2 border-2 border-ink rounded-full font-mono text-[11px] uppercase hover:bg-saffron whitespace-nowrap"
                    >
                      + {t('add_calendar')}
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      {sessions.length === 0 && <p className="py-12 font-mono text-xs uppercase text-ink/60">{t('empty')}</p>}
    </div>
  );
}
