'use client';

import { useId } from 'react';

export const inputClass =
  'w-full bg-paper border-2 border-ink px-3 py-2.5 text-sm focus:outline-none focus:bg-saffron/10 focus:border-lapis placeholder:text-ink/30';

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="font-mono text-[11px] uppercase text-ink/70">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

export function Button({
  variant = 'ink',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ink' | 'ghost' | 'saffron' | 'danger' }) {
  const styles = {
    ink: 'bg-ink text-paper hover:bg-lapis',
    ghost: 'border-2 border-ink hover:bg-saffron',
    saffron: 'bg-saffron text-ink border-2 border-ink hover:bg-paper',
    danger: 'border-2 border-brick text-brick hover:bg-brick hover:text-paper',
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs uppercase transition-colors disabled:opacity-40 disabled:pointer-events-none ${styles} ${className}`}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 font-mono text-xs uppercase"
    >
      <span className={`relative w-12 h-7 rounded-full border-2 border-ink transition-colors ${checked ? 'bg-teal' : 'bg-paper'}`}>
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-all ${checked ? 'start-[calc(100%-1.4rem)]' : 'start-0.5'}`}
        />
      </span>
      {label}
    </button>
  );
}

export function PageTitle({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    // `contents` lets the action bar stick for the whole page, not just this header
    <div className="contents">
      <div className={children ? 'mb-4' : 'mb-10'}>
        <p className="font-mono text-xs uppercase text-brick">{kicker}</p>
        <h1 className="font-display italic text-5xl md:text-7xl leading-[0.9]">{title}</h1>
      </div>
      {/* actions stay reachable while scrolling long forms */}
      {children && (
        <div className="sticky top-14 lg:top-0 z-20 -mx-4 px-4 md:-mx-10 md:px-10 py-3 mb-8 bg-paper/95 backdrop-blur-sm border-b-2 border-ink/10 flex flex-wrap gap-2">{children}</div>
      )}
    </div>
  );
}

export function Pill({ tone, children }: { tone: 'live' | 'draft' | 'muted' | 'alert'; children: React.ReactNode }) {
  const styles = {
    live: 'bg-teal text-paper',
    draft: 'bg-saffron text-ink',
    muted: 'bg-ink/10',
    alert: 'bg-brick text-paper',
  }[tone];
  return <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] uppercase ${styles}`}>{children}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-dashed border-ink/40 p-10 text-center font-display italic text-2xl text-ink/50">{children}</div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-2 border-brick bg-brick/10 text-brick px-4 py-3 text-sm">
      {message}
    </p>
  );
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[ً-ْ]/g, '') // Arabic diacritics
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Baghdad', dateStyle: 'medium', timeStyle: 'short' }) : '—';
