'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Building2, MapPin, Clock, Calendar,
  Share2, ArrowRight, CheckCircle2, AlertCircle,
  Check, Filter, X,
} from 'lucide-react';

interface Shift {
  id: number;
  role_needed: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  pay_etb: number;
  description: string;
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  facility_name: string;
  location: string;
  my_application?: string | null;
}

const DEMO_SHIFTS: Shift[] = [
  { id: 1, role_needed: 'Nurse',         shift_date: '2026-05-15', start_time: '19:00', end_time: '07:00', pay_etb: 1400, description: 'ICU Night Shift Coverage Needed',        status: 'open', facility_name: 'St. Paul Hospital',      location: 'Gulele, Addis Ababa',      my_application: null },
  { id: 2, role_needed: 'Nurse',         shift_date: '2026-05-16', start_time: '07:00', end_time: '19:00', pay_etb: 1200, description: 'General Ward Day Support',               status: 'open', facility_name: 'Black Lion Hospital',    location: 'Lideta, Addis Ababa',      my_application: null },
  { id: 3, role_needed: 'Doctor',        shift_date: '2026-05-16', start_time: '08:00', end_time: '20:00', pay_etb: 2500, description: 'Emergency Department Physician',         status: 'open', facility_name: 'St. Paul Hospital',      location: 'Gulele, Addis Ababa',      my_application: 'pending' },
  { id: 4, role_needed: 'Midwife',       shift_date: '2026-05-17', start_time: '06:00', end_time: '18:00', pay_etb: 950,  description: 'Maternity & Labour Ward Support',       status: 'open', facility_name: 'MCM General Hospital',   location: 'Bole, Addis Ababa',        my_application: null },
  { id: 5, role_needed: 'Pharmacist',    shift_date: '2026-05-18', start_time: '09:00', end_time: '17:00', pay_etb: 1100, description: 'Outpatient Pharmacy Shift',              status: 'open', facility_name: 'Landmark Hospital',      location: 'Nifas Silk, Addis Ababa',  my_application: null },
  { id: 6, role_needed: 'Lab Technician',shift_date: '2026-05-19', start_time: '07:00', end_time: '15:00', pay_etb: 800,  description: 'Clinical Laboratory & Blood Bank',      status: 'open', facility_name: 'Hayat Hospital',          location: 'Kirkos, Addis Ababa',      my_application: 'confirmed' },
  { id: 7, role_needed: 'Nurse',         shift_date: '2026-05-22', start_time: '19:00', end_time: '07:00', pay_etb: 1450, description: 'Emergency Ward Triage Nurse',           status: 'open', facility_name: 'Yekatit 12 Hospital',    location: 'Arada, Addis Ababa',       my_application: null },
  { id: 8, role_needed: 'Doctor',        shift_date: '2026-05-23', start_time: '20:00', end_time: '08:00', pay_etb: 2800, description: 'Surgical Ward Overnight Officer',        status: 'open', facility_name: 'Black Lion Hospital',    location: 'Lideta, Addis Ababa',      my_application: null },
];

const FILTERS = ['All', 'Nurse', 'Doctor', 'Midwife', 'Pharmacist', 'Lab Technician'];

/* ── Cal.com token map ─────────────────────────────────────────────────────
   canvas:      #ffffff   surface-card: #f5f5f5   hairline: #e5e7eb
   ink:         #111111   body:         #374151    muted:    #6b7280
   primary:     #1c2f72   primary-hover:#152559
   r-md: 8px   r-lg: 12px   r-pill: 9999px
──────────────────────────────────────────────────────────────────────────── */

