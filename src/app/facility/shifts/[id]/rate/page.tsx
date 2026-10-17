'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function RateWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shiftId } = use(params);
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stars === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId: Number(shiftId), stars, comment }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/facility/dashboard');
    } else {
      setError(data.error || 'Failed to submit rating');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Rate This Worker</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>How was their performance?</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border p-6 mb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" onClick={() => setStars(s)}
                className="text-4xl transition-transform hover:scale-110"
                style={{ color: s <= stars ? '#F59E0B' : '#D1D5DB' }}>
                ★
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Comment (optional)
            </label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
              placeholder="Share your experience working with them…"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{ borderColor: 'var(--border)' }} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
          style={{ background: 'var(--blue)' }}>
          {loading ? 'Submitting…' : 'Submit Rating'}
        </button>
        <button type="button" onClick={() => router.push('/facility/dashboard')}
          className="w-full py-3 mt-2 rounded-xl text-sm"
          style={{ color: 'var(--text-secondary)' }}>
          Skip for now
        </button>
      </form>
    </div>
  );
}
