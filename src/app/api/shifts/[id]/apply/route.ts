import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// POST — worker applies for a shift
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'worker') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: shiftId } = await params;

  try {
    // Get worker profile
    const workerResult = await query(
      'SELECT id FROM worker_profiles WHERE user_id = $1', [user.userId]
    );
    if (!workerResult.rows[0]) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }
    const workerId = workerResult.rows[0].id;

    // Get the shift details
    const shiftResult = await query(
      'SELECT * FROM shifts WHERE id = $1', [shiftId]
    );
    if (!shiftResult.rows[0]) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }
    const shift = shiftResult.rows[0];

    if (shift.status !== 'open') {
      return NextResponse.json({ error: 'This shift is no longer open' }, { status: 409 });
    }

    // CONFLICT DETECTION: check if worker has a confirmed shift overlapping this date/time
    const conflict = await query(
      `SELECT s.shift_date, s.start_time, s.end_time, fp.facility_name
       FROM shifts s
       JOIN facility_profiles fp ON s.facility_id = fp.id
       JOIN shift_applications sa ON sa.shift_id = s.id
       WHERE sa.worker_id = $1
         AND sa.status = 'confirmed'
         AND s.shift_date = $2
         AND s.status IN ('open', 'filled')
         AND (
           (s.start_time < $4::time AND s.end_time > $3::time)
           OR (s.start_time >= $3::time AND s.start_time < $4::time)
         )`,
      [workerId, shift.shift_date, shift.start_time, shift.end_time]
    );

    if (conflict.rows.length > 0) {
      const c = conflict.rows[0];
      return NextResponse.json({
        error: `Schedule clash! You already have a confirmed shift at ${c.facility_name} on ${c.shift_date} from ${c.start_time} to ${c.end_time}.`,
        conflict: true,
      }, { status: 409 });
    }

    // Apply
    await query(
      `INSERT INTO shift_applications (shift_id, worker_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (shift_id, worker_id) DO NOTHING`,
      [shiftId, workerId]
    );

    return NextResponse.json({ message: 'Application submitted successfully' }, { status: 201 });
  } catch (err) {
    console.error('Apply error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — worker withdraws their pending application
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'worker') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: shiftId } = await params;

  try {
    const workerResult = await query(
      'SELECT id FROM worker_profiles WHERE user_id = $1', [user.userId]
    );
    if (!workerResult.rows[0]) {
      return NextResponse.json({ error: 'Worker profile not found' }, { status: 404 });
    }
    const workerId = workerResult.rows[0].id;

    // Only allow withdrawing if still pending
    const appResult = await query(
      'SELECT status FROM shift_applications WHERE shift_id = $1 AND worker_id = $2',
      [shiftId, workerId]
    );

    if (!appResult.rows[0]) {
      return NextResponse.json({ error: 'No active application found' }, { status: 404 });
    }

    if (appResult.rows[0].status === 'confirmed') {
      return NextResponse.json({ error: 'Cannot withdraw a confirmed shift. Please contact the hospital directly.' }, { status: 400 });
    }

    await query(
      'DELETE FROM shift_applications WHERE shift_id = $1 AND worker_id = $2',
      [shiftId, workerId]
    );

    return NextResponse.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    console.error('Withdraw application error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