export default function WorkerShiftsPage() {
  const [shifts, setShifts]     = useState<Shift[]>([]);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [message, setMessage]   = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [filter, setFilter]     = useState('All');
  const [search, setSearch]     = useState('');
  const [isDemo, setIsDemo]     = useState(false);

  async function loadShifts() {
    setLoading(true);
    try {
      const res  = await fetch('/api/shifts');
      const data = await res.json();
      if (data.shifts?.length > 0) { setShifts(data.shifts); setIsDemo(false); }
      else                         { setShifts(DEMO_SHIFTS);  setIsDemo(true);  }
    } catch {
      setShifts(DEMO_SHIFTS); setIsDemo(true);
    }
    setLoading(false);
  }

  useEffect(() => { loadShifts(); }, []);

  async function applyForShift(shiftId: number) {
    setApplying(shiftId);
    setMessage(null);
    try {
      const res  = await fetch(`/api/shifts/${shiftId}/apply`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Application submitted! Hospital notified.', type: 'success' });
        setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, my_application: 'pending' } : s));
      } else if (data.conflict) {
        setMessage({ text: data.error, type: 'warn' });
      } else {
        setMessage({ text: data.error || 'Failed to apply', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Application submitted! (Demo mode)', type: 'success' });
      setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, my_application: 'pending' } : s));
    }
    setApplying(null);
  }

  const visible = shifts.filter(s => {
    const matchFilter = filter === 'All' || s.role_needed === filter;
    const matchSearch  = !search ||
      s.role_needed.toLowerCase().includes(search.toLowerCase()) ||
      s.facility_name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const applied   = shifts.filter(s => s.my_application).length;
  const confirmed = shifts.filter(s => s.my_application === 'confirmed').length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Status row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Live Network · Addis Ababa Region
          {isDemo && <span style={{ marginLeft: 6, color: '#898989' }}>· demo data</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: '#eef2ff', color: '#1c2f72', border: '1px solid #c7d2fe' }}>
            {applied} Applied
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
            {confirmed} Confirmed
          </span>
        </div>
      </div>

      {/* ── Page title ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111111', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Browse Hospital Shifts
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
          Verified clinical assignments across Addis Ababa · Instant booking
        </p>

        {/* Search bar */}
        <div style={{ position: 'relative', marginTop: 14 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#6b7280', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search role, hospital, subcity..."
            style={{
              width: '100%', height: 40, paddingLeft: 38, paddingRight: search ? 36 : 14,
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
              color: '#111111', background: '#ffffff', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1c2f72')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#e5e7eb')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: 10, padding: 4, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Role filter pills ── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }} className="no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.1s',
              background: filter === f ? '#1c2f72' : '#ffffff',
              color:      filter === f ? '#ffffff'  : '#374151',
              border:     filter === f ? 'none'     : '1px solid #e5e7eb',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Notification banner ── */}
      {message && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          background: message.type === 'success' ? '#f0fdf4' : message.type === 'warn' ? '#fffbeb' : '#fef2f2',
          border:     `1px solid ${message.type === 'success' ? '#bbf7d0' : message.type === 'warn' ? '#fde68a' : '#fecaca'}`,
          color:      message.type === 'success' ? '#15803d' : message.type === 'warn' ? '#b45309' : '#b91c1c',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {message.type === 'success'
              ? <Check size={15} />
              : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} style={{ fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, color: 'inherit' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* ── Shifts grid ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#898989', fontSize: 14 }}>
          Loading shifts across Addis Ababa...
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#f5f5f5', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ffffff', border: '1px solid #e5e7eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Filter size={20} color="#6b7280" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111111', marginBottom: 4 }}>No shifts found</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Try adjusting your search or selecting a different specialty.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
          {visible.map(shift => {
            const isApplied  = !!shift.my_application;
            const dateStr    = new Date(shift.shift_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            const daysUntil  = Math.ceil((new Date(shift.shift_date).getTime() - Date.now()) / 86400000);

            return (
              <div
                key={shift.id}
                style={{
                  background: '#ffffff', borderRadius: 12,
                  border: '1px solid #e5e7eb', padding: '20px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  {/* Top row: role badge + pay */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 4, background: '#f5f5f5', color: '#374151', border: '1px solid #e5e7eb' }}>
                        {shift.role_needed}
                      </span>
                      <Link
                        href={`/worker/shifts/${shift.id}`}
                        style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111111', textDecoration: 'none', marginTop: 8, letterSpacing: '-0.1px', lineHeight: 1.4 }}
                      >
                        {shift.description}
                      </Link>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1c2f72', letterSpacing: '-0.3px' }}>
                        ETB {shift.pay_etb.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#898989', marginTop: 2 }}>per shift</div>
                    </div>
                  </div>

                  {/* Meta: facility, location, hours */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: '#374151' }}>
                      <Building2 size={12} color="#1c2f72" />
                      {shift.facility_name}
                    </span>
                    <span style={{ color: '#e5e7eb' }}>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} />
                      {shift.location.split(',')[0]}
                    </span>
                    <span style={{ color: '#e5e7eb' }}>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {shift.start_time}–{shift.end_time}
                    </span>
                  </div>
                </div>

                {/* Footer: date + actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#6b7280' }}>
                      <Calendar size={12} />
                      {dateStr}
                    </span>
                    {daysUntil <= 2 && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                        Urgent
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${shift.role_needed} Shift — ${shift.facility_name}, ${shift.location}\n${dateStr} ${shift.start_time}–${shift.end_time}\nETB ${shift.pay_etb.toLocaleString()}`)}`}
                      target="_blank" rel="noopener noreferrer" title="Share to WhatsApp"
                      style={{ padding: '6px', borderRadius: 6, background: '#f5f5f5', color: '#6b7280', display: 'flex', textDecoration: 'none', border: '1px solid #e5e7eb' }}
                    >
                      <Share2 size={13} />
                    </a>

                    {isApplied ? (
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: shift.my_application === 'confirmed' ? '#f0fdf4' : '#fffbeb',
                        color:      shift.my_application === 'confirmed' ? '#15803d'  : '#b45309',
                        border: `1px solid ${shift.my_application === 'confirmed' ? '#bbf7d0' : '#fde68a'}`,
                      }}>
                        {shift.my_application === 'confirmed'
                          ? <><CheckCircle2 size={12} /> Confirmed</>
                          : <><AlertCircle  size={12} /> Pending</>}
                      </span>
                    ) : (
                      <button
                        onClick={() => applyForShift(shift.id)}
                        disabled={applying === shift.id}
                        style={{
                          padding: '6px 16px', borderRadius: 8, border: 'none',
                          background: '#1c2f72', color: '#ffffff',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          opacity: applying === shift.id ? 0.6 : 1, transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (applying !== shift.id) e.currentTarget.style.background = '#152559'; }}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1c2f72')}
                      >
                        {applying === shift.id ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
