import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { SignOut } from './SignOut';

export function NotStaff({ email }: { email: string }) {
  return (
    <main className="min-h-screen paper-lines flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <Logo badge className="w-28 mx-auto -rotate-12" />
        <h1 className="mt-6 font-display italic text-5xl leading-none">Hall pass, please.</h1>
        <p className="mt-4 text-ink/70">
          <strong>{email}</strong> is signed in but isn&rsquo;t on the staff list yet. Ask an admin to add you to the{' '}
          <code className="font-mono text-sm bg-saffron/40 px-1">staff</code> table.
        </p>
        <div className="mt-8 flex justify-center gap-3 font-mono text-xs uppercase">
          <Link href="/" className="px-4 py-2.5 border-2 border-ink rounded-full hover:bg-saffron">
            Back to site
          </Link>
          <SignOut className="px-4 py-2.5 bg-ink text-paper rounded-full hover:bg-lapis uppercase" />
        </div>
      </div>
    </main>
  );
}
