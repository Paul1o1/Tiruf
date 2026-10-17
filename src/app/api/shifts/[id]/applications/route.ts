import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// GET — list applications for a shift (facility only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: shiftId } = await params;

  try {
    const facilityResult = await query(
      'SELECT id FROM facility_profiles WHERE user_id = $1', [user.userId]
    );
    const facilityId = facilityResult.rows[0]?.id;

    // Verify the shift belongs to this facility
    const shiftCheck = await query(
      'SELECT id FROM shifts WHERE id = $1 AND facility_id = $2', [shiftId, facilityId]
    );
    if (!shiftCheck.rows[0]) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    const result = await query(
      `SELECT sa.id, sa.status, sa.applied_at,
        wp.id as worker_id, wp.full_name, wp.cadre, wp.years_experience,
        wp.bio, wp.avg_rating, wp.rating_count, wp.shifts_completed,
        u.email
       FROM shift_applications sa
       JOIN worker_profiles wp ON sa.worker_id = wp.id
       JOIN users u ON wp.user_id = u.id
       WHERE sa.shift_id = $1
       ORDER BY sa.applied_at ASC`,
      [shiftId]
    );

    return NextResponse.json({ applications: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
