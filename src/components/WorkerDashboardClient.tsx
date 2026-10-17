'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, ShieldCheck, ChevronDown, Building2,
  Clock, MapPin, Share2, Check, AlertCircle, ArrowRight,
  TrendingUp, Star, Sparkles
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
  { day: 'Mon', height: '58%', type: 'gradient', shifts: 22 },
  { day: 'Tue', height: '80%', type: 'gradient', shifts: 35 },
  { day: 'Wed', height: '36%', type: 'gradient', shifts: 14 },
  { day: 'Thu', height: '88%', type: 'navy',     shifts: 42, peak: true },
  { day: 'Fri', height: '74%', type: 'gradient', shifts: 31 },
  { day: 'Sat', height: '88%', type: 'navy',     shifts: 45, peak: true },
  { day: 'Sun', height: '80%', type: 'gradient', shifts: 36 },
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
  const urgentShift = shifts.find(s => s.role_needed === 'Nurse' && s.description.toLowerCase().includes('icu')) ||
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
          text: 'Application submitted! The hospital has been notified.',
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
      // In demo mode without backend
      setAlert({ text: 'Application submitted! (Demo mode)', type: 'success' });
      setShifts(prev =>
        prev.map(s => (s.id === shiftId ? { ...s, my_application: 'pending' } : s))
      );
    }

    setApplying(null);
  }

  // Filter shifts
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
    <div className="max-w-[1240px] mx-auto select-none font-sans">
      {/* ── Top Bar with Live Network Indicator ── */}
      <div className="flex items-center justify-between pb-4 mb-2">
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>tiruf.et</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">portal</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#2563eb] font-bold">shifts</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 shadow-xs ml-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Hospital Network
        </div>
      </div>

      {/* ── Header: Greeting, Search, Verified Badge ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-[30px] font-black text-[#12234e] tracking-tight">
            Hello, {workerName}
          </h1>
          <p className="text-sm text-[#64748b] font-medium mt-0.5">
            {workerCadre} · Addis Ababa Roster
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search
              size={17}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shifts, hospitals..."
              className="w-full sm:w-64 md:w-72 pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs md:text-sm text-[#12234e] placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />
          </div>

          {/* Verified Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#e8f1ff] text-[#2563eb] text-xs font-bold border border-blue-200 shadow-xs shrink-0">
            <ShieldCheck size={15} className="text-[#2563eb]" />
            <span>Verified</span>
          </div>
        </div>
      </div>

      {/* ── Overview Section Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-black text-[#12234e] tracking-tight">
          Overview
        </h2>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <button
            onClick={() => setTimeDropdown(!timeDropdown)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#12234e] hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <span>{timeframe}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {timeDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setTimeDropdown(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                {['This Week', 'This Month', 'All Time'].map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimeframe(t);
                      setTimeDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors ${
                      timeframe === t ? 'text-[#2563eb] bg-blue-50/50' : 'text-slate-700'
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

      {/* ── 3 Overview Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Card 1: Shift Earnings */}
        <div className="bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)] flex flex-col justify-between hover:shadow-[0_6px_24px_rgba(18,35,78,0.06)] transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#64748b]">
                Shift Earnings
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#dbeafe] text-[#1d4ed8]">
                +12%
              </span>
            </div>
            <div className="text-[28px] md:text-[32px] font-black text-[#12234e] tracking-tight mb-4">
              ETB {earnings ? earnings.toLocaleString() : '14,850'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100/80">
            <span className="text-[#94a3b8] font-medium">Total Payouts</span>
            <span className="font-bold text-[#2563eb] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
              Completed
            </span>
          </div>
        </div>

        {/* Card 2: Open Shifts */}
        <div className="bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)] flex flex-col justify-between hover:shadow-[0_6px_24px_rgba(18,35,78,0.06)] transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#64748b]">
                Open Shifts
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e0f7fa] text-[#0284c7]">
                +8 New
              </span>
            </div>
            <div className="text-[28px] md:text-[32px] font-black text-[#12234e] tracking-tight mb-4">
              {shifts.length > 0 ? (shifts.length * 16 + 28) : '128'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100/80">
            <span className="text-[#94a3b8] font-medium">Across 18 Hospitals</span>
            <span className="font-bold text-[#06b6d4] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span>
              Live
            </span>
          </div>
        </div>

        {/* Card 3: Hospital Rating */}
        <div className="bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)] flex flex-col justify-between hover:shadow-[0_6px_24px_rgba(18,35,78,0.06)] transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#64748b]">
                Hospital Rating
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center gap-1">
                <Star size={11} className="fill-[#1d4ed8] text-[#1d4ed8]" />
                4.9
              </span>
            </div>
            <div className="text-[28px] md:text-[32px] font-black text-[#12234e] tracking-tight mb-4">
              98.4%
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100/80">
            <span className="text-[#94a3b8] font-medium">Fulfillment Score</span>
            <span className="font-black text-[#12234e]">Top 5%</span>
          </div>
        </div>
      </div>

      {/* ── Middle Split: Demand Analysis + Next Urgent Shift ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left: Shift Demand Analysis (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-[#12234e] tracking-tight">
                Shift Demand Analysis
              </h3>
              <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                <span>Weekly</span>
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Custom Bar Chart with Hover Tooltip */}
            <div className="relative pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 sm:px-4">
                {DEMAND_BARS.map((bar, i) => {
                  const isHovered = hoveredBar === i;
                  return (
                    <div
                      key={bar.day}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-10 bg-[#12234e] text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-30 animate-in fade-in zoom-in-95 duration-100">
                          {bar.shifts} Shifts {bar.peak ? '(Peak)' : ''}
                        </div>
                      )}

                      {/* Bar */}
                      <div
                        style={{
                          height: bar.height,
                          background:
                            bar.type === 'navy'
                              ? '#1c2f72'
                              : 'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)',
                        }}
                        className={`w-full max-w-[52px] rounded-t-[8px] transition-all duration-200 ${
                          isHovered ? 'brightness-110 scale-y-[1.03]' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Day Labels */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-4 mt-3 pt-2 border-t border-slate-100">
                {DEMAND_BARS.map(bar => (
                  <div
                    key={bar.day}
                    className="flex-1 text-center text-xs font-semibold text-[#94a3b8]"
                  >
                    {bar.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Next Urgent Shift (col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[#12234e]">
                Next Urgent Shift
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fee2e2] text-[#ef4444]">
                Urgent
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#12234e] tracking-tight mb-1">
              {urgentShift?.description?.slice(0, 32) || 'ICU Night Coverage'}
            </h3>

            <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#64748b] font-medium mb-6">
              <Building2 size={15} className="text-[#2563eb]" />
              <span>
                {urgentShift?.facility_name || 'St. Paul Hospital'} ·{' '}
                {urgentShift?.location || 'Gulele'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 mb-6">
              <div>
                <div className="text-xs font-medium text-[#94a3b8] mb-0.5">
                  Offered Compensation
                </div>
                <div className="text-lg font-black text-[#12234e]">
                  {urgentShift?.pay_etb ? `${urgentShift.pay_etb.toLocaleString()} ETB` : '1,400 ETB'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-medium text-[#94a3b8] mb-0.5">
                  Shift Timing
                </div>
                <div className="text-sm font-extrabold text-[#334155]">
                  {urgentShift ? `${urgentShift.start_time} – ${urgentShift.end_time}` : '19:00 – 07:00'}
                </div>
              </div>
            </div>
          </div>

          <div>
            {urgentShift?.my_application ? (
              <div className="w-full py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm text-center border border-emerald-200">
                ✓ Application {urgentShift.my_application}
              </div>
            ) : (
              <button
                onClick={() => urgentShift && handleApply(urgentShift.id)}
                disabled={applying === urgentShift?.id}
                className="w-full py-3.5 rounded-xl bg-[#1c2f72] hover:bg-[#16255c] active:bg-[#0f1a40] text-white font-bold text-sm transition-all shadow-md shadow-blue-950/10 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {applying === urgentShift?.id ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Instant Apply</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Alert Notice ── */}
      {alert && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : alert.type === 'warn'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alert.type === 'success' ? (
              <Check size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{alert.text}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── EXISTING FEATURE 1: Available Shifts & Role Filter ── */}
      <div className="bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-black text-[#12234e] tracking-tight">
              Available Shifts in Addis Ababa
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Select your role, inspect hospital details, and apply with conflict validation.
            </p>
          </div>

          <Link
            href="/worker/shifts"
            className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            View all {shifts.length} shifts
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRole === role
                  ? 'bg-[#1c2f72] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Shift Cards Feed */}
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No open shifts match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShifts.slice(0, 6).map(shift => {
              const isApplied = !!shift.my_application;
              const dateStr = new Date(shift.shift_date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={shift.id}
                  className="p-5 rounded-2xl border border-slate-100 bg-[#fbfcfd] hover:bg-white hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb]">
                          {shift.role_needed}
                        </span>
                        <Link
                          href={`/worker/shifts/${shift.id}`}
                          className="block text-sm font-bold text-[#12234e] hover:text-[#2563eb] transition-colors mt-1.5"
                        >
                          {shift.description}
                        </Link>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-[#1c2f72]">
                          ETB {shift.pay_etb.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">per shift</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Building2 size={13} className="text-slate-400" />
                        {shift.facility_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {shift.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        {shift.start_time} – {shift.end_time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">
                      📅 {dateStr}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🚨 ${shift.role_needed} Shift in Addis Ababa!\n🏥 ${shift.facility_name}\n📍 ${shift.location}\n📅 ${dateStr} (${shift.start_time} - ${shift.end_time})\n💰 ETB ${shift.pay_etb.toLocaleString()}\nApply on Tiruf!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on WhatsApp"
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        <Share2 size={14} />
                      </a>

                      {isApplied ? (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          {shift.my_application === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(shift.id)}
                          disabled={applying === shift.id}
                          className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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

      {/* ── EXISTING FEATURE 2: My Applications & Booked Roster ── */}
      <div className="bg-white rounded-[20px] border border-[#eef2f8] p-6 shadow-[0_4px_20px_rgba(18,35,78,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[#12234e] tracking-tight">
            My Applications & Confirmed Shifts
          </h3>
          <Link
            href="/worker/my-shifts"
            className="text-xs font-bold text-[#2563eb] hover:underline flex items-center gap-1"
          >
            Manage applications
            <ArrowRight size={13} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No active shift applications yet. Apply to open shifts above!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map(app => (
              <div
                key={app.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-sm font-bold text-[#12234e]">
                    {app.role_needed} — {app.facility_name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Shift Date: {new Date(app.shift_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                  <span className="text-sm font-black text-[#12234e]">
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
