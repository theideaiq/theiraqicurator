import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { SyllabusIndex } from '@/components/syllabus/SyllabusIndex';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Syllabus' });
  return { title: t('title'), description: t('sub') };
}

export default async function SyllabusPage() {
  const t = await getTranslations('Syllabus');

  return (
    <>
      <PageHeader eyebrow="§04" title={t('title')} sub={t('sub')} accent="bg-teal text-paper" />
      <section className="px-4 md:px-8 pb-32">
        <SyllabusIndex />
      </section>
    </>
  );
}
