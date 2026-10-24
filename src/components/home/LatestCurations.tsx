'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getSupabase, readingMinutes } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase/types';

type Curation = Pick<Tables<'curations'>, 'id' | 'slug' | 'title' | 'excerpt' | 'content' | 'image_url' | 'video_url' | 'created_at'>;

const TINTS = ['bg-teal text-paper', 'bg-saffron', 'bg-rose'];

/** The three newest published curations — written and published from the staff room. */
export function LatestCurations() {
  const t = useTranslations('Latest');
  const locale = useLocale();
  const [posts, setPosts] = useState<Curation[] | null>(() => (getSupabase() ? null : []));

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('curations')
      .select('id, slug, title, excerpt, content, image_url, video_url, created_at')
      .eq('published', true)
      .in('language', [locale, 'both'])
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!cancelled) setPosts(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (posts === null) {
    return (
      <div className="grid md:grid-cols-3 gap-6" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] border-2 border-ink/20 bg-ink/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border-2 border-dashed border-ink/40 p-10 md:p-16 text-center">
        <p className="font-display italic text-3xl md:text-4xl">{t('empty')}</p>
        <a href="https://www.instagram.com/theiraqicurator/" target="_blank" rel="noreferrer" className="inline-block mt-6 font-mono text-xs uppercase underline underline-offset-4 hover:text-lapis">
          {t('meanwhile')} ↗
        </a>
      </div>
    );
  }

  return (
    <div>
      <ul className="grid md:grid-cols-3 gap-8 md:gap-6 pe-1.5 pb-1.5">
        {posts.map((post, i) => (
          <motion.li
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={`/blog/${post.slug}`}
              data-cursor="read"
              className="group flex flex-col h-full border-2 border-ink bg-paper hard-shadow overflow-hidden transition-transform hover:-translate-y-1"
            >
              <span className={`relative block aspect-[4/3] border-b-2 border-ink overflow-hidden ${post.image_url ? 'bg-paper-2' : TINTS[i % TINTS.length]}`}>
                {post.image_url ? (
                  <img src={post.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span dir="auto" className="absolute inset-0 flex items-center justify-center p-6 text-center font-display text-4xl leading-none">
                    {post.title}
                  </span>
                )}
                {post.video_url && (
                  <span className="absolute top-3 end-3 w-10 h-10 rounded-full bg-paper text-ink border-2 border-ink flex items-center justify-center text-sm" aria-label={t('video')}>
                    ▶
                  </span>
                )}
              </span>
              <span className="flex flex-col flex-1 p-5">
                <span className="font-mono text-[11px] uppercase text-brick">
                  {new Date(post.created_at).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {readingMinutes(post.content)} {t('min')}
                </span>
                <span dir="auto" className="mt-2 font-display text-3xl leading-tight group-hover:italic">
                  {post.title}
                </span>
                {post.excerpt && (
                  <span dir="auto" className="mt-2 text-sm text-ink/70 line-clamp-3">
                    {post.excerpt}
                  </span>
                )}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
      <Link href="/blog" className="inline-block mt-8 font-mono text-xs uppercase underline underline-offset-4 decoration-2 hover:text-lapis">
        {t('all')} →
      </Link>
    </div>
  );
}
