import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// POST — submit a rating after shift completion
export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { shiftId, stars, comment } = await req.json();

    if (!shiftId || !stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 });
    }

    // Get shift info
    const shiftResult = await query(
      `SELECT s.*, fp.user_id as facility_user_id, wp.user_id as worker_user_id,
        fp.id as facility_profile_id, wp.id as worker_profile_id
       FROM shifts s
       JOIN facility_profiles fp ON s.facility_id = fp.id
       LEFT JOIN worker_profiles wp ON s.confirmed_worker_id = wp.id
       WHERE s.id = $1`,
      [shiftId]
    );

    if (!shiftResult.rows[0]) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    const shift = shiftResult.rows[0];

    if (shift.status !== 'completed') {
      return NextResponse.json({ error: 'Can only rate completed shifts' }, { status: 400 });
    }

    let rateeId: number;
    let raterType: string;

    if (user.userType === 'facility') {
      // Facility rates the worker
      raterType = 'facility';
      rateeId = shift.worker_user_id;
      if (!rateeId) return NextResponse.json({ error: 'No worker to rate' }, { status: 400 });

      // Insert rating
      await query(
        `INSERT INTO ratings (shift_id, rater_id, ratee_id, rater_type, stars, comment)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [shiftId, user.userId, rateeId, raterType, stars, comment || '']
      );

      // Update worker's avg rating
      await query(
        `UPDATE worker_profiles
         SET avg_rating = (SELECT AVG(stars) FROM ratings WHERE ratee_id = $1),
             rating_count = (SELECT COUNT(*) FROM ratings WHERE ratee_id = $1)
         WHERE user_id = $1`,
        [rateeId]
      );
    } else {
      // Worker rates the facility
      raterType = 'worker';
      rateeId = shift.facility_user_id;

      await query(
        `INSERT INTO ratings (shift_id, rater_id, ratee_id, rater_type, stars, comment)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [shiftId, user.userId, rateeId, raterType, stars, comment || '']
      );

      // Update facility's avg rating
      await query(
        `UPDATE facility_profiles
         SET avg_rating = (SELECT AVG(stars) FROM ratings WHERE ratee_id = $1),
             rating_count = (SELECT COUNT(*) FROM ratings WHERE ratee_id = $1)
         WHERE user_id = $1`,
        [rateeId]
      );
    }

    return NextResponse.json({ message: 'Rating submitted successfully' }, { status: 201 });
  } catch (err) {
    console.error('Rating error:', err);
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'You have already rated this shift' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
