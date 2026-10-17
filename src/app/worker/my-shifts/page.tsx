'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays, Clock, CheckCircle2, Hourglass,
  FlagTriangleRight, XCircle, MapPin, Phone, ArrowRight,
} from 'lucide-react';

interface Application {
  app_id: number;
  app_status: string;
  applied_at: string;
  shift_id: number;
  role_needed: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  pay_etb: number;
  facility_name: string;
  location: string;
  contact_phone?: string;
}

type Tab = 'upcoming' | 'pending' | 'past' | 'declined';

const TAB_META: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'upcoming', label: 'Upcoming',  Icon: CheckCircle2 },
  { key: 'pending',  label: 'Pending',   Icon: Hourglass    },
  { key: 'past',     label: 'Past',      Icon: FlagTriangleRight },
  { key: 'declined', label: 'Declined',  Icon: XCircle      },
];

const STATUS_CHIP: Record<string, { color: string; bg: string; border: string; label: string }> = {
  confirmed: { color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', label: 'Confirmed' },
  pending:   { color: '#b45309', bg: '#fffbeb', border: '#fde68a', label: 'Pending'   },
  rejected:  { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: 'Declined'  },
  completed: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed' },
};

const DEMO: Application[] = [
  { app_id: 1, app_status: 'confirmed', applied_at: new Date(Date.now() - 86400000).toISOString(), shift_id: 10, role_needed: 'Nurse', shift_date: new Date(Date.now() + 86400000).toISOString().slice(0,10), start_time: '07:00', end_time: '19:00', pay_etb: 1200, facility_name: 'St. Paul Hospital', location: 'Gulele, Addis Ababa', contact_phone: '+251 911 000 001' },
  { app_id: 2, app_status: 'pending',   applied_at: new Date(Date.now() - 3600000).toISOString(),  shift_id: 11, role_needed: 'Nurse', shift_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0,10), start_time: '19:00', end_time: '07:00', pay_etb: 1400, facility_name: 'Black Lion Hospital', location: 'Lideta, Addis Ababa' },
  { app_id: 3, app_status: 'rejected',  applied_at: new Date(Date.now() - 5 * 86400000).toISOString(), shift_id: 9, role_needed: 'Nurse', shift_date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0,10), start_time: '08:00', end_time: '20:00', pay_etb: 1100, facility_name: 'Hayat Hospital', location: 'Kirkos, Addis Ababa' },
  { app_id: 4, app_status: 'completed', applied_at: new Date(Date.now() - 10 * 86400000).toISOString(), shift_id: 7, role_needed: 'Nurse', shift_date: new Date(Date.now() - 9 * 86400000).toISOString().slice(0,10), start_time: '07:00', end_time: '19:00', pay_etb: 1200, facility_name: 'Landmark Hospital', location: 'Nifas Silk, Addis Ababa' },
];

