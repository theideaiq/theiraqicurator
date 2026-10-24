import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Lands email sign-ins (magic link, password reset, invite) and turns them
 * into a session cookie. Handles both shapes Supabase can send:
 *  - `?code=` (PKCE) — needs the same browser that asked for the link;
 *  - `?token_hash=&type=` — works from any browser or device.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get('next');
  const destination = next && next.startsWith('/staff') ? next : '/staff';

  const fail = (reason: string) => {
    const url = new URL('/staff/login', origin);
    url.searchParams.set('error', reason);
    return NextResponse.redirect(url);
  };

  // Supabase reports its own failures (expired link, etc.) as query params.
  const upstream = searchParams.get('error_description') ?? searchParams.get('error');
  if (upstream) return fail(upstream);

  const supabase = await createClient();
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail(error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return fail(
        /verifier/i.test(error.message)
          ? 'Open the sign-in link in the same browser you requested it from, or ask for a new one.'
          : error.message
      );
    }
  } else {
    return fail('That sign-in link is incomplete. Ask for a new one.');
  }

  // A password-reset link lands on the account page so a new password can be set.
  return NextResponse.redirect(new URL(type === 'recovery' ? '/staff/account?reset=1' : destination, origin));
}
