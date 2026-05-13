import { Link } from 'react-router-dom';
import { FiMap } from 'react-icons/fi';
import { Footer } from './Footer';

export function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f8f9fa', textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: 120, fontWeight: 900, color: '#ff5722',
        lineHeight: 1, marginBottom: 8, opacity: 0.15 }}>
        404
      </div>
      <div style={{ marginTop: -60, marginBottom: 24, color: '#ff5722' }}>
        <FiMap size={64} strokeWidth={1} />
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>
        Page not found
      </h1>
      <p style={{ fontSize: 15, color: '#666', maxWidth: 400, margin: '0 0 32px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>
      <Link to="/" style={{
        background: '#ff5722', color: 'white', textDecoration: 'none',
        padding: '12px 32px', borderRadius: 10, fontWeight: 600, fontSize: 15,
      }}>
        ← Back to Home
      </Link>
      <div style={{ width: '100%', marginTop: 64 }}>
        <Footer />
      </div>
    </div>
  );
}
