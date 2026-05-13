import { AdminLayout } from '../components/AdminLayout';
import { Spinner } from '../../../shared/components/Spinner';
import toast from 'react-hot-toast';
import { useAdminListings, useToggleListingPublished, useAdminDeleteListing } from '../hooks/useAdminListings';

export default function ModerationQueue() {
  const { data: allListings = [], isLoading } = useAdminListings();
  const togglePublished = useToggleListingPublished();
  const deleteListing   = useAdminDeleteListing();

  // Moderation queue = draft (unpublished) listings
  const queue = allListings.filter((l: any) => l.isPublished === false);

  return (
    <AdminLayout title="Moderation Queue" subtitle="Review draft listings and publish or reject them.">

        {isLoading && <Spinner />}

        {!isLoading && queue.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px', color: '#374151' }}>Queue is clear</p>
            <p style={{ fontSize: 13, margin: 0 }}>No draft listings awaiting review.</p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 14 }}>
          {queue.map((l: any) => {
            const photo = l.photos?.[0]?.url || `https://picsum.photos/seed/${l.id}/200/130`;
            const isApproving = togglePublished.isPending && (togglePublished.variables as any)?.id === l.id && (togglePublished.variables as any)?.isPublished === true;
            const isRejecting = deleteListing.isPending && deleteListing.variables === l.id;

            return (
              <div
                key={l.id}
                style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 14,
                  padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={photo}
                  alt={l.title}
                  style={{ width: 140, height: 96, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${l.id}/200/130`; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{l.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                    📍 {l.location} · <strong>${l.pricePerNight}</strong>/night · {l.type}
                  </div>
                  {l.host?.name && (
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                      Host: {l.host.name} · {l.host.email}
                    </div>
                  )}
                  {l.description && (
                    <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                      {l.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button
                    disabled={isApproving}
                    onClick={() => togglePublished.mutate(
                      { id: l.id, isPublished: true },
                      {
                        onSuccess: () => toast.success('Listing published'),
                        onError: (e) => toast.error((e as Error).message),
                      },
                    )}
                    style={{
                      background: '#16a34a', color: 'white', border: 'none',
                      borderRadius: 8, padding: '9px 18px', fontWeight: 700,
                      fontSize: 13, cursor: 'pointer', minWidth: 110,
                      opacity: isApproving ? 0.6 : 1,
                    }}
                  >
                    {isApproving ? '…' : '✓ Approve'}
                  </button>
                  <button
                    disabled={isRejecting}
                    onClick={() => {
                      if (!confirm(`Reject and delete "${l.title}"?`)) return;
                      deleteListing.mutate(l.id, {
                        onSuccess: () => toast.success('Listing rejected and deleted'),
                        onError: (e) => toast.error((e as Error).message),
                      });
                    }}
                    style={{
                      background: 'white', color: '#dc2626', border: '1px solid #fca5a5',
                      borderRadius: 8, padding: '9px 18px', fontWeight: 700,
                      fontSize: 13, cursor: 'pointer', minWidth: 110,
                      opacity: isRejecting ? 0.6 : 1,
                    }}
                  >
                    {isRejecting ? '…' : '✕ Reject'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
    </AdminLayout>
  );
}
