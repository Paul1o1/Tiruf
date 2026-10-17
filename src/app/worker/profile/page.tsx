import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { StarRating } from '@/components/ui';
import Link from 'next/link';
import { Star, Check, Circle, ArrowRight } from 'lucide-react';

const DEMO_RATINGS = [
  { stars: 5, comment: 'Abebe was punctual, professional, and handled ICU patients with exceptional care.', created_at: '2026-04-28T10:00:00Z', facility_name: 'Black Lion Hospital' },
  { stars: 4, comment: 'Great midwife. Very calm under pressure during a difficult delivery.',               created_at: '2026-04-15T08:30:00Z', facility_name: 'Hayat Hospital'       },
  { stars: 5, comment: 'Would rehire immediately. Outstanding pharmacist.',                                 created_at: '2026-04-05T14:00:00Z', facility_name: 'Landmark Hospital'    },
];
const DEMO_COMPLETED = 3;

/* ── Cal.com token map ─────────────────────────────────────────────────────
   canvas:       #ffffff   surface-card:  #f5f5f5   hairline: #e5e7eb
   ink:          #111111   body:          #374151    muted:    #6b7280
   primary:      #1c2f72   r-md: 8px     r-lg: 12px
──────────────────────────────────────────────────────────────────────────── */

export default async function WorkerProfilePage() {
  const user = await getServerUser();
  if (!user) return null;

  let worker: Record<string, unknown> | null = null;
  let ratings: Array<{ stars: number; comment: string; created_at: string; facility_name: string }> = [];
  let isDemo = false;

  try {
    const wr = await query('SELECT * FROM worker_profiles WHERE user_id=$1', [user.userId]);
    worker = wr.rows[0] || null;
    if (worker) {
      const rr = await query(
        `SELECT r.stars,r.comment,r.created_at,fp.facility_name FROM ratings r JOIN facility_profiles fp ON r.rater_id=fp.user_id WHERE r.ratee_id=$1 AND r.rater_type='facility' ORDER BY r.created_at DESC LIMIT 20`,
        [user.userId]
      );
      ratings = rr.rows;
    }
  } catch { isDemo = true; }

  if (isDemo || !worker) { isDemo = true; ratings = DEMO_RATINGS; }

  const name     = (worker?.full_name as string) ?? user.email.split('@')[0];
  const cadre    = (worker?.cadre as string)  ?? 'Healthcare Worker';
  const exp      = (worker?.years_experience as number) ?? 0;
  const done     = (worker?.shifts_completed as number) ?? (isDemo ? DEMO_COMPLETED : 0);
  const avgRaw   = worker?.avg_rating ? Number(worker.avg_rating) : (isDemo ? 4.7 : 0);
  const avg      = avgRaw > 0 ? avgRaw.toFixed(1) : null;
  const rCount   = (worker?.rating_count as number) ?? (isDemo ? DEMO_RATINGS.length : 0);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join('');

  const completionRate = done > 0 ? 100 : 0;
  const levelLabel = done >= 20 ? 'Expert' : done >= 10 ? 'Senior' : done >= 5 ? 'Experienced' : 'Newcomer';

  const STATS = [
    { label: 'Shifts Done',  value: done,                  bg: '#f5f5f5' },
    { label: 'Avg Rating',   value: avg ?? '—',            bg: '#f5f5f5' },
    { label: 'Reviews',      value: rCount,                bg: '#f5f5f5' },
    { label: 'Completion',   value: `${completionRate}%`,  bg: '#f5f5f5' },
  ];

  const COMPLETENESS = [
    { label: 'Bio',           done: true    },
    { label: 'Cadre',         done: true    },
    { label: 'Experience',    done: !!exp   },
    { label: 'Profile Photo', done: false   },
  ];
  const completePct = Math.round((COMPLETENESS.filter(c => c.done).length / COMPLETENESS.length) * 100);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111111', letterSpacing: '-0.5px', marginBottom: 4 }}>
          My Profile
          {isDemo && <span style={{ marginLeft: 10, fontSize: 12, color: '#898989', fontWeight: 400 }}>(demo data)</span>}
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Your public worker profile visible to facilities
        </p>
      </div>

      {/* ── Identity card ── */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#1c2f72', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22, fontWeight: 600, color: '#ffffff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111111', letterSpacing: '-0.2px' }}>{name}</h2>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#1c2f72', background: '#eef2ff', padding: '2px 10px', borderRadius: 9999, border: '1px solid #c7d2fe' }}>
                {levelLabel}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280' }}>{cadre} · {exp} year{exp !== 1 ? 's' : ''} experience</p>
            <p style={{ fontSize: 12, color: '#898989', marginTop: 2 }}>{user.email}</p>
          </div>
          <Link
            href="/worker/shifts"
            style={{ padding: '8px 18px', borderRadius: 8, background: '#1c2f72', color: '#ffffff', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
          >
            Find Shifts
          </Link>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: avg ? 16 : 0 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: '#f5f5f5', borderRadius: 8, padding: '12px 14px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#111111', letterSpacing: '-0.3px' }}>{String(s.value)}</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Star bar */}
        {avg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
            <StarRating value={Number(avg)} size="md" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111111' }}>{avg}</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>from {rCount} review{rCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Profile completeness ── */}
      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>Profile Completeness</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1c2f72' }}>{completePct}%</span>
        </div>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completePct}%`, background: '#1c2f72', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          {COMPLETENESS.map(item => (
            <span key={item.label} style={{ fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, color: item.done ? '#15803d' : '#898989' }}>
              {item.done ? <Check size={12} style={{ flexShrink: 0 }} /> : <Circle size={12} style={{ flexShrink: 0 }} />}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Reviews ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111111', letterSpacing: '-0.2px' }}>Reviews from Facilities</h2>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{ratings.length} total</span>
      </div>

      {ratings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ratings.map((r, i) => (
            <div key={i} style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, color: '#1c2f72', border: '1px solid #e5e7eb' }}>
                    {r.facility_name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{r.facility_name}</div>
                    <StarRating value={r.stars} size="sm" />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#898989' }}>
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {r.comment && (
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                  &ldquo;{r.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#f5f5f5', borderRadius: 12, border: '1px solid #e5e7eb', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ffffff', border: '1px solid #e5e7eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Star size={20} color="#fb923c" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#111111', marginBottom: 4 }}>No reviews yet</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            Complete your first shift to receive ratings from facilities.
          </p>
          <Link
            href="/worker/shifts"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, background: '#1c2f72', color: '#ffffff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            Browse Shifts <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
