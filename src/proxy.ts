import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tiruf-dev-secret-change-in-production'
);

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register', '/api/auth/demo', '/manifest.webmanifest', '/sw.js'];

// Static file extensions that should never require auth
const STATIC_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|otf|mp4|mp3|pdf|json|webmanifest|js)$/i;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files (images, fonts, etc.) — never redirect these
  if (STATIC_EXTENSIONS.test(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('tiruf_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userType = payload.userType as string;

    // Route guards
    if (pathname.startsWith('/worker') && userType !== 'worker') {
      return NextResponse.redirect(new URL('/facility/dashboard', req.url));
    }
    if (pathname.startsWith('/facility') && userType !== 'facility') {
      return NextResponse.redirect(new URL('/worker/dashboard', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    // Exclude Next.js internals, static assets, and common file extensions
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|otf|mp4|mp3|pdf)).*)',
  ],
};
