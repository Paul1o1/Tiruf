import { getServerUser } from '@/lib/auth';
import { query } from '@/lib/db';
import Link from 'next/link';

/* ─── demo data ─── */
const DEMO_UPCOMING = [
  { id:10, role_needed:'Nurse',    facility_name:'St. Paul Hospital',   location:'Gulele, Addis Ababa',   shift_date:'2026-05-12', start_time:'07:00', end_time:'19:00', pay_etb:1200 },
  { id:11, role_needed:'Midwife',  facility_name:'MCM General Hospital', location:'Bole, Addis Ababa',     shift_date:'2026-05-20', start_time:'06:00', end_time:'18:00', pay_etb:950  },
];
const DEMO_COMPLETED = [
  { id:7, role_needed:'Nurse',    facility_name:'Black Lion Hospital', location:'Lideta, Addis Ababa', shift_date:'2026-04-28', start_time:'07:00', end_time:'19:00', pay_etb:1200 },
  { id:8, role_needed:'Midwife',  facility_name:'Hayat Hospital',      location:'Kirkos, Addis Ababa', shift_date:'2026-04-15', start_time:'08:00', end_time:'20:00', pay_etb:1100 },
  { id:9, role_needed:'Pharmacist',facility_name:'Landmark Hospital',  location:'Nifas Silk',          shift_date:'2026-04-05', start_time:'09:00', end_time:'17:00', pay_etb:900  },
];

/* ─── helpers ─── */
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildCalendarWeeks(year: number, month: number, markedDates: Set<string>) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: ({ day: number; date: string; marked: boolean } | null)[][] = [];
  let week: ({ day: number; date: string; marked: boolean } | null)[] = [];
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    week.push({ day: d, date: dateStr, marked: markedDates.has(dateStr) });
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

type ShiftRow = { id: number; role_needed: string; shift_date: string; start_time: string; end_time: string; pay_etb: number; facility_name: string; location: string; };

