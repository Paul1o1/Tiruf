'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Building2, MapPin, Clock, Calendar,
  Share2, ArrowRight, CheckCircle2, ShieldCheck,
  AlertCircle, Check, Briefcase, Filter, X
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
  {
    id: 1,
    role_needed: 'Nurse',
    shift_date: '2026-05-15',
    start_time: '19:00',
    end_time: '07:00',
    pay_etb: 1400,
    description: 'ICU Night Shift Coverage Needed',
    status: 'open',
    facility_name: 'St. Paul Hospital',
    location: 'Gulele, Addis Ababa',
    my_application: null,
  },
  {
    id: 2,
    role_needed: 'Nurse',
    shift_date: '2026-05-16',
    start_time: '07:00',
    end_time: '19:00',
    pay_etb: 1200,
    description: 'General Ward Day Support',
    status: 'open',
    facility_name: 'Black Lion Hospital',
    location: 'Lideta, Addis Ababa',
    my_application: null,
  },
  {
    id: 3,
    role_needed: 'Doctor',
    shift_date: '2026-05-16',
    start_time: '08:00',
    end_time: '20:00',
    pay_etb: 2500,
    description: 'Emergency Department Physician',
    status: 'open',
    facility_name: 'St. Paul Hospital',
    location: 'Gulele, Addis Ababa',
    my_application: 'pending',
  },
  {
    id: 4,
    role_needed: 'Midwife',
    shift_date: '2026-05-17',
    start_time: '06:00',
    end_time: '18:00',
    pay_etb: 950,
    description: 'Maternity & Labour Ward Support',
    status: 'open',
    facility_name: 'MCM General Hospital',
    location: 'Bole, Addis Ababa',
    my_application: null,
  },
  {
    id: 5,
    role_needed: 'Pharmacist',
    shift_date: '2026-05-18',
    start_time: '09:00',
    end_time: '17:00',
    pay_etb: 1100,
    description: 'Outpatient Pharmacy Shift',
    status: 'open',
    facility_name: 'Landmark Hospital',
    location: 'Nifas Silk, Addis Ababa',
    my_application: null,
  },
  {
    id: 6,
    role_needed: 'Lab Technician',
    shift_date: '2026-05-19',
    start_time: '07:00',
    end_time: '15:00',
    pay_etb: 800,
    description: 'Clinical Laboratory & Blood Bank',
    status: 'open',
    facility_name: 'Hayat Hospital',
    location: 'Kirkos, Addis Ababa',
    my_application: 'confirmed',
  },
  {
    id: 7,
    role_needed: 'Nurse',
    shift_date: '2026-05-22',
    start_time: '19:00',
    end_time: '07:00',
    pay_etb: 1450,
    description: 'Emergency Ward Triage Nurse',
    status: 'open',
    facility_name: 'Yekatit 12 Hospital',
    location: 'Arada, Addis Ababa',
    my_application: null,
  },
  {
    id: 8,
    role_needed: 'Doctor',
    shift_date: '2026-05-23',
    start_time: '20:00',
    end_time: '08:00',
    pay_etb: 2800,
    description: 'Surgical Ward Overnight Officer',
    status: 'open',
    facility_name: 'Black Lion Hospital',
    location: 'Lideta, Addis Ababa',
    my_application: null,
  },
];

const FILTERS = ['All', 'Nurse', 'Doctor', 'Midwife', 'Pharmacist', 'Lab Technician'];

