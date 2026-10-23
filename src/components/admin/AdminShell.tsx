'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, CalendarDays, Frame, Inbox, LayoutGrid, ExternalLink, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { BaghdadClock } from '@/components/layout/BaghdadClock';
import { SignOut } from './SignOut';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/admin/curations', label: 'Curations', icon: BookOpen },
  { href: '/admin/artworks', label: 'Museum', icon: Frame },
  { href: '/admin/timetable', label: 'Timetable', icon: CalendarDays },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
];

export function AdminShell({ email, migrated, children }: { email: string; migrated: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close the menu whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-full border-2 font-mono text-xs uppercase transition-colors ${
            active(href, exact) ? 'bg-ink text-paper border-ink' : 'border-transparent hover:border-ink'
          }`}
        >
          <Icon size={16} strokeWidth={2.25} />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-auto flex flex-col gap-4 pt-8">
      <a href="/" target="_blank" className="flex items-center gap-2 font-mono text-xs uppercase hover:text-lapis">
        <ExternalLink size={14} /> View site
      </a>
      <div className="flex items-center justify-between gap-2">
        <ThemeToggle labels={{ day: 'Day mode', night: 'Night mode' }} />
        <SignOut className="font-mono text-xs uppercase underline underline-offset-4 hover:text-brick" />
      </div>
      <p className="font-mono text-[10px] uppercase text-ink/50 break-all">{email}</p>
      <p className="font-mono text-[10px] uppercase text-ink/40">Platform by The IDEA</p>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen border-e-2 border-ink bg-paper-2 p-5">
        <Link href="/admin" className="flex items-center gap-3 mb-10">
          <Logo className="w-11" />
          <span className="leading-none">
            <span className="block font-display italic text-2xl">Staff Room</span>
            <span className="block font-arabic text-sm text-ink/60" dir="rtl" lang="ar">
              غرفة المدرسين
            </span>
          </span>
        </Link>
        {nav}
        {footer}
      </aside>

      {/* mobile bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b-2 border-ink bg-paper px-4 h-14">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="w-8" />
          <span className="font-display italic text-xl">Staff Room</span>
        </Link>
        <button type="button" onClick={() => setOpen(!open)} className="p-2" aria-label="Menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-paper-2 p-5 flex flex-col">
          {nav}
          {footer}
        </div>
      )}

      <main className="min-w-0 px-4 md:px-10 py-8 md:py-12">
        <div className="flex justify-end mb-6">
          <BaghdadClock label="BGD" locale="en" />
        </div>
        {!migrated && (
          <div className="mb-8 border-2 border-ink bg-saffron p-4 text-sm">
            <strong className="font-mono uppercase text-xs">Setup needed:</strong> run{' '}
            <code className="font-mono">supabase/migrations/20261024000000_platform.sql</code> in the Supabase SQL editor, then add
            your email to the <code className="font-mono">staff</code> table. Until then the timetable and inbox can&rsquo;t save, and
            any signed-in user can see this room.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
