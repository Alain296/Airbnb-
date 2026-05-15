import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';
import loginImage from '../../../assets/login_picture-removebg-preview.png';
import registerImage from '../../../assets/register_picture-removebg-preview.png';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';
import { API_ORIGIN } from '../../../lib/api';

/* ─── Laptop + Woman + Lock illustration (Login right panel) ─────────────── */
function LaptopLockIllustration() {
  return (
    <img
      src={loginImage}
      alt="Login illustration"
      style={{ width: '100%', maxWidth: 620, display: 'block', margin: '0 auto' }}
    />
  );
}

/* ─── Man from behind + Question mark + PIN dots (Reset right panel) ─────── */
function ResetIllustration() {
  return (
    <img
      src={registerImage}
      alt="Registration illustration"
      style={{ width: '100%', maxWidth: 640, display: 'block', margin: '0 auto' }}
    />
  );
}

/* ─── Main LoginPage ─────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'reset'>('login');

  // Forgot password state
  const [resetEmail,   setResetEmail]   = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent,    setResetSent]    = useState(false);
  const [resetError,   setResetError]   = useState('');

  useEffect(() => {
    // Already logged in → RoleRedirect will send to correct dashboard
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { setResetError('Please enter your email address'); return; }
    setResetError('');
    setResetSending(true);
    try {
      await import('../../../lib/api').then(({ api }) =>
        api.post('/auth/forgot-password', { email: resetEmail }),
      );
      setResetSent(true);
    } catch {
      // API always returns 200 for security — show success regardless
      setResetSent(true);
    } finally {
      setResetSending(false);
    }
  };

  /* ── RESET MODE: split layout ── */
  if (mode === 'reset') {
    return (
      <div style={{
        minHeight: '100vh', background: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', flexDirection: 'column',
      }}>
        <Navbar />

        <div style={{ flex: 1, display: 'flex' }}>
          {/* Left: reset form */}
          <div style={{
            width: 540, flexShrink: 0,
            padding: '96px 80px 60px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start',
          }}>
            <h1 style={{ fontSize: 38, fontWeight: 700, margin: '0 0 16px', lineHeight: 1.2 }}>
              Password{' '}
              <span style={{ fontStyle: 'italic', color: '#ff5722', fontFamily: 'Georgia, serif' }}>
                Reset
              </span>
            </h1>
            <p style={{ fontSize: 15, color: '#555', margin: '0 0 44px', lineHeight: 1.7 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetSent ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
                <p style={{ margin: 0, color: '#166534', fontWeight: 700, fontSize: 16 }}>✓ Check your email</p>
                <p style={{ margin: '8px 0 0', color: '#166534', fontSize: 14 }}>
                  If <strong>{resetEmail}</strong> is registered, you'll receive a reset link shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div style={{
                  border: `1.5px solid ${resetError ? '#ef4444' : '#e2e8f0'}`, borderRadius: 10,
                  padding: '16px 18px', position: 'relative', marginBottom: 18,
                }}>
                  <label style={{ position: 'absolute', top: -11, left: 14, background: 'white', padding: '0 5px', fontSize: 13, color: '#1a1a1a', fontWeight: 600 }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                    placeholder="your@email.com"
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, background: 'transparent', color: '#1a1a1a' }}
                  />
                </div>
                {resetError && <p style={{ color: '#ef4444', fontSize: 13, margin: '-10px 0 14px 4px' }}>{resetError}</p>}

                <button
                  type="submit"
                  disabled={resetSending}
                  style={{
                    width: '100%', background: '#ff5722', color: 'white',
                    border: 'none', borderRadius: 10, padding: '18px',
                    fontSize: 17, fontWeight: 700,
                    cursor: resetSending ? 'not-allowed' : 'pointer',
                    opacity: resetSending ? 0.7 : 1,
                    marginTop: 10, marginBottom: 28,
                  }}
                >
                  {resetSending ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', fontSize: 15, color: '#555' }}>
              Remember your password?{' '}
              <button
                onClick={() => { setMode('login'); setResetSent(false); setResetEmail(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a', fontWeight: 700, fontSize: 15, padding: 0, textDecoration: 'underline' }}
              >
                Log in
              </button>
            </div>
          </div>

          {/* Right: illustration panel */}
          <div style={{
            flex: 1, background: '#f1f0eb',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px 24px',
          }}>
            <div style={{ maxWidth: 700, textAlign: 'center', width: '100%' }}>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1a1a1a',
                marginBottom: 16, lineHeight: 1.35 }}>
                Effortlessly organize your<br />workspace with ease.
              </h2>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7,
                maxWidth: 420, margin: '0 auto 36px' }}>
                It is a long established fact that a reader will be distracted by the
                readable content of a page when looking at its layout.
              </p>
              <ResetIllustration />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /* ── LOGIN MODE: split layout (matches screenshot 4) ── */
  return (
    <div style={{
      minHeight: '100vh', background: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left: login form with generous top spacing */}
        <div style={{
          width: 520, flexShrink: 0,
          padding: '72px 72px 60px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start',
          overflowY: 'auto',
        }}>
          {/* Heading */}
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1a1a1a',
            margin: '0 0 4px', lineHeight: 1.2 }}>
            Welcome back! Please
          </h1>
          <h1 style={{ fontSize: 34, fontWeight: 700, margin: '0 0 20px', lineHeight: 1.2 }}>
            <span style={{ fontStyle: 'italic', color: '#ff5722',
              fontFamily: 'Georgia, serif' }}>Sign in </span>
            <span style={{ color: '#1a1a1a' }}>to continue.</span>
          </h1>
          <p style={{ fontSize: 15, color: '#555', margin: '0 0 36px', lineHeight: 1.7 }}>
            Unlock a world of exclusive content, enjoy special offers, and be the
            first to dive into exciting news and updates by joining our community!
          </p>

          {/* Apple — decorative only (requires Apple Developer account) */}
          <button
            type="button"
            onClick={() => { window.location.href = `${API_ORIGIN}/api/v1/auth/apple`; }}
            style={{
              width: '100%', background: '#1a1a1a', color: 'white',
              border: '1px solid #111', borderRadius: 14, padding: '17px 20px',
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12,
              boxShadow: '0 12px 26px rgba(17, 17, 17, 0.16)',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Google — redirects to real OAuth flow */}
          <a
            href={`${API_ORIGIN}/api/v1/auth/google`}
            style={{
              width: '100%', background: '#ffffff', color: '#111827',
              border: '1px solid #e5e7eb', borderRadius: 14, padding: '17px 20px',
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 22,
              textDecoration: 'none',
              boxShadow: '0 12px 26px rgba(31, 41, 55, 0.08)',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <p style={{ fontSize: 14, color: '#888', margin: '0 0 26px', lineHeight: 1.6 }}>
            We won't post anything without your permission and your personal details
            are kept private
          </p>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 15, color: '#888', fontWeight: 500 }}>Or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <LoginForm onSuccess={() => {
            // RoleRedirect at /dashboard will send each role to the right place
            navigate('/dashboard', { replace: true });
          }} />

          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 15, color: '#555' }}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: '#1a1a1a', fontWeight: 700, fontSize: 15,
                padding: 0, textDecoration: 'underline' }}>
              Sign Up
            </button>
            <br />
            <button onClick={() => setMode('reset')}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: '#1a1a1a', fontWeight: 700, fontSize: 15,
                padding: 0, textDecoration: 'underline', marginTop: 6 }}>
              Remind Password
            </button>
          </div>
        </div>

        {/* Right: illustration panel */}
        <div style={{
          flex: 1, background: '#f1f0eb',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px',
        }}>
          <div style={{ maxWidth: 680, textAlign: 'center', width: '100%' }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1a1a1a',
              marginBottom: 16, lineHeight: 1.35 }}>
              Effortlessly organize your<br />workspace with ease.
            </h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7,
              maxWidth: 400, margin: '0 auto 32px' }}>
              It is a long established fact that a reader will be distracted by the
              readable content of a page when looking at its layout.
            </p>
            <LaptopLockIllustration />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ─── Reusable reset field (plain text / email) ──────────────────────────── */
