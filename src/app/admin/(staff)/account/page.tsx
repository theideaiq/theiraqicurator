'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, ErrorNote, Field, PageTitle, inputClass } from '@/components/admin/ui';

function PasswordForm() {
  const fromReset = useSearchParams().get('reset') === '1';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords don’t match.');
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else {
      setDone(true);
      setPassword('');
      setConfirm('');
    }
  };

  return (
    <form onSubmit={save} className="max-w-md border-2 border-ink bg-paper-2 hard-shadow p-6 flex flex-col gap-5">
      {fromReset && !done && <p className="border-2 border-saffron bg-saffron/20 px-4 py-3 text-sm">You’re signed in from the email link. Choose a password for next time.</p>}
      <ErrorNote message={error} />
      <Field label="New password" hint="At least 8 characters.">
        {(id) => <input id={id} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />}
      </Field>
      <Field label="Repeat it">
        {(id) => <input id={id} type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />}
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save password'}
      </Button>
      {done && (
        <p className="text-sm text-teal" role="status">
          Password saved. Use it on the sign-in page from now on.
        </p>
      )}
    </form>
  );
}

export default function AccountPage() {
  return (
    <div>
      <PageTitle kicker="Your account" title="Password" />
      <Suspense>
        <PasswordForm />
      </Suspense>
    </div>
  );
}
