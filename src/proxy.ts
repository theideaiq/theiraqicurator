import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The staff room lives outside the localised site and needs a session.
  if (pathname.startsWith('/admin')) {
    const { response, user } = await updateSession(request, NextResponse.next({ request }));
    const isPublic = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/auth');
    if (!user && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (user && pathname.startsWith('/admin/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return response;
  }

  const { response } = await updateSession(request, intlMiddleware(request));
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)'],
};
