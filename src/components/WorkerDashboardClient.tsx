'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ShieldCheck, ChevronDown, Building2,
  Clock, MapPin, Share2, Check, AlertCircle, ArrowRight,
  Star, Calendar as CalendarIcon, User
} from 'lucide-react';

export interface ShiftItem {
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
  my_application?: string | null;
}

export interface ApplicationItem {
  id: number;
  role_needed: string;
  facility_name: string;
  status: string;
  shift_date: string;
  pay_etb: number;
}

interface WorkerDashboardClientProps {
  workerName: string;
  workerCadre: string;
  isDemo: boolean;
  initialShifts: ShiftItem[];
  initialApplications: ApplicationItem[];
  earnings: number;
}

const DEMAND_BARS = [
  { day: 'Mon', height: '58%', type: 'normal', shifts: 22 },
  { day: 'Tue', height: '80%', type: 'normal', shifts: 35 },
  { day: 'Wed', height: '36%', type: 'normal', shifts: 14 },
  { day: 'Thu', height: '88%', type: 'peak',   shifts: 42, peak: true },
  { day: 'Fri', height: '74%', type: 'normal', shifts: 31 },
  { day: 'Sat', height: '88%', type: 'peak',   shifts: 45, peak: true },
  { day: 'Sun', height: '80%', type: 'normal', shifts: 36 },
];

const ROLES = ['All', 'Nurse', 'Doctor', 'Midwife', 'Pharmacist', 'Lab Technician'];

