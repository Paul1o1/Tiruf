import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { StarRating } from '@/components/ui';
import Link from 'next/link';

const DEMO_RATINGS = [
  { stars:5, comment:'Abebe was punctual, professional, and handled ICU patients with exceptional care.', created_at:'2026-04-28T10:00:00Z', facility_name:'Black Lion Hospital' },
  { stars:4, comment:'Great midwife. Very calm under pressure during a difficult delivery.', created_at:'2026-04-15T08:30:00Z', facility_name:'Hayat Hospital' },
  { stars:5, comment:'Would rehire immediately. Outstanding pharmacist.', created_at:'2026-04-05T14:00:00Z', facility_name:'Landmark Hospital' },
];
const DEMO_COMPLETED = 3;

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

  if (isDemo || !worker) {
    isDemo = true;
    ratings = DEMO_RATINGS;
  }

  const name     = (worker?.full_name as string) ?? user.email.split('@')[0];
  const cadre    = (worker?.cadre as string) ?? 'Healthcare Worker';
  const exp      = (worker?.years_experience as number) ?? 0;
  const done     = (worker?.shifts_completed as number) ?? (isDemo ? DEMO_COMPLETED : 0);
  const avgRaw   = worker?.avg_rating ? Number(worker.avg_rating) : (isDemo ? 4.7 : 0);
  const avg      = avgRaw > 0 ? avgRaw.toFixed(1) : null;
  const rCount   = (worker?.rating_count as number) ?? (isDemo ? DEMO_RATINGS.length : 0);
  const initials = name.split(' ').filter(Boolean).slice(0,2).map((w:string) => w[0].toUpperCase()).join('');

  const completionRate = done > 0 ? 100 : 0;
  const levelLabel = done >= 20 ? 'Expert' : done >= 10 ? 'Senior' : done >= 5 ? 'Experienced' : 'Newcomer';
  const levelColor = done >= 20 ? '#d97706' : done >= 10 ? '#7c3aed' : done >= 5 ? '#1B6CA8' : '#1D9E75';

  return (
    <div style={{ maxWidth:720, margin:'0 auto', fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a2332', letterSpacing:'-0.4px' }}>My Profile</h1>
        <p style={{ fontSize:14, color:'#64748b', marginTop:4 }}>
          Your public worker profile visible to facilities
          {isDemo && <span style={{ marginLeft:8, fontSize:12, color:'#94a3b8' }}>(demo data)</span>}
        </p>
      </div>

      {/* Identity card */}
      <div style={{ background:'white', borderRadius:20, border:'1.5px solid #f0f2f7', padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
          {/* Avatar */}
          <div style={{ width:76, height:76, borderRadius:'50%', background:'linear-gradient(135deg,#4e7fe8,#35bdd0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'white', flexShrink:0, boxShadow:'0 4px 16px rgba(78,127,232,0.25)', border:'3px solid #f0f4ff' }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#1a2332' }}>{name}</h2>
              <span style={{ fontSize:12, fontWeight:700, color:levelColor, background:`${levelColor}18`, padding:'3px 12px', borderRadius:20 }}>{levelLabel}</span>
            </div>
            <p style={{ fontSize:14, color:'#64748b' }}>{cadre} · {exp} year{exp !== 1 ? 's' : ''} experience</p>
            <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{user.email}</p>
          </div>
          <Link href="/worker/shifts" style={{ padding:'10px 20px', borderRadius:50, background:'linear-gradient(135deg,#1c2f72,#4e7fe8)', color:'white', fontSize:13, fontWeight:700, textDecoration:'none', flexShrink:0 }}>
            Find Shifts
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom: avg ? 16 : 0 }}>
          {[
            { label:'Shifts Done',    value: done,               color:'#1B6CA8', bg:'#e8f1f9' },
            { label:'Avg Rating',     value: avg ?? '—',         color:'#d97706', bg:'#fffbeb' },
            { label:'Reviews',        value: rCount,             color:'#7c3aed', bg:'#f3eeff' },
            { label:'Completion',     value: `${completionRate}%`, color:'#1D9E75', bg:'#e6f5f0' },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'12px 14px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:'#64748b', fontWeight:600, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Star bar */}
        {avg && (
          <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:16, borderTop:'1px solid #f0f2f7' }}>
            <StarRating value={Number(avg)} size="md" />
            <span style={{ fontSize:14, fontWeight:700, color:'#1a2332' }}>{avg}</span>
            <span style={{ fontSize:13, color:'#64748b' }}>from {rCount} review{rCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Profile completeness */}
      <div style={{ background:'linear-gradient(135deg,#f0f4ff,#f5f0ff)', borderRadius:16, padding:'16px 20px', marginBottom:20, border:'1px solid #e0e7ff' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#1a2332' }}>Profile Completeness</span>
          <span style={{ fontSize:14, fontWeight:800, color:'#4e7fe8' }}>75%</span>
        </div>
        <div style={{ height:8, background:'#e0e7ff', borderRadius:4, overflow:'hidden' }}>
          <div style={{ height:'100%', width:'75%', background:'linear-gradient(90deg,#4e7fe8,#35bdd0)', borderRadius:4 }} />
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
          {[
            { label:'Bio', done: true },
            { label:'Cadre', done: true },
            { label:'Experience', done: !!exp },
            { label:'Profile Photo', done: false },
          ].map(item => (
            <span key={item.label} style={{ fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4,
              color: item.done ? '#1D9E75' : '#94a3b8' }}>
              {item.done ? '✓' : '○'} {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:'#1a2332' }}>Reviews from Facilities</h2>
        <span style={{ fontSize:13, color:'#64748b' }}>{ratings.length} total</span>
      </div>

      {ratings.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {ratings.map((r, i) => (
            <div key={i} style={{ background:'white', borderRadius:14, border:'1.5px solid #f0f2f7', padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#e8f1f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, color:'#1B6CA8' }}>
                    {r.facility_name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1a2332' }}>{r.facility_name}</div>
                    <StarRating value={r.stars} size="sm" />
                  </div>
                </div>
                <span style={{ fontSize:12, color:'#94a3b8' }}>
                  {new Date(r.created_at).toLocaleDateString('en-GB',{ day:'numeric', month:'short', year:'numeric' })}
                </span>
              </div>
              {r.comment && <p style={{ fontSize:14, color:'#475569', lineHeight:1.6, fontStyle:'italic' }}>&ldquo;{r.comment}&rdquo;</p>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:16, border:'1.5px solid #f0f2f7', padding:'32px 24px', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:10 }}>⭐</div>
          <p style={{ fontSize:15, fontWeight:600, color:'#1a2332', marginBottom:4 }}>No reviews yet</p>
          <p style={{ fontSize:14, color:'#64748b' }}>Complete your first shift to receive ratings from facilities.</p>
          <Link href="/worker/shifts" style={{ display:'inline-block', marginTop:14, padding:'10px 24px', borderRadius:50, background:'linear-gradient(135deg,#1c2f72,#4e7fe8)', color:'white', fontSize:14, fontWeight:700, textDecoration:'none' }}>
            Browse Shifts →
          </Link>
        </div>
      )}
    </div>
  );
}
