'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/Logo';

function Sticker({
  children,
  className,
  rotate = 0,
  delay = 0.5,
  bounds,
}: {
  children: React.ReactNode;
  className: string;
  rotate?: number;
  delay?: number;
  bounds: React.RefObject<HTMLElement | null>;
}) {
  return (
    <motion.div
      drag
      dragConstraints={bounds}
      dragElastic={0.15}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.12, rotate: rotate + 6, zIndex: 40 }}
      initial={{ opacity: 0, scale: 0.4, rotate: rotate - 30 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ type: 'spring', stiffness: 220, damping: 14, delay }}
      data-cursor="drag"
      className={`absolute z-20 touch-none select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </motion.div>
  );
}

function RotatingStamp({ text }: { text: string }) {
  return (
    <div className="relative w-28 h-28 md:w-40 md:h-40">
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow" aria-hidden>
        <defs>
          <path id="stamp-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="98" fill="var(--color-teal)" stroke="var(--color-ink)" strokeWidth="3" />
        <text className="font-mono" fontSize="17" fontWeight="700" fill="var(--color-paper)" letterSpacing="2">
          <textPath href="#stamp-circle">{text.repeat(2)}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden>
        ✎
      </span>
    </div>
  );
}

export function Hero() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yTitle = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const rotateStrip = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  const words = [t('line1'), t('line2'), t('line3'), t('line4')];

  return (
    <section ref={ref} className="relative min-h-[100svh] paper-lines overflow-hidden pt-24 pb-16 px-4 md:px-8 ps-[5.5rem] md:ps-[6.5rem]">
      {/* top meta row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase text-ink/70">
        <span className="px-2 py-0.5 bg-ink text-paper">{t('kicker')}</span>
        <span>33.3152°N 44.3661°E</span>
        <span className="hidden sm:inline">{t('drag_hint')}</span>
      </div>

      <motion.h1 style={{ y: yTitle }} className={`relative z-10 mt-8 md:mt-12 font-display tracking-tight ${locale === 'ar' ? 'leading-[1.2]' : 'leading-[0.82]'}`}>
        <motion.span
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="block text-[19vw] md:text-[12vw] italic"
        >
          {words[0]}
        </motion.span>
        <motion.span
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={`block text-[20vw] md:text-[16vw] ms-[2vw] md:ms-[6vw] ${locale === 'ar' ? 'text-lapis' : 'text-outline font-sans font-bold uppercase tracking-tighter'}`}
        >
          {words[1]}
        </motion.span>
        <motion.span
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="block text-[12vw] md:text-[7.5vw]"
        >
          <span className="highlight">{words[2]}</span>
        </motion.span>
        <motion.span
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="block text-[12vw] md:text-[7.5vw] ms-[20vw] italic text-brick"
        >
          {words[3]}
        </motion.span>
      </motion.h1>

      {/* the other-language strip, like a label on an exercise book */}
      <motion.div
        style={{ rotate: rotateStrip }}
        className="relative z-10 mt-10 md:mt-6 md:ms-[38vw] inline-block bg-rose text-ink border-2 border-ink px-4 py-2 hard-shadow"
      >
        <p
          className={`text-xl md:text-3xl ${locale === 'ar' ? 'font-display italic' : 'font-arabic'}`}
          lang={locale === 'ar' ? 'en' : 'ar'}
          dir={locale === 'ar' ? 'ltr' : 'rtl'}
        >
          {t('alt')}
        </p>
      </motion.div>

      <div className="relative z-10 mt-12 grid md:grid-cols-12 gap-8 items-end">
        <p className="md:col-span-5 text-base md:text-lg leading-relaxed max-w-md">{t('intro')}</p>
        <div className="md:col-span-7 flex flex-wrap gap-3 md:justify-end">
          <Link href="/timetable" className="px-5 py-3 bg-ink text-paper font-mono text-xs uppercase rounded-full hover:bg-lapis transition-colors">
            {t('cta_timetable')} →
          </Link>
          <Link
            href="/museum"
            className="px-5 py-3 border-2 border-ink font-mono text-xs uppercase rounded-full hover:bg-saffron transition-colors"
          >
            {t('cta_museum')} ↗
          </Link>
        </div>
      </div>

      {/* draggable stickers */}
      <Sticker bounds={ref} delay={0.62} rotate={6} className="top-[12%] end-[4%] md:end-[8%] w-24 md:w-44">
        <div className="relative">
          <Logo className="w-full drop-shadow-[6px_8px_0_rgba(22,19,15,0.2)]" />
        </div>
      </Sticker>
      <Sticker bounds={ref} delay={0.74} rotate={8} className="hidden md:block top-[46%] end-[24%]">
        <RotatingStamp text={t('stamp')} />
      </Sticker>
      <Sticker bounds={ref} delay={0.86} rotate={-6} className="hidden sm:block top-[66%] end-[30%] md:end-[42%]">
        <span className="block px-4 py-2 bg-saffron border-2 border-ink font-mono text-xs font-bold uppercase hard-shadow">
          ★ {t('classmates')}
        </span>
      </Sticker>
      <Sticker bounds={ref} delay={0.98} rotate={12} className="top-[30%] end-[2%] md:end-[34%]">
        <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-brick text-paper font-display text-3xl md:text-4xl border-2 border-ink">
          A+
        </span>
      </Sticker>
      <Sticker bounds={ref} delay={1.10} rotate={-3} className="hidden md:block top-[80%] end-[6%]">
        <span className="block px-4 py-2 bg-paper border-2 border-dashed border-ink font-mono text-xs uppercase">
          ✕ {t('no_homework')}
        </span>
      </Sticker>
      <Sticker bounds={ref} delay={1.22} rotate={4} className="hidden md:block top-[9%] end-[30%]">
        <span className="block tape px-6 py-1.5 font-mono text-[11px] uppercase">{t('est')}</span>
      </Sticker>
    </section>
  );
}
