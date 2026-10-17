import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// POST — facility marks a shift as complete
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const result = await query(
      `UPDATE shifts SET status = 'completed'
       WHERE id = $1 AND facility_id = $2 AND status = 'filled'
       RETURNING *`,
      [shiftId, facilityId]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Shift not found or not in filled state' }, { status: 404 });
    }

    // Increment worker's shifts_completed counter
    const shift = result.rows[0];
    if (shift.confirmed_worker_id) {
      await query(
        'UPDATE worker_profiles SET shifts_completed = shifts_completed + 1 WHERE id = $1',
        [shift.confirmed_worker_id]
      );
    }

    return NextResponse.json({ message: 'Shift marked as complete', shift: result.rows[0] });
  } catch (err) {
    console.error('Complete shift error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
