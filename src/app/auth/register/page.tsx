'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CADRES = ['Nurse', 'Midwife', 'Lab Technician', 'Pharmacist', 'Radiographer', 'Admin'];
const FACILITY_TYPES = ['Hospital', 'Clinic', 'NGO Facility'];

type Step = 'type' | 'account' | 'profile';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spinnerRing {
    to { transform: rotate(360deg); }
  }
  @keyframes kenBurns {
    0%   { transform: scale(1)    translateX(0px); }
    50%  { transform: scale(1.07) translateX(-10px); }
    100% { transform: scale(1)    translateX(0px); }
  }
  @keyframes overlayPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.80; }
  }
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes floatDown {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(10px); }
  }

  @media (min-width: 768px) {
    #reg-left-panel { display: block !important; }
  }

  .reg-input {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1.5px solid #dde3ef;
    font-size: 15px;
    color: #111827;
    background: #fff;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Inter', -apple-system, sans-serif;
  }
  .reg-input:focus {
    border-color: #4e7fe8;
    box-shadow: 0 0 0 3.5px rgba(78,127,232,0.14);
  }
  .reg-input::placeholder { color: #b0b8cc; }

  .reg-btn-primary {
    width: 100%;
    padding: 15px 24px;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #1c2f72 0%, #4e7fe8 60%, #35bdd0 100%);
    color: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 6px 24px rgba(78,127,232,0.36);
    font-family: 'Inter', sans-serif;
  }
  .reg-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(78,127,232,0.44); }
  .reg-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .type-card {
    padding: 22px 18px;
    border-radius: 16px;
    border: 2px solid #e8edf5;
    background: #fafbfe;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
    outline: none;
  }
  .type-card:hover { border-color: #4e7fe8; background: #f0f6ff; transform: translateY(-2px); }
  .type-card.selected { border-color: #4e7fe8; background: #f0f6ff; box-shadow: 0 0 0 4px rgba(78,127,232,0.12); }

  .step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    transition: background 0.3s, color 0.3s;
  }
  .step-dot.active { background: linear-gradient(135deg,#4e7fe8,#35bdd0); color: white; }
  .step-dot.done { background: #d1fae5; color: #059669; }
  .step-dot.upcoming { background: #f1f5f9; color: #94a3b8; }

  .spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spinnerRing 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [userType, setUserType] = useState<'worker' | 'facility' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Worker profile
  const [fullName, setFullName] = useState('');
  const [cadre, setCadre] = useState('Nurse');
  const [yearsExp, setYearsExp] = useState('');
  const [bio, setBio] = useState('');
  // Facility profile
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('Hospital');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const profile = userType === 'worker'
      ? { fullName, cadre, yearsExperience: Number(yearsExp), bio }
      : { facilityName, facilityType, location, description };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType, profile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      router.push('/auth/login?registered=1');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = { type: 0, account: 1, profile: 2 }[step];

  const steps = [
    { label: 'Account Type' },
    { label: 'Credentials' },
    { label: 'Profile' },
  ];

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 7,
  };
  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid #dde3ef', fontSize: 15, color: '#111827',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const textareaStyle: React.CSSProperties = {
    ...selectStyle,
    resize: 'none',
    lineHeight: 1.6,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{CSS}</style>

      {/* ── LEFT PANEL ── */}
      <div
        id="reg-left-panel"
        style={{
          flex: '0 0 46%',
          position: 'relative',
          overflow: 'hidden',
          display: 'none',
          background: '#081030',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-doctor.png"
          alt="Tiruf Healthcare"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            display: 'block',
            animation: 'kenBurns 16s ease-in-out infinite',
            transformOrigin: 'center center',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(8,16,48,0.55) 0%, rgba(8,16,48,0.28) 40%, rgba(8,16,48,0.86) 100%)',
          animation: 'overlayPulse 10s ease-in-out infinite',
        }} />

        {/* Floating badges */}
        <div style={{
          position: 'absolute', top: 44, right: 28,
          background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 18, padding: '12px 18px', color: 'white',
          animation: 'floatUp 5.5s ease-in-out infinite',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>🚀</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Join in 3 Minutes</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>Quick, easy sign-up</div>
          </div>
        </div>

        <div style={{
          position: 'absolute', top: '40%', left: 24,
          background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 18, padding: '12px 18px', color: 'white',
          animation: 'floatDown 6.5s ease-in-out infinite',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>🔐</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Verified Profiles</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>Secure & trusted</div>
          </div>
        </div>

        {/* Bottom branding */}
        <div style={{ position: 'absolute', bottom: 48, left: 44, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20, color: '#1c2f72',
            }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.3px' }}>TIRUF</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.88, maxWidth: 280 }}>
            Ethiopia&apos;s Premier Healthcare<br />Workforce Marketplace.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: '#ffffff',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeSlideIn 0.5s ease-out both' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #1c2f72, #4e7fe8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 17, color: 'white',
              boxShadow: '0 4px 12px rgba(78,127,232,0.32)',
            }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1c2f72', letterSpacing: '-0.3px' }}>Tiruf</span>
          </Link>

          {/* Heading */}
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.5px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 28 }}>
            Join Ethiopia&apos;s leading healthcare platform.
          </p>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div className={`step-dot ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'upcoming'}`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: i === stepIndex ? '#4e7fe8' : '#94a3b8', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#4e7fe8' : '#e2e8f0', margin: '0 8px', marginBottom: 22, borderRadius: 1, transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 18, padding: '12px 16px', borderRadius: 11,
              background: '#fef2f2', color: '#dc2626', fontSize: 14,
              border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* ── STEP 1: Account type ── */}
          {step === 'type' && (
            <div style={{ animation: 'fadeSlideIn 0.35s ease-out both' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>I am a…</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { type: 'worker' as const, icon: '👩‍⚕️', label: 'Health Worker', desc: 'Find extra shifts & earn more' },
                  { type: 'facility' as const, icon: '🏥', label: 'Facility', desc: 'Post shifts & find staff' },
                ].map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => { setUserType(opt.type); setStep('account'); }}
                    className={`type-card${userType === opt.type ? ' selected' : ''}`}
                  >
                    <div style={{ fontSize: 34, marginBottom: 10 }}>{opt.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2332', marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Credentials ── */}
          {step === 'account' && (
            <form onSubmit={e => { e.preventDefault(); setStep('profile'); }} style={{ animation: 'fadeSlideIn 0.35s ease-out both' }}>
              <button type="button" onClick={() => setStep('type')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 600, color: '#64748b',
                background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0,
              }}>
                ← Back
              </button>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com" className="reg-input" />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required minLength={8} placeholder="Minimum 8 characters" className="reg-input" />
              </div>
              <button type="submit" className="reg-btn-primary">Continue →</button>
            </form>
          )}

          {/* ── STEP 3: Profile ── */}
          {step === 'profile' && (
            <form onSubmit={handleSubmit} style={{ animation: 'fadeSlideIn 0.35s ease-out both' }}>
              <button type="button" onClick={() => setStep('account')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 600, color: '#64748b',
                background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0,
              }}>
                ← Back
              </button>

              {userType === 'worker' ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                      placeholder="e.g. Abebe Girma" className="reg-input" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Cadre</label>
                    <select value={cadre} onChange={e => setCadre(e.target.value)} required style={selectStyle}>
                      {CADRES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Years of Experience</label>
                    <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
                      required min="0" placeholder="e.g. 3" className="reg-input" />
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={labelStyle}>Short Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      placeholder="Tell facilities about yourself…" style={textareaStyle} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Facility Name</label>
                    <input type="text" value={facilityName} onChange={e => setFacilityName(e.target.value)} required
                      placeholder="e.g. Hayat Hospital" className="reg-input" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Facility Type</label>
                    <select value={facilityType} onChange={e => setFacilityType(e.target.value)} required style={selectStyle}>
                      {FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Location in Addis Ababa</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} required
                      placeholder="e.g. Bole, Addis Ababa" className="reg-input" />
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      placeholder="Brief description of your facility…" style={textareaStyle} />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="reg-btn-primary">
                {loading ? <><span className="spinner" />Creating account…</> : 'Create Account →'}
              </button>
            </form>
          )}

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 28 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ fontWeight: 700, color: '#4e7fe8', textDecoration: 'none' }}>
              Log In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
