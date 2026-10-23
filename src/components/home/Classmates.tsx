'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { pick, type PartnerKind } from '@/lib/content';
import { usePartners } from '@/lib/partners';

const ORDER: PartnerKind[] = ['creative', 'sponsor', 'institution', 'platform'];

// Each name gets its own sticker treatment, like a desk covered in labels.
const STICKERS = [
  'bg-saffron font-display text-3xl md:text-4xl',
  'bg-paper font-mono text-sm uppercase tracking-widest border-dashed',
  'bg-rose font-display italic text-3xl md:text-4xl',
  'bg-teal text-paper font-sans font-bold text-xl uppercase',
  'bg-lapis text-paper font-display text-3xl md:text-4xl',
  'bg-paper-2 font-sans text-2xl tracking-tight',
  'bg-brick text-paper font-mono text-sm uppercase',
];

export function Classmates() {
  const t = useTranslations('Classmates');
  const locale = useLocale();
  const partners = usePartners();

  let n = 0;
  return (
    <div className="flex flex-col gap-14">
      {ORDER.map((kind) => {
        const group = partners.filter((p) => p.kind === kind);
        if (!group.length) return null;
        return (
          <div key={kind}>
            <h3 className="font-mono text-xs uppercase text-ink/60 mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-current" />
              {t(`kinds.${kind}`)}
            </h3>
            <ul className="flex flex-wrap gap-4 md:gap-5 items-center">
              {group.map((partner) => {
                const i = n++;
                const tilt = ((i * 37) % 9) - 4;
                const name = pick(partner.name, locale);
                const isArabic = /[؀-ۿ]/.test(name);
                const inner = (
                  <>
                    <span className={isArabic ? 'font-arabic' : undefined}>{name}</span>
                    {partner.url && <span className="ms-2 text-sm align-super">↗</span>}
                  </>
                );
                const className = `inline-block border-2 border-ink px-4 py-2 hard-shadow ${STICKERS[i % STICKERS.length]}`;
                return (
                  <motion.li
                    key={partner.id}
                    initial={{ opacity: 0, scale: 0.6, rotate: tilt * 3 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: tilt }}
                    whileHover={{ rotate: 0, scale: 1.06 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14, delay: (i % 6) * 0.04 }}
                    title={pick(partner.note, locale)}
                  >
                    {partner.url ? (
                      <a href={partner.url} target="_blank" rel="noreferrer" className={className} data-cursor="visit">
                        {inner}
                      </a>
                    ) : (
                      <span className={className}>{inner}</span>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
