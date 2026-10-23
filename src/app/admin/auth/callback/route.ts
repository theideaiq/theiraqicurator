import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Lands magic-link sign-ins: swaps the one-time code for a session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const destination = next && next.startsWith('/admin') ? next : '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destination}`);
  }
  return NextResponse.redirect(`${origin}/admin/login?error=link`);
}
