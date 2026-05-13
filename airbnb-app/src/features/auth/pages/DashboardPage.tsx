import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiGrid,
  FiPlusSquare,
  FiDollarSign,
  FiMessageSquare,
  FiList,
  FiStar,
  FiCalendar,
  FiHeart,
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiMaximize2,
  FiMoon,
  FiSun,
  FiMapPin,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../../../store/StoreContext';
import { useTheme } from '../../../store/ThemeContext';
import { DashboardContent } from '../dashboard/dashboardContent';

const accent = '#fe4c51';
const PROMO_KEY = 'liston-dashboard-promo-dismissed';

function normalizePrimary(raw?: string) {
  if (!raw) return 'dashboard';
  const s = raw.toLowerCase();
  if (s === 'overview') return 'dashboard';
  if (s === 'saved') return 'bookmark';
  if (s === 'messages' || s === 'notifications') return 'message';
  if (s === 'multi') return 'multi-level';
  return s;
}

function parseDashboardPath(pathname: string): { primary: string; segments: string[] } {
  const base = '/dashboard';
  if (pathname === base || pathname === `${base}/`) {
    return { primary: 'dashboard', segments: [] };
  }
  const rest = pathname.startsWith(`${base}/`) ? pathname.slice(base.length + 1) : '';
  const parts = rest.split('/').filter(Boolean).map(p => p.toLowerCase());
  if (parts.length === 0) return { primary: 'dashboard', segments: [] };
  return { primary: normalizePrimary(parts[0]), segments: parts.slice(1) };
}