export default function MyShiftsPage() {
  const [apps, setApps]         = useState<Application[]>([]);
  const [isDemo, setIsDemo]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('upcoming');
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

  function loadApplications() {
    fetch('/api/shifts?filter=my-applications')
      .then(r => r.json())
      .then(d => {
        if (d.applications?.length > 0) {
          setApps(d.applications);
          setIsDemo(false);
        } else {
          setApps(DEMO);
          setIsDemo(true);
        }
      })
      .catch(() => { setApps(DEMO); setIsDemo(true); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadApplications(); }, []);

  async function handleWithdraw(shiftId: number) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(shiftId);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, { method: 'DELETE' });
      if (res.ok) setApps(prev => prev.filter(a => a.shift_id !== shiftId));
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawing(null);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  const grouped: Record<Tab, Application[]> = {
    upcoming: apps.filter(a => a.app_status === 'confirmed' && a.shift_date >= today),
    pending:  apps.filter(a => a.app_status === 'pending'),
    past:     apps.filter(a => a.app_status === 'completed' || (a.app_status === 'confirmed' && a.shift_date < today)),
    declined: apps.filter(a => a.app_status === 'rejected'),
  };

  const visible = grouped[tab];

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  const EMPTY_ICONS: Record<Tab, React.ElementType> = {
    upcoming: CalendarDays,
    pending:  Hourglass,
    past:     FlagTriangleRight,
    declined: XCircle,
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a2332', letterSpacing: '-0.4px' }}>
          My Applications
          {isDemo && <span style={{ marginLeft: 10, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>(demo)</span>}
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Track your shift applications and upcoming bookings
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {TAB_META.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 50, border: '1.5px solid',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                borderColor: active ? '#1c2f72' : '#e2e8f0',
                background:  active ? '#1c2f72' : 'white',
                color:       active ? 'white'   : '#475569',
              }}
            >
              <Icon size={14} />
              {label}
              <span style={{
                minWidth: 20, height: 20, borderRadius: 10,
                background: active ? 'rgba(255,255,255,0.20)' : '#f1f5f9',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: active ? 'white' : '#64748b',
              }}>
                {grouped[key].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>Loading…</div>
      ) : visible.length === 0 ? (() => {
        const EmptyIcon = EMPTY_ICONS[tab];
        return (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: 'white', borderRadius: 16, border: '1.5px solid #f0f2f7' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <EmptyIcon size={24} color="#94a3b8" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>
              No {tab} applications
            </p>
            {tab === 'upcoming' && (
              <Link href="/worker/shifts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '10px 22px', borderRadius: 50, background: '#1c2f72', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Browse Shifts <ArrowRight size={14} />
              </Link>
            )}
          </div>
        );
      })() : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(a => {
            const chip = STATUS_CHIP[a.app_status] ?? STATUS_CHIP.pending;
            const isUpcoming = a.app_status === 'confirmed' && a.shift_date >= today;
            return (
              <div
                key={a.app_id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  border: '1.5px solid #f0f2f7',
                  borderLeft: `4px solid #1c2f72`,
                  padding: '18px 20px',
                  boxShadow: '0 2px 12px rgba(18,35,78,0.04)',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', marginBottom: 3 }}>
                      {a.role_needed} — {a.facility_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b' }}>
                      <MapPin size={12} color="#94a3b8" />
                      {a.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1c2f72' }}>
                      ETB {a.pay_etb.toLocaleString()}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, color: chip.color, background: chip.bg, border: `1px solid ${chip.border}` }}>
                      {chip.label}
                    </span>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginBottom: isUpcoming && a.contact_phone ? 14 : 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CalendarDays size={13} color="#94a3b8" />
                    {fmtDate(a.shift_date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} color="#94a3b8" />
                    {a.start_time}–{a.end_time}
                  </span>
                </div>

                {/* Contact — only when confirmed */}
                {isUpcoming && a.contact_phone && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px', borderRadius: 10,
                    background: '#f0fdfa', border: '1px solid #99f6e4',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={15} color="#0f766e" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', marginBottom: 1 }}>Facility Contact</div>
                      <a href={`tel:${a.contact_phone}`} style={{ fontSize: 14, fontWeight: 700, color: '#0f766e', textDecoration: 'none' }}>
                        {a.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <Link
                    href={`/worker/shifts/${a.shift_id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#1c2f72', textDecoration: 'none' }}
                  >
                    View Shift Details <ArrowRight size={13} />
                  </Link>

                  {a.app_status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(a.shift_id)}
                      disabled={withdrawing === a.shift_id}
                      style={{
                        padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca',
                        cursor: 'pointer', opacity: withdrawing === a.shift_id ? 0.6 : 1,
                      }}
                    >
                      {withdrawing === a.shift_id ? 'Withdrawing…' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer CTA */}
      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <Link href="/worker/shifts" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: '#1c2f72', textDecoration: 'none' }}>
          Browse available shifts <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
