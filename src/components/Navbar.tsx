'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutGrid, BarChart3, Mail, Calendar, FileText,
  LogOut, PlusCircle, Building2, User, Briefcase, ClipboardList
} from 'lucide-react';

interface NavbarProps {
  userType: 'worker' | 'facility';
  userName: string;
}

const DESKTOP_WORKER_TABS = [
  { href: '/worker/dashboard', icon: LayoutGrid, label: 'Overview' },
  { href: '/worker/shifts',    icon: Briefcase,  label: 'Browse Shifts' },
  { href: '/worker/help',      icon: Mail,       label: 'Support & Help' },
  { href: '/worker/calendar',  icon: Calendar,   label: 'Calendar & Roster' },
  { href: '/worker/my-shifts', icon: ClipboardList, label: 'My Applications' },
];

const MOBILE_WORKER_TABS = [
  { href: '/worker/dashboard', icon: LayoutGrid, label: 'Overview' },
  { href: '/worker/shifts',    icon: Briefcase,  label: 'Shifts' },
  { href: '/worker/calendar',  icon: Calendar,   label: 'Calendar' },
  { href: '/worker/my-shifts', icon: ClipboardList, label: 'My Shifts' },
  { href: '/worker/profile',   icon: User,       label: 'Profile' },
];

const DESKTOP_FACILITY_TABS = [
  { href: '/facility/dashboard',  icon: LayoutGrid, label: 'Dashboard' },
  { href: '/facility/shifts',     icon: FileText,   label: 'My Shifts' },
  { href: '/facility/shifts/new', icon: PlusCircle, label: 'Post a Shift' },
  { href: '/facility/profile',    icon: Building2,  label: 'Facility Profile' },
];

const MOBILE_FACILITY_TABS = [
  { href: '/facility/dashboard',  icon: LayoutGrid, label: 'Dashboard' },
  { href: '/facility/shifts',     icon: FileText,   label: 'Shifts' },
  { href: '/facility/shifts/new', icon: PlusCircle, label: 'Post' },
  { href: '/facility/profile',    icon: Building2,  label: 'Profile' },
];

export default function Navbar({ userType, userName }: NavbarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const desktopTabs = userType === 'worker' ? DESKTOP_WORKER_TABS : DESKTOP_FACILITY_TABS;
  const mobileTabs  = userType === 'worker' ? MOBILE_WORKER_TABS  : MOBILE_FACILITY_TABS;
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
    .join('') || userName[0]?.toUpperCase() || 'ST';

  return (
    <>
      {/* ── Desktop Icon Rail (Matches mockup) ── */}
      <aside
        className="hidden md:flex shrink-0 w-[76px] h-screen sticky top-0 flex-col justify-between items-center py-6 border-r border-[#eef2f6] bg-white z-40 select-none"
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center">
          <Link
            href="/"
            title="Tiruf Home"
            className="w-11 h-11 flex items-center justify-center text-[26px] font-black text-[#2563eb] hover:opacity-80 transition-opacity"
            style={{ letterSpacing: '-0.5px' }}
          >
            T
          </Link>
        </div>

        {/* Middle Navigation Icons */}
        <nav className="flex flex-col items-center gap-3 w-full px-3">
          {desktopTabs.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== '/worker/dashboard' &&
                href !== '/facility/dashboard' &&
                pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`relative group flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-150 ${
                  active
                    ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/25 scale-[1.02]'
                    : 'text-[#94a3b8] hover:text-[#334155] hover:bg-[#f8fafc]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />

                {/* Tooltip on hover */}
                <span className="absolute left-[62px] bg-[#12234e] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Avatar & Logout Menu */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title={userName}
            className="w-10 h-10 rounded-full bg-[#12234e] text-white text-xs font-bold flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer shadow-sm"
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-[58px] bottom-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {userName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {userType === 'facility' ? 'Facility Manager' : 'Healthcare Worker'}
                  </div>
                </div>

                <Link
                  href={userType === 'facility' ? '/facility/profile' : '/worker/profile'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <User size={14} className="text-slate-400" />
                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} className="text-rose-500" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── Apple iOS HIG Mobile Bottom Tab Bar ── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/90 border-t border-slate-200/70 shadow-[0_-1px_10px_rgba(0,0,0,0.03)]"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
          paddingTop: '6px',
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto px-2">
          {mobileTabs.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== '/worker/dashboard' &&
                href !== '/facility/dashboard' &&
                pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                  active ? 'text-[#2563eb]' : 'text-[#8E8E93] hover:text-slate-600'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    active ? 'text-[#2563eb]' : ''
                  }`}
                >
                  <Icon size={21} strokeWidth={active ? 2.4 : 1.7} />
                </div>
                <span
                  className={`text-[10px] tracking-tight transition-all ${
                    active ? 'font-bold text-[#2563eb]' : 'font-medium text-[#8E8E93]'
                  }`}
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
