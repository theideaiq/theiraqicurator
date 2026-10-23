import type { ClassSession } from './content';

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

/** Build a single-event .ics file and hand it to the browser as a download. */
export function downloadIcs(session: ClassSession, locale: string) {
  if (!session.startsAt) return;
  const lang = locale === 'ar' ? 'ar' : 'en';
  const start = new Date(session.startsAt);
  const end = new Date(start.getTime() + (session.durationMinutes ?? 120) * 60_000);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Iraqi Curator//Timetable//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${session.id}@theiraqicurator`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(session.title[lang])}`,
    `DESCRIPTION:${escape(session.blurb[lang])}`,
    `LOCATION:${escape(session.venue[lang])}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
