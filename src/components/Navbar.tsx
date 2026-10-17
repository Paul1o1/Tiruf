'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutGrid, Mail, Calendar, FileText,
  LogOut, PlusCircle, Building2, User, Briefcase, ClipboardList,
} from 'lucide-react';

interface NavbarProps {
  userType: 'worker' | 'facility';
  userName: string;
}

const DESKTOP_WORKER_TABS = [
  { href: '/worker/dashboard', icon: LayoutGrid,    label: 'Overview'          },
  { href: '/worker/shifts',    icon: Briefcase,      label: 'Browse Shifts'     },
  { href: '/worker/calendar',  icon: Calendar,       label: 'Calendar'          },
  { href: '/worker/my-shifts', icon: ClipboardList,  label: 'My Applications'   },
  { href: '/worker/help',      icon: Mail,           label: 'Support'           },
];

const MOBILE_WORKER_TABS = [
  { href: '/worker/dashboard', icon: LayoutGrid,    label: 'Overview'   },
  { href: '/worker/shifts',    icon: Briefcase,      label: 'Shifts'     },
  { href: '/worker/calendar',  icon: Calendar,       label: 'Calendar'   },
  { href: '/worker/my-shifts', icon: ClipboardList,  label: 'Applied'    },
  { href: '/worker/profile',   icon: User,           label: 'Profile'    },
];

const DESKTOP_FACILITY_TABS = [
  { href: '/facility/dashboard',  icon: LayoutGrid, label: 'Dashboard'       },
  { href: '/facility/shifts',     icon: FileText,   label: 'My Shifts'       },
  { href: '/facility/shifts/new', icon: PlusCircle, label: 'Post a Shift'    },
  { href: '/facility/profile',    icon: Building2,  label: 'Facility Profile' },
];

const MOBILE_FACILITY_TABS = [
  { href: '/facility/dashboard',  icon: LayoutGrid, label: 'Dashboard' },
  { href: '/facility/shifts',     icon: FileText,   label: 'Shifts'    },
  { href: '/facility/shifts/new', icon: PlusCircle, label: 'Post'      },
  { href: '/facility/profile',    icon: Building2,  label: 'Profile'   },
];

export default function Navbar({ userType, userName }: NavbarProps) {
  const pathname     = usePathname();
  const router       = useRouter();
  const desktopTabs  = userType === 'worker' ? DESKTOP_WORKER_TABS : DESKTOP_FACILITY_TABS;
  const mobileTabs   = userType === 'worker' ? MOBILE_WORKER_TABS  : MOBILE_FACILITY_TABS;
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || userName[0]?.toUpperCase() || 'U';

  function isActive(href: string) {
    if (href === '/worker/dashboard' || href === '/facility/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ────────────────────────────────────────────────────────────────────
          Desktop Icon Rail  —  Cal.com style: white, 76px wide, hairline right border
      ──────────────────────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex shrink-0 w-[72px] h-screen sticky top-0 flex-col justify-between items-center py-5 z-40 select-none"
        style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb' }}
      >
        {/* Wordmark / Logo */}
        <div className="flex flex-col items-center gap-6 w-full">
          <Link
            href="/"
            title="Tiruf Home"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-white text-xl font-bold tracking-tight"
            style={{ background: '#1c2f72', letterSpacing: '-0.5px' }}
          >
            T
          </Link>

          {/* Nav Icons */}
          <nav className="flex flex-col items-center gap-1 w-full px-2">
            {desktopTabs.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className="relative group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-100"
                  style={{
                    background:  active ? '#eef2ff' : 'transparent',
                    color:       active ? '#1c2f72' : '#6b7280',
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />

                  {/* Active indicator dot */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                      style={{ background: '#1c2f72' }}
                    />
                  )}

                  {/* Tooltip */}
                  <span className="absolute left-[58px] bg-[#111111] text-white text-[11px] font-medium px-2.5 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-sm">
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Avatar + Logout Menu */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title={userName}
            className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
            style={{ background: '#1c2f72' }}
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute left-[52px] bottom-0 w-52 rounded-xl shadow-lg border py-2 z-50"
                style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
              >
                <div className="px-3 py-2 border-b mb-1" style={{ borderColor: '#f3f4f6' }}>
                  <div className="text-xs font-semibold truncate" style={{ color: '#111111' }}>
                    {userName}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>
                    {userType === 'facility' ? 'Facility Manager' : 'Healthcare Worker'}
                  </div>
                </div>

                <Link
                  href={userType === 'facility' ? '/facility/profile' : '/worker/profile'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors"
                  style={{ color: '#374151' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={13} />
                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left cursor-pointer transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────────────
          Mobile Bottom Tab Bar  —  white, 1px top hairline, safe-area padding
      ──────────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          paddingTop: '6px',
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto px-1">
          {mobileTabs.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all active:scale-95"
                style={{ color: active ? '#1c2f72' : '#6b7280' }}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                <span
                  className="text-[10px] font-medium"
                  style={{ fontWeight: active ? 600 : 500 }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
