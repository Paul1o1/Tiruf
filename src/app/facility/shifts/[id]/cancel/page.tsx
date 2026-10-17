'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function CancelShiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shiftId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCancel() {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/shifts/${shiftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) {
      router.push('/facility/shifts');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to cancel shift.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Cancel Shift
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Are you sure? Any pending applications will be dismissed.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6 mb-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <div className="text-5xl mb-4">⚠️</div>
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          This action cannot be undone
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          The shift will be marked as cancelled and removed from the worker discovery feed.
        </p>
      </div>

      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all hover:opacity-90"
        style={{ background: 'var(--danger)' }}
      >
        {loading ? 'Cancelling…' : 'Yes, Cancel This Shift'}
      </button>

      <button
        onClick={() => router.back()}
        className="w-full py-3 mt-2 rounded-xl text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Go Back
      </button>
    </div>
  );
}
