import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// GET — ratings received by this facility (left by workers)
export async function GET() {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT r.id, r.stars, r.comment, r.created_at,
              wp.full_name as rater_name
       FROM ratings r
       JOIN worker_profiles wp ON r.rater_id = wp.user_id
       WHERE r.ratee_id = $1 AND r.rater_type = 'worker'
       ORDER BY r.created_at DESC
       LIMIT 30`,
      [user.userId]
    );
    return NextResponse.json({ ratings: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ratings: [] });
  }
}
