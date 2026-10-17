import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// GET single shift details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const result = await query(
      `SELECT s.*, fp.facility_name, fp.location, fp.description as facility_description,
        fp.facility_type, fp.avg_rating as facility_rating,
        wp.full_name as confirmed_worker_name
       FROM shifts s
       JOIN facility_profiles fp ON s.facility_id = fp.id
       LEFT JOIN worker_profiles wp ON s.confirmed_worker_id = wp.id
       WHERE s.id = $1`,
      [id]
    );
    if (!result.rows[0]) return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    return NextResponse.json({ shift: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update shift status (cancel)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  try {
    const facilityResult = await query(
      'SELECT id FROM facility_profiles WHERE user_id = $1', [user.userId]
    );
    const facilityId = facilityResult.rows[0]?.id;

    const result = await query(
      `UPDATE shifts SET status = $1
       WHERE id = $2 AND facility_id = $3
       RETURNING *`,
      [status, id, facilityId]
    );
    if (!result.rows[0]) return NextResponse.json({ error: 'Shift not found or unauthorized' }, { status: 404 });
    return NextResponse.json({ shift: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
