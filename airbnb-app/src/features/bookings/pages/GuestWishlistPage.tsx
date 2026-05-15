import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMapPin, FiStar } from 'react-icons/fi';
import { GuestLayout } from '../components/GuestLayout';
import { readSavedListingSnapshots, useSaved } from '../../listings/hooks/useToggleSaved';
import { useFavorites } from '../../listings/hooks/useFavorites';
import { useListings } from '../../listings/hooks/useListings';

export default function GuestWishlistPage() {
  const navigate = useNavigate();
  const { data: savedIds = [] } = useSaved();
  const { toggle } = useFavorites();
  const { data: allListings = [], isLoading } = useListings(50);

  const wishlist = useMemo(() => {
    const apiMatches = allListings.filter((listing) => savedIds.includes(listing.id));
    const apiIds = new Set(apiMatches.map((listing) => listing.id));
    const snapshots = readSavedListingSnapshots().filter(
      (listing) => savedIds.includes(listing.id) && !apiIds.has(listing.id),
    );

    return [...apiMatches, ...snapshots].sort(
      (a, b) => savedIds.indexOf(a.id) - savedIds.indexOf(b.id),
    );
  }, [allListings, savedIds]);

  return (
    <GuestLayout title="Wishlist" subtitle="Listings you have saved">
      {!isLoading && wishlist.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <FiHeart size={64} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h2 style={{ margin: '0 0 8px', color: '#374151', fontSize: 22, fontWeight: 800 }}>No saved listings yet</h2>
          <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6b7280' }}>
            Click the heart icon on any listing to save it here.
          </p>
          <button
            onClick={() => navigate('/listings')}
            style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Browse Listings
          </button>
        </div>
      )}

      {wishlist.length > 0 && (
        <>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>
            {wishlist.length} saved listing{wishlist.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {wishlist.map((l) => (
              <div
                key={l.id}
                style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s' }}
                onClick={() => navigate(`/listings/${l.id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img
                    src={l.img}
                    alt={l.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${l.id}/400/280`; }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(l.id, l.title); }}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'white', border: 'none', borderRadius: '50%',
                      width: 36, height: 36, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                    title="Remove from wishlist"
                  >
                    <FiHeart size={16} fill="#ff5722" color="#ff5722" />
                  </button>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1a1a1a' }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiMapPin size={11} /> {l.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#ff5722', fontSize: 16 }}>
                      ${l.price}<span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>/night</span>
                    </span>
                    <span style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <FiStar size={12} fill="#f59e0b" color="#f59e0b" /> {l.rating || 'New'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </GuestLayout>
  );
}
