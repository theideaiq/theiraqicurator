import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/PageHeader';
import { ManifestoRules } from '@/components/manifesto/ManifestoRules';
import { Logo } from '@/components/Logo';
import { sectionNumber } from '@/lib/sections';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Manifesto' });
  return { title: t('title'), description: t('sub') };
}

export default async function ManifestoPage() {
  const t = await getTranslations('Manifesto');
  const locale = await getLocale();

  return (
    <>
      <PageHeader eyebrow={sectionNumber('manifesto')} title={t('title')} sub={t('sub')} accent="bg-rose" />

      <section className="px-4 md:px-8 pb-24">
        <ManifestoRules />
      </section>

      <section className="px-4 md:px-8 py-24 bg-ink text-paper grid md:grid-cols-12 gap-10 items-center">
        <Logo badge className="md:col-span-3 w-40 md:w-full max-w-56 -rotate-6" />
        <div className="md:col-span-5">
          <p className="font-mono text-xs uppercase text-saffron">{t('colophon')}</p>
          <p className="mt-3 leading-relaxed text-paper/80">{t('colophon_body')}</p>
          <p className="mt-8 font-mono text-xs uppercase text-saffron">{t('platform')}</p>
          <p className="mt-3 leading-relaxed text-paper/80">{t('platform_body')}</p>
        </div>
        <div className="md:col-span-4 md:text-end">
          <p className="font-display italic text-4xl md:text-5xl leading-none">{t('signed')}</p>
          <p className={`mt-4 text-3xl ${locale === 'ar' ? 'font-display' : 'font-arabic'}`} lang={locale === 'ar' ? 'en' : 'ar'}>
            {locale === 'ar' ? 'The Iraqi Curator' : 'القيّم العراقي'}
          </p>
          <Link href="/#enroll" className="inline-block mt-8 px-5 py-3 bg-saffron text-ink rounded-full font-mono text-xs uppercase hover:bg-paper">
            ✍ {t('sign')}
          </Link>
        </div>
      </section>
    </>
  );
}