function ResetField({ label, type = 'text' }: { label: string; type?: string }) {
  return (
    <div style={{
      border: '1.5px solid #e2e8f0', borderRadius: 10,
      padding: '16px 18px', position: 'relative', marginBottom: 18,
    }}>
      <label style={{
        position: 'absolute', top: -11, left: 14,
        background: 'white', padding: '0 5px',
        fontSize: 13, color: '#1a1a1a', fontWeight: 600,
      }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <input type={type} style={{
        width: '100%', border: 'none', outline: 'none',
        fontSize: 16, background: 'transparent', color: '#1a1a1a',
      }} />
    </div>
  );
}

/* ─── Reusable reset field (password with show/hide) ────────────────────── */
function ResetFieldPassword({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{
      border: '1.5px solid #e2e8f0', borderRadius: 10,
      padding: '16px 18px', position: 'relative', marginBottom: 18,
    }}>
      <label style={{
        position: 'absolute', top: -11, left: 14,
        background: 'white', padding: '0 5px',
        fontSize: 13, color: '#1a1a1a', fontWeight: 600,
      }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type={show ? 'text' : 'password'} style={{
          flex: 1, border: 'none', outline: 'none',
          fontSize: 16, background: 'transparent', color: '#1a1a1a',
        }} />
        <button type="button" onClick={() => setShow(p => !p)}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}>
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
}
