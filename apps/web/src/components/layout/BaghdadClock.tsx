'use client';

import { useEffect, useState } from 'react';

/** Live local time in Baghdad — every good studio site has a clock. */
export function BaghdadClock({ label, locale }: { label: string; locale: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
      timeZone: 'Asia/Baghdad',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [locale]);

  return (
    <span className="font-mono text-[11px] uppercase tracking-wider tabular-nums" suppressHydrationWarning>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brick me-1.5 align-middle animate-pulse" />
      {label} {time ?? '--:--:--'}
    </span>
  );
}
