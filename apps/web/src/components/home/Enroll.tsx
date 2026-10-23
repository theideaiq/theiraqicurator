'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SOCIAL } from '@/lib/content';

const TOPICS = ['show', 'workshop', 'collab', 'hi'] as const;

/** A "pass the note" contact form that opens the visitor's mail client. */
export function Enroll() {
  const t = useTranslations('Enroll');
  const id = useId();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('show');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');
    const message = String(data.get('message') ?? '');
    const subject = `[${t(`topics.${topic}`)}] — ${name}`;
    const body = `${message}\n\n— ${name}${email ? ` <${email}>` : ''}`;
    window.location.href = `mailto:${SOCIAL.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SOCIAL.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the address is visible anyway */
    }
  };

  const field = 'w-full bg-transparent border-b-2 border-ink py-2 text-lg focus:outline-none focus:border-lapis placeholder:text-ink/30';

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <form onSubmit={submit} className="lg:col-span-7 relative bg-paper border-2 border-ink hard-shadow p-6 md:p-10 paper-lines">
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 tape w-28 h-7 rotate-[-3deg]" aria-hidden />

        <fieldset>
          <legend className="font-mono text-xs uppercase text-ink/60 mb-3">{t('topic')}</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((key) => (
              <label
                key={key}
                className={`cursor-pointer px-4 py-2 rounded-full border-2 border-ink font-mono text-xs uppercase transition-colors has-[:focus-visible]:outline-dashed has-[:focus-visible]:outline-2 ${
                  topic === key ? 'bg-ink text-paper' : 'hover:bg-saffron'
                }`}
              >
                <input
                  type="radio"
                  name="topic"
                  value={key}
                  checked={topic === key}
                  onChange={() => setTopic(key)}
                  className="sr-only"
                />
                {t(`topics.${key}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor={`${id}-name`} className="font-mono text-xs uppercase text-ink/60">{t('name')}</label>
            <input id={`${id}-name`} name="name" required autoComplete="name" className={field} />
          </div>
          <div>
            <label htmlFor={`${id}-email`} className="font-mono text-xs uppercase text-ink/60">{t('email')}</label>
            <input id={`${id}-email`} name="email" type="email" autoComplete="email" className={field} />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor={`${id}-message`} className="font-mono text-xs uppercase text-ink/60">{t('message')}</label>
          <textarea id={`${id}-message`} name="message" required rows={4} className={`${field} resize-none leading-8`} />
        </div>

        <button type="submit" className="mt-8 px-6 py-3 bg-lapis text-paper rounded-full font-mono text-xs uppercase hover:bg-ink">
          ✉ {t('send')}
        </button>
        {sent && <p className="mt-4 text-sm text-teal" role="status">{t('sent')}</p>}
      </form>

      <div className="lg:col-span-5 flex flex-col justify-between gap-10">
        <div>
          <a href={`mailto:${SOCIAL.email}`} dir="ltr" className="rtl:text-right block font-display text-3xl md:text-5xl leading-none break-all hover:text-lapis italic">
            {SOCIAL.email}
          </a>
          <button type="button" onClick={copy} className="mt-4 px-4 py-2 border-2 border-ink rounded-full font-mono text-xs uppercase hover:bg-saffron">
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-ink/60">{t('or')}</p>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="mt-2 inline-flex items-center gap-3 font-display text-4xl md:text-6xl hover:text-rose"
          >
            {SOCIAL.instagramHandle} <span className="text-2xl">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
