'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/ui/PageHeader';
import { getSupabase, readingMinutes } from '@/lib/supabase';
import { sectionNumber } from '@/lib/sections';

type Curation = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
};

export default function BlogList() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const [curations, setCurations] = useState<Curation[] | null>(() => (getSupabase() ? null : []));
  const [offline, setOffline] = useState(() => !getSupabase());
  const [query, setQuery] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('curations')
      .select('*')
      .eq('published', true)
      // `language` isn't in the generated types yet
      .in('language' as never, [locale, 'both'])
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setOffline(true);
        setCurations((data as Curation[] | null) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!curations || !q) return curations ?? [];
    return curations.filter((c) => `${c.title} ${c.excerpt ?? ''} ${c.content}`.toLowerCase().includes(q));
  }, [curations, query]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <PageHeader eyebrow={sectionNumber('blog')} title={t('title')} sub={t('sub')} accent="bg-rose">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search')}
          aria-label={t('search')}
          className="mt-10 w-full max-w-lg bg-transparent border-b-2 border-ink py-2 font-display text-3xl placeholder:text-ink/30 focus:outline-none focus:border-lapis"
        />
      </PageHeader>

      <section className="px-4 md:px-8 pb-32">
        {curations === null ? (
          <ul className="border-t-2 border-ink" aria-busy="true" aria-label={t('loading')}>
            {[0, 1, 2].map((i) => (
              <li key={i} className="py-10 border-b-2 border-ink animate-pulse">
                <div className="h-3 w-32 bg-ink/10 mb-4" />
                <div className="h-10 w-2/3 bg-ink/10" />
              </li>
            ))}
          </ul>
        ) : (
          <ol className="border-t-2 border-ink">
            {filtered.map((post, index) => (
              <motion.li
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: Math.min(index, 6) * 0.05 }}
                className="border-b-2 border-ink"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  data-cursor="read"
                  className="group grid md:grid-cols-[8rem_1fr_16rem] gap-4 md:gap-8 py-10 md:items-center hover:bg-saffron/30 transition-colors md:px-4"
                >
                  <span className="font-mono text-xs uppercase text-ink/60">
                    {t('lesson')} {String(filtered.length - index).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-mono text-[11px] uppercase text-brick">
                      {formatDate(post.created_at)} · {readingMinutes(post.content)} {t('min')}
                      {post.video_url && ' · ▶'}
                    </p>
                    <h2 className="mt-2 font-display text-4xl md:text-6xl leading-[0.95] group-hover:italic">{post.title}</h2>
                    {post.excerpt && <p className="mt-3 max-w-2xl text-sm text-ink/70 line-clamp-2">{post.excerpt}</p>}
                  </div>
                  <div className="hidden md:block relative aspect-[4/3] border-2 border-ink overflow-hidden bg-paper-2 rotate-2 group-hover:rotate-0 transition-transform">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-display text-7xl text-ink/20">
                        {post.title.slice(0, 1)}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.li>
            ))}
          </ol>
        )}

        {curations !== null && filtered.length === 0 && (
          <p className="py-16 font-display text-3xl italic text-ink/50">
            {offline ? t('offline') : query ? t('no_match') : t('empty')}
          </p>
        )}
      </section>
    </>
  );
}
