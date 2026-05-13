import { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Props {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: Props) {
  const { login } = useAuth();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setEmailError('Enter your valid email'); return; }
    setEmailError('');
    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldWrap = (hasError = false): React.CSSProperties => ({
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: 10, padding: '16px 18px', position: 'relative',
    marginBottom: hasError ? 6 : 18, transition: 'border-color 0.2s',
  });

  const labelStyle: React.CSSProperties = {
    position: 'absolute', top: -11, left: 14,
    background: 'white', padding: '0 5px',
    fontSize: 13, color: '#1a1a1a', fontWeight: 600,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: 'none', outline: 'none',
    fontSize: 16, background: 'transparent', color: '#1a1a1a',
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Email */}
      <div style={fieldWrap(!!emailError)}>
        <label style={{ ...labelStyle, color: emailError ? '#ef4444' : '#1a1a1a' }}>
          Enter Email <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="email" value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            style={{ ...inputStyle, flex: 1 }} />
          {emailError && <FiAlertCircle size={18} color="#ef4444" />}
        </div>
      </div>
      {emailError && (
        <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 14px 4px' }}>{emailError}</p>
      )}

      {/* Password */}
      <div style={fieldWrap()}>
        <label style={labelStyle}>
          Password <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type={showPass ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} required
            style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => setShowPass(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}>
            {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div onClick={() => setRemember(p => !p)}
          style={{ width: 22, height: 22,
            border: `2px solid ${remember ? '#ff5722' : '#d1d5db'}`,
            borderRadius: 5, cursor: 'pointer', flexShrink: 0,
            background: remember ? '#ff5722' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s' }}>
          {remember && <span style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>✓</span>}
        </div>
        <span style={{ fontSize: 15, color: '#444' }}>Remember me next time</span>
      </div>

      {/* Submit */}
      <button type="submit" disabled={submitting}
        style={{ width: '100%', background: '#ff5722', color: 'white',
          border: 'none', borderRadius: 10, padding: '17px',
          fontSize: 17, fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.8 : 1, transition: 'opacity 0.2s' }}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
