import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long'
);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('session')?.value;

  if (req.nextUrl.pathname.startsWith('/chat')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // If already logged in and tries to go to landing page
  if (req.nextUrl.pathname === '/' && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/chat', req.url));
    } catch (err) {
      // Token invalid, allow landing page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*', '/'],
};
