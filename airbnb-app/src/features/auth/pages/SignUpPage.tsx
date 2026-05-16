import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';
import registerImage from '../../../assets/register_picture-removebg-preview.png';
import { api, API_BASE_URL } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'GUEST' as 'GUEST' | 'HOST',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Call the real API to register
      await api.post('/auth/register', {
        name:     `${formData.firstName} ${formData.lastName}`.trim(),
        email:    formData.email,
        username: formData.username || formData.email.split('@')[0],
        phone:    formData.phone || '0000000000',
        password: formData.password,
        role:     'GUEST', // SignUp page is always for guests — hosts use /become-a-host
      });

      // Auto-login after successful registration
      await login(formData.email, formData.password);
      toast.success('Account created successfully! Welcome 🎉');
      navigate('/dashboard', { replace: true }); // RoleRedirect handles the rest
    } catch (err) {
      toast.error((err as Error).message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left: Registration form */}
        <div style={{
          width: 540, flexShrink: 0,
          padding: '72px 72px 60px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start',
          overflowY: 'auto',
        }}>
          {/* Heading */}
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1a1a1a',
            margin: '0 0 4px', lineHeight: 1.2 }}>
            Create Account! Please
          </h1>
          <h1 style={{ fontSize: 34, fontWeight: 700, margin: '0 0 20px', lineHeight: 1.2 }}>
            <span style={{ fontStyle: 'italic', color: '#ff5722',
              fontFamily: 'Georgia, serif' }}>Sign Up </span>
            <span style={{ color: '#1a1a1a' }}>to continue.</span>
          </h1>
          <p style={{ fontSize: 15, color: '#555', margin: '0 0 36px', lineHeight: 1.7 }}>
            Join our community and unlock exclusive content, special offers, and be the first to dive into exciting news and updates!
          </p>

          {/* Social Sign Up */}
          <button style={{
            width: '100%', background: '#1a1a1a', color: 'white',
            border: '1px solid #111', borderRadius: 14, padding: '17px 20px',
            fontSize: 15, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12,
            boxShadow: '0 12px 26px rgba(17, 17, 17, 0.16)',
          }}
            onClick={() => { window.location.href = `${API_BASE_URL}/auth/apple`; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </button>

          <a
            href={`${API_BASE_URL}/auth/google`}
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
            We won't post anything without your permission and your personal details are kept private
          </p>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 15, color: '#888', fontWeight: 500 }}>Or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <FormField label="First Name" icon={<FiUser size={18} color="#94a3b8" />}>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required style={inputStyle} />
              </FormField>
              <FormField label="Last Name" icon={<FiUser size={18} color="#94a3b8" />}>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required style={inputStyle} />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <FormField label="Username" icon={<FiUser size={18} color="#94a3b8" />}>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required style={inputStyle} placeholder="e.g. john_doe" />
              </FormField>
              <FormField label="Phone" icon={<FiPhone size={18} color="#94a3b8" />}>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required style={inputStyle} placeholder="+1 555 000 0000" />
              </FormField>
            </div>

            <FormField label="Email Address" icon={<FiMail size={18} color="#94a3b8" />}>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={inputStyle} />
            </FormField>

            <FormField label="Password" icon={<FiLock size={18} color="#94a3b8" />}>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} required minLength={8} style={inputStyle} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </FormField>

            <FormField label="Confirm Password" icon={<FiLock size={18} color="#94a3b8" />}>
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required minLength={8} style={inputStyle} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeBtn}>
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </FormField>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} required style={{ marginTop: 2, width: 16, height: 16 }} />
              <label style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>
                I agree to the <a href="#" style={{ color: '#ff5722', textDecoration: 'none' }}>Terms and Conditions</a> and <a href="#" style={{ color: '#ff5722', textDecoration: 'none' }}>Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: '100%', background: '#ff5722', color: 'white',
              border: 'none', borderRadius: 10, padding: '18px',
              fontSize: 17, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1, marginBottom: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 15, color: '#555' }}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: '#1a1a1a', fontWeight: 700, fontSize: 15,
                padding: 0, textDecoration: 'underline' }}>
              Sign In
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
              Join our community and<br />start your journey today.
            </h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7,
              maxWidth: 400, margin: '0 auto 32px' }}>
              Create your account to access exclusive features, save your favorite listings, and connect with hosts from around the world.
            </p>
            <img
              src={registerImage}
              alt="Registration illustration"
              style={{ width: '100%', maxWidth: 640, display: 'block', margin: '0 auto' }}
            />
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ── Reusable form field wrapper ────────────────────────────────────── */
function FormField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '16px 18px', position: 'relative', marginBottom: 18 }}>
      <label style={{ position: 'absolute', top: -11, left: 14, background: 'white', padding: '0 5px', fontSize: 13, color: '#1a1a1a', fontWeight: 600 }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, border: 'none', outline: 'none',
  fontSize: 16, background: 'transparent', color: '#1a1a1a', width: '100%',
};
const eyeBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center',
};