export default function WorkerShiftsPage() {
  const [shifts, setShifts]       = useState<Shift[]>([]);
  const [loading, setLoading]     = useState(true);
  const [applying, setApplying]   = useState<number | null>(null);
  const [message, setMessage]     = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');
  const [isDemo, setIsDemo]       = useState(false);

  async function loadShifts() {
    setLoading(true);
    try {
      const res = await fetch('/api/shifts');
      const data = await res.json();
      if (data.shifts?.length > 0) {
        setShifts(data.shifts);
        setIsDemo(false);
      } else {
        setShifts(DEMO_SHIFTS);
        setIsDemo(true);
      }
    } catch {
      setShifts(DEMO_SHIFTS);
      setIsDemo(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadShifts();
  }, []);

  async function applyForShift(shiftId: number) {
    setApplying(shiftId);
    setMessage(null);
    try {
      const res = await fetch(`/api/shifts/${shiftId}/apply`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Application submitted! Hospital notified.', type: 'success' });
        setShifts(prev =>
          prev.map(s => (s.id === shiftId ? { ...s, my_application: 'pending' } : s))
        );
      } else if (data.conflict) {
        setMessage({ text: data.error, type: 'warn' });
      } else {
        setMessage({ text: data.error || 'Failed to apply', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Application submitted! (Demo mode)', type: 'success' });
      setShifts(prev =>
        prev.map(s => (s.id === shiftId ? { ...s, my_application: 'pending' } : s))
      );
    }
    setApplying(null);
  }

  const visible = shifts.filter(s => {
    const matchFilter = filter === 'All' || s.role_needed === filter;
    const matchSearch =
      !search ||
      s.role_needed.toLowerCase().includes(search.toLowerCase()) ||
      s.facility_name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const applied   = shifts.filter(s => s.my_application).length;
  const confirmed = shifts.filter(s => s.my_application === 'confirmed').length;

  return (
    <div className="max-w-[1240px] mx-auto select-none font-sans pb-10">
      {/* ── Top Bar: Live Hospital Network ── */}
      <div className="flex items-center justify-between pb-3 md:pb-4 mb-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 text-emerald-700 text-xs font-bold border border-emerald-200/70 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Hospital Network</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-blue-50 text-[#2563eb] text-xs font-bold border border-blue-200/80 shadow-xs">
            {applied} Applied
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 shadow-xs">
            {confirmed} Confirmed
          </div>
        </div>
      </div>

      {/* ── Large Title (iOS HIG Pattern) & Search ── */}
      <div className="mb-5 md:mb-6">
        <h1 className="text-[26px] md:text-[32px] font-black text-[#12234e] tracking-tight leading-tight">
          Browse Hospital Shifts
        </h1>
        <p className="text-xs md:text-sm text-[#64748b] font-medium mt-0.5">
          Verified Addis Ababa shifts · Instant booking & peer ratings
        </p>

        {/* Full-width iOS-style Search Bar */}
        <div className="relative mt-3.5">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search role, hospital, subcity..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-200/50 focus:bg-white border border-transparent focus:border-[#2563eb] text-sm text-[#12234e] placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Role Filter (iOS Segmented Scrollable Control) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
              filter === f
                ? 'bg-[#1c2f72] text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Notification Banner ── */}
      {message && (
        <div
          className={`mb-5 p-4 rounded-2xl text-xs md:text-sm font-medium border flex items-center justify-between animate-in fade-in duration-150 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : message.type === 'warn'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <Check size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Shifts List Grid ── */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 text-sm">
          Loading shifts across Addis Ababa...
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Search size={22} className="text-slate-400" />
          </div>
          <div className="font-bold text-[#12234e] text-base">No shifts found</div>
          <div className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or selecting a different specialty.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
          {visible.map(shift => {
            const isApplied = !!shift.my_application;
            const dateStr = new Date(shift.shift_date).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            const daysUntil = Math.ceil(
              (new Date(shift.shift_date).getTime() - Date.now()) / 86400000
            );

            return (
              <div
                key={shift.id}
                className="bg-white rounded-3xl md:rounded-[22px] border border-[#eef2f8] p-4 md:p-5 shadow-[0_3px_16px_rgba(18,35,78,0.03)] hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb]">
                        {shift.role_needed}
                      </span>
                      <Link
                        href={`/worker/shifts/${shift.id}`}
                        className="block text-sm md:text-base font-extrabold text-[#12234e] hover:text-[#2563eb] transition-colors mt-1.5"
                      >
                        {shift.description}
                      </Link>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base md:text-lg font-black text-[#1c2f72]">
                        ETB {shift.pay_etb.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">per shift</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Building2 size={13} className="text-[#2563eb]" />
                      {shift.facility_name}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {shift.location.split(',')[0]}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {shift.start_time}–{shift.end_time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <Calendar size={12} className="text-slate-400" />{dateStr}
                    </span>
                    {daysUntil <= 2 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        Urgent
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🚨 ${shift.role_needed} Shift in Addis Ababa!\n🏥 ${shift.facility_name}\n📍 ${shift.location}\n📅 ${dateStr} (${shift.start_time} - ${shift.end_time})\n💰 ETB ${shift.pay_etb.toLocaleString()}\nApply on Tiruf: http://localhost:3000/worker/shifts/${shift.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share to WhatsApp"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors active:scale-95"
                    >
                      <Share2 size={13} />
                    </a>

                    {isApplied ? (
                      <span
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 ${
                          shift.my_application === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {shift.my_application === 'confirmed' ? <><CheckCircle2 size={12} /> Confirmed</> : <><AlertCircle size={12} /> Pending</>}
                      </span>
                    ) : (
                      <button
                        onClick={() => applyForShift(shift.id)}
                        disabled={applying === shift.id}
                        className="px-4 py-2 rounded-2xl bg-[#1c2f72] hover:bg-[#16255c] active:scale-[0.98] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
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
