import { cn } from '@/lib/utils';

/* ── Primitive components ─────────────────────────────── */

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity', className)}
      style={{ background: 'var(--blue)', color: 'white' }}
      {...props}
    />
  );
}

export function Card({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border shadow-soft p-4', className)}
      style={{ background: 'var(--white)', borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
      style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
    >
      {children}
    </span>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs border', className)}
      style={{ borderColor: 'var(--border)' }}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-xl', className)} />;
}

/* ── StatCard ─────────────────────────────────────────── */

export function StatCard({
  label, value, icon, color,
}: {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        padding: '14px 16px',
      }}
    >
      {icon && <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>}
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: color ?? 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

/* ── ShiftCard ────────────────────────────────────────── */

export type ShiftCardData = {
  id?: any;
  role_needed?: any;
  shift_date?: any;
  start_time?: any;
  end_time?: any;
  pay_etb?: any;
  description?: any;
  status?: any;
  facility_name?: any;
  location?: any;
  confirmed_worker_name?: any;
  pending_count?: any;
  [key: string]: any;
};

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  open:      { color: '#1c2f72', bg: '#eef2ff', border: '#c7d2fe' },
  filled:    { color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  completed: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelled: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

export function ShiftCard({
  shift,
  actions,
}: {
  shift: ShiftCardData | Record<string, any>;
  actions?: React.ReactNode;
}) {
  const statusStyle = STATUS_STYLES[shift.status] ?? STATUS_STYLES.open;
  const dateStr = (() => {
    try {
      return new Date(shift.shift_date).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
    } catch {
      return shift.shift_date;
    }
  })();

  const durationH = (() => {
    try {
      const [sh, sm] = shift.start_time.split(':').map(Number);
      const [eh, em] = shift.end_time.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      return `${Math.floor(diff / 60)}h`;
    } catch {
      return '';
    }
  })();

  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        borderLeft: '4px solid var(--blue)',
        padding: '16px 18px',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {shift.role_needed}
            {shift.facility_name && (
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}> — {shift.facility_name}</span>
            )}
          </div>
          {shift.description && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {String(shift.description).slice(0, 60)}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--blue)' }}>
            ETB {Number(shift.pay_etb).toLocaleString()}
          </div>
          <span
            style={{
              display: 'inline-block', marginTop: 4,
              fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
              color: statusStyle.color, background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
            }}
          >
            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap', marginBottom: actions ? 12 : 0 }}>
        <span>📅 {dateStr}</span>
        <span>⏰ {shift.start_time}–{shift.end_time}{durationH ? ` (${durationH})` : ''}</span>
        {shift.location && <span>📍 {shift.location}</span>}
        {shift.confirmed_worker_name && <span>👤 {shift.confirmed_worker_name}</span>}
      </div>

      {/* Actions */}
      {actions && (
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

/* ── StarRating ───────────────────────────────────────── */

export function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          width={px} height={px}
          viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? '#f59e0b' : '#e2e8f0'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
