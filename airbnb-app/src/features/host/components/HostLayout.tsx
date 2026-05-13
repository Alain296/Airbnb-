import type { ReactNode } from 'react';
import { HostSidebar } from './HostSidebar';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function HostLayout({ children, title, subtitle, action }: Props) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <HostSidebar />

      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Top bar */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #f0f0f0',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div>
            {title && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{title}</h1>}
            {subtitle && <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Page content */}
        <div style={{ padding: '24px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
