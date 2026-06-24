import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('julu_session_token')?.value;
  
  const { pathname } = request.nextUrl;

  // console.log({ middleware: token, pathname })

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname === '/';
  const isAuthRoute = pathname === '/login';

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
  ],
};