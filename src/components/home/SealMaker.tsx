'use client';

import { useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toCuneiform, WORD_DIVIDER } from '@/lib/cuneiform';
import { cuneiform } from '@/lib/fonts';

const CLAY = '#c98a5b';

/**
 * Type a name, get a (playful) cylinder seal. The stone cylinder spins with
 * the signs carved in reverse; rolling it presses a right-reading impression
 * into the clay strip, which can be downloaded as a PNG.
 */
export function SealMaker() {
  const t = useTranslations('Seal');
  const inputId = useId();
  const [name, setName] = useState('');
  const [rolls, setRolls] = useState(0);

  const glyphs = useMemo(() => toCuneiform(name), [name]);
  const impression = glyphs ? `${glyphs}  ${WORD_DIVIDER}  ${glyphs}` : '';

  const download = async () => {
    if (!glyphs) return;
    const family = cuneiform.style.fontFamily;
    await document.fonts.load(`72px ${family}`, glyphs);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = `72px ${family}`;
    const width = Math.max(800, Math.ceil(ctx.measureText(impression).width) + 160);
    canvas.width = width;
    canvas.height = 320;

    // clay slab with a little speckle
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#d79a6a');
    grad.addColorStop(0.5, CLAY);
    grad.addColorStop(1, '#a8693f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, canvas.height);
    for (let i = 0; i < width * 1.5; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,235,210' : '60,30,10'},${Math.random() * 0.18})`;
      ctx.fillRect(Math.random() * width, Math.random() * canvas.height, 2, 2);
    }

    // impressed signs: highlight below-right, shadow above-left
    ctx.font = `72px ${family}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const cx = width / 2;
    const cy = canvas.height / 2 - 10;
    ctx.fillStyle = 'rgba(255,230,200,0.55)';
    ctx.fillText(impression, cx + 2, cy + 2);
    ctx.fillStyle = 'rgba(60,28,8,0.85)';
    ctx.fillText(impression, cx, cy);

    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(40,20,5,0.7)';
    ctx.fillText(`${name.trim()} — sealed at theiraqicurator`, cx, canvas.height - 36);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `seal-${name.trim().replace(/\s+/g, '-') || 'impression'}.png`;
    a.click();
  };

  return (
    <div className="grid lg:grid-cols-12 gap-10 items-start">
      <form
        className="lg:col-span-4 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setRolls((r) => r + 1);
        }}
      >
        <label htmlFor={inputId} className="font-mono text-xs uppercase text-chalk/70">
          {t('label')}
        </label>
        <input
          id={inputId}
          value={name}
          maxLength={24}
          onChange={(e) => {
            setName(e.target.value);
            setRolls((r) => r + 1);
          }}
          placeholder={t('placeholder')}
          className="w-full bg-transparent border-b-2 border-chalk py-3 font-display text-4xl text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-saffron"
        />
        <div className="flex flex-wrap gap-3 mt-2">
          <button
            type="submit"
            disabled={!glyphs}
            className="px-5 py-3 bg-saffron text-coal rounded-full font-mono text-xs uppercase disabled:opacity-40 hover:bg-chalk"
          >
            ⟳ {t('roll')}
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!glyphs}
            className="px-5 py-3 border-2 border-chalk text-chalk rounded-full font-mono text-xs uppercase disabled:opacity-40 hover:bg-chalk hover:text-coal"
          >
            ↓ {t('download')}
          </button>
        </div>
        <p className="text-xs text-chalk/50 leading-relaxed">{t('disclaimer')}</p>
      </form>

      <div className="lg:col-span-8 flex flex-col items-center gap-0" dir="ltr">
        {/* the stone cylinder */}
        <div className="relative w-48 md:w-64 h-24 md:h-28 rounded-[1.25rem/50%] overflow-hidden border-2 border-coal shadow-[inset_0_-14px_18px_rgba(0,0,0,0.45),inset_0_10px_14px_rgba(255,255,255,0.25)] bg-gradient-to-b from-[#6f7f86] via-[#a9b5b8] to-[#4d5a60]">
          {/* seals are carved in mirror image */}
          <div className="absolute inset-0 -scale-x-100" aria-hidden>
            <div
              key={`cyl-${rolls}`}
              className="flex h-full w-max items-center whitespace-nowrap text-4xl md:text-5xl text-coal/50 animate-marquee [animation-duration:6s]"
              style={{ fontFamily: cuneiform.style.fontFamily }}
            >
              <span className="px-4">{glyphs || '𒀭 𒀭 𒀭'}</span>
              <span className="px-4">{glyphs || '𒀭 𒀭 𒀭'}</span>
            </div>
          </div>
        </div>

        {/* the clay strip */}
        <div
          className="relative w-full -mt-3 h-40 md:h-48 rounded-md overflow-hidden border-2 border-coal"
          style={{
            background: `radial-gradient(120% 80% at 50% 0%, #dba274 0%, ${CLAY} 55%, #9c6036 100%)`,
          }}
        >
          <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply" aria-hidden>
            <filter id="clay-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
              <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.18  0 0 0 0 0.05  0 0 0 0.9 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#clay-noise)" />
          </svg>

          {glyphs ? (
            <motion.div
              key={`imp-${rolls}`}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center px-6 text-center"
            >
              <p
                className="text-4xl md:text-6xl leading-tight break-all"
                style={{
                  fontFamily: cuneiform.style.fontFamily,
                  color: 'rgba(70,32,10,0.85)',
                  textShadow: '2px 2px 0 rgba(255,230,200,0.5), -1px -1px 0 rgba(40,15,0,0.35)',
                }}
                aria-label={name}
              >
                {impression}
              </p>
            </motion.div>
          ) : (
            <p className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase text-coal/60">
              {t('empty')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
