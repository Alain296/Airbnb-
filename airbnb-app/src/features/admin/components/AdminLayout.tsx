import type { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: Props) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <AdminSidebar />

      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: '#0f172a' }}>
        {/* Top bar */}
        <div style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div>
            {title && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{title}</h1>}
            {subtitle && <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '24px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
