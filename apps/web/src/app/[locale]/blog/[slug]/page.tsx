'use client';

import { use, useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getSupabase, readingMinutes } from '@/lib/supabase';

type Curation = {
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
};

export default function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations('Blog');
  const locale = useLocale();
  const [post, setPost] = useState<Curation | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setMissing(true);
      return;
    }
    let cancelled = false;
    supabase
      .from('curations')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setPost(data as Curation);
        else setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (missing) notFound();

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled the share sheet */
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase text-ink/60">
        {t('loading')}
      </div>
    );
  }

  const paragraphs = post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <motion.div style={{ scaleX: progress }} className="fixed top-14 inset-x-0 h-1.5 bg-brick origin-[0%] z-40 rtl:origin-[100%]" />

      <article className="px-4 md:px-8 pt-32 pb-32">
        <Link href="/blog" className="font-mono text-xs uppercase hover:text-lapis">
          ← {t('back')}
        </Link>

        <header className="mt-10 max-w-5xl">
          <p className="font-mono text-xs uppercase text-brick">
            {new Date(post.created_at).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {readingMinutes(post.content)} {t('min')}
          </p>
          <h1 dir="auto" className="mt-4 font-display text-5xl md:text-8xl leading-[0.9]">{post.title}</h1>
          {post.excerpt && <p dir="auto" className="mt-6 max-w-2xl text-xl md:text-2xl leading-snug text-ink/70 italic font-display">{post.excerpt}</p>}
          <button type="button" onClick={share} className="mt-8 px-4 py-2 border-2 border-ink rounded-full font-mono text-xs uppercase hover:bg-saffron">
            {copied ? t('copied') : t('share')} ↗
          </button>
        </header>

        {post.image_url && (
          <figure className="relative mt-16 max-w-5xl">
            <span className="absolute -top-3 start-10 tape w-28 h-7 -rotate-3 z-10" aria-hidden />
            <img src={post.image_url} alt="" className="w-full border-2 border-ink hard-shadow" />
          </figure>
        )}

        <div
          dir="auto"
          className={`mt-16 max-w-2xl mx-auto text-lg leading-[2] space-y-6 ${
            // drop caps would break Arabic letter joining
            locale === 'ar' ? '' : 'first-letter:font-display first-letter:text-7xl first-letter:float-start first-letter:me-3 first-letter:leading-[0.8] first-letter:text-brick'
          }`}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>

        <div className="mt-24 max-w-2xl mx-auto border-t-2 border-ink pt-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/blog" className="font-mono text-xs uppercase hover:text-lapis">← {t('back')}</Link>
          <span className="font-display italic text-2xl">— The Iraqi Curator</span>
        </div>
      </article>
    </>
  );
}
