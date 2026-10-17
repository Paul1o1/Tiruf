'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, Building2, CheckCircle2, ArrowRight,
  Download, Share2, Sparkles, Filter
} from 'lucide-react';

export interface CalendarShift {
  id: number;
  role_needed: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  pay_etb: number;
  facility_name: string;
  location: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
}

interface WorkerCalendarClientProps {
  initialUpcoming: CalendarShift[];
  initialCompleted: CalendarShift[];
  isDemo: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WorkerCalendarClient({
  initialUpcoming,
  initialCompleted,
  isDemo,
}: WorkerCalendarClientProps) {
  const allShifts = [...initialUpcoming, ...initialCompleted];

  const now = new Date();
  const [currentYear, setCurrentYear]   = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    initialUpcoming[0]?.shift_date.slice(0, 10) || now.toISOString().slice(0, 10)
  );
  const [filterTab, setFilterTab]       = useState<'upcoming' | 'completed' | 'all'>('upcoming');

  const todayStr = now.toISOString().slice(0, 10);

  // Month navigation
  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }

  function jumpToToday() {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  }

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0 (Sunday is 6)
  const mondayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: ({ dateStr: string; dayNum: number; isCurrentMonth: boolean } | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Group shifts by date for quick lookup
  const shiftsByDate: Record<string, CalendarShift[]> = {};
  allShifts.forEach(s => {
    const d = s.shift_date.slice(0, 10);
    if (!shiftsByDate[d]) shiftsByDate[d] = [];
    shiftsByDate[d].push(s);
  });

  // Shifts for selected date
  const selectedDayShifts = shiftsByDate[selectedDate] || [];

  // Filtered shifts for the list view
  const displayShifts = allShifts
    .filter(s => {
      if (filterTab === 'upcoming') return s.status === 'confirmed' || s.status === 'pending';
      if (filterTab === 'completed') return s.status === 'completed';
      return true;
    })
    .sort((a, b) => new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime());

  // Metrics
  const totalUpcomingCount = initialUpcoming.length;
  const totalCompletedCount = initialCompleted.length;
  const totalEarned = initialCompleted.reduce((acc, s) => acc + Number(s.pay_etb), 0);
  const totalUpcomingPay = initialUpcoming.reduce((acc, s) => acc + Number(s.pay_etb), 0);

  // ICS export
  function downloadICS(shift: CalendarShift) {
    const d = new Date(shift.shift_date);
    const datePart = d.toISOString().slice(0, 10).replace(/-/g, '');
    const startClean = shift.start_time.replace(':', '') + '00';
    const endClean   = shift.end_time.replace(':', '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tiruf Healthcare//ET',
      'BEGIN:VEVENT',
      `SUMMARY:Tiruf Shift: ${shift.role_needed} at ${shift.facility_name}`,
      `LOCATION:${shift.facility_name}, ${shift.location}`,
      `DESCRIPTION:Clinical shift via Tiruf. Pay: ETB ${shift.pay_etb}`,
      `DTSTART:${datePart}T${startClean}`,
      `DTEND:${datePart}T${endClean}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tiruf-shift-${shift.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="max-w-[1240px] mx-auto select-none font-sans pb-12">
      {/* ── Top Bar: Live Hospital Network ── */}
      <div className="flex items-center justify-between pb-3 md:pb-4 mb-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 text-emerald-700 text-xs font-bold border border-emerald-200/70 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Hospital Roster</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            Today
          </button>
          <div className="px-3 py-1 rounded-full bg-blue-50 text-[#2563eb] text-xs font-bold border border-blue-200/80 shadow-xs">
            {totalUpcomingCount} Confirmed
          </div>
        </div>
      </div>

      {/* ── Title & Large Header ── */}
      <div className="mb-5 md:mb-6">
        <h1 className="text-[26px] md:text-[32px] font-black text-[#12234e] tracking-tight leading-tight">
          Shift Calendar & Roster
        </h1>
        <p className="text-xs md:text-sm text-[#64748b] font-medium mt-0.5">
          Tap any date to inspect scheduled clinical shifts, timings, and hospital directions.
        </p>
      </div>

      {/* ── Quick Stat Metric Cards (Carousel on mobile) ── */}
      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-5 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x no-scrollbar mb-6">
        <div className="min-w-[240px] md:min-w-0 flex-1 snap-start bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-5 shadow-[0_3px_16px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-1">Upcoming Shifts</div>
          <div className="text-2xl md:text-3xl font-black text-[#1c2f72]">
            {totalUpcomingCount}
          </div>
          <div className="text-xs font-semibold text-[#2563eb] mt-2">
            ETB {totalUpcomingPay.toLocaleString()} confirmed
          </div>
        </div>

        <div className="min-w-[240px] md:min-w-0 flex-1 snap-start bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-5 shadow-[0_3px_16px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-1">Completed History</div>
          <div className="text-2xl md:text-3xl font-black text-[#1c2f72]">
            {totalCompletedCount}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-2">
            ETB {totalEarned.toLocaleString()} earned
          </div>
        </div>

        <div className="min-w-[240px] md:min-w-0 flex-1 snap-start bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-5 shadow-[0_3px_16px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 mb-1">Roster Commitment</div>
          <div className="text-2xl md:text-3xl font-black text-[#1c2f72]">
            {totalUpcomingCount * 12} hrs
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-2">
            100% on-time attendance
          </div>
        </div>
      </div>

      {/* ── Main Interactive Split: Calendar & Agenda ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left: Interactive Calendar Widget (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-5 md:p-6 shadow-[0_3px_16px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div>
            {/* Month Header with interactive navigation */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-black text-[#12234e]">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day Header Row */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarDays.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="h-10 md:h-12" />;
                }

                const dayShifts = shiftsByDate[cell.dateStr] || [];
                const hasUpcoming = dayShifts.some(s => s.status === 'confirmed');
                const hasCompleted = dayShifts.some(s => s.status === 'completed');
                const isSelected = selectedDate === cell.dateStr;
                const isToday = cell.dateStr === todayStr;

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`h-11 md:h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#1c2f72] text-white shadow-md shadow-blue-950/20 font-black'
                        : isToday
                        ? 'bg-blue-50 text-[#2563eb] font-bold border border-blue-200'
                        : hasUpcoming
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs md:text-sm">{cell.dayNum}</span>

                    {/* Indicator dots */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasUpcoming && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-cyan-300' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                      {hasCompleted && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white/80' : 'bg-slate-400'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-4 mt-5 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Confirmed Shift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1c2f72]"></span>
              <span>Selected Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Date Agenda (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-5 md:p-6 shadow-[0_3px_16px_rgba(18,35,78,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Agenda for
                </span>
                <h3 className="text-lg font-black text-[#12234e]">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              {selectedDayShifts.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {selectedDayShifts.length} {selectedDayShifts.length === 1 ? 'Shift' : 'Shifts'}
                </span>
              )}
            </div>

            {selectedDayShifts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon size={22} />
                </div>
                <div className="font-bold text-[#12234e] text-sm">No Shifts Scheduled</div>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                  You have no clinical shifts booked for this day.
                </p>
                <Link
                  href="/worker/shifts"
                  className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] active:scale-95 transition-all shadow-xs"
                >
                  Browse Available Shifts
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayShifts.map(s => {
                  const isConfirmed = s.status === 'confirmed';
                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-[#fbfcfd] hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isConfirmed ? '✓ Confirmed Shift' : 'Completed'}
                          </span>
                          <div className="font-extrabold text-[#12234e] text-sm mt-1">
                            {s.role_needed}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-[#1c2f72]">
                            ETB {s.pay_etb.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">compensation</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 my-3">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building2 size={13} className="text-[#2563eb]" />
                          <span>{s.facility_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{s.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          <span>{s.start_time} – {s.end_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => downloadICS(s)}
                          title="Export to Apple / Google Calendar"
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                        >
                          <Download size={13} />
                          <span>Save to Phone</span>
                        </button>

                        <Link
                          href={`/worker/shifts/${s.id}`}
                          className="py-2 px-4 rounded-xl bg-[#1c2f72] hover:bg-[#16255c] text-white text-xs font-bold transition-all active:scale-95 text-center shadow-xs"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── All Confirmed Shifts List ── */}
      <div className="bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-5 md:p-6 shadow-[0_3px_16px_rgba(18,35,78,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base md:text-lg font-black text-[#12234e] tracking-tight">
              Shift Roster Overview
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Review all confirmed assignments and completed shift history.
            </p>
          </div>

          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            {(['upcoming', 'completed', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer active:scale-95 ${
                  filterTab === tab
                    ? 'bg-white text-[#12234e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {displayShifts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No shifts found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayShifts.map(s => {
              const d = new Date(s.shift_date);
              const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
              const isConfirmed = s.status === 'confirmed';

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-[#fbfcfd] hover:bg-white hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isConfirmed ? (days <= 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`) : 'Completed'}
                        </span>
                        <div className="font-extrabold text-[#12234e] text-sm mt-1">
                          {s.role_needed} — {s.facility_name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-[#1c2f72]">
                          ETB {s.pay_etb.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                      <span>📍 {s.location.split(',')[0]}</span>
                      <span>·</span>
                      <span>⏰ {s.start_time}–{s.end_time}</span>
                      <span>·</span>
                      <span>🗓 {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400">
                      ID: #{s.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadICS(s)}
                        title="Save to Phone Calendar"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Download size={13} />
                      </button>

                      <Link
                        href={`/worker/shifts/${s.id}`}
                        className="px-3 py-1 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] active:scale-95 transition-all shadow-xs"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
