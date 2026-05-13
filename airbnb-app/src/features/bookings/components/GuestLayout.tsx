import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { GuestSidebar } from './GuestSidebar';
import { Navbar } from '../../../shared/components/Navbar';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function GuestLayout({ children, title, subtitle, action }: Props) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Navbar always at top */}
      <Navbar />

      <div style={{ display: 'flex' }}>
        <GuestSidebar />

        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {/* Page top bar */}
          <div style={{
            background: 'white', borderBottom: '1px solid #f0f0f0',
            padding: '16px 28px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'sticky', top: 64, zIndex: 9,
          }}>
            <div>
              {title    && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{title}</h1>}
              {subtitle && <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {action}
              <button
                onClick={() => navigate('/listings')}
                style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <FiSearch size={14} /> Browse Listings
              </button>
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: '24px 28px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
