'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, Building2, CheckCircle2, ArrowRight,
  Download, Share2, Filter
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

  // Group shifts by date
  const shiftsByDate: Record<string, CalendarShift[]> = {};
  allShifts.forEach(s => {
    const d = s.shift_date.slice(0, 10);
    if (!shiftsByDate[d]) shiftsByDate[d] = [];
    shiftsByDate[d].push(s);
  });

  const selectedDayShifts = shiftsByDate[selectedDate] || [];

  const displayShifts = allShifts
    .filter(s => {
      if (filterTab === 'upcoming') return s.status === 'confirmed' || s.status === 'pending';
      if (filterTab === 'completed') return s.status === 'completed';
      return true;
    })
    .sort((a, b) => new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime());

  const totalUpcomingCount = initialUpcoming.length;
  const totalCompletedCount = initialCompleted.length;
  const totalEarned = initialCompleted.reduce((acc, s) => acc + Number(s.pay_etb), 0);
  const totalUpcomingPay = initialUpcoming.reduce((acc, s) => acc + Number(s.pay_etb), 0);

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
      `DESCRIPTION:Clinical shift via Tiruf. Compensation: ETB ${shift.pay_etb}`,
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
    <div style={{ maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: 48 }}>
      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Roster Schedule · Addis Ababa Hospitals
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={jumpToToday}
            style={{ padding: '4px 12px', borderRadius: 6, background: '#ffffff', border: '1px solid #e5e7eb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Today
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: '#eef2ff', color: '#1c2f72', border: '1px solid #c7d2fe' }}>
            {totalUpcomingCount} Confirmed
          </span>
        </div>
      </div>

      {/* ── Title ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#111111', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Shift Calendar &amp; Roster
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Select any date to view scheduled department shifts, reporting times, and hospital locations.
        </p>
      </div>

      {/* ── Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, overflowX: 'auto' }}>
        {[
          { label: 'Upcoming Assignments',    value: totalUpcomingCount,            sub: `ETB ${totalUpcomingPay.toLocaleString()} scheduled` },
          { label: 'Completed History',        value: totalCompletedCount,           sub: `ETB ${totalEarned.toLocaleString()} disbursed`  },
          { label: 'Scheduled Clinical Hours', value: `${totalUpcomingCount * 12} hrs`, sub: '100% Verified attendance' },
        ].map(card => (
          <div key={card.label} style={{ background: '#f5f5f5', borderRadius: 12, border: '1px solid #e5e7eb', padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#111111', letterSpacing: '-0.5px' }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#898989', marginTop: 6 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Interactive Split: Calendar & Agenda ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left: Interactive Calendar Widget (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-base md:text-lg font-bold text-slate-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day Header Row */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1">
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
                    className={`h-10 md:h-11 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#1c2f72] text-white shadow-xs font-bold'
                        : isToday
                        ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300'
                        : hasUpcoming
                        ? 'bg-slate-50 text-slate-900 font-bold border border-slate-200'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs md:text-sm">{cell.dayNum}</span>

                    {/* Subdued Indicators */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasUpcoming && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-emerald-600'
                          }`}
                        />
                      )}
                      {hasCompleted && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white/70' : 'bg-slate-400'
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
          <div className="flex flex-wrap items-center gap-4 pt-3 mt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Confirmed Shift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1c2f72]"></span>
              <span>Selected Date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Date Agenda (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Agenda
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              {selectedDayShifts.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/60">
                  {selectedDayShifts.length} {selectedDayShifts.length === 1 ? 'Shift' : 'Shifts'}
                </span>
              )}
            </div>

            {selectedDayShifts.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <CalendarIcon size={20} />
                </div>
                <div className="font-semibold text-slate-800 text-xs">No Shifts Scheduled</div>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                  No clinical shifts booked for this selected date.
                </p>
                <Link
                  href="/worker/shifts"
                  className="inline-flex items-center gap-1 mt-3 px-3.5 py-1.5 rounded-lg bg-[#1c2f72] text-white text-xs font-semibold hover:bg-[#152355] transition-all shadow-xs"
                >
                  Browse Available Shifts
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayShifts.map(s => {
                  const isConfirmed = s.status === 'confirmed';
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl border border-slate-200/60 bg-[#fbfcfd] hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                            {isConfirmed ? 'Confirmed Shift' : 'Completed'}
                          </span>
                          <div className="font-bold text-slate-900 text-sm mt-1">
                            {s.role_needed}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-[#1c2f72]">
                            ETB {s.pay_etb.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">compensation</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 my-3">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Building2 size={12} className="text-[#1c2f72]" />
                          <span>{s.facility_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{s.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={12} className="text-slate-400" />
                          <span>{s.start_time} – {s.end_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                        <button
                          onClick={() => downloadICS(s)}
                          title="Save to Phone Calendar"
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download size={12} />
                          <span>Save to Calendar</span>
                        </button>

                        <Link
                          href={`/worker/shifts/${s.id}`}
                          className="py-1.5 px-3 rounded-lg bg-[#1c2f72] hover:bg-[#152355] text-white text-xs font-semibold transition-all text-center shadow-xs"
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
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Shift Roster Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All confirmed clinical appointments and historical records
            </p>
          </div>

          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto border border-slate-200/60">
            {(['upcoming', 'completed', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize cursor-pointer ${
                  filterTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {displayShifts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
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
                  className="p-4 rounded-xl border border-slate-200/60 bg-[#fbfcfd] hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                          {isConfirmed ? (days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`) : 'Completed'}
                        </span>
                        <div className="font-bold text-slate-900 text-sm mt-1">
                          {s.role_needed} — {s.facility_name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-[#1c2f72]">
                          ETB {s.pay_etb.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {s.location.split(',')[0]}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {s.start_time}–{s.end_time}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={11} className="text-slate-400" />
                        {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Shift #{s.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadICS(s)}
                        title="Save to Phone Calendar"
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <Download size={12} />
                      </button>

                      <Link
                        href={`/worker/shifts/${s.id}`}
                        className="px-3 py-1 rounded-lg bg-[#1c2f72] text-white text-xs font-semibold hover:bg-[#152355] transition-all shadow-xs"
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
