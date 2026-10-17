import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// POST — facility confirms a worker for a shift
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: shiftId } = await params;
  const { workerId } = await req.json();

  if (!workerId) {
    return NextResponse.json({ error: 'workerId required' }, { status: 400 });
  }

  try {
    const facilityResult = await query(
      'SELECT id FROM facility_profiles WHERE user_id = $1', [user.userId]
    );
    const facilityId = facilityResult.rows[0]?.id;

    // Verify shift belongs to this facility and is open
    const shiftResult = await query(
      'SELECT * FROM shifts WHERE id = $1 AND facility_id = $2 AND status = $3',
      [shiftId, facilityId, 'open']
    );
    if (!shiftResult.rows[0]) {
      return NextResponse.json({ error: 'Shift not found or not open' }, { status: 404 });
    }
    const shift = shiftResult.rows[0];

    // Check the worker actually applied
    const appCheck = await query(
      'SELECT id FROM shift_applications WHERE shift_id = $1 AND worker_id = $2',
      [shiftId, workerId]
    );
    if (!appCheck.rows[0]) {
      return NextResponse.json({ error: 'Worker has not applied for this shift' }, { status: 400 });
    }

    // Double-check for worker conflict
    const conflict = await query(
      `SELECT s.shift_date, s.start_time, s.end_time, fp.facility_name
       FROM shifts s
       JOIN facility_profiles fp ON s.facility_id = fp.id
       JOIN shift_applications sa ON sa.shift_id = s.id
       WHERE sa.worker_id = $1
         AND sa.status = 'confirmed'
         AND s.shift_date = $2
         AND s.id != $3
         AND (
           (s.start_time < $5::time AND s.end_time > $4::time)
           OR (s.start_time >= $4::time AND s.start_time < $5::time)
         )`,
      [workerId, shift.shift_date, shiftId, shift.start_time, shift.end_time]
    );

    if (conflict.rows.length > 0) {
      const c = conflict.rows[0];
      return NextResponse.json({
        error: `This worker already has a confirmed shift at ${c.facility_name} on that date and time.`,
        conflict: true,
      }, { status: 409 });
    }

    // Confirm this worker, reject all others
    await query(
      `UPDATE shift_applications SET status = 'confirmed'
       WHERE shift_id = $1 AND worker_id = $2`,
      [shiftId, workerId]
    );
    await query(
      `UPDATE shift_applications SET status = 'rejected'
       WHERE shift_id = $1 AND worker_id != $2`,
      [shiftId, workerId]
    );

    // Update shift status to filled, set confirmed_worker_id
    await query(
      `UPDATE shifts SET status = 'filled', confirmed_worker_id = $1
       WHERE id = $2`,
      [workerId, shiftId]
    );

    return NextResponse.json({ message: 'Worker confirmed successfully' });
  } catch (err) {
    console.error('Confirm error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
