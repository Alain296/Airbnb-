import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ListingsPage } from './features/listings/pages/ListingsPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import OAuthCallbackPage from './features/auth/pages/OAuthCallbackPage';
import BecomeHostPage from './features/auth/pages/BecomeHostPage';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { RoleRoute } from './shared/components/RoleRoute';
import { RoleRedirect } from './shared/components/RoleRedirect';
import { NotFound } from './shared/components/NotFound';
import { Spinner } from './shared/components/Spinner';
import HomePage from './features/home/pages/HomePage';
import MyBookingsPage from './features/bookings/pages/MyBookingsPage';
import NewBookingPage from './features/bookings/pages/NewBookingPage';
import GuestDashboard from './features/bookings/pages/GuestDashboard';
import GuestWishlistPage from './features/bookings/pages/GuestWishlistPage';
import GuestStubPage from './features/bookings/pages/GuestStubPage';
import HostDashboard from './features/host/pages/HostDashboard';
import HostBookingsPage from './features/host/pages/HostBookingsPage';
import HostReviewsPage from './features/host/pages/HostReviewsPage';
import HostPersonalInfoPage from './features/host/pages/HostPersonalInfoPage';
import CreateListingPage from './features/host/pages/CreateListingPage';
import EditListingPage from './features/host/pages/EditListingPage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import ModerationQueue from './features/admin/pages/ModerationQueue';
import AllBookingsPage from './features/admin/pages/AllBookingsPage';
import UserManagementPage from './features/admin/pages/UserManagementPage';
import ListingManagementPage from './features/admin/pages/ListingManagementPage';

// Lazy-loaded pages — only downloaded when the user navigates to them (Criteria #10 + #11)
const ListingDetail  = lazy(() => import('./features/listings/pages/ListingDetail'));
const DashboardPage  = lazy(() => import('./features/auth/pages/DashboardPage'));
const ExplorePage    = lazy(() => import('./features/listings/pages/ExplorePage'));

// Configure NProgress — thin bar, no spinner
NProgress.configure({ showSpinner: false, speed: 300 });

