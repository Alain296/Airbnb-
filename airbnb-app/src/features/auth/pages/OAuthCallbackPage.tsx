import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../../../shared/components/Spinner';
import toast from 'react-hot-toast';

/**
 * Landing page for Google OAuth redirect.
 * URL: /auth/callback?token=...&userId=...&role=...&name=...&email=...
 *
 * The API redirects here after successful Google login.
 * We read the params, store them in AuthContext + localStorage, then go to /dashboard.
 */
export default function OAuthCallbackPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token  = params.get('token');
    const userId = params.get('userId');
    const role   = params.get('role') as 'HOST' | 'GUEST' | 'ADMIN' | null;
    const name   = params.get('name')  ?? '';
    const email  = params.get('email') ?? '';
    const error  = params.get('error');

    if (error) {
      const messages: Record<string, string> = {
        google_cancelled:    'Google sign-in was cancelled.',
        oauth_not_configured:'Google OAuth is not configured on the server.',
        google_failed:       'Google sign-in failed. Please try again.',
        account_suspended:   'Your account has been suspended.',
      };
      toast.error(messages[error] ?? 'Sign-in failed.');
      navigate('/login', { replace: true });
      return;
    }

    if (!token || !userId || !role) {
      toast.error('Invalid OAuth response.');
      navigate('/login', { replace: true });
      return;
    }

    // Store in AuthContext + localStorage
    loginWithToken({ token, userId, role, email, name });
    toast.success(`Welcome, ${name || 'back'}! 🎉`);
    navigate('/dashboard', { replace: true });
  }, [params, navigate, loginWithToken]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <p style={{ marginTop: 16, color: '#666', fontSize: 15 }}>Completing sign-in…</p>
      </div>
    </div>
  );
}
