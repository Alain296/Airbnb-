import { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Spinner } from '../../../shared/components/Spinner';
import toast from 'react-hot-toast';
import { useAllBookings } from '../hooks/useAllBookings';
import { api } from '../../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING:   { background: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { background: '#dcfce7', color: '#166534' },
  CANCELLED: { background: '#fee2e2', color: '#991b1b' },
};

function useAdminUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/bookings/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings', 'all'] }),
  });
}

export default function AllBookingsPage() {
  const [status, setStatus] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('all');
  const [page,   setPage]   = useState(1);
  const [from,   setFrom]   = useState('');
  const [to,     setTo]     = useState('');

  const { data, isLoading, isFetching, isError, error } = useAllBookings({
    status, page,
    from: from || undefined,
    to:   to   || undefined,
  });

  const updateBooking = useAdminUpdateBooking();

  const bookings = data?.data ?? [];
  const meta     = data?.meta;

  return (
    <AdminLayout title="All Bookings" subtitle="View and manage all platform reservations.">

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            style={inp}
          >
            <option value="all">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13, color: '#6b7280' }}>From</label>
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} style={inp} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13, color: '#6b7280' }}>To</label>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} style={inp} />
          </div>
          {(from || to || status !== 'all') && (
            <button
              onClick={() => { setFrom(''); setTo(''); setStatus('all'); setPage(1); }}
              style={btnGhost}
            >
              Clear filters
            </button>
          )}
          {isFetching && !isLoading && (
            <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 600 }}>Refreshing…</span>
          )}
        </div>

        {isLoading && <Spinner />}
        {isError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: 0, color: '#991b1b', fontWeight: 700 }}>{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Table header */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 140px', padding: '10px 16px', background: '#f8f9fa', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Listing</span>
                <span>Guest</span>
                <span>Dates</span>
                <span>Total</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {bookings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 24px', color: '#9ca3af' }}>
                  No bookings found.
                </div>
              )}

              {bookings.map((b: any, i: number) => {
                const checkIn  = String(b.checkIn  ?? '').slice(0, 10);
                const checkOut = String(b.checkOut ?? '').slice(0, 10);
                const isActing = updateBooking.isPending && (updateBooking.variables as any)?.id === b.id;

                return (
                  <div
                    key={b.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 140px',
                      padding: '12px 16px',
                      borderBottom: i < bookings.length - 1 ? '1px solid #f3f4f6' : 'none',
                      alignItems: 'center',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{b.listing?.title ?? b.listingId}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.listing?.location ?? ''}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{b.guest?.name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.guest?.email ?? ''}</div>
                    </div>
                    <div style={{ color: '#374151' }}>
                      {checkIn} → {checkOut}
                    </div>
                    <div style={{ fontWeight: 700, color: '#1a1a1a' }}>
                      ${Number(b.totalPrice ?? 0).toFixed(0)}
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, ...(STATUS_STYLE[b.status] ?? STATUS_STYLE.PENDING) }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.status === 'PENDING' && (
                        <button
                          disabled={isActing}
                          onClick={() => updateBooking.mutate(
                            { id: b.id, status: 'CONFIRMED' },
                            { onSuccess: () => toast.success('Booking confirmed'), onError: (e) => toast.error((e as Error).message) },
                          )}
                          style={{ ...btnTiny, background: '#dcfce7', color: '#166534' }}
                        >
                          {isActing ? '…' : '✓'}
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          disabled={isActing}
                          onClick={() => {
                            if (!confirm('Cancel this booking?')) return;
                            updateBooking.mutate(
                              { id: b.id, status: 'CANCELLED' },
                              { onSuccess: () => toast.success('Booking cancelled'), onError: (e) => toast.error((e as Error).message) },
                            );
                          }}
                          style={{ ...btnTiny, background: '#fee2e2', color: '#991b1b' }}
                        >
                          {isActing ? '…' : '✕'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ ...btnGhost, opacity: page <= 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Page {page}{meta?.totalPages ? ` of ${meta.totalPages}` : ''}
                {meta?.total ? ` · ${meta.total} total` : ''}
              </span>
              <button
                disabled={meta ? page >= meta.totalPages : false}
                onClick={() => setPage((p) => p + 1)}
                style={{ ...btnGhost, opacity: meta && page >= meta.totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          </>
        )}
    </AdminLayout>
  );
}

const inp: React.CSSProperties = {
  border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 13,
};
const btnGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const btnTiny: React.CSSProperties = {
  border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
};
