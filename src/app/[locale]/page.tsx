import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Hero } from '@/components/home/Hero';
import { Timetable } from '@/components/home/Timetable';
import { Curriculum } from '@/components/home/Curriculum';
import { PopQuiz } from '@/components/home/PopQuiz';
import { SealMaker } from '@/components/home/SealMaker';
import { BackRow } from '@/components/home/BackRow';
import { Enroll } from '@/components/home/Enroll';
import { Classmates } from '@/components/home/Classmates';
import { Marquee } from '@/components/ui/Marquee';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TICKER, pick } from '@/lib/content';

export default async function Home() {
  const t = await getTranslations('Sections');
  const tt = await getTranslations('Timetable');
  const locale = await getLocale();

  return (
    <>
      <Hero />

      {/* the tilted ticker is wider than the screen; keep it inside the page */}
      <div className="overflow-hidden py-2 -my-2">
        <Marquee
          className="bg-ink text-paper py-3 border-y-2 border-ink -rotate-1 scale-[1.02]"
          items={TICKER.map((item) => pick(item, locale))}
        />
      </div>

      <section className="px-4 md:px-8 py-24 md:py-32">
        <SectionHeading index="01" title={t('timetable')} sub={t('timetable_sub')} />
        <Timetable limit={3} />
        <Link href="/timetable" className="inline-block mt-8 font-mono text-xs uppercase underline underline-offset-4 decoration-2 hover:text-lapis">
          {tt('view_all')} →
        </Link>
      </section>

      <section className="px-4 md:px-8 py-24 md:py-32 bg-paper-2 border-y-2 border-ink">
        <SectionHeading index="02" title={t('curriculum')} sub={t('curriculum_sub')} />
        <Curriculum />
      </section>

      <section className="px-4 md:px-8 py-24 md:py-32 bg-lapis text-paper">
        <SectionHeading index="03" title={t('quiz')} sub={t('quiz_sub')} tone="paper" />
        <PopQuiz />
      </section>

      <section className="px-4 md:px-8 py-24 md:py-32 bg-ink text-paper">
        <SectionHeading index="04" title={t('seal')} sub={t('seal_sub')} tone="paper" />
        <SealMaker />
      </section>

      <section className="px-4 md:px-8 py-24 md:py-32">
        <SectionHeading index="05" title={t('feed')} sub={t('feed_sub')} />
        <BackRow />
      </section>

      <section id="classmates" className="px-4 md:px-8 py-24 md:py-32 paper-grid border-t-2 border-ink">
        <SectionHeading index="06" title={t('classmates')} sub={t('classmates_sub')} />
        <Classmates />
      </section>

      <section id="enroll" className="px-4 md:px-8 py-24 md:py-32 bg-paper-2 border-t-2 border-ink">
        <SectionHeading index="07" title={t('enroll')} sub={t('enroll_sub')} />
        <Enroll />
      </section>
    </>
  );
}
