import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// GET — fetch facility profile
export async function GET() {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      'SELECT * FROM facility_profiles WHERE user_id = $1',
      [user.userId]
    );
    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update facility profile (contact_phone, description)
export async function PATCH(req: NextRequest) {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { contact_phone, description } = await req.json();
    await query(
      `UPDATE facility_profiles
       SET contact_phone = COALESCE($1, contact_phone),
           description = COALESCE($2, description)
       WHERE user_id = $3`,
      [contact_phone ?? null, description ?? null, user.userId]
    );
    return NextResponse.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
