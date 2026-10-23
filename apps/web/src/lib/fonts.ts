import { Instrument_Serif, Space_Grotesk, Space_Mono, Lalezar, IBM_Plex_Sans_Arabic, Noto_Sans_Cuneiform } from 'next/font/google';

export const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
});

export const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export const lalezar = Lalezar({
  subsets: ['arabic', 'latin'],
  weight: '400',
  variable: '--font-lalezar',
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-plex-ar',
});

// Only the seal room needs this one, so don't preload it on every page.
export const cuneiform = Noto_Sans_Cuneiform({
  subsets: ['cuneiform'],
  weight: '400',
  variable: '--font-cuneiform',
  preload: false,
});

export const fontVariables = [instrument, grotesk, spaceMono, lalezar, plexArabic, cuneiform]
  .map((f) => f.variable)
  .join(' ');
