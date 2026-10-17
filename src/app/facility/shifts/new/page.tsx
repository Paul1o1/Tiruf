'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['Nurse', 'Midwife', 'Lab Technician', 'Pharmacist', 'Radiographer', 'Admin'];

export default function NewShiftPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    roleNeeded: 'Nurse',
    shiftDate: '',
    startTime: '',
    endTime: '',
    payEtb: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleNeeded: form.roleNeeded,
        shiftDate: form.shiftDate,
        startTime: form.startTime,
        endTime: form.endTime,
        payEtb: parseFloat(form.payEtb),
        description: form.description,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/facility/shifts');
    } else {
      setError(data.error || 'Failed to post shift');
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-blue-500";
  const inputStyle = { borderColor: 'var(--border)', background: 'var(--white)' };
  const labelStyle = { color: 'var(--text-primary)' };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Post a Shift</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Fill in the details and workers will be able to apply.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEF2F2', color: '#DC2626' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border p-6 space-y-4 mb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>Role Needed</label>
            <select value={form.roleNeeded} onChange={e => update('roleNeeded', e.target.value)}
              className={inputClass} style={inputStyle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>Date</label>
            <input type="date" value={form.shiftDate} onChange={e => update('shiftDate', e.target.value)}
              required min={new Date().toISOString().split('T')[0]}
              className={inputClass} style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>Start Time</label>
              <input type="time" value={form.startTime} onChange={e => update('startTime', e.target.value)}
                required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={labelStyle}>End Time</label>
              <input type="time" value={form.endTime} onChange={e => update('endTime', e.target.value)}
                required className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>Pay (ETB)</label>
            <input type="number" value={form.payEtb} onChange={e => update('payEtb', e.target.value)}
              required min="0" step="50" placeholder="e.g. 1200"
              className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              rows={4} placeholder="What does this shift involve? Any special requirements?"
              className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
          style={{ background: 'var(--blue)' }}>
          {loading ? 'Posting…' : 'Post Shift'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="w-full py-3 mt-2 rounded-xl text-sm"
          style={{ color: 'var(--text-secondary)' }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
