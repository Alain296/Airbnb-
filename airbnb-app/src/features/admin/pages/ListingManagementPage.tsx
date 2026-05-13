import { useState, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Spinner } from '../../../shared/components/Spinner';
import toast from 'react-hot-toast';
import { useAdminListings, useToggleListingPublished, useAdminDeleteListing } from '../hooks/useAdminListings';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

export default function ListingManagementPage() {
  const { data: listings = [], isLoading, isError, error, refetch } = useAdminListings();
  const togglePublished = useToggleListingPublished();
  const deleteListing   = useAdminDeleteListing();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter,   setTypeFilter]   = useState('ALL');

  const types = useMemo(() => {
    const set = new Set(listings.map((l: any) => l.type).filter(Boolean));
    return ['ALL', ...Array.from(set)] as string[];
  }, [listings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter((l: any) => {
      const matchSearch = !q || l.title?.toLowerCase().includes(q) || l.location?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL'
        ? true
        : statusFilter === 'PUBLISHED' ? l.isPublished !== false
        : l.isPublished === false;
      const matchType = typeFilter === 'ALL' || l.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [listings, search, statusFilter, typeFilter]);

  const counts = {
    ALL:       listings.length,
    PUBLISHED: listings.filter((l: any) => l.isPublished !== false).length,
    DRAFT:     listings.filter((l: any) => l.isPublished === false).length,
  };

  return (
    <AdminLayout title="Listing Management" subtitle="Publish, unpublish, or remove listings from the platform.">

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by title or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {(['ALL', 'PUBLISHED', 'DRAFT'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  border: `1.5px solid ${statusFilter === s ? '#ff5722' : '#e5e7eb'}`,
                  background: statusFilter === s ? '#fff7f2' : 'white',
                  color: statusFilter === s ? '#ff5722' : '#374151',
                  borderRadius: 8, padding: '8px 14px',
                  fontWeight: statusFilter === s ? 700 : 500,
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                {s} <span style={{ fontSize: 11, opacity: 0.7 }}>({counts[s]})</span>
              </button>
            ))}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}
          >
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {isLoading && <Spinner />}
        {isError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', color: '#991b1b', fontWeight: 700 }}>Failed to load listings</p>
            <p style={{ margin: '0 0 10px', color: '#991b1b', fontSize: 13 }}>{(error as Error).message}</p>
            <button onClick={() => refetch()} style={btnGhost}>Retry</button>
          </div>
        )}

        {!isLoading && !isError && (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: '#9ca3af', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                No listings match your filters.
              </div>
            )}
            {filtered.map((l: any) => {
              const photo = l.photos?.[0]?.url || `https://picsum.photos/seed/${l.id}/200/130`;
              const isPublished = l.isPublished !== false;
              const isToggling  = togglePublished.isPending && (togglePublished.variables as any)?.id === l.id;
              const isDeleting  = deleteListing.isPending && deleteListing.variables === l.id;

              return (
                <div
                  key={l.id}
                  style={{
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: 12,
                    padding: 14, display: 'flex', gap: 14, alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    opacity: isPublished ? 1 : 0.7,
                  }}
                >
                  <img
                    src={photo}
                    alt={l.title}
                    style={{ width: 110, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${l.id}/200/130`; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{l.title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                      📍 {l.location} · <strong>${l.pricePerNight}</strong>/night · {l.type}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: isPublished ? '#dcfce7' : '#f3f4f6',
                        color: isPublished ? '#166534' : '#6b7280',
                      }}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                      {l.host?.name && (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Host: {l.host.name}</span>
                      )}
                      {l.rating && (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>⭐ {Number(l.rating).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      disabled={isToggling}
                      onClick={() => {
                        togglePublished.mutate(
                          { id: l.id, isPublished: !isPublished },
                          {
                            onSuccess: () => toast.success(isPublished ? 'Listing unpublished' : 'Listing published'),
                            onError: (e) => toast.error((e as Error).message),
                          },
                        );
                      }}
                      style={{
                        background: isPublished ? '#fef9c3' : '#dcfce7',
                        color: isPublished ? '#854d0e' : '#166534',
                        border: 'none', borderRadius: 8, padding: '7px 12px',
                        fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        opacity: isToggling ? 0.6 : 1,
                      }}
                    >
                      {isToggling ? '…' : isPublished ? '⏸ Unpublish' : '▶ Publish'}
                    </button>
                    <button
                      disabled={isDeleting}
                      onClick={() => {
                        if (!confirm(`Delete "${l.title}"? This cannot be undone.`)) return;
                        deleteListing.mutate(l.id, {
                          onSuccess: () => toast.success('Listing deleted'),
                          onError: (e) => toast.error((e as Error).message),
                        });
                      }}
                      style={{
                        background: '#fee2e2', color: '#991b1b', border: 'none',
                        borderRadius: 8, padding: '7px 12px', fontWeight: 700,
                        fontSize: 12, cursor: 'pointer', opacity: isDeleting ? 0.6 : 1,
                      }}
                    >
                      {isDeleting ? '…' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
          Showing {filtered.length} of {listings.length} listings
        </p>
    </AdminLayout>
  );
}

const btnGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