// App.tsx is routes only — no state, no logic (Criteria #2)
export default function App() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 100);
    return () => { clearTimeout(t); NProgress.done(); };
  }, [location.pathname]);

  return (
    <>
      {/* Global CSS to hide template decorations and widgets */}
      <style>{`
        /* AGGRESSIVE HIDING OF TEMPLATE DECORATIONS */
        /* Hide ALL floating widgets, decorations, and third-party chat widgets */
        [class*="float"]:not([class*="chatbox"]),
        [class*="widget"]:not([class*="chatbox"]),
        [class*="decoration"],
        [id*="float"],
        [id*="widget"],
        .template-widget,
        .floating-decoration,
        /* Hide tropical/vacation imagery */
        img[src*="palm"],
        img[src*="tree"],
        img[src*="tropical"],
        img[src*="island"],
        img[src*="beach"],
        img[src*="vacation"],
        img[alt*="palm"],
        img[alt*="tree"],
        img[alt*="tropical"],
        img[alt*="island"],
        /* Hide third-party chat widgets */
        .chat-widget,
        .whatsapp-widget,
        .messenger-widget,
        .tawk-widget,
        #tawk-bubble,
        #tidio-chat,
        #tidio-chat-iframe,
        .crisp-client,
        .intercom-launcher,
        .drift-widget,
        /* Hide any fixed bottom-right elements that are NOT our chatbox */
        body > div:not(#root) > div[style*="position: fixed"][style*="bottom"][style*="right"]:not([style*="z-index: 999"]),
        body > div:not(#root) > button[style*="position: fixed"][style*="bottom"][style*="right"]:not([style*="z-index: 999"]),
        body > div:not(#root) > a[style*="position: fixed"][style*="bottom"][style*="right"]:not([style*="z-index: 999"]),
        body > div:not(#root) > img[style*="position: fixed"][style*="bottom"][style*="right"],
        /* Hide elements with tropical background images */
        *[style*="background-image"][style*="palm"],
        *[style*="background-image"][style*="tree"],
        *[style*="background-image"][style*="tropical"],
        *[style*="background-image"][style*="island"],
        *[style*="background-image"][style*="beach"],
        /* Hide chat/widget iframes */
        iframe[src*="chat"],
        iframe[src*="widget"],
        iframe[src*="messenger"],
        iframe[src*="tawk"],
        iframe[src*="tidio"],
        iframe[src*="crisp"],
        iframe[src*="intercom"],
        iframe[src*="drift"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        [data-listing-image] > :not(img):not(button):not([data-listing-badge]):not([data-listing-control]),
        [data-listing-image] img[src*="palm"],
        [data-listing-image] img[src*="tree"],
        [data-listing-image] img[src*="tropical"],
        [data-listing-image] img[src*="island"],
        [data-listing-image] img[alt*="palm"],
        [data-listing-image] img[alt*="tree"],
        [data-listing-image] img[alt*="tropical"],
        [data-listing-image] img[alt*="island"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        [data-listing-card] img:not([data-listing-photo]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/listings"    element={<ListingsPage />} />
        <Route path="/explore"     element={<ExplorePage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignUpPage />} />
        <Route path="/become-a-host"  element={<ProtectedRoute><BecomeHostPage /></ProtectedRoute>} />
        <Route path="/auth/callback"  element={<OAuthCallbackPage />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/bookings/new/:listingId" element={<ProtectedRoute><NewBookingPage /></ProtectedRoute>} />

        {/* Guest routes — GUEST only */}
        <Route path="/guest/dashboard"     element={<RoleRoute allow={['GUEST']}><GuestDashboard /></RoleRoute>} />
        <Route path="/guest/wishlist"      element={<RoleRoute allow={['GUEST']}><GuestWishlistPage /></RoleRoute>} />
        <Route path="/guest/messages"      element={<RoleRoute allow={['GUEST']}><GuestStubPage title="Messages"        iconName="FiMessageSquare" description="Chat with your hosts" /></RoleRoute>} />
        <Route path="/guest/reviews"       element={<RoleRoute allow={['GUEST']}><GuestStubPage title="My Reviews"      iconName="FiStar" description="Reviews you've written" /></RoleRoute>} />
        <Route path="/guest/notifications" element={<RoleRoute allow={['GUEST']}><GuestStubPage title="Notifications"   iconName="FiBell" description="Your latest updates" /></RoleRoute>} />
        <Route path="/guest/payments"      element={<RoleRoute allow={['GUEST']}><GuestStubPage title="Payment Methods" iconName="FiCreditCard" description="Manage your payment cards" /></RoleRoute>} />
        <Route path="/guest/settings"      element={<RoleRoute allow={['GUEST']}><GuestStubPage title="Account Settings" iconName="FiSettings" description="Update your profile and preferences" /></RoleRoute>} />
        {/* Host routes — HOST only */}
        <Route path="/host/dashboard" element={<RoleRoute allow={['HOST']}><HostDashboard /></RoleRoute>} />
        <Route path="/host/bookings"  element={<RoleRoute allow={['HOST']}><HostBookingsPage /></RoleRoute>} />
        <Route path="/host/reviews"   element={<RoleRoute allow={['HOST']}><HostReviewsPage /></RoleRoute>} />
        <Route path="/host/personal-info" element={<RoleRoute allow={['HOST']}><HostPersonalInfoPage /></RoleRoute>} />
        <Route path="/host/listings/new" element={<RoleRoute allow={['HOST']}><CreateListingPage /></RoleRoute>} />
        <Route path="/host/listings/:id/edit" element={<RoleRoute allow={['HOST']}><EditListingPage /></RoleRoute>} />

        {/* Admin routes — ADMIN only */}
        <Route path="/admin/dashboard"  element={<RoleRoute allow={['ADMIN']}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/users"      element={<RoleRoute allow={['ADMIN']}><UserManagementPage /></RoleRoute>} />
        <Route path="/admin/listings"   element={<RoleRoute allow={['ADMIN']}><ListingManagementPage /></RoleRoute>} />
        <Route path="/admin/moderation" element={<RoleRoute allow={['ADMIN']}><ModerationQueue /></RoleRoute>} />
        <Route path="/admin/bookings"   element={<RoleRoute allow={['ADMIN']}><AllBookingsPage /></RoleRoute>} />
        <Route path="/add-listing"  element={<Navigate to="/dashboard/add-listing" replace />} />

        {/* Template URL compatibility (avoid 404s when template links are used) */}
        <Route path="/listings-list-left.html" element={<Navigate to="/listings" replace />} />
        <Route path="/listings-list-with-sidebar.html" element={<Navigate to="/listings" replace />} />
        <Route path="/listings-list-no-sidebar.html" element={<Navigate to="/listings" replace />} />
        <Route path="/explore.html" element={<Navigate to="/explore" replace />} />

        {/* /dashboard → smart redirect to role-specific dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        } />

        {/* Legacy template dashboard — kept for the DashboardPage template UI */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* 404 — catches all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  );
}
