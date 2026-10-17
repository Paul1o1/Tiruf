import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { StarRating } from '@/components/ui';

interface Rating {
  id: number;
  stars: number;
  comment: string;
  created_at: string;
  rater_name: string;
}

export default async function FacilityProfilePage() {
  const user = await getServerUser();
  if (!user) return null;

  let facility = null;
  let ratings: Rating[] = [];

  try {
    const profResult = await query(
      'SELECT * FROM facility_profiles WHERE user_id = $1',
      [user.userId]
    );
    facility = profResult.rows[0] || null;

    if (facility) {
      const ratResult = await query(
        `SELECT r.id, r.stars, r.comment, r.created_at,
                wp.full_name as rater_name
         FROM ratings r
         JOIN worker_profiles wp ON r.rater_id = wp.user_id
         WHERE r.ratee_id = $1 AND r.rater_type = 'worker'
         ORDER BY r.created_at DESC
         LIMIT 30`,
        [user.userId]
      );
      ratings = ratResult.rows;
    }
  } catch {
    // DB not connected yet — gracefully show empty state
  }

  if (!facility) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Facility Profile</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Your public facility profile</p>
        <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: 'var(--blue-light)' }}>🏥</div>
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Your profile will populate once the database is connected and seeded.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['Avg rating', 'Reviews received'].map(l => (
              <div key={l} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-secondary)' }}>—</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const avg = facility.avg_rating && Number(facility.avg_rating) > 0
    ? Number(facility.avg_rating).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Facility Profile
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Your public facility profile
      </p>

      {/* Identity card */}
      <div className="bg-white rounded-2xl border p-6 mb-5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: 'var(--blue-light)' }}
          >
            🏥
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {facility.facility_name}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {facility.facility_type} · {facility.location}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--blue)' }}>
              {avg ?? '—'}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Avg rating</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {facility.rating_count || 0}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Reviews received</div>
          </div>
        </div>

        {avg && (
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
            <StarRating value={Number(avg)} size="md" />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {avg} average from workers
            </span>
          </div>
        )}

        {facility.contact_phone && (
          <div className="mt-4 pt-4 border-t text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            📞 {facility.contact_phone}
          </div>
        )}

        {facility.description && (
          <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {facility.description}
          </div>
        )}
      </div>

      {/* Reviews from workers */}
      <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Reviews from Workers
      </h2>
      {ratings.length > 0 ? (
        <div className="space-y-3">
          {ratings.map(r => (
            <div key={r.id} className="bg-white rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    👤 {r.rater_name}
                  </span>
                  <StarRating value={r.stars} size="sm" />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(r.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: 'var(--border)' }}>
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No reviews yet — workers will rate you after completing shifts.
          </p>
        </div>
      )}
    </div>
  );
}
