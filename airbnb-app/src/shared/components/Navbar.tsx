import { useMemo, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHeart, FiUser, FiUserPlus, FiSun, FiMoon, FiPlusCircle, FiLogOut,
  FiHome, FiCalendar, FiSearch, FiGrid, FiFileText, FiStar, FiPlus,
  FiBarChart2, FiUsers, FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useFavorites } from '../../features/listings/hooks/useFavorites';
import { useTheme } from '../../store/ThemeContext';
import { SavedListings } from '../../features/listings/components/SavedListings';

type NavbarProps = {
  variant?: 'default' | 'transparent';
};

export function Navbar({ variant = 'default' }: NavbarProps) {
  const { dark, setDark } = useTheme();
  const { isAuthenticated, logout, role, userName, userEmail } = useAuth();
  const { count: savedCount } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);

  const displayName = userName || userEmail?.split('@')[0] || 'Account';

  // Admin and Host use sidebar — hide Navbar entirely on their routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHostRoute  = location.pathname.startsWith('/host');
  const isGuestDashRoute = location.pathname.startsWith('/guest') || location.pathname === '/bookings' || location.pathname.startsWith('/bookings/');
  if (isAdminRoute) return null;
  if (isHostRoute)  return null;
  if (isAuthenticated && role === 'GUEST' && isGuestDashRoute) return null;

  const palette = useMemo(() => {
    if (variant === 'transparent') {
      return {
        bg: 'transparent', border: 'transparent',
        txt: 'rgba(255,255,255,0.85)', head: 'white',
      };
    }
    return {
      bg:     dark ? '#1e293b' : 'white',
      border: dark ? '#334155' : '#e8e8e8',
      txt:    dark ? '#94a3b8' : '#444',
      head:   dark ? '#f1f5f9' : '#1a1a1a',
    };
  }, [dark, variant]);

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color: isActive ? '#ff5722' : palette.txt,
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: 15,
    display: 'flex', alignItems: 'center', gap: 3,
    paddingBottom: 2,
    borderBottom: isActive ? '2px solid #ff5722' : '2px solid transparent',
    transition: 'color 0.2s',
  });

  return (
    <>
      <nav style={{
        background: palette.bg,
        borderBottom: `1px solid ${palette.border}`,
        position: variant === 'transparent' ? 'absolute' : 'sticky',
        top: 0, left: 0, right: 0, zIndex: 200,
        transition: 'background 0.3s',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          padding: '0 40px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <span
            onClick={() => navigate('/')}
            style={{ fontSize: 26, fontWeight: 800, color: palette.head, letterSpacing: '-0.5px', cursor: 'pointer' }}
          >
            List<span style={{ color: '#ff5722', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>On.</span>
          </span>

          {/* Nav links — strictly role-based, no overlap */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <NavLink to="/"         style={({ isActive }) => linkStyle(isActive)}>Home</NavLink>
            <NavLink to="/listings" style={({ isActive }) => linkStyle(isActive)}>Listings</NavLink>
            <NavLink to="/explore"  style={({ isActive }) => linkStyle(isActive)}>Explore</NavLink>

            {/* GUEST only */}
            {isAuthenticated && role === 'GUEST' && (
              <NavLink to="/bookings" style={({ isActive }) => linkStyle(isActive)}>My Bookings</NavLink>
            )}

            {/* HOST only */}
            {isAuthenticated && role === 'HOST' && (
              <NavLink to="/host/dashboard" style={({ isActive }) => linkStyle(isActive)}>Host</NavLink>
            )}

            {/* ADMIN only */}
            {isAuthenticated && role === 'ADMIN' && (
              <NavLink to="/admin/dashboard" style={({ isActive }) => linkStyle(isActive)}>Admin</NavLink>
            )}
          </div>

          {/* Switch to Host — shown to authenticated GUESTs */}
          {isAuthenticated && role === 'GUEST' && (
            <button
              onClick={() => navigate('/become-a-host')}
              style={{
                background: 'none', border: `1.5px solid ${palette.border}`,
                borderRadius: 8, padding: '7px 14px', fontWeight: 600,
                fontSize: 13, cursor: 'pointer', color: palette.head,
                whiteSpace: 'nowrap',
              }}
            >
              Switch to Host
            </button>
          )}

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>

            {/* Saved / wishlist */}
            <div
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setSavedPanelOpen(true)}
              title="Saved listings"
            >
              <FiHeart
                size={22}
                fill={savedCount > 0 ? '#ff5722' : 'none'}
                color={savedCount > 0 ? '#ff5722' : palette.head}
              />
              {savedCount > 0 && (
                <div style={{
                  position: 'absolute', top: -8, right: -8,
                  background: '#ff5722', color: 'white', borderRadius: '50%',
                  width: 18, height: 18, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                }}>
                  {savedCount}
                </div>
              )}
            </div>

            {/* User menu */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  title={displayName}
                  style={{
                    background: 'none', border: `1.5px solid ${palette.border}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    gap: 8, padding: '6px 12px', borderRadius: 24,
                    color: palette.head,
                  }}
                >
                  <FiUser size={18} color={palette.head} />
                  <span style={{ fontSize: 14, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                    background: role === 'ADMIN' ? '#fef3c7' : role === 'HOST' ? '#dbeafe' : '#f3f4f6',
                    color:      role === 'ADMIN' ? '#92400e' : role === 'HOST' ? '#1e40af' : '#374151',
                  }}>
                    {role}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute', top: '110%', right: 0,
                      background: dark ? '#1e293b' : 'white',
                      border: `1px solid ${palette.border}`,
                      borderRadius: 12, minWidth: 200,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 300, overflow: 'hidden',
                    }}
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${palette.border}` }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: palette.head }}>{displayName}</div>
                      <div style={{ fontSize: 12, color: palette.txt }}>{userEmail}</div>
                    </div>

                    {/* GUEST menu */}
                    {role === 'GUEST' && (
                      <>
                        <MenuItem Icon={FiHome} label="My Dashboard"    onClick={() => { navigate('/guest/dashboard');  setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiCalendar} label="My Bookings"     onClick={() => { navigate('/bookings');         setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiSearch} label="Browse Listings" onClick={() => { navigate('/listings');         setUserMenuOpen(false); }} />
                      </>
                    )}

                    {/* HOST menu */}
                    {role === 'HOST' && (
                      <>
                        <MenuItem Icon={FiHome} label="Host Dashboard"   onClick={() => { navigate('/host/dashboard');    setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiFileText} label="Booking Requests" onClick={() => { navigate('/host/bookings');     setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiStar} label="Guest Reviews"    onClick={() => { navigate('/host/reviews');      setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiPlus} label="Create Listing"   onClick={() => { navigate('/host/listings/new'); setUserMenuOpen(false); }} />
                      </>
                    )}

                    {/* ADMIN menu */}
                    {role === 'ADMIN' && (
                      <>
                        <MenuItem Icon={FiBarChart2} label="Admin Dashboard"  onClick={() => { navigate('/admin/dashboard');   setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiUsers} label="User Management"  onClick={() => { navigate('/admin/users');       setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiGrid} label="Listings"         onClick={() => { navigate('/admin/listings');    setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiCalendar} label="All Bookings"     onClick={() => { navigate('/admin/bookings');    setUserMenuOpen(false); }} />
                        <MenuItem Icon={FiShield} label="Moderation"       onClick={() => { navigate('/admin/moderation'); setUserMenuOpen(false); }} />
                      </>
                    )}

                    <div style={{ borderTop: `1px solid ${palette.border}` }}>
                      <button
                        onClick={() => { logout(); navigate('/'); setUserMenuOpen(false); }}
                        style={{
                          width: '100%', background: 'none', border: 'none',
                          padding: '11px 16px', textAlign: 'left', cursor: 'pointer',
                          fontSize: 14, color: '#dc2626', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <FiLogOut size={15} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                {/* Become a Host — shown to unauthenticated users */}
                <button
                  onClick={() => navigate('/become-a-host')}
                  style={{
                    background: 'none', color: palette.head, border: 'none',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '8px 12px',
                    textDecoration: 'underline',
                  }}
                >
                  Become a Host
                </button>
                <NavLink
                  to="/login"
                  style={{
                    color: palette.head, textDecoration: 'none', fontWeight: 600,
                    fontSize: 14, padding: '8px 16px', borderRadius: 8,
                    border: `1.5px solid ${palette.border}`,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <FiUser size={16} /> Sign in
                </NavLink>
                <NavLink
                  to="/signup"
                  style={{
                    background: '#ff5722', color: 'white', textDecoration: 'none',
                    fontWeight: 600, fontSize: 14, padding: '8px 16px', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <FiUserPlus size={16} /> Sign up
                </NavLink>
              </div>
            )}

            {/* Dark / light toggle */}
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Light mode' : 'Dark mode'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6,
              }}
            >
              {dark ? <FiSun size={22} color="#f59e0b" /> : <FiMoon size={22} color={palette.head} />}
            </button>

            {/* Add Listing — only for HOST */}
            {isAuthenticated && role === 'HOST' && (
              <button
                onClick={() => navigate('/host/listings/new')}
                style={{
                  background: '#ff5722', color: 'white', border: 'none',
                  padding: '9px 20px', borderRadius: 24, fontWeight: 600,
                  cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <FiPlusCircle size={16} />
                Add Listing
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Saved panel */}
      <SavedListings
        open={savedPanelOpen}
        onClose={() => setSavedPanelOpen(false)}
        dark={dark}
      />
    </>
  );
}

/* ── Dropdown menu item ─────────────────────────────────────────────── */
function MenuItem({ Icon, label, onClick }: { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', background: hover ? '#fff7f2' : 'none',
        border: 'none', padding: '11px 16px', textAlign: 'left',
        cursor: 'pointer', fontSize: 14,
        color: hover ? '#ff5722' : '#374151',
        fontWeight: hover ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <Icon size={16} color={hover ? '#ff5722' : '#374151'} />
      {label}
    </button>
  );
}
