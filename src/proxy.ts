import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // ไม่มี token พยายามเข้า /manager → redirect ไป /auth
  if (pathname.startsWith('/manager') && !token) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('error', 'no_token');
    return NextResponse.redirect(url);
  }

  // มี token อยู่หน้า /auth → redirect ไป /manager
  if (pathname === '/auth' && token) {
    return NextResponse.redirect(new URL('/manager', request.url));
  }

  // ป้องกัน cache หน้า /manager/*
  if (pathname.startsWith('/manager')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '-1');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manager/:path*', '/auth'],
};
