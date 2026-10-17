'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/* ─── animations injected once ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

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
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes successSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spinnerRing {
    to { transform: rotate(360deg); }
  }

  @media (min-width: 768px) {
    #login-left-panel { display: block !important; }
  }

  .tiruf-input {
    width: 100%;
    padding: 14px 16px;
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
  .tiruf-input:focus {
    border-color: #4e7fe8;
    box-shadow: 0 0 0 3.5px rgba(78,127,232,0.14);
  }
  .tiruf-input::placeholder { color: #b0b8cc; }

  .demo-btn {
    flex: 1;
    padding: 13px 10px;
    border-radius: 50px;
    border: 1.5px solid #e2e8f0;
    background: #fafbfd;
    color: #374151;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
  }
  .demo-btn:hover:not(:disabled) {
    background: #f0f4ff;
    border-color: #4e7fe8;
    transform: translateY(-1px);
  }
  .demo-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-btn {
    width: 100%;
    padding: 16px 24px;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #1c2f72 0%, #4e7fe8 60%, #35bdd0 100%);
    color: white;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 6px 24px rgba(78,127,232,0.36);
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .login-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.2s;
  }
  .login-btn:hover:not(:disabled)::after { background: rgba(255,255,255,0.08); }
  .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(78,127,232,0.44); }
  .login-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .spinner {
    display: inline-block;
    width: 17px; height: 17px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spinnerRing 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
`;

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'worker' | 'facility' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push(data.userType === 'worker' ? '/worker/dashboard' : '/facility/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(userType: 'worker' | 'facility') {
    setDemoLoading(userType);
    setError('');
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType }),
      });
      if (res.ok) {
        router.push(userType === 'worker' ? '/worker/dashboard' : '/facility/dashboard');
      } else {
        setError('Demo login failed. Try again.');
        setDemoLoading(null);
      }
    } catch {
      setError('Network error. Please try again.');
      setDemoLoading(null);
    }
  }

  const EyeOpen = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  );
  const EyeClosed = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
    </svg>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{CSS}</style>

      {/* ── LEFT PANEL ── */}
      <div
        id="login-left-panel"
        style={{
          flex: '0 0 48%',
          position: 'relative',
          overflow: 'hidden',
          display: 'none',
          background: '#0b1a3d',
        }}
      >
        {/* Doctor photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-doctor.png"
          alt="Tiruf Healthcare Professional"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            display: 'block',
            animation: 'kenBurns 16s ease-in-out infinite',
            transformOrigin: 'center center',
          }}
        />

        {/* Deep gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(8,20,60,0.55) 0%, rgba(8,20,60,0.30) 40%, rgba(8,20,60,0.82) 100%)',
          animation: 'overlayPulse 10s ease-in-out infinite',
        }} />

        {/* Floating badge — top right */}
        <div style={{
          position: 'absolute', top: 44, right: 28,
          background: 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 18, padding: '12px 18px',
          color: 'white',
          animation: 'floatUp 5.5s ease-in-out infinite, fadeSlideIn 0.9s ease-out 0.3s both',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>✅</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}>500+ Professionals</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>Verified &amp; Ready</div>
          </div>
        </div>

        {/* Floating badge — mid left */}
        <div style={{
          position: 'absolute', top: '42%', left: 24,
          background: 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 18, padding: '12px 18px',
          color: 'white',
          animation: 'floatDown 6.5s ease-in-out infinite, fadeSlideIn 0.9s ease-out 0.6s both',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>⚡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}>Instant Matching</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>No conflicts, no clashes</div>
          </div>
        </div>

        {/* Floating badge — lower right */}
        <div style={{
          position: 'absolute', bottom: '28%', right: 32,
          background: 'rgba(53,189,208,0.18)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(53,189,208,0.35)',
          borderRadius: 18, padding: '12px 18px',
          color: 'white',
          animation: 'floatUp 7s ease-in-out 1s infinite, fadeSlideIn 0.9s ease-out 0.9s both',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>🏥</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}>80+ Facilities</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>Across Addis Ababa</div>
          </div>
        </div>

        {/* Bottom branding */}
        <div style={{ position: 'absolute', bottom: 48, left: 44, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20, color: '#1c2f72',
            }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.3px' }}>TIRUF</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.88, maxWidth: 280 }}>
            Empowering Ethiopia&apos;s Healthcare,<br />One Shift at a Time.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        background: '#ffffff',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: mounted ? 'fadeSlideIn 0.5s ease-out both' : 'none' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 38 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #1c2f72, #4e7fe8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 17, color: 'white',
              boxShadow: '0 4px 12px rgba(78,127,232,0.32)',
            }}>T</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1c2f72', letterSpacing: '-0.3px' }}>Tiruf</span>
          </Link>

          {/* Success banner (post-registration) */}
          {justRegistered && (
            <div style={{
              marginBottom: 22,
              padding: '13px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #e6f5f0, #d0f0e8)',
              border: '1px solid #a3ddc9',
              color: '#166534',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'successSlide 0.4s ease-out both',
            }}>
              <span style={{ fontSize: 18 }}>🎉</span>
              Account created! Please log in to continue.
            </div>
          )}

          {/* Heading */}
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 30, lineHeight: 1.5 }}>
            Log in to your Tiruf account to continue.
          </p>

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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="tiruf-input"
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="tiruf-input"
                  style={{ paddingRight: 48 } as React.CSSProperties}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: 26 }}>
              <Link href="#" style={{ fontSize: 13, fontWeight: 600, color: '#4e7fe8', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              id="signin-btn"
              type="submit"
              disabled={loading || !!demoLoading}
              className="login-btn"
              style={{ marginBottom: 14 }}
            >
              {loading ? <><span className="spinner" />Signing in…</> : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '4px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: '#e9ecf2' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.04em' }}>OR TRY A DEMO</span>
            <div style={{ flex: 1, height: 1, background: '#e9ecf2' }} />
          </div>

          {/* Demo buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button
              id="demo-worker-btn"
              onClick={() => handleDemoLogin('worker')}
              disabled={!!demoLoading || loading}
              className="demo-btn"
            >
              {demoLoading === 'worker' ? '⏳ Loading…' : '👩‍⚕️ Demo Worker'}
            </button>
            <button
              id="demo-facility-btn"
              onClick={() => handleDemoLogin('facility')}
              disabled={!!demoLoading || loading}
              className="demo-btn"
            >
              {demoLoading === 'facility' ? '⏳ Loading…' : '🏥 Demo Facility'}
            </button>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            padding: '11px 15px',
            borderRadius: 10,
            background: '#f0f6ff',
            fontSize: 12,
            color: '#4a6fa5',
            lineHeight: 1.75,
            border: '1px solid #dbeafe',
            marginBottom: 28,
          }}>
            <strong>Demo accounts</strong> — password: <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: 4 }}>Demo1234!</code><br />
            🏥 hayat@tiruf.demo &nbsp;·&nbsp; 👩‍⚕️ abebe@tiruf.demo
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ fontWeight: 700, color: '#4e7fe8', textDecoration: 'none' }}>
              Get Started →
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
