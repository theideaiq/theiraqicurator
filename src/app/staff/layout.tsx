import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';
import { themeScript } from '@/lib/theme';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Staff Room — The Iraqi Curator', template: '%s — Staff Room' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} staff-root`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
