import { Link, useNavigate } from 'react-router-dom';
import { HostLayout } from '../components/HostLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyListings } from '../hooks/useMyListings';
import { useDeleteListing } from '../hooks/useDeleteListing';
import { useHostBookings } from '../hooks/useHostBookings';

export default function HostDashboard() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useMyListings(userId);
  const deleteMutation = useDeleteListing();
  const hostListingIds = listings.map((l) => String(l.id));
  const { data: hostBookings = [] } = useHostBookings(hostListingIds);

  const totalEarnings = hostBookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

  const avgRating = listings.length
    ? listings.reduce((s, l) => s + Number(l.rating || 0), 0) / listings.length
    : 0;

  const pendingCount = hostBookings.filter((b) => b.status === 'PENDING').length;

  return (
    <HostLayout
      title="Host Dashboard"
      subtitle="Manage your listings and bookings"
      action={<Link to="/host/listings/new" style={btnPrimary}>+ Create Listing</Link>}
    >

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          <Stat title="Total listings"  value={String(listings.length)} />
          <Stat title="Total bookings"  value={String(hostBookings.length)} />
          <Stat title="Total earnings"  value={`$${totalEarnings.toFixed(2)}`} />
          <Stat title="Average rating"  value={avgRating > 0 ? avgRating.toFixed(2) : '—'} />
        </div>

        {/* Booking requests banner — shown when there are pending requests */}
        {pendingCount > 0 && (
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🔔</span>
              <div>
                <div style={{ fontWeight: 700, color: '#9a3412', fontSize: 15 }}>
                  You have {pendingCount} pending booking request{pendingCount > 1 ? 's' : ''}
                </div>
                <div style={{ color: '#c2410c', fontSize: 13 }}>
                  Guests are waiting — accept or decline within 24 hours.
                </div>
              </div>
            </div>
            <Link to="/host/bookings" style={{ ...btnPrimary, background: '#ea580c', whiteSpace: 'nowrap' }}>
              Review Requests
            </Link>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <Link to="/host/bookings" style={{ ...btnGhostLink, position: 'relative' }}>
            Booking Requests
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#ef4444',
                color: 'white',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                padding: '1px 6px',
                minWidth: 18,
                textAlign: 'center',
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
          <Link to="/host/reviews" style={btnGhostLink}>
            Guest Reviews
          </Link>
        </div>

        {/* Listings section */}
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>My Listings</h2>

        {isLoading && <Spinner />}

        {!isLoading && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 12, border: '1px solid #eee' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>No listings yet</p>
            <p style={{ color: '#666', fontSize: 13, margin: '0 0 16px' }}>Create your first listing to start hosting.</p>
            <Link to="/host/listings/new" style={btnPrimary}>Create Listing</Link>
          </div>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {listings.map((l) => {
            const bookingsForListing = hostBookings.filter(
              (b) => String(b.listingId ?? b.listing?.id) === String(l.id),
            );
            const pendingForListing = bookingsForListing.filter((b) => b.status === 'PENDING').length;

            return (
              <div
                key={l.id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={l.img}
                  alt={l.title}
                  style={{ width: 110, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${l.id}/220/140`;
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{l.title}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    {l.location} · <strong>${l.price}</strong>/night
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {(l as any).isPublished === false ? (
                      <span style={{ fontSize: 12, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                        Draft
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                        Published
                      </span>
                    )}
                    {pendingForListing > 0 && (
                      <span style={{ fontSize: 12, background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                        {pendingForListing} pending request{pendingForListing > 1 ? 's' : ''}
                      </span>
                    )}
                    {l.rating && (
                      <span style={{ fontSize: 12, color: '#888' }}>⭐ {Number(l.rating).toFixed(1)}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button style={btnGhost} onClick={() => navigate(`/host/listings/${l.id}/edit`)}>Edit</button>
                  <button
                    style={{ ...btnGhost, borderColor: '#fca5a5', color: '#b91c1c' }}
                    onClick={() => {
                      if (!confirm('Delete this listing? This cannot be undone.')) return;
                      deleteMutation.mutate(String(l.id));
                    }}
                  >
                    Delete
                  </button>
                  <button style={btnGhost} onClick={() => navigate(`/listings/${l.id}`)}>View</button>
                </div>
              </div>
            );
          })}
        </div>
    </HostLayout>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */
function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>{value}</div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const btnPrimary: React.CSSProperties = {
  background: '#ff5722',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '9px 16px',
  fontWeight: 700,
  textDecoration: 'none',
  fontSize: 14,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  background: 'white',
  color: '#444',
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: '7px 12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
};

const btnGhostLink: React.CSSProperties = {
  background: 'white',
  color: '#444',
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: '8px 14px',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 13,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};
