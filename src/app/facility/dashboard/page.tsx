import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { StatCard, ShiftCard } from '@/components/ui';
import Link from 'next/link';

interface FacilityRow {
  id: number;
  facility_name: string;
  facility_type: string;
  location: string;
}

interface StatsRow {
  open_count: string;
  filled_count: string;
  completed_count: string;
  total_count: string;
}

type ShiftRow = Record<string, unknown>;

export default async function FacilityDashboard() {
  const user = await getServerUser();
  if (!user) return null;

  let facility: FacilityRow | null = null;
  let stats: StatsRow = { open_count: '0', filled_count: '0', completed_count: '0', total_count: '0' };
  let openShifts: ShiftRow[] = [];
  let filledShifts: ShiftRow[] = [];
  let readyToComplete: ShiftRow[] = [];

  try {
    const facilityResult = await query(
      'SELECT * FROM facility_profiles WHERE user_id = $1',
      [user.userId]
    );
    facility = facilityResult.rows[0] || null;

    if (facility) {
      const [statsResult, openResult, filledResult, completeResult] = await Promise.all([
        query(
          `SELECT
            COUNT(*) FILTER (WHERE status = 'open') as open_count,
            COUNT(*) FILTER (WHERE status = 'filled') as filled_count,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
            COUNT(*) as total_count
           FROM shifts WHERE facility_id = $1`,
          [facility.id]
        ),
        query(
          `SELECT s.*,
            (SELECT COUNT(*) FROM shift_applications WHERE shift_id = s.id AND status = 'pending') as pending_count
           FROM shifts s
           WHERE s.facility_id = $1 AND s.status = 'open'
           ORDER BY s.shift_date ASC
           LIMIT 5`,
          [facility.id]
        ),
        query(
          `SELECT s.*, wp.full_name as confirmed_worker_name
           FROM shifts s
           LEFT JOIN worker_profiles wp ON s.confirmed_worker_id = wp.id
           WHERE s.facility_id = $1 AND s.status = 'filled' AND s.shift_date >= CURRENT_DATE
           ORDER BY s.shift_date ASC
           LIMIT 5`,
          [facility.id]
        ),
        query(
          `SELECT s.*, wp.full_name as confirmed_worker_name, wp.id as worker_profile_id
           FROM shifts s
           LEFT JOIN worker_profiles wp ON s.confirmed_worker_id = wp.id
           WHERE s.facility_id = $1 AND s.status = 'filled' AND s.shift_date < CURRENT_DATE
           ORDER BY s.shift_date DESC`,
          [facility.id]
        ),
      ]);

      stats = statsResult.rows[0] || stats;
      openShifts = openResult.rows;
      filledShifts = filledResult.rows;
      readyToComplete = completeResult.rows;
    }
  } catch {
    // DB not connected yet — show graceful empty state below
  }

  /* ── No profile (demo mode OR DB connected but no profile yet) ── */
  if (!facility) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Facility Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {user.email}
          </p>
        </div>

        {/* Stats placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Open Shifts" value="—" icon="🟢" />
          <StatCard label="Confirmed" value="—" icon="✅" color="var(--teal)" />
          <StatCard label="Completed" value="—" icon="🏁" />
          <StatCard label="Total Posted" value="—" icon="📋" color="var(--blue)" />
        </div>

        <Link
          href="/facility/shifts/new"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white text-sm mb-6"
          style={{ background: 'var(--blue)' }}
        >
          ➕ Post a New Shift
        </Link>

        <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)', background: 'var(--white)' }}>
          <div className="text-5xl mb-4">🏥</div>
          <p className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome to Tiruf!
          </p>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Your facility dashboard will populate once the database is connected and seeded. Use the navigation to explore the UI.
          </p>
          <Link
            href="/facility/shifts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'var(--blue)' }}
          >
            View My Shifts →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {facility.facility_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {facility.facility_type} · {facility.location}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Open Shifts" value={stats.open_count || 0} icon="🟢" />
        <StatCard label="Confirmed" value={stats.filled_count || 0} icon="✅" color="var(--teal)" />
        <StatCard label="Completed" value={stats.completed_count || 0} icon="🏁" />
        <StatCard label="Total Posted" value={stats.total_count || 0} icon="📋" color="var(--blue)" />
      </div>

      {/* Shifts ready to mark complete */}
      {readyToComplete.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border-2" style={{ borderColor: 'var(--teal)', background: 'var(--teal-light)' }}>
          <p className="font-semibold text-sm mb-3" style={{ color: 'var(--teal-dark)' }}>
            🏁 Shifts ready to mark complete
          </p>
          <div className="space-y-2">
            {readyToComplete.map(s => (
              <CompleteShiftRow key={s.id as number} shift={s as { id: number; role_needed: string; shift_date: string; confirmed_worker_name?: string }} />
            ))}
          </div>
        </div>
      )}

      {/* Quick action */}
      <Link
        href="/facility/shifts/new"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white text-sm mb-6"
        style={{ background: 'var(--blue)' }}
      >
        ➕ Post a New Shift
      </Link>

      {/* Open shifts */}
      {openShifts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Open Shifts</h2>
            <Link href="/facility/shifts" className="text-sm" style={{ color: 'var(--blue)' }}>See all →</Link>
          </div>
          <div className="space-y-3">
            {openShifts.map(s => (
              <ShiftCard
                key={s.id as number}
                shift={s as Parameters<typeof ShiftCard>[0]['shift']}
                actions={
                  Number(s.pending_count) > 0 ? (
                    <Link
                      href={`/facility/shifts/${s.id}/applicants`}
                      className="block w-full text-center py-2 rounded-lg text-sm font-semibold"
                      style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
                    >
                      View {s.pending_count as number} Applicant{(s.pending_count as number) !== 1 ? 's' : ''}
                    </Link>
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmed upcoming */}
      {filledShifts.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Upcoming Confirmed</h2>
          <div className="space-y-3">
            {filledShifts.map(s => (
              <ShiftCard key={s.id as number} shift={s as Parameters<typeof ShiftCard>[0]['shift']} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {openShifts.length === 0 && filledShifts.length === 0 && readyToComplete.length === 0 && (
        <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No active shifts</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Post your first shift to start finding health workers.</p>
          <Link
            href="/facility/shifts/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'var(--blue)' }}
          >
            Post a Shift →
          </Link>
        </div>
      )}
    </div>
  );
}

function CompleteShiftRow({ shift }: { shift: { id: number; role_needed: string; shift_date: string; confirmed_worker_name?: string } }) {
  const d = new Date(shift.shift_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2" style={{ border: '1px solid var(--border)' }}>
      <div className="text-sm">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{shift.role_needed}</span>
        <span style={{ color: 'var(--text-secondary)' }}> · {d}</span>
        {shift.confirmed_worker_name && (
          <span style={{ color: 'var(--text-secondary)' }}> · {shift.confirmed_worker_name}</span>
        )}
      </div>
      <a
        href={`/facility/shifts/${shift.id}/complete`}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ background: 'var(--teal)', color: 'white' }}
      >
        Mark Done
      </a>
    </div>
  );
}
