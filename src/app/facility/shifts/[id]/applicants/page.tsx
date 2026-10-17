'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from '@/components/ui';
import { ArrowLeft, Check, Star, X, Building2, ShieldCheck, Phone } from 'lucide-react';

interface Applicant {
  id: number;
  worker_id: number;
  full_name: string;
  cadre: string;
  years_experience: number;
  bio: string;
  avg_rating: number;
  rating_count: number;
  shifts_completed: number;
  status: string;
  applied_at: string;
}

interface WorkerProfileDetail {
  worker: {
    id: number;
    full_name: string;
    cadre: string;
    years_experience: number;
    bio: string;
    shifts_completed: number;
    avg_rating: number;
    rating_count: number;
    contact_phone?: string;
    email?: string;
  };
  ratings: Array<{
    stars: number;
    comment: string;
    created_at: string;
    facility_name: string;
  }>;
}

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shiftId } = use(params);
  const router = useRouter();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Selected worker for detailed profile inspection
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfileDetail | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    fetch(`/api/shifts/${shiftId}/applications`)
      .then(r => r.json())
      .then(d => { setApplicants(d.applications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [shiftId]);

  async function openWorkerProfile(workerId: number) {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/workers/${workerId}`);
      const data = await res.json();
      if (res.ok && data.worker) {
        setSelectedWorker(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function confirmWorker(workerId: number) {
    setConfirming(workerId);
    setError('');

    try {
      const res = await fetch(`/api/shifts/${shiftId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Worker confirmed! The shift is now filled.');
        setSelectedWorker(null);
        setTimeout(() => router.push('/facility/shifts'), 1500);
      } else {
        setError(data.error || 'Failed to confirm worker');
        setConfirming(null);
      }
    } catch {
      setError('Network error. Failed to confirm.');
      setConfirming(null);
    }
  }

  if (loading) return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <p style={{ color: 'var(--text-secondary)' }}>Loading applicants…</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto font-sans pb-12">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-1.5 text-sm mb-4 font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft size={16} />
        Back to Shifts
      </button>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Shift Applicants</h1>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'}
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Review credentials and past performance before confirming your shift coverage.
      </p>

      {message && (
        <div className="mb-4 p-4 rounded-xl text-sm font-semibold" style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)', border: '1px solid #99f6e4' }}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 rounded-xl text-sm font-semibold" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #fecaca' }}>
          ⚠️ {error}
        </div>
      )}

      {applicants.length === 0 && (
        <div className="text-center py-16 rounded-2xl border bg-white" style={{ borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold text-slate-800">No one has applied yet</p>
          <p className="text-xs text-slate-500 mt-1">Available workers in Addis Ababa are being alerted.</p>
        </div>
      )}

      {/* Applicants List */}
      <div className="space-y-3">
        {applicants.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-sm"
                  style={{ background: 'var(--blue)' }}
                >
                  {a.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-base text-slate-900">{a.full_name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    {a.cadre} · {a.years_experience} {a.years_experience === 1 ? 'year' : 'years'} clinical exp
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <StarRating value={Number(a.avg_rating)} size="sm" />
                  <span className="text-xs font-bold text-slate-700">
                    {a.rating_count > 0 ? `${Number(a.avg_rating).toFixed(1)}` : 'New'}
                  </span>
                </div>
                <div className="text-xs mt-0.5 text-slate-500 font-medium">
                  {a.shifts_completed} shifts completed
                </div>
              </div>
            </div>

            {a.bio && (
              <p className="text-xs text-slate-600 mb-4 line-clamp-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                &ldquo;{a.bio}&rdquo;
              </p>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => openWorkerProfile(a.worker_id)}
                disabled={loadingProfile}
                className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                Inspect Full Profile & Reviews
              </button>

              {a.status === 'confirmed' ? (
                <div className="px-5 py-2 text-center text-xs font-bold rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  ✓ Confirmed
                </div>
              ) : a.status === 'rejected' ? (
                <div className="px-5 py-2 text-center text-xs font-medium rounded-xl bg-slate-100 text-slate-400">
                  Not selected
                </div>
              ) : (
                <button
                  onClick={() => confirmWorker(a.worker_id)}
                  disabled={confirming !== null}
                  className="px-6 py-2 rounded-xl font-bold text-white text-xs shadow-sm hover:opacity-90 disabled:opacity-50 transition"
                  style={{ background: 'var(--teal)' }}
                >
                  {confirming === a.worker_id ? 'Confirming…' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full Profile Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-md"
                style={{ background: 'var(--blue)' }}
              >
                {selectedWorker.worker.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedWorker.worker.full_name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedWorker.worker.cadre} · {selectedWorker.worker.years_experience} Years Clinical Experience
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={Number(selectedWorker.worker.avg_rating)} size="sm" />
                  <span className="text-xs font-bold text-slate-700">
                    {selectedWorker.worker.avg_rating ? Number(selectedWorker.worker.avg_rating).toFixed(1) : 'New'} ({selectedWorker.worker.rating_count} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 my-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-xl font-extrabold text-blue-700">{selectedWorker.worker.shifts_completed}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Shifts Completed</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-xl font-extrabold text-emerald-700">100%</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Attendance Reliability</div>
              </div>
            </div>

            {/* Bio */}
            {selectedWorker.worker.bio && (
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Clinical Background</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {selectedWorker.worker.bio}
                </p>
              </div>
            )}

            {/* Hospital Reviews */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Hospital Performance Reviews ({selectedWorker.ratings.length})
              </h4>
              {selectedWorker.ratings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No facility reviews recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedWorker.ratings.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{r.facility_name}</span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-700">{r.stars}</span>
                        </div>
                      </div>
                      {r.comment && <p className="text-slate-600 italic mt-0.5">&ldquo;{r.comment}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm button in modal */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedWorker(null)}
                className="flex-1 py-3 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => confirmWorker(selectedWorker.worker.id)}
                disabled={confirming !== null}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50"
                style={{ background: 'var(--teal)' }}
              >
                {confirming === selectedWorker.worker.id ? 'Confirming…' : 'Confirm This Worker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
