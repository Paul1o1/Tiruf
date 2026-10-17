'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Building2, MapPin, Clock, Calendar,
  Share2, ArrowRight, CheckCircle2, ShieldCheck,
  AlertCircle, Check, Briefcase, Filter
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
        setMessage({ text: 'Application submitted! The hospital will review it.', type: 'success' });
        setShifts(prev =>
          prev.map(s => (s.id === shiftId ? { ...s, my_application: 'pending' } : s))
        );
      } else if (data.conflict) {
        setMessage({ text: data.error, type: 'warn' });
      } else {
        setMessage({ text: data.error || 'Failed to apply', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Application submitted (Demo mode)!', type: 'success' });
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

      {/* ── Header: Title, Search, Stats ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-[30px] font-black text-[#12234e] tracking-tight">
            Browse Hospital Shifts
          </h1>
          <p className="text-sm text-[#64748b] font-medium mt-0.5">
            Licensed shifts across Addis Ababa hospitals — verified pay & instant booking
            {isDemo && <span className="ml-2 text-xs text-slate-400 font-semibold">(demo roster)</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search role, hospital, subcity..."
              className="w-full sm:w-64 md:w-72 pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs md:text-sm text-[#12234e] placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />
          </div>

          {/* Quick Counter Pills */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-xs font-black text-[#2563eb] mr-1">{applied}</span>
              <span className="text-[11px] font-medium text-slate-500">Applied</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-xs font-black text-emerald-600 mr-1">{confirmed}</span>
              <span className="text-[11px] font-medium text-slate-500">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Role Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === f
                ? 'bg-[#1c2f72] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Alert Notice ── */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-between animate-in fade-in duration-150 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : message.type === 'warn'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <Check size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Shifts Grid ── */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 text-sm">
          Loading shifts across Addis Ababa...
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-bold text-[#12234e] text-base">No shifts found</div>
          <div className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or selecting a different specialty.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="bg-white rounded-2xl border border-[#eef2f8] p-5 shadow-[0_4px_20px_rgba(18,35,78,0.03)] hover:shadow-[0_6px_24px_rgba(18,35,78,0.06)] hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb]">
                        {shift.role_needed}
                      </span>
                      <Link
                        href={`/worker/shifts/${shift.id}`}
                        className="block text-base font-extrabold text-[#12234e] hover:text-[#2563eb] transition-colors mt-1.5"
                      >
                        {shift.description}
                      </Link>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-[#1c2f72]">
                        ETB {shift.pay_etb.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">per shift</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 size={13} className="text-[#2563eb]" />
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      📅 {dateStr}
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
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                      <Share2 size={14} />
                    </a>

                    {isApplied ? (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                          shift.my_application === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {shift.my_application === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                      </span>
                    ) : (
                      <button
                        onClick={() => applyForShift(shift.id)}
                        disabled={applying === shift.id}
                        className="px-4 py-2 rounded-xl bg-[#1c2f72] hover:bg-[#16255c] active:bg-[#0f1a40] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
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
