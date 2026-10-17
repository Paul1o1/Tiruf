import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// GET worker profile + ratings
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const workerResult = await query(
      `SELECT wp.*, u.email
       FROM worker_profiles wp
       JOIN users u ON wp.user_id = u.id
       WHERE wp.id = $1`,
      [id]
    );
    if (!workerResult.rows[0]) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const ratingsResult = await query(
      `SELECT r.stars, r.comment, r.created_at, fp.facility_name
       FROM ratings r
       JOIN facility_profiles fp ON r.rater_id = fp.user_id
       WHERE r.ratee_id = (SELECT user_id FROM worker_profiles WHERE id = $1)
         AND r.rater_type = 'facility'
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    return NextResponse.json({
      worker: workerResult.rows[0],
      ratings: ratingsResult.rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update own worker profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.userType !== 'worker') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { fullName, cadre, yearsExperience, bio } = await req.json();

    // Verify ownership
    const check = await query(
      'SELECT id FROM worker_profiles WHERE id = $1 AND user_id = $2', [id, user.userId]
    );
    if (!check.rows[0]) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const result = await query(
      `UPDATE worker_profiles
       SET full_name = COALESCE($1, full_name),
           cadre = COALESCE($2, cadre),
           years_experience = COALESCE($3, years_experience),
           bio = COALESCE($4, bio)
       WHERE id = $5 RETURNING *`,
      [fullName, cadre, yearsExperience, bio, id]
    );

    return NextResponse.json({ worker: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
