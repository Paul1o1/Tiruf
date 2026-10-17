import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { ShiftCard } from '@/components/ui';
import Link from 'next/link';

// Helper type
type Shift = Record<string, unknown>;

export default async function FacilityShiftsPage() {
  const user = await getServerUser();
  if (!user) return null;

  let open: Shift[] = [];
  let filled: Shift[] = [];
  let completed: Shift[] = [];
  let cancelled: Shift[] = [];
  let total = 0;

  try {
    const facilityResult = await query(
      'SELECT id FROM facility_profiles WHERE user_id = $1', [user.userId]
    );
    const facilityId = facilityResult.rows[0]?.id;

    if (facilityId) {
      const shiftsResult = await query(
        `SELECT s.*, wp.full_name as confirmed_worker_name,
          (SELECT COUNT(*) FROM shift_applications WHERE shift_id = s.id AND status = 'pending') as pending_count
         FROM shifts s
         LEFT JOIN worker_profiles wp ON s.confirmed_worker_id = wp.id
         WHERE s.facility_id = $1
         ORDER BY s.shift_date DESC, s.start_time ASC`,
        [facilityId]
      );
      const shifts = shiftsResult.rows;
      total = shifts.length;
      open      = shifts.filter(s => s.status === 'open');
      filled    = shifts.filter(s => s.status === 'filled');
      completed = shifts.filter(s => s.status === 'completed');
      cancelled = shifts.filter(s => s.status === 'cancelled');
    }
  } catch {
    // DB not connected yet
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Shifts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total} total posted</p>
        </div>
        <Link href="/facility/shifts/new"
          className="px-4 py-2 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'var(--blue)' }}>
          ➕ Post Shift
        </Link>
      </div>

      {total === 0 && (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No shifts posted yet</p>
          <Link href="/facility/shifts/new" className="text-sm font-medium" style={{ color: 'var(--blue)' }}>
            Post your first shift →
          </Link>
        </div>
      )}

      {open.length > 0 && (
        <ShiftSection title="Open" count={open.length} color="var(--blue)">
          {open.map(s => (
            <ShiftCard key={s.id as number} shift={s as Parameters<typeof ShiftCard>[0]['shift']}
              actions={
                <div className="flex gap-2">
                  {Number(s.pending_count) > 0 && (
                    <Link href={`/facility/shifts/${s.id}/applicants`}
                      className="flex-1 text-center py-2 rounded-lg text-sm font-semibold"
                      style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                      {s.pending_count as number} Applicant{(s.pending_count as number) !== 1 ? 's' : ''}
                    </Link>
                  )}
                  <Link href={`/facility/shifts/${s.id}/cancel`}
                    className="px-3 py-2 rounded-lg text-sm"
                    style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
                    Cancel
                  </Link>
                </div>
              }
            />
          ))}
        </ShiftSection>
      )}

      {filled.length > 0 && (
        <ShiftSection title="Confirmed" count={filled.length} color="var(--teal)">
          {filled.map(s => (
            <ShiftCard key={s.id as number} shift={s as Parameters<typeof ShiftCard>[0]['shift']}
              actions={
                <Link href={`/facility/shifts/${s.id}/complete`}
                  className="block w-full text-center py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'var(--teal)' }}>
                  Mark as Complete
                </Link>
              }
            />
          ))}
        </ShiftSection>
      )}

      {completed.length > 0 && (
        <ShiftSection title="Completed" count={completed.length} color="#15803D">
          {completed.map(s => (
            <ShiftCard key={s.id as number} shift={s as Parameters<typeof ShiftCard>[0]['shift']} />
          ))}
        </ShiftSection>
      )}

      {cancelled.length > 0 && (
        <ShiftSection title="Cancelled" count={cancelled.length} color="#6B7280">
          {cancelled.map(s => (
            <ShiftCard key={s.id as number} shift={s as Parameters<typeof ShiftCard>[0]['shift']} />
          ))}
        </ShiftSection>
      )}
    </div>
  );
}

function ShiftSection({ title, count, color, children }: {
  title: string; count: number; color: string; children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-3 h-3 rounded-full" style={{ background: color }} />
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {title} ({count})
        </h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
