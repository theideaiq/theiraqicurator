import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Timetable } from '@/components/home/Timetable';
import { PageHeader } from '@/components/ui/PageHeader';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Timetable' });
  return { title: t('page_title'), description: t('page_sub') };
}

export default async function TimetablePage() {
  const t = await getTranslations('Timetable');

  return (
    <>
      <PageHeader eyebrow="§01" title={t('page_title')} sub={t('page_sub')} accent="bg-saffron" />
      <section className="px-4 md:px-8 pb-32">
        <Timetable filterable />
      </section>
    </>
  );
}
