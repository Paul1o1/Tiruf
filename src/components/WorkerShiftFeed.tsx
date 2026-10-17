'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface ShiftFeedItem {
  id: number;
  role_needed: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  pay_etb: number;
  description: string;
  status: string;
  facility_name: string;
  location: string;
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function getTags(role: string) {
  return ({
    Nurse: ['ICU', 'Triage', 'IV Care'],
    Doctor: ['Emergency', 'Clinical', 'Surgery'],
    Midwife: ['Maternity', 'Labour', 'Neonatal'],
    Pharmacist: ['Outpatient', 'Drug Review', 'Dispensing'],
    'Lab Technician': ['Haematology', 'Microbiology', 'PCR'],
  } as Record<string, string[]>)[role] ?? ['Clinical', 'General'];
}

function ShiftCard({ shift }: { shift: ShiftFeedItem }) {
  const d = daysUntil(shift.shift_date);
  const urgent = d >= 0 && d <= 2;
  const dateStr = new Date(shift.shift_date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const hours =
    shift.start_time && shift.end_time
      ? `${shift.start_time} – ${shift.end_time}`
      : 'Full day';
  const tags = getTags(shift.role_needed);
  const [hover, setHover] = useState(false);

  return (
    <Link href={`/worker/shifts/${shift.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 12,
          border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--border)'}`,
          borderLeft: urgent ? '3px solid var(--danger)' : '3px solid var(--border-strong)',
          padding: '14px 16px',
          boxShadow: hover ? 'var(--shadow-sm)' : 'none',
          transition: 'box-shadow 0.15s, border-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'var(--blue-light)',
                color: 'var(--blue-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {shift.facility_name?.[0] ?? 'H'}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {shift.facility_name}
            </span>
            {urgent && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--danger)',
                  background: 'var(--danger-light)',
                  padding: '2px 8px',
                  borderRadius: 20,
                  flexShrink: 0,
                }}
              >
                Urgent
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              ETB {shift.pay_etb.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>per shift</div>
          </div>
        </div>

        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 2px' }}>
          {shift.role_needed}
        </div>
        {shift.description && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {shift.description}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginBottom: tags.length ? 10 : 0,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
            {shift.location}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
            {hours}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {dateStr}
          </span>
        </div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg)',
                  padding: '3px 9px',
                  borderRadius: 20,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function WorkerShiftFeed({
  shifts,
  isDemo,
}: {
  shifts: ShiftFeedItem[];
  isDemo: boolean;
}) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'date' | 'pay'>('date');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? shifts.filter(s =>
          [s.role_needed, s.facility_name, s.location, s.description ?? '']
            .join(' ')
            .toLowerCase()
            .includes(needle)
        )
      : [...shifts];
    list.sort((a, b) =>
      sort === 'pay'
        ? b.pay_etb - a.pay_etb
        : new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime()
    );
    return list;
  }, [shifts, q, sort]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}
        >
          <svg width="15" height="15" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search role, hospital, or area…"
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--text-primary)',
              background: 'transparent',
              width: '100%',
            }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              aria-label="Clear search"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 16,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'date' | 'pay')}
          style={{
            padding: '9px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <option value="date">Soonest</option>
          <option value="pay">Highest pay</option>
        </select>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filtered.length}</strong>{' '}
        {filtered.length === 1 ? 'shift' : 'shifts'} available
        {isDemo && <span style={{ color: 'var(--text-muted)' }}> (demo)</span>}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '44px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              No shifts match &ldquo;{q}&rdquo;
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Try a different role, hospital, or area.
            </p>
            <button
              onClick={() => setQ('')}
              style={{
                marginTop: 14,
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear search
            </button>
          </div>
        ) : (
          filtered.map(shift => <ShiftCard key={shift.id} shift={shift} />)
        )}
      </div>
    </div>
  );
}
