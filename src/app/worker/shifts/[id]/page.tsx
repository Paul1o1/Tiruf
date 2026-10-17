'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Briefcase
} from 'lucide-react';

interface ShiftDetail {
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
  facility_type?: string;
  facility_description?: string;
  facility_rating?: number;
  contact_phone?: string;
  my_application?: string | null;
}

const DEMO_DETAIL: ShiftDetail = {
  id: 1,
  role_needed: 'Nurse',
  shift_date: '2026-05-15',
  start_time: '07:00',
  end_time: '19:00',
  pay_etb: 1400,
  description: 'Coverage needed for Intensive Care Unit (ICU). Responsibilities include ventilator management, patient vitals monitoring, medication administration, and assisting attending intensivists.',
  status: 'open',
  facility_name: 'St. Paul Hospital Millennium Medical College',
  location: 'Gulele Sub-City, Addis Ababa',
  facility_type: 'Public Specialized Hospital',
  facility_description: 'One of the largest tertiary referral hospitals in Ethiopia, serving over 1,200 emergency and specialized care patients daily.',
  facility_rating: 4.8,
  contact_phone: '+251 911 234 567',
  my_application: null,
};

export default function WorkerShiftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shiftId } = use(params);
  const router = useRouter();

  const [shift, setShift] = useState<ShiftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warn' } | null>(null);

  useEffect(() => {
    async function loadShift() {
      try {
        const res = await fetch(`/api/shifts/${shiftId}`);
        const data = await res.json();
        if (res.ok && data.shift) {
          setShift(data.shift);
        } else {
          setShift({ ...DEMO_DETAIL, id: Number(shiftId) });
        }
      } catch {
        setShift({ ...DEMO_DETAIL, id: Number(shiftId) });
      } finally {
        setLoading(false);
      }
    }
    loadShift();
  }, [shiftId]);

  async function handleApply() {
    if (!shift) return;
    setApplying(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/shifts/${shift.id}/apply`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Application submitted successfully! The hospital coordinator has been notified.', type: 'success' });
        setShift(prev => prev ? { ...prev, my_application: 'pending' } : null);
      } else if (data.conflict) {
        setMessage({ text: data.error, type: 'warn' });
      } else {
        setMessage({ text: data.error || 'Failed to submit application', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="animate-pulse text-slate-400">Loading shift details…</div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-slate-600 font-semibold mb-4">Shift not found or no longer active.</p>
        <Link href="/worker/shifts" className="text-blue-600 font-bold hover:underline">
          ← Back to all shifts
        </Link>
      </div>
    );
  }

  const dateStr = (() => {
    try {
      return new Date(shift.shift_date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return shift.shift_date;
    }
  })();

  const shareText = encodeURIComponent(
    `🚨 Open ${shift.role_needed} Shift in Addis Ababa!\n🏥 ${shift.facility_name}\n📍 ${shift.location}\n📅 ${dateStr} (${shift.start_time} - ${shift.end_time})\n💰 ETB ${shift.pay_etb?.toLocaleString()} per shift\nApply on Tiruf!`
  );

  return (
    <div className="max-w-3xl mx-auto pb-12 font-sans">
      
      {/* Top back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to shifts
        </button>

        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all"
        >
          <Share2 size={13} />
          Share to WhatsApp
        </a>
      </div>

      {/* Main Shift Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
        
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              <Briefcase size={13} />
              {shift.role_needed} Position
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {shift.role_needed} Shift Coverage
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5">
              <Building2 size={15} className="text-slate-400" />
              {shift.facility_name}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-blue-700">
              ETB {shift.pay_etb?.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 font-medium">Guaranteed per-shift payout</span>
          </div>
        </div>

        {/* Shift Details Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <Calendar size={14} className="text-blue-600" />
              Date
            </div>
            <div className="text-sm font-bold text-slate-900">{dateStr}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-blue-600" />
              Working Hours
            </div>
            <div className="text-sm font-bold text-slate-900">
              {shift.start_time} – {shift.end_time}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
              <MapPin size={14} className="text-blue-600" />
              Location
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">{shift.location}</div>
          </div>
        </div>

        {/* Clinical Responsibilities & Description */}
        <div className="py-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900">Shift Scope & Requirements</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {shift.description || 'General ward coverage according to standard hospital clinical protocols.'}
          </p>
        </div>

        {/* Hospital overview */}
        {shift.facility_description && (
          <div className="pt-4 pb-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              About the Facility
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {shift.facility_description}
            </p>
          </div>
        )}

        {/* Feedback message */}
        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : message.type === 'warn' 
              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Apply CTA Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Schedule conflict prevention active</span>
          </div>

          {shift.my_application === 'confirmed' ? (
            <div className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-center">
              ✓ Confirmed for this Shift
            </div>
          ) : shift.my_application === 'pending' ? (
            <div className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-amber-50 text-amber-700 border border-amber-200 text-center">
              ⏳ Application Pending Facility Review
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || shift.status !== 'open'}
              className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1c2f72 0%, #4e7fe8 100%)' }}
            >
              {applying ? 'Submitting Application…' : 'Apply for this Shift →'}
            </button>
          )}
        </div>

      </div>

      {/* Confirmed Arrival Notice if accepted */}
      {shift.my_application === 'confirmed' && shift.contact_phone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-emerald-900">Hospital Coordinator Contact</div>
            <div className="text-xs text-emerald-700 mt-0.5">Please call when you arrive at the facility entrance:</div>
          </div>
          <a
            href={`tel:${shift.contact_phone}`}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition"
          >
            📞 {shift.contact_phone}
          </a>
        </div>
      )}

    </div>
  );
}
