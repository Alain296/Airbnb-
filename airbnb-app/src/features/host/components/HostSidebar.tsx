import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiCalendar, FiStar, FiPlusCircle, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth';

const accent = '#ff5722';

const NAV_ITEMS = [
  { Icon: FiHome,       label: 'Home',             path: '/' },
  { Icon: FiGrid,       label: 'Dashboard',        path: '/host/dashboard' },
  { Icon: FiCalendar,   label: 'Booking Requests', path: '/host/bookings' },
  { Icon: FiStar,       label: 'Guest Reviews',    path: '/host/reviews' },
  { Icon: FiPlusCircle, label: 'Create Listing',   path: '/host/listings/new' },
];

export function HostSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, userName, userEmail } = useAuth();

  const displayName = userName || userEmail?.split('@')[0] || 'Host';

  return (
    <aside style={{
      width: 260, flexShrink: 0, background: 'white',
      borderRight: '1px solid #f0f0f0', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <span onClick={() => navigate('/')} style={{ fontSize: 24, fontWeight: 800, cursor: 'pointer', letterSpacing: -0.5 }}>
          List<span style={{ color: accent, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>On.</span>
        </span>
        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>HOST PANEL</div>
      </div>

      {/* User profile */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #ff5722, #ff8a50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: 999 }}>HOST</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 12px 4px' }}>MENU</p>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: isActive ? '#fff7f2' : 'transparent',
                color: isActive ? accent : '#374151',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                boxShadow: isActive ? ('inset 3px 0 0 ' + accent) : 'none',
              }}
            >
              <item.Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid #f0f0f0' }}>
        <button onClick={() => { logout(); navigate('/'); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
          <FiLogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