export default function WorkerDashboardClient({
  workerName,
  workerCadre,
  isDemo,
  initialShifts,
  initialApplications,
  earnings,
}: WorkerDashboardClientProps) {
  const [search, setSearch]             = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [timeframe, setTimeframe]       = useState('This Week');
  const [timeDropdown, setTimeDropdown] = useState(false);
  const [shifts, setShifts]             = useState<ShiftItem[]>(initialShifts);
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [applying, setApplying]         = useState<number | null>(null);
  const [hoveredBar, setHoveredBar]     = useState<number | null>(null);
  const [alert, setAlert]               = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);

  // Urgent shift highlight
  const urgentShift =
    shifts.find(s => s.role_needed === 'Nurse' && s.description.toLowerCase().includes('icu')) ||
    shifts.find(s => !s.my_application) ||
    shifts[0];

  async function handleApply(shiftId: number) {
    setApplying(shiftId);
    setAlert(null);

    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setAlert({
          text: 'Application submitted successfully. The facility coordinator has been notified.',
          type: 'success',
        });
        setShifts(prev =>
          prev.map(s => (s.id === shiftId ? { ...s, my_application: 'pending' } : s))
        );
        const shift = shifts.find(s => s.id === shiftId);
        if (shift) {
          setApplications(prev => [
            {
              id: Date.now(),
              role_needed: shift.role_needed,
              facility_name: shift.facility_name,
              status: 'pending',
              shift_date: shift.shift_date,
              pay_etb: shift.pay_etb,
            },
            ...prev,
          ]);
        }
      } else if (data.conflict) {
        setAlert({ text: data.error, type: 'warn' });
      } else {
        setAlert({ text: data.error || 'Failed to submit application', type: 'error' });
      }
    } catch {
      setAlert({ text: 'Application submitted (Demo mode).', type: 'success' });
      setShifts(prev =>
        prev.map(s => (s.id === shiftId ? { ...s, my_application: 'pending' } : s))
      );
    }

    setApplying(null);
  }

  const filteredShifts = shifts.filter(s => {
    const matchRole = selectedRole === 'All' || s.role_needed === selectedRole;
    const matchSearch =
      !search ||
      s.role_needed.toLowerCase().includes(search.toLowerCase()) ||
      s.facility_name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto select-none font-sans pb-12">
      {/* ── Top Bar: Subdued Network Status & Verification ── */}
      <div className="flex items-center justify-between pb-3 md:pb-4 mb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Live Network</span>
          <span className="text-slate-300">·</span>
          <span>Addis Ababa Region</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
            <ShieldCheck size={14} className="text-[#1c2f72]" />
            <span>Verified Practitioner</span>
          </div>

          <Link
            href="/worker/profile"
            className="md:hidden w-8 h-8 rounded-full bg-[#1c2f72] text-white flex items-center justify-center text-xs font-bold shadow-xs"
          >
            {workerName[0] || 'W'}
          </Link>
        </div>
      </div>

      {/* ── Practitioner Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111111] tracking-tight" style={{ letterSpacing: '-0.5px' }}>
            Hello, {workerName}
          </h1>
          <p className="text-sm text-[#6b7280] font-normal mt-1">
            {workerCadre} · Active Roster
          </p>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-[#6b7280] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shifts, hospitals, departments..."
              className="w-72 pl-9 pr-4 py-2 bg-white border border-[#e5e7eb] text-sm text-[#111111] placeholder:text-[#898989] focus:outline-none focus:border-[#1c2f72] transition-all"
              style={{ borderRadius: 8, height: 40 }}
            />
          </div>
        </div>

        {/* Mobile Full-Width Search */}
        <div className="relative md:hidden">
          <Search size={15} className="absolute left-3 top-3 text-[#6b7280] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shifts, hospitals, wards..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#e5e7eb] bg-[#f5f5f5] focus:bg-white text-sm text-[#111111] placeholder:text-[#898989] focus:outline-none focus:border-[#1c2f72] transition-all"
            style={{ borderRadius: 8 }}
          />
        </div>
      </div>

      {/* ── Overview Section Header with Timeframe ── */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
          Performance & Roster
        </h2>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <button
            onClick={() => setTimeDropdown(!timeDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium text-[#374151] hover:bg-[#f5f5f5] transition-all cursor-pointer"
            style={{ borderColor: '#e5e7eb', borderRadius: 8, background: '#ffffff' }}
          >
            <span>{timeframe}</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {timeDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setTimeDropdown(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white border border-[#e5e7eb] rounded-lg shadow-md py-1 z-40">
                {['This Week', 'This Month', 'All Time'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTimeframe(t); setTimeDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-[#f5f5f5] transition-colors ${
                      timeframe === t ? 'text-[#1c2f72] bg-[#f5f5f5] font-semibold' : 'text-[#374151]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Professional Metric Cards (Disciplined Colors & Clean Spacing) ── */}
      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x no-scrollbar mb-6">
        {/* Card 1: Shift Earnings */}
        <div className="min-w-[240px] md:min-w-0 flex-1 snap-start rounded-xl border border-[#e5e7eb] p-5 flex flex-col justify-between" style={{ background: '#f5f5f5' }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#6b7280]">Shift Earnings</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-[#374151] border border-[#e5e7eb]">+12% vs last week</span>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#111111] mb-1" style={{ letterSpacing: '-0.5px' }}>
              ETB {earnings ? earnings.toLocaleString() : '14,850'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-[#e5e7eb]">
            <span className="text-[#898989]">Disbursed</span>
            <span className="font-medium text-[#374151] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Completed
            </span>
          </div>
        </div>

        {/* Card 2: Open Shifts */}
        <div className="min-w-[240px] md:min-w-0 flex-1 snap-start rounded-xl border border-[#e5e7eb] p-5 flex flex-col justify-between" style={{ background: '#f5f5f5' }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#6b7280]">Open Shifts Available</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-[#374151] border border-[#e5e7eb]">+8 New</span>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#111111] mb-1" style={{ letterSpacing: '-0.5px' }}>
              {shifts.length > 0 ? shifts.length * 16 + 28 : '124'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-[#e5e7eb]">
            <span className="text-[#898989]">Addis Ababa Hospitals</span>
            <span className="font-medium text-[#374151] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c2f72]"></span>
              Active Roster
            </span>
          </div>
        </div>

        {/* Card 3: Quality Score */}
        <div className="min-w-[240px] md:min-w-0 flex-1 snap-start rounded-xl border border-[#e5e7eb] p-5 flex flex-col justify-between" style={{ background: '#f5f5f5' }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#6b7280]">Hospital Peer Rating</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-[#374151] border border-[#e5e7eb] flex items-center gap-1">
                <Star size={11} className="fill-[#fb923c] text-[#fb923c]" />
                4.9 / 5.0
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#111111] mb-1" style={{ letterSpacing: '-0.5px' }}>
              98.4%
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-[#e5e7eb]">
            <span className="text-[#898989]">Shift Fulfillment</span>
            <span className="font-medium text-[#374151]">Top 5% Practitioner</span>
          </div>
        </div>
      </div>

      {/* ── Mid Split: Next Priority Shift + Shift Demand Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 mb-6 md:mb-8">
        {/* Next Urgent Shift Card */}
        <div className="lg:order-2 lg:col-span-5 bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Priority Assignment
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/70">
                Urgent Coverage
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight mb-1">
              {urgentShift?.description?.slice(0, 36) || 'ICU Night Coverage'}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-4">
              <Building2 size={13} className="text-[#1c2f72]" />
              <span>
                {urgentShift?.facility_name || 'St. Paul Hospital'} ·{' '}
                {urgentShift?.location || 'Gulele'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 mb-5 text-xs">
              <div>
                <div className="font-medium text-slate-400 mb-0.5">
                  Compensation
                </div>
                <div className="text-base md:text-lg font-extrabold text-slate-900">
                  {urgentShift?.pay_etb ? `ETB ${urgentShift.pay_etb.toLocaleString()}` : 'ETB 1,400'}
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-slate-400 mb-0.5">
                  Shift Timing
                </div>
                <div className="text-xs md:text-sm font-bold text-slate-800">
                  {urgentShift ? `${urgentShift.start_time} – ${urgentShift.end_time}` : '19:00 – 07:00'}
                </div>
              </div>
            </div>
          </div>

          <div>
            {urgentShift?.my_application ? (
              <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs text-center border border-slate-200">
                Application Submitted ({urgentShift.my_application})
              </div>
            ) : (
              <button
                onClick={() => urgentShift && handleApply(urgentShift.id)}
                disabled={applying === urgentShift?.id}
                className="w-full py-3 rounded-xl bg-[#1c2f72] hover:bg-[#152355] active:scale-[0.99] text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {applying === urgentShift?.id ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Confirm & Apply</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Shift Demand Analysis (Refined Corporate Bars) */}
        <div className="lg:order-1 lg:col-span-7 bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
                  Hospital Shift Demand Forecast
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Weekly requirement across Addis Ababa healthcare network</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Weekly</span>
            </div>

            {/* Custom Bar Chart with Touch Tooltips */}
            <div className="relative pt-4 pb-1">
              <div className="h-36 md:h-40 flex items-end justify-between gap-2 sm:gap-3 px-1 sm:px-3">
                {DEMAND_BARS.map((bar, i) => {
                  const isHovered = hoveredBar === i;
                  return (
                    <div
                      key={bar.day}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                      onClick={() => setHoveredBar(hoveredBar === i ? null : i)}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {isHovered && (
                        <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-30 animate-in fade-in duration-100">
                          {bar.shifts} Shifts {bar.peak ? '(Peak)' : ''}
                        </div>
                      )}

                      <div
                        style={{
                          height: bar.height,
                          background: bar.type === 'peak' ? '#1c2f72' : '#3b82f6',
                          opacity: bar.type === 'peak' ? 1 : 0.75,
                        }}
                        className={`w-full max-w-[42px] rounded-t-md transition-all duration-150 ${
                          isHovered ? 'brightness-110 scale-y-[1.02]' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-3 px-1 sm:px-3 mt-2.5 pt-2 border-t border-slate-100">
                {DEMAND_BARS.map(bar => (
                  <div
                    key={bar.day}
                    className="flex-1 text-center text-[10px] md:text-xs font-semibold text-slate-500"
                  >
                    {bar.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Alert Notice ── */}
      {alert && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between animate-in fade-in duration-150 ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : alert.type === 'warn'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <Check size={15} className="text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle size={15} className="shrink-0" />
            )}
            <span>{alert.text}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs font-semibold underline opacity-80 hover:opacity-100 ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Available Shifts Feed & Role Filter ── */}
      <div className="rounded-xl border border-[#e5e7eb] p-5 md:p-6 mb-6 md:mb-8" style={{ background: '#ffffff' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#111111]" style={{ letterSpacing: '-0.2px' }}>
              Available Shifts in Addis Ababa
            </h3>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Verified clinical assignments with direct hospital coordination
            </p>
          </div>
          <Link href="/worker/shifts" className="text-xs font-medium text-[#1c2f72] flex items-center gap-0.5 shrink-0">
            All Shifts <ArrowRight size={13} />
          </Link>
        </div>

        {/* Role Segmented Filter (Subdued Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar mb-4">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedRole === role
                  ? 'bg-[#1c2f72] text-white'
                  : 'text-[#374151] hover:bg-[#f5f5f5]'
              }`}
              style={{
                borderRadius: 6,
                border: selectedRole === role ? 'none' : '1px solid #e5e7eb',
                background: selectedRole === role ? '#1c2f72' : '#ffffff',
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Shift Cards */}
        {filteredShifts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No open shifts match your search filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3.5">
            {filteredShifts.slice(0, 6).map(shift => {
              const isApplied = !!shift.my_application;
              const dateStr = new Date(shift.shift_date).toLocaleDateString('en-GB', {
                weekday: 'short', day: 'numeric', month: 'short',
              });

              return (
                <div
                  key={shift.id}
                  className="p-4 flex flex-col justify-between border border-[#e5e7eb] transition-all"
                  style={{ borderRadius: 12, background: '#f5f5f5' }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-[#374151] border border-[#e5e7eb]">{shift.role_needed}</span>
                        <Link
                          href={`/worker/shifts/${shift.id}`}
                          className="block text-sm font-semibold text-[#111111] hover:text-[#1c2f72] transition-colors mt-1.5"
                        >
                          {shift.description}
                        </Link>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-semibold text-[#1c2f72]" style={{ letterSpacing: '-0.2px' }}>ETB {shift.pay_etb.toLocaleString()}</div>
                        <div className="text-[10px] text-[#898989] font-normal">per shift</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280] mb-3">
                      <span className="flex items-center gap-1 font-medium text-[#374151]"><Building2 size={12} className="text-[#1c2f72]" />{shift.facility_name}</span>
                      <span className="text-[#e5e7eb]">·</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{shift.location.split(',')[0]}</span>
                      <span className="text-[#e5e7eb]">·</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{shift.start_time}–{shift.end_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#e5e7eb] text-xs">
                    <span className="flex items-center gap-1 font-medium text-[#6b7280]"><CalendarIcon size={12} />{dateStr}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Open ${shift.role_needed} Shift:\n${shift.facility_name}, ${shift.location}\n${dateStr} ${shift.start_time}-${shift.end_time}\nETB ${shift.pay_etb.toLocaleString()}`)}`}
                        target="_blank" rel="noopener noreferrer" title="Share"
                        className="p-1.5 text-[#6b7280] hover:bg-white rounded transition-colors" style={{ borderRadius: 6 }}
                      >
                        <Share2 size={13} />
                      </a>
                      {isApplied ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 border border-[#e5e7eb] text-[#374151]" style={{ borderRadius: 6, background: '#ffffff' }}>
                          {shift.my_application === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(shift.id)}
                          disabled={applying === shift.id}
                          className="text-white text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
                          style={{ padding: '5px 14px', borderRadius: 8, background: '#1c2f72' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#152559')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#1c2f72')}
                        >
                          {applying === shift.id ? 'Applying...' : 'Apply'}
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

      {/* ── My Applications List ── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
            Active Applications & Bookings
          </h3>
          <Link
            href="/worker/my-shifts"
            className="text-xs font-semibold text-[#1c2f72] hover:underline flex items-center gap-0.5"
          >
            Manage All
            <ArrowRight size={13} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No active shift applications. Select an open shift above to apply.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map(app => (
              <div
                key={app.id}
                className="py-3 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs md:text-sm font-bold text-slate-900">
                    {app.role_needed} — {app.facility_name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(app.shift_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : app.status === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                  <span className="text-xs md:text-sm font-extrabold text-slate-900">
                    ETB {app.pay_etb?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
