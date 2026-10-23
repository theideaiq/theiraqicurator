'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { Button, ErrorNote, Field, inputClass } from '@/components/admin/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next')?.startsWith('/admin') ? params.get('next')! : '/admin';
  const [mode, setMode] = useState<'password' | 'link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get('error') ? 'That sign-in link expired. Ask for a fresh one.' : null);
  const [linkSent, setLinkSent] = useState(false);

  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) setError(error.message);
      else setLinkSent(true);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div role="tablist" className="flex rounded-full border-2 border-ink overflow-hidden font-mono text-xs uppercase">
        {(['password', 'link'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setLinkSent(false);
            }}
            className={`flex-1 py-2 ${mode === m ? 'bg-ink text-paper' : 'hover:bg-saffron'}`}
          >
            {m === 'password' ? 'Password' : 'Email me a link'}
          </button>
        ))}
      </div>

      {!configured && <ErrorNote message="Supabase isn't configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." />}
      <ErrorNote message={error} />

      <Field label="Email">
        {(id) => <input id={id} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />}
      </Field>
      {mode === 'password' && (
        <Field label="Password">
          {(id) => (
            <input id={id} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          )}
        </Field>
      )}

      {linkSent ? (
        <p className="border-2 border-teal bg-teal/10 px-4 py-3 text-sm">Check your inbox — the link signs you straight in.</p>
      ) : (
        <Button type="submit" disabled={busy || !configured} className="py-3.5">
          {busy ? 'One sec…' : mode === 'password' ? 'Enter the staff room →' : 'Send sign-in link →'}
        </Button>
      )}
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen paper-lines grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-lapis text-paper p-12 border-e-2 border-ink overflow-hidden relative">
        <p className="font-mono text-xs uppercase">The Iraqi Curator · Staff only</p>
        <h1 className="font-display italic text-[8vw] leading-[0.85]">
          Teachers&rsquo;
          <br />
          lounge.
        </h1>
        <p className="font-arabic text-4xl" dir="rtl" lang="ar">
          غرفة المدرسين
        </p>
        <motion.div
          initial={{ rotate: -40, scale: 0.6, opacity: 0 }}
          animate={{ rotate: -12, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 10 }}
          className="absolute end-10 top-24 w-56"
        >
          <Logo badge className="w-full" />
        </motion.div>
      </section>

      <section className="flex items-center justify-center p-6 pl-[5.5rem] lg:pl-24">
        <div className="w-full max-w-sm">
          <Logo className="w-16 mb-6 lg:hidden" />
          <p className="font-mono text-xs uppercase text-brick">Staff room</p>
          <h2 className="font-display italic text-5xl leading-none mt-1 mb-8">Sign in.</h2>
          <Suspense>
            <LoginForm />
          </Suspense>
          <Link href="/" className="block mt-10 font-mono text-xs uppercase hover:text-lapis">
            ← Back to the site
          </Link>
        </div>
      </section>
    </main>
  );
}
