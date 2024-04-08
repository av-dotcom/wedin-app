import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('_vercel_jwt')?.value;
  const { pathname } = request.nextUrl;

  console.log('request', request);
  console.log('cookies', request.cookies);
  console.log('middleware.ts', sessionToken, pathname);

  if (!sessionToken && pathname === '/') {
    return NextResponse.redirect(new URL('/gifts', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
