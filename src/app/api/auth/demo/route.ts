import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

/**
 * Demo login — creates a JWT session WITHOUT touching the database.
 * Use this to walk through the UI before Supabase is connected.
 * userId 9001 = demo worker, 9002 = demo facility.
 */
export async function POST(req: NextRequest) {
  const { userType } = await req.json();

  if (!['worker', 'facility'].includes(userType)) {
    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  }

  const token = await signToken({
    userId: userType === 'worker' ? 9001 : 9002,
    userType: userType as 'worker' | 'facility',
    email:
      userType === 'worker'
        ? 'demo.worker@tiruf.demo'
        : 'demo.facility@tiruf.demo',
  });

  const response = NextResponse.json({
    message: 'Demo login successful',
    userType,
  });

  response.cookies.set('tiruf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return response;
}
