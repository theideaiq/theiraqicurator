'use client';

import { useSyncExternalStore } from 'react';
import { THEME_KEY } from '@/lib/theme';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
const getTheme = () => (document.documentElement.dataset.theme === 'night' ? 'night' : 'day');

/** Day class / night class. */
export function ThemeToggle({ labels }: { labels: { day: string; night: string } }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);

  const flip = () => {
    const next = theme === 'night' ? 'day' : 'night';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode — the toggle still works for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={theme === 'night' ? labels.day : labels.night}
      title={theme === 'night' ? labels.day : labels.night}
      className="h-9 w-9 rounded-full border-2 border-ink flex items-center justify-center hover:bg-saffron transition-colors"
    >
      <span aria-hidden className="text-base leading-none">{theme === 'night' ? '☀' : '☾'}</span>
    </button>
  );
}
