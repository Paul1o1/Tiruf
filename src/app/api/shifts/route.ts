import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerUser } from '@/lib/auth';

// GET all shifts (worker sees open shifts matching their cadre, facility sees their own)
export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');

  try {
    if (user.userType === 'worker') {
      // Get worker cadre
      const workerResult = await query(
        'SELECT id, cadre FROM worker_profiles WHERE user_id = $1',
        [user.userId]
      );
      if (!workerResult.rows[0]) return NextResponse.json({ shifts: [] });
      const { id: workerId, cadre } = workerResult.rows[0];

      const role = searchParams.get('role');

      if (filter === 'my-applications') {
        const appsResult = await query(
          `SELECT sa.id as app_id, sa.status as app_status, sa.applied_at,
                  s.id as shift_id, s.role_needed, s.shift_date, s.start_time, s.end_time, s.pay_etb,
                  fp.facility_name, fp.location, fp.contact_phone
           FROM shift_applications sa
           JOIN shifts s ON sa.shift_id = s.id
           JOIN facility_profiles fp ON s.facility_id = fp.id
           WHERE sa.worker_id = $1
           ORDER BY sa.applied_at DESC`,
          [workerId]
        );
        return NextResponse.json({ applications: appsResult.rows });
      } else if (filter === 'confirmed') {
        // Calendar: all confirmed shifts for this worker
        const shiftsQuery = `
          SELECT s.*, fp.facility_name, fp.location, fp.contact_phone,
            sa.status as application_status
          FROM shifts s
          JOIN facility_profiles fp ON s.facility_id = fp.id
          JOIN shift_applications sa ON sa.shift_id = s.id AND sa.worker_id = $1
          WHERE sa.status = 'confirmed'
          ORDER BY s.shift_date ASC, s.start_time ASC
        `;
        const result = await query(shiftsQuery, [workerId]);
        return NextResponse.json({ shifts: result.rows, workerId });
      } else {
        // Available open shifts
        let shiftsQuery = `
          SELECT s.*, fp.facility_name, fp.location,
            (SELECT status FROM shift_applications WHERE shift_id = s.id AND worker_id = $1) as my_application
          FROM shifts s
          JOIN facility_profiles fp ON s.facility_id = fp.id
          WHERE s.status = 'open'
            AND s.shift_date >= CURRENT_DATE
        `;
        const params: unknown[] = [workerId];
        if (role && role !== 'All') {
          params.push(role);
          shiftsQuery += ` AND s.role_needed = $2`;
        }
        shiftsQuery += ` ORDER BY s.shift_date ASC, s.start_time ASC`;

        const result = await query(shiftsQuery, params);
        return NextResponse.json({ shifts: result.rows, workerId });
      }
    } else {
      // Facility sees their own shifts
      const facilityResult = await query(
        'SELECT id FROM facility_profiles WHERE user_id = $1',
        [user.userId]
      );
      if (!facilityResult.rows[0]) return NextResponse.json({ shifts: [] });
      const facilityId = facilityResult.rows[0].id;

      const statusFilter = filter ? `AND s.status = '${filter}'` : '';
      const result = await query(
        `SELECT s.*,
          wp.full_name as confirmed_worker_name,
          wp.cadre as confirmed_worker_cadre,
          (SELECT COUNT(*) FROM shift_applications WHERE shift_id = s.id AND status = 'pending') as pending_count
         FROM shifts s
         LEFT JOIN worker_profiles wp ON s.confirmed_worker_id = wp.id
         WHERE s.facility_id = $1
         ${statusFilter}
         ORDER BY s.shift_date DESC, s.start_time ASC`,
        [facilityId]
      );
      return NextResponse.json({ shifts: result.rows, facilityId });
    }
  } catch (err) {
    console.error('GET shifts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new shift (facility only)
export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || user.userType !== 'facility') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { roleNeeded, shiftDate, startTime, endTime, payEtb, description } = await req.json();

    if (!roleNeeded || !shiftDate || !startTime || !endTime || !payEtb) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const facilityResult = await query(
      'SELECT id FROM facility_profiles WHERE user_id = $1',
      [user.userId]
    );
    if (!facilityResult.rows[0]) {
      return NextResponse.json({ error: 'Facility profile not found' }, { status: 404 });
    }
    const facilityId = facilityResult.rows[0].id;

    const result = await query(
      `INSERT INTO shifts (facility_id, role_needed, shift_date, start_time, end_time, pay_etb, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open') RETURNING *`,
      [facilityId, roleNeeded, shiftDate, startTime, endTime, payEtb, description || '']
    );

    return NextResponse.json({ shift: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('POST shift error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
