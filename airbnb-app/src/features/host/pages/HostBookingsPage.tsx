import { useState } from 'react';
import { FiCheck, FiX, FiCalendar, FiDollarSign, FiUser, FiAlertCircle } from 'react-icons/fi';
import { HostLayout } from '../components/HostLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyListings } from '../hooks/useMyListings';
import { useHostBookings } from '../hooks/useHostBookings';
import { useUpdateBookingStatus } from '../hooks/useUpdateBookingStatus';
import toast from 'react-hot-toast';

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING:   { background: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { background: '#dcfce7', color: '#166534' },
  CANCELLED: { background: '#fee2e2', color: '#991b1b' },
};

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

/* ── Decline reason modal ───────────────────────────────────────────── */
function DeclineModal({
  bookingId,
  guestName,
  onClose,
}: {
  bookingId: string;
  guestName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const updateStatus = useUpdateBookingStatus();

  const PRESET_REASONS = [
    'The dates are no longer available.',
    'The listing is under maintenance.',
    'The guest count exceeds capacity.',
    'I have a prior commitment for those dates.',
    'Other reason (see below)',
  ];

  const handleDecline = async () => {
    if (!reason.trim()) { toast.error('Please provide a reason for declining.'); return; }
    try {
      await updateStatus.mutateAsync({ id: bookingId, status: 'CANCELLED' });
      toast.success('Booking declined. The guest has been notified.');
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Decline Booking Request</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <FiX size={22} />
          </button>
        </div>

        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <FiAlertCircle size={18} color="#854d0e" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#854d0e', lineHeight: 1.5 }}>
            You are about to decline <strong>{guestName}</strong>'s booking request. Please provide a reason so the guest understands why.
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#374151' }}>
            Select a reason
          </label>
          <div style={{ display: 'grid', gap: 8 }}>
            {PRESET_REASONS.map((r) => (
              <label key={r} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${reason === r ? '#ff5722' : '#e5e7eb'}`,
                background: reason === r ? '#fff7f2' : 'white',
              }}>
                <input type="radio" name="reason" value={r} checked={reason === r}
                  onChange={() => setReason(r)} style={{ accentColor: '#ff5722' }} />
                <span style={{ fontSize: 13, color: reason === r ? '#ff5722' : '#374151', fontWeight: reason === r ? 600 : 400 }}>
                  {r}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#374151' }}>
            Additional message (optional)
          </label>
          <textarea
            placeholder="Add any additional details for the guest..."
            rows={3}
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            onChange={(e) => {
              if (!PRESET_REASONS.slice(0, 4).includes(reason)) {
                setReason(e.target.value);
              }
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            disabled={updateStatus.isPending || !reason.trim()}
            onClick={handleDecline}
            style={{
              flex: 1, background: '#dc2626', color: 'white', border: 'none',
              borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14,
              cursor: !reason.trim() || updateStatus.isPending ? 'not-allowed' : 'pointer',
              opacity: !reason.trim() || updateStatus.isPending ? 0.5 : 1,
            }}
          >
            {updateStatus.isPending ? 'Declining...' : 'Decline Booking'}
          </button>
          <button onClick={onClose} style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HostBookingsPage() {
  const { userId } = useAuth();
  const [tab, setTab] = useState<FilterTab>('ALL');
  const [declineBooking, setDeclineBooking] = useState<{ id: string; guestName: string } | null>(null);

  const { data: listings = [], isLoading: listingsLoading } = useMyListings(userId);
  const hostListingIds = listings.map((l) => String(l.id));

  const { data: bookings = [], isLoading: bookingsLoading, isError, error, refetch } = useHostBookings(hostListingIds);
  const updateStatus = useUpdateBookingStatus();

  const isLoading = listingsLoading || bookingsLoading;
  const listingMap = Object.fromEntries(listings.map((l) => [String(l.id), l]));
  const filtered = tab === 'ALL' ? bookings : bookings.filter((b) => b.status === tab);

  const counts = {
    ALL:       bookings.length,
    PENDING:   bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  return (
    <HostLayout title="Booking Requests" subtitle="Accept or decline guest booking requests for your listings.">

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as FilterTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              padding: '10px 16px', fontWeight: tab === t ? 700 : 500,
              fontSize: 14, color: tab === t ? '#ff5722' : '#555',
              borderBottom: tab === t ? '2px solid #ff5722' : '2px solid transparent',
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t}
            <span style={{ background: tab === t ? '#ff5722' : '#e5e7eb', color: tab === t ? 'white' : '#555', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px', minWidth: 20, textAlign: 'center' }}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}

      {isError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16 }}>
          <p style={{ margin: '0 0 8px', color: '#991b1b', fontWeight: 700 }}>Failed to load bookings</p>
          <p style={{ margin: '0 0 10px', color: '#991b1b', fontSize: 13 }}>{(error as Error).message}</p>
          <button onClick={() => refetch()} style={btnGhost}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
          <FiCalendar size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#374151' }}>
            No {tab !== 'ALL' ? tab.toLowerCase() : ''} bookings
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            {tab === 'PENDING' ? 'No pending requests right now.' : 'Nothing to show for this filter.'}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map((booking) => {
          const listing = listingMap[String(booking.listingId ?? booking.listing?.id)];
          const photo   = booking.listing?.photos?.[0]?.url || listing?.img || `https://picsum.photos/seed/bk-${booking.id}/200/130`;
          const checkIn  = String(booking.checkIn  ?? '').slice(0, 10);
          const checkOut = String(booking.checkOut ?? '').slice(0, 10);
          const nights   = checkIn && checkOut
            ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
            : '—';
          const guestName  = booking.guest?.name ?? booking.guest?.username ?? 'Guest';
          const guestEmail = booking.guest?.email ?? '';
          const isPending  = booking.status === 'PENDING';
          const isActing   = updateStatus.isPending && (updateStatus.variables as any)?.id === String(booking.id);

          return (
            <div key={booking.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <img src={photo} alt={listing?.title ?? 'Listing'}
                style={{ width: 130, height: 90, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/bk-${booking.id}/200/130`; }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#1a1a1a' }}>
                  {booking.listing?.title ?? listing?.title ?? 'Listing'}
                </div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiUser size={13} />
                  <span style={{ fontWeight: 600 }}>{guestName}</span>
                  {guestEmail && <span style={{ color: '#888' }}>· {guestEmail}</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#555', marginBottom: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiCalendar size={13} /> {checkIn} to {checkOut} ({nights} night{nights !== 1 ? 's' : ''})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiDollarSign size={13} /> <strong>${Number(booking.totalPrice ?? 0).toFixed(2)}</strong>
                  </span>
                </div>
                <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, ...(STATUS_STYLE[booking.status] ?? STATUS_STYLE.PENDING) }}>
                  {booking.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {isPending && (
                  <>
                    <button
                      disabled={isActing}
                      onClick={() => {
                        updateStatus.mutate({ id: String(booking.id), status: 'CONFIRMED' }, {
                          onSuccess: () => toast.success('Booking accepted'),
                          onError: (e) => toast.error((e as Error).message),
                        });
                      }}
                      style={{ ...btnAccept, opacity: isActing ? 0.6 : 1, cursor: isActing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiCheck size={14} /> Accept
                    </button>
                    <button
                      disabled={isActing}
                      onClick={() => setDeclineBooking({ id: String(booking.id), guestName })}
                      style={{ ...btnDecline, opacity: isActing ? 0.6 : 1, cursor: isActing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiX size={14} /> Decline
                    </button>
                  </>
                )}
                {booking.status === 'CONFIRMED' && (
                  <button
                    disabled={isActing}
                    onClick={() => setDeclineBooking({ id: String(booking.id), guestName })}
                    style={{ ...btnDecline, opacity: isActing ? 0.6 : 1, cursor: isActing ? 'not-allowed' : 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {declineBooking && (
        <DeclineModal
          bookingId={declineBooking.id}
          guestName={declineBooking.guestName}
          onClose={() => setDeclineBooking(null)}
        />
      )}
    </HostLayout>
  );
}

const btnAccept: React.CSSProperties = { background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, minWidth: 100 };
const btnDecline: React.CSSProperties = { background: 'white', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, minWidth: 100 };
const btnGhost: React.CSSProperties = { background: 'white', color: '#444', border: '1px solid #ddd', borderRadius: 8, padding: '8px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 };