function navButtonStyle(active: boolean, dark: boolean): CSSProperties {
  return {
    border: 'none',
    background: 'transparent',
    color: active ? accent : dark ? '#ccc' : '#555',
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 8px',
    borderRadius: 6,
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userEmail, logout } = useAuth();
  const { state, dispatch } = useStore();
  const { dark, setDark } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);

  const { primary, segments } = useMemo(() => parseDashboardPath(pathname), [pathname]);
  const savedListings = useMemo(
    () => state.listings.filter(l => state.saved.includes(l.id)),
    [state.listings, state.saved],
  );
  const displayName = userEmail?.split('@')[0] || 'User';

  const [sidebarNarrow, setSidebarNarrow] = useState(false);
  const [listingOpen, setListingOpen] = useState(primary === 'my-listings');
  const [multiOpen, setMultiOpen] = useState(primary === 'multi-level');
  const [listingMenuOpen, setListingMenuOpen] = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PROMO_KEY) === '1',
  );

  useEffect(() => {
    if (primary === 'my-listings') setListingOpen(true);
    if (primary === 'multi-level') setMultiOpen(true);
  }, [primary]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dismissPromo = useCallback(() => {
    sessionStorage.setItem(PROMO_KEY, '1');
    setPromoDismissed(true);
  }, []);

  const toggleFs = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const go = (path: string) => {
    navigate(path);
  };

  const sidebarW = sidebarNarrow ? 76 : 268;
  const pageBg = dark ? '#151515' : '#f7f5f4';
  const panelBg = dark ? '#1e1e1e' : '#fff';
  const borderCol = dark ? '#2f2f2f' : '#ebebeb';
  const muted = dark ? '#9a9a9a' : '#9a9a9a';

  const rowBtn = useCallback((active: boolean): CSSProperties => ({
    width: '100%',
    marginBottom: 4,
    border: 'none',
    borderRadius: 8,
    padding: sidebarNarrow ? '10px' : '10px 12px',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    justifyContent: sidebarNarrow ? 'center' : 'flex-start',
    background: active ? (dark ? 'rgba(254,76,81,0.15)' : 'rgba(254,76,81,0.1)') : 'transparent',
    color: active ? accent : dark ? '#d5d5d5' : '#444',
    fontSize: 14,
    boxShadow: active ? `inset 3px 0 0 ${accent}` : 'none',
  }), [dark, sidebarNarrow]);

  const subRow = (active: boolean): CSSProperties => ({
    ...rowBtn(active),
    paddingLeft: sidebarNarrow ? 10 : 36,
    fontSize: 13,
    boxShadow: active ? `inset 3px 0 0 ${accent}` : 'none',
  });

  const sectionLabel = (_section: string): CSSProperties => ({
    margin: '18px 0 8px',
    fontSize: 11,
    color: muted,
    fontWeight: 800,
    letterSpacing: '0.06em',
    paddingLeft: sidebarNarrow ? 0 : 4,
    textAlign: sidebarNarrow ? 'center' : 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: pageBg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: dark ? '#e8e8e8' : '#222',
    }}
    >
      <div style={{ display: 'flex' }}>
        <aside style={{
          width: sidebarW,
          flexShrink: 0,
          background: panelBg,
          borderRight: `1px solid ${borderCol}`,
          minHeight: '100vh',
          padding: sidebarNarrow ? '14px 8px' : '18px 14px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 180ms ease',
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
            justifyContent: sidebarNarrow ? 'center' : 'flex-start',
          }}
          >
            <FiMapPin color={accent} size={sidebarNarrow ? 26 : 28} aria-hidden />
            {!sidebarNarrow && (
              <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
                List<span style={{ color: accent, fontStyle: 'italic' }}>On</span>
              </span>
            )}
          </div>

          <p style={sectionLabel('MAIN MENU')} title="Main menu">{sidebarNarrow ? '·' : 'MAIN MENU'}</p>
          <button type="button" style={rowBtn(primary === 'dashboard')} onClick={() => go('/dashboard')} title="Dashboard">
            <FiGrid size={18} /> {!sidebarNarrow && 'Dashboard'}
          </button>
          <button type="button" style={rowBtn(primary === 'add-listing')} onClick={() => go('/dashboard/add-listing')} title="Add listing">
            <FiPlusSquare size={18} /> {!sidebarNarrow && 'Add listing'}
          </button>
          <button type="button" style={rowBtn(primary === 'wallet')} onClick={() => go('/dashboard/wallet')} title="Wallet">
            <FiDollarSign size={18} /> {!sidebarNarrow && 'Wallet'}
          </button>
          <button type="button" style={{ ...rowBtn(primary === 'message'), position: 'relative' }} onClick={() => go('/dashboard/message')} title="Message">
            <FiMessageSquare size={18} />
            {!sidebarNarrow && <span style={{ flex: 1, textAlign: 'left' }}>Message</span>}
            <span style={{
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              background: '#22c55e',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(sidebarNarrow ? { position: 'absolute', top: 6, right: 6 } : {}),
            }}
            >
              2
            </span>
          </button>

          <p style={sectionLabel('LISTING')} title="Listing">{sidebarNarrow ? '·' : 'LISTING'}</p>

          {!sidebarNarrow && (
            <button
              type="button"
              style={{ ...rowBtn(listingOpen && primary === 'my-listings'), fontWeight: 600 }}
              onClick={() => setListingOpen(v => !v)}
            >
              {listingOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
              <FiList size={18} />
              My Listing
            </button>
          )}
          {sidebarNarrow && (
            <button type="button" style={rowBtn(primary === 'my-listings')} title="My Listing" onClick={() => go('/dashboard/my-listings')}>
              <FiList size={18} />
            </button>
          )}
          {(listingOpen && !sidebarNarrow) && (
            <>
              <button type="button" style={subRow(primary === 'my-listings' && segments.length === 0)} onClick={() => go('/dashboard/my-listings')}>
                All listings
              </button>
              <button type="button" style={subRow(primary === 'my-listings' && segments[0] === 'pending')} onClick={() => go('/dashboard/my-listings/pending')}>
                Pending
              </button>
            </>
          )}

          <button type="button" style={rowBtn(primary === 'reviews')} onClick={() => go('/dashboard/reviews')} title="Reviews">
            <FiStar size={18} /> {!sidebarNarrow && 'Reviews'}
          </button>
          <button type="button" style={rowBtn(primary === 'bookings')} onClick={() => go('/dashboard/bookings')} title="Bookings">
            <FiCalendar size={18} /> {!sidebarNarrow && 'Bookings'}
          </button>
          <button type="button" style={rowBtn(primary === 'bookmark')} onClick={() => go('/dashboard/bookmark')} title="Bookmark">
            <FiHeart size={18} /> {!sidebarNarrow && 'Bookmark'}
          </button>

          {!sidebarNarrow && (
            <button
              type="button"
              style={{ ...rowBtn(multiOpen || primary === 'multi-level'), fontWeight: 600 }}
              onClick={() => setMultiOpen(v => !v)}
            >
              {multiOpen ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <FiMenu size={18} /> Multi Level Menu
              </span>
            </button>
          )}
          {sidebarNarrow && (
            <button type="button" style={rowBtn(primary === 'multi-level')} title="Multi Level" onClick={() => go('/dashboard/multi-level/second')}>
              <FiMenu size={18} />
            </button>
          )}
          {(multiOpen && !sidebarNarrow) && (
            <>
              <button type="button" style={subRow(primary === 'multi-level' && segments[0] === 'second')} onClick={() => go('/dashboard/multi-level/second')}>
                Level 2
              </button>
              <button type="button" style={subRow(primary === 'multi-level' && segments[0] === 'third')} onClick={() => go('/dashboard/multi-level/third')}>
                Level 3
              </button>
            </>
          )}

          <p style={sectionLabel('ACCOUNT')} title="Account">{sidebarNarrow ? '·' : 'ACCOUNT'}</p>
          <button type="button" style={rowBtn(primary === 'edit-profile')} onClick={() => go('/dashboard/edit-profile')} title="Edit Profile">
            <FiUser size={18} /> {!sidebarNarrow && 'Edit Profile'}
          </button>
          <button type="button" style={rowBtn(primary === 'setting')} onClick={() => go('/dashboard/setting')} title="Setting">
            <FiSettings size={18} /> {!sidebarNarrow && 'Setting'}
          </button>
          <button type="button" style={rowBtn(primary === 'support')} onClick={() => go('/dashboard/support')} title="Support">
            <FiHelpCircle size={18} /> {!sidebarNarrow && 'Support'}
          </button>
          <button
            type="button"
            style={rowBtn(false)}
            onClick={() => { logout(); navigate('/'); }}
            title="Logout"
          >
            <FiLogOut size={18} /> {!sidebarNarrow && 'Logout'}
          </button>

          {!sidebarNarrow && !promoDismissed && (
            <div style={{
              marginTop: 'auto',
              paddingTop: 24,
              position: 'relative',
              borderRadius: 12,
              border: `1px solid ${borderCol}`,
              background: dark ? '#262626' : '#fafafa',
              padding: 12,
            }}
            >
              <button type="button" aria-label="Dismiss" onClick={dismissPromo} style={{ position: 'absolute', top: 8, right: 8, border: 'none', background: 'none', cursor: 'pointer', color: muted }}>
                <FiX />
              </button>
              <div style={{ height: 72, borderRadius: 8, background: `linear-gradient(135deg,${accent}33,transparent)` }} />
              <p style={{ margin: '10px 0 0', fontSize: 12, color: muted, lineHeight: 1.4 }}>
                Upgrade your listings — promotions and analytics tips.
              </p>
            </div>
          )}
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header style={{
            background: panelBg,
            borderBottom: `1px solid ${borderCol}`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
          >
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarNarrow(v => !v)}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: 'none',
                background: accent,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <FiMenu size={20} />
            </button>

            <div style={{ flex: 1, minWidth: 200, maxWidth: 420, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: muted }} />
              <input
                ref={searchRef}
                placeholder="Search (Ctrl+/)"
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 40px',
                  borderRadius: 10,
                  border: `1px solid ${borderCol}`,
                  background: dark ? '#2a2a2a' : '#fafafa',
                  color: dark ? '#eee' : '#222',
                  fontSize: 14,
                }}
              />
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <span style={navButtonStyle(pathname === '/', dark)}>Home</span>
              </Link>
              <button type="button" style={navButtonStyle(primary === 'dashboard', dark)} onClick={() => go('/dashboard')}>
                Dashboard <FiChevronDown size={14} aria-hidden />
              </button>
              <span style={{ position: 'relative' }}>
                <button
                  type="button"
                  style={navButtonStyle(listingMenuOpen || ['/listings', '/explore'].some(p => pathname.startsWith(p)), dark)}
                  onClick={() => setListingMenuOpen(v => !v)}
                >
                  Listing <FiChevronDown size={14} aria-hidden />
                </button>
                {listingMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 6,
                    background: panelBg,
                    border: `1px solid ${borderCol}`,
                    borderRadius: 10,
                    minWidth: 160,
                    boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)',
                    zIndex: 30,
                  }}
                  >
                    <button
                      type="button"
                      onClick={() => { navigate('/listings'); setListingMenuOpen(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        background: 'transparent',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: dark ? '#e0e0e0' : '#333',
                      }}
                    >
                      List view
                    </button>
                  </div>
                )}
              </span>
              <Link to="/explore" style={{ textDecoration: 'none' }}>
                <span style={navButtonStyle(pathname.startsWith('/explore'), dark)}>Explore</span>
              </Link>
              <a href={`${import.meta.env.BASE_URL}liston-v2.3/index.html`} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
                <span style={navButtonStyle(false, dark)}>Template <FiChevronDown size={14} aria-hidden /></span>
              </a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
              <button type="button" aria-label="Fullscreen" onClick={toggleFs} style={{ ...navButtonStyle(false, dark), padding: 8 }}>
                <FiMaximize2 size={18} />
              </button>
              <button type="button" aria-label="Toggle theme" onClick={() => setDark(!dark)} style={{ ...navButtonStyle(false, dark), padding: 8 }}>
                {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: `1px solid ${borderCol}` }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: dark ? '#3a3a3a' : '#e8e8e8' }} />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: muted }}>{userEmail || 'example@gmail.com'}</div>
                </div>
              </div>
            </div>
          </header>

          <main style={{ padding: 20, flex: 1 }}>
            <DashboardContent
              primary={primary}
              segments={segments}
              state={state}
              userEmail={userEmail || ''}
              displayName={displayName}
              savedListings={savedListings}
              navigate={navigate}
              dispatch={dispatch}
            />
          </main>

          <footer style={{
            padding: '12px 22px',
            borderTop: `1px solid ${borderCol}`,
            fontSize: 12,
            color: muted,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            background: panelBg,
          }}
          >
            <span>© 2026 ListOn — directory dashboard (demo).</span>
            <span>Built with Airbnb app shell</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
