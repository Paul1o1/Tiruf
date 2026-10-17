'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function CompleteShiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shiftId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleComplete() {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/shifts/${shiftId}/complete`, { method: 'POST' });
    if (res.ok) {
      // Redirect to rate the worker
      router.push(`/facility/shifts/${shiftId}/rate`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to mark shift as complete.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Mark Shift Complete
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Confirm that the worker has finished their shift. You&apos;ll be able to leave a rating next.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6 mb-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <div className="text-5xl mb-4">🏁</div>
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Ready to close this shift?
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          This action will mark the shift as completed and prompt you to rate the worker.
        </p>
      </div>

      <button
        onClick={handleComplete}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all hover:opacity-90"
        style={{ background: 'var(--teal)' }}
      >
        {loading ? 'Processing…' : '✓ Yes, Mark as Complete'}
      </button>

      <button
        onClick={() => router.back()}
        className="w-full py-3 mt-2 rounded-xl text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Cancel
      </button>
    </div>
  );
}