export default async function WorkerCalendarPage() {
  const user = await getServerUser();
  if (!user) return null;

  let upcoming: ShiftRow[] = [];
  let completed: ShiftRow[] = [];
  let isDemo = false;

  try {
    const wr = await query('SELECT id FROM worker_profiles WHERE user_id=$1', [user.userId]);
    const wid = wr.rows[0]?.id;
    if (wid) {
      const [upRes, compRes] = await Promise.all([
        query(`SELECT s.*,fp.facility_name,fp.location FROM shifts s JOIN facility_profiles fp ON s.facility_id=fp.id JOIN shift_applications sa ON sa.shift_id=s.id WHERE sa.worker_id=$1 AND sa.status='confirmed' AND s.shift_date>=CURRENT_DATE ORDER BY s.shift_date`, [wid]),
        query(`SELECT s.*,fp.facility_name,fp.location FROM shifts s JOIN facility_profiles fp ON s.facility_id=fp.id JOIN shift_applications sa ON sa.shift_id=s.id WHERE sa.worker_id=$1 AND s.status='completed' ORDER BY s.shift_date DESC LIMIT 10`, [wid]),
      ]);
      upcoming  = upRes.rows;
      completed = compRes.rows;
    }
  } catch { isDemo = true; }

  if (isDemo || (upcoming.length === 0 && completed.length === 0)) {
    upcoming  = DEMO_UPCOMING;
    completed = DEMO_COMPLETED;
    isDemo    = true;
  }

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const today = `${year}-${String(month+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const markedDates = new Set<string>([...upcoming, ...completed].map(s => s.shift_date.slice(0,10)));
  const weeks = buildCalendarWeeks(year, month, markedDates);

  const totalPay = [...completed].reduce((sum, s) => sum + Number(s.pay_etb), 0);
  const hoursWorked = completed.length * 12; // avg 12h per shift estimate

  const borderColors = ['#1B6CA8','#1D9E75','#7c3aed','#d97706','#dc2626','#0891b2'];

  return (
    <div style={{ maxWidth:900, margin:'0 auto', fontFamily:"'Inter',-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a2332', letterSpacing:'-0.4px' }}>My Calendar</h1>
        <p style={{ fontSize:14, color:'#64748b', marginTop:4 }}>
          Your confirmed shifts and work history{isDemo && <span style={{ marginLeft:8, fontSize:12, color:'#94a3b8' }}>(demo data)</span>}
        </p>
      </div>

      {/* Top stat row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Upcoming Shifts', value: upcoming.length,    color:'#1B6CA8', bg:'#e8f1f9' },
          { label:'Completed',       value: completed.length,   color:'#1D9E75', bg:'#e6f5f0' },
          { label:'Hours Worked',    value: `${hoursWorked}h`,  color:'#7c3aed', bg:'#f3eeff' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:14, padding:'16px 20px', border:`1px solid ${s.color}22` }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#64748b', fontWeight:600, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* ── Mini Calendar ── */}
        <div style={{ background:'white', borderRadius:16, padding:20, border:'1.5px solid #f0f2f7' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#1a2332' }}>{MONTH_NAMES[month]} {year}</span>
            <span style={{ fontSize:12, color:'#94a3b8' }}>● Shift day</span>
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
            {DAY_NAMES.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#94a3b8' }}>{d}</div>)}
          </div>
          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
              {week.map((cell, ci) => (
                <div key={ci} style={{
                  height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight: cell?.marked ? 700 : 400,
                  color: !cell ? 'transparent' : cell.date === today ? 'white' : cell.marked ? '#1B6CA8' : '#475569',
                  background: !cell ? 'transparent' : cell.date === today ? '#1B6CA8' : cell.marked ? '#e8f1f9' : 'transparent',
                  cursor: cell?.marked ? 'pointer' : 'default',
                }}>
                  {cell?.day ?? ''}
                </div>
              ))}
            </div>
          ))}
          {/* Legend */}
          <div style={{ display:'flex', gap:12, marginTop:12, padding:'10px 0 0', borderTop:'1px solid #f0f2f7' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#64748b' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'#1B6CA8' }} />Today
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#64748b' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'#e8f1f9', border:'1px solid #1B6CA8' }} />Shift day
            </div>
          </div>
        </div>

        {/* ── Upcoming Shifts ── */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>Upcoming Shifts</div>
          {upcoming.length === 0 ? (
            <div style={{ background:'white', borderRadius:14, border:'1.5px solid #f0f2f7', padding:'24px 20px', textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>📅</div>
              <p style={{ fontSize:14, color:'#64748b' }}>No upcoming shifts booked</p>
              <Link href="/worker/shifts" style={{ display:'inline-block', marginTop:12, fontSize:13, fontWeight:600, color:'#4e7fe8', textDecoration:'none' }}>Browse shifts →</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {upcoming.map((s, i) => {
                const d = new Date(s.shift_date);
                const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
                const bc = borderColors[i % borderColors.length];
                return (
                  <div key={s.id} style={{ background:'white', borderRadius:14, border:'1.5px solid #f0f2f7', borderLeft:`4px solid ${bc}`, padding:'14px 16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1a2332', marginBottom:3 }}>{s.role_needed} — {s.facility_name}</div>
                        <div style={{ fontSize:12, color:'#64748b' }}>📍 {s.location} · ⏰ {s.start_time}–{s.end_time}</div>
                        <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>🗓 {d.toLocaleDateString('en-GB',{ day:'numeric', month:'short', year:'numeric' })}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:bc }}>
                          {days <= 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days}d`}
                        </div>
                        <div style={{ fontSize:12, color:'#1B6CA8', fontWeight:600, marginTop:2 }}>ETB {s.pay_etb.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Completed History ── */}
      {completed.length > 0 && (
        <div style={{ marginTop:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase' }}>Completed History</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#1D9E75' }}>Total earned: ETB {totalPay.toLocaleString()}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {completed.map((s, i) => {
              const bc = borderColors[i % borderColors.length];
              return (
                <div key={s.id} style={{ background:'white', borderRadius:14, border:'1.5px solid #f0f2f7', borderTop:`3px solid ${bc}`, padding:'14px 16px' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1a2332', marginBottom:4 }}>{s.role_needed}</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>{s.facility_name}</div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8 }}>
                    {new Date(s.shift_date).toLocaleDateString('en-GB',{ day:'numeric', month:'short' })} · {s.start_time}–{s.end_time}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#1D9E75', background:'#e6f5f0', padding:'3px 10px', borderRadius:20 }}>✓ Done</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#1B6CA8' }}>ETB {Number(s.pay_etb).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
