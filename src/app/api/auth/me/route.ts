import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let profile = null;
  try {
    if (user.userType === 'worker') {
      const result = await query(
        'SELECT * FROM worker_profiles WHERE user_id = $1',
        [user.userId]
      );
      profile = result.rows[0] || null;
    } else {
      const result = await query(
        'SELECT * FROM facility_profiles WHERE user_id = $1',
        [user.userId]
      );
      profile = result.rows[0] || null;
    }
  } catch {
    // DB not connected — return user without profile
  }

  return NextResponse.json({ ...user, profile });
}

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('tiruf_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
