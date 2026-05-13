import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const accent = '#ff5722';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',       path: '/admin/dashboard' },
  { icon: '👥', label: 'User Management', path: '/admin/users' },
  { icon: '🏠', label: 'Listings',        path: '/admin/listings' },
  { icon: '📅', label: 'All Bookings',    path: '/admin/bookings' },
  { icon: '🛡️', label: 'Moderation',      path: '/admin/moderation' },
];

export function AdminSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, userName, userEmail } = useAuth();

  const displayName = userName || userEmail?.split('@')[0] || 'Admin';

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      background: '#0f172a',
      borderRight: '1px solid #1e293b',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1e293b' }}>
        <span
          onClick={() => navigate('/')}
          style={{ fontSize: 24, fontWeight: 800, cursor: 'pointer', letterSpacing: -0.5, color: 'white' }}
        >
          List<span style={{ color: accent, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>On.</span>
        </span>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>
          ADMIN PANEL
        </div>
      </div>

      {/* User profile */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff5722, #ff8a50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 999 }}>
              ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 12px 4px' }}>
          MANAGEMENT
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: isActive ? 'rgba(255,87,34,0.15)' : 'transparent',
                color: isActive ? accent : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14, cursor: 'pointer', textAlign: 'left',
                marginBottom: 2,
                boxShadow: isActive ? ('inset 3px 0 0 ' + accent) : 'none',
              }}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10, border: 'none',
            background: 'transparent', color: '#ef4444',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
