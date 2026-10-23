import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { CustomCursor } from '@/components/CustomCursor';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NowShowing } from '@/components/layout/NowShowing';
import { fontVariables } from '@/lib/fonts';
import { themeScript } from '@/lib/theme';
import '../globals.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: { default: t('title'), template: `%s — ${locale === 'ar' ? 'القيّم العراقي' : 'The Iraqi Curator'}` },
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: ['/og.png'],
      locale: locale === 'ar' ? 'ar_IQ' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain flex flex-col min-h-screen bg-paper text-ink">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:bg-saffron focus:px-4 focus:py-2 font-mono text-xs uppercase"
          >
            {t('skip')}
          </a>
          <CustomCursor />
          <Navbar />
          <main id="main" className="flex-grow">
            {children}
          </main>
          <Footer />
          <NowShowing />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
