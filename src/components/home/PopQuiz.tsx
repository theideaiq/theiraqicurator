'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { pick } from '@/lib/content';
import { useQuiz } from '@/lib/editable';

const LETTERS = { en: ['A', 'B', 'C', 'D'], ar: ['أ', 'ب', 'ج', 'د'] };

function gradeFor(score: number, total: number) {
  const pct = score / total;
  if (pct >= 0.85) return { grade: 'A', remark: 'a' } as const;
  if (pct >= 0.65) return { grade: 'B', remark: 'b' } as const;
  if (pct >= 0.5) return { grade: 'C', remark: 'c' } as const;
  return { grade: 'F', remark: 'f' } as const;
}

export function PopQuiz() {
  const t = useTranslations('Quiz');
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const quiz = useQuiz();

  // the list can change once database rows load; never read past its end
  const question = quiz[Math.min(index, quiz.length - 1)];
  const letters = locale === 'ar' ? LETTERS.ar : LETTERS.en;
  const isLast = index === quiz.length - 1;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const reset = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setCopied(false);
  };

  const result = gradeFor(score, quiz.length);

  const share = async () => {
    const text =
      locale === 'ar'
        ? `حصلت على ${score}/${quiz.length} (${result.grade}) بامتحان القيّم العراقي المفاجئ. ${window.location.origin}`
        : `I got ${score}/${quiz.length} (${result.grade}) on The Iraqi Curator's pop quiz. ${window.location.origin}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative bg-paper text-ink border-2 border-ink hard-shadow paper-grid max-w-3xl mx-auto">
      {/* progress strip */}
      <div className="flex border-b-2 border-ink" aria-hidden>
        {quiz.map((_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 border-e border-ink last:border-e-0 ${
              done || i < index ? 'bg-teal' : i === index ? 'bg-saffron' : ''
            }`}
          />
        ))}
      </div>

      <div className="p-6 md:p-10 min-h-[26rem]">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-mono text-xs uppercase text-ink/60" aria-live="polite">
                {t('question')} {index + 1} {t('of')} {quiz.length}
              </p>
              <h3 className="mt-3 font-display text-3xl md:text-4xl leading-tight">{pick(question.q, locale)}</h3>

              <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                {question.options.map((opt, i) => {
                  const revealed = picked !== null;
                  const right = i === question.answer;
                  const chosen = i === picked;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => choose(i)}
                        disabled={revealed}
                        className={`w-full flex items-center gap-3 text-start px-4 py-3 border-2 border-ink transition-all ${
                          revealed && right
                            ? 'bg-teal text-paper'
                            : revealed && chosen
                              ? 'bg-brick text-paper line-through'
                              : revealed
                                ? 'opacity-50'
                                : 'bg-paper hover:bg-saffron hover:-translate-y-0.5'
                        }`}
                      >
                        <span className="shrink-0 w-7 h-7 rounded-full border-2 border-current flex items-center justify-center font-mono text-xs">
                          {letters[i]}
                        </span>
                        <span>{pick(opt, locale)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {picked !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  aria-live="polite"
                >
                  <p className="text-sm max-w-md">
                    <strong className={picked === question.answer ? 'text-teal' : 'text-brick'}>
                      {picked === question.answer ? t('correct') : t('wrong')}
                    </strong>{' '}
                    {pick(question.why, locale)}
                  </p>
                  <button
                    type="button"
                    onClick={next}
                    className="shrink-0 px-5 py-3 bg-ink text-paper rounded-full font-mono text-xs uppercase hover:bg-lapis"
                  >
                    {isLast ? t('finish') : t('next')} →
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="report" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="font-mono text-xs uppercase text-ink/60">{t('report_card')}</p>
              <div className="mt-6 grid grid-cols-2 border-2 border-ink">
                <div className="p-5 border-e-2 border-ink">
                  <p className="font-mono text-[11px] uppercase text-ink/60">{t('score')}</p>
                  <p className="font-display text-6xl">
                    {score}/{quiz.length}
                  </p>
                </div>
                <div className="p-5 relative">
                  <p className="font-mono text-[11px] uppercase text-ink/60">{t('grade')}</p>
                  <motion.p
                    initial={{ scale: 3, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: -8, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.2 }}
                    className="font-display text-7xl text-brick border-4 border-brick rounded-full w-24 h-24 flex items-center justify-center"
                  >
                    {result.grade}
                  </motion.p>
                </div>
                <div className="col-span-2 p-5 border-t-2 border-ink">
                  <p className="font-mono text-[11px] uppercase text-ink/60">{t('remark')}</p>
                  <p className="mt-2 font-display text-2xl italic text-lapis">“{t(`remarks.${result.remark}`)}”</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={reset} className="px-5 py-3 bg-ink text-paper rounded-full font-mono text-xs uppercase hover:bg-lapis">
                  ↺ {t('retake')}
                </button>
                <button type="button" onClick={share} className="px-5 py-3 border-2 border-ink rounded-full font-mono text-xs uppercase hover:bg-saffron">
                  {copied ? t('copied') : t('share')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
