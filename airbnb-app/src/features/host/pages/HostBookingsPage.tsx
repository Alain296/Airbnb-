import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle, FiCalendar, FiCheck, FiDollarSign, FiHome,
  FiMapPin, FiMessageSquare, FiSearch, FiSend, FiUser, FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { HostLayout } from '../components/HostLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyListings } from '../hooks/useMyListings';
import { useHostBookings } from '../hooks/useHostBookings';
import { useUpdateBookingStatus } from '../hooks/useUpdateBookingStatus';
import { api } from '../../../lib/api';

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING: { background: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { background: '#dcfce7', color: '#166534' },
  CANCELLED: { background: '#fee2e2', color: '#991b1b' },
};

const HOST_MESSAGE_TEMPLATES = [
  'Hello, thank you for your booking request. I will be happy to host you.',
  'Hi, could you please confirm your arrival time for check-in?',
  'Hello, I have received your message and will share the details shortly.',
];

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

type BookingMessage = {
  id: string;
  bookingId: string;
  text: string;
  createdAt: string;
  sender?: { id: string; role?: string; name?: string; avatar?: string };
};

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

  const presetReasons = [
    'The dates are no longer available.',
    'The listing is under maintenance.',
    'The guest count exceeds capacity.',
    'I have a prior commitment for those dates.',
    'Other reason (see below)',
  ];

  const handleDecline = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for declining.');
      return;
    }

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
          <button onClick={onClose} style={iconButton} title="Close">
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
            {presetReasons.map((item) => (
              <label key={item} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${reason === item ? '#ff5722' : '#e5e7eb'}`,
                background: reason === item ? '#fff7f2' : 'white',
              }}>
                <input type="radio" name="reason" value={item} checked={reason === item}
                  onChange={() => setReason(item)} style={{ accentColor: '#ff5722' }} />
                <span style={{ fontSize: 13, color: reason === item ? '#ff5722' : '#374151', fontWeight: reason === item ? 600 : 400 }}>
                  {item}
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
              if (!presetReasons.slice(0, 4).includes(reason)) setReason(e.target.value);
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
          <button onClick={onClose} style={btnGhost}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function HostBookingsPage() {
  const { userId } = useAuth();
  const [tab, setTab] = useState<FilterTab>('ALL');
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [declineBooking, setDeclineBooking] = useState<{ id: string; guestName: string } | null>(null);

  const { data: listings = [], isLoading: listingsLoading } = useMyListings(userId);
  const hostListingIds = listings.map((l) => String(l.id));
  const { data: bookings = [], isLoading: bookingsLoading, isError, error, refetch } = useHostBookings(hostListingIds);
  const updateStatus = useUpdateBookingStatus();

  const listingMap = Object.fromEntries(listings.map((listing) => [String(listing.id), listing]));
  const filtered = useMemo(
    () => tab === 'ALL' ? bookings : bookings.filter((booking) => booking.status === tab),
    [bookings, tab],
  );
  const activeBooking = filtered.find((booking) => String(booking.id) === activeId) ?? filtered[0];
  const bookingMessages = messages.filter((message) => message.bookingId === String(activeBooking?.id));

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((booking) => booking.status === 'PENDING').length,
    CONFIRMED: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    CANCELLED: bookings.filter((booking) => booking.status === 'CANCELLED').length,
  };

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((booking) => String(booking.id) === activeId)) {
      setActiveId(String(filtered[0].id));
    }
  }, [activeId, filtered]);

  useEffect(() => {
    if (!activeBooking) return;
    setMessagesLoading(true);
    setMessageError('');
    api.get<{ messages: BookingMessage[] }>(`/bookings/${activeBooking.id}/messages`)
      .then((res) => setMessages((res.messages ?? []).map((message) => ({ ...message, bookingId: String(message.bookingId) }))))
      .catch((err) => setMessageError((err as Error).message))
      .finally(() => setMessagesLoading(false));
  }, [activeBooking?.id]);

  const sendReply = async () => {
    if (!activeBooking || !draft.trim()) return;

    const text = draft.trim();
    setDraft('');
    try {
      const res = await api.post<{ message: BookingMessage }>(`/bookings/${activeBooking.id}/messages`, { text });
      setMessages((prev) => [...prev, { ...res.message, bookingId: String(res.message.bookingId) }]);
    } catch (err) {
      setDraft(text);
      setMessageError((err as Error).message);
    }
  };

  const changeStatus = (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => {
        toast.success(status === 'CONFIRMED' ? 'Booking accepted' : 'Booking cancelled');
        refetch();
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  if (listingsLoading || bookingsLoading) {
    return <HostLayout title="Booking Requests" subtitle="Review requests and reply to guests."><Spinner /></HostLayout>;
  }

  return (
    <HostLayout title="Booking Requests" subtitle="Review requests and reply to guests.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as FilterTab[]).map((item) => (
          <button key={item} onClick={() => setTab(item)}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              padding: '10px 16px', fontWeight: tab === item ? 700 : 500,
              fontSize: 14, color: tab === item ? '#ff5722' : '#555',
              borderBottom: tab === item ? '2px solid #ff5722' : '2px solid transparent',
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {item}
            <span style={{ background: tab === item ? '#ff5722' : '#e5e7eb', color: tab === item ? 'white' : '#555', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px', minWidth: 20, textAlign: 'center' }}>
              {counts[item]}
            </span>
          </button>
        ))}
      </div>

      {isError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 16 }}>
          <p style={{ margin: '0 0 8px', color: '#991b1b', fontWeight: 700 }}>Failed to load bookings</p>
          <p style={{ margin: '0 0 10px', color: '#991b1b', fontSize: 13 }}>{(error as Error).message}</p>
          <button onClick={() => refetch()} style={btnGhost}>Retry</button>
        </div>
      )}

      {!isError && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
          <FiCalendar size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#374151' }}>No {tab !== 'ALL' ? tab.toLowerCase() : ''} bookings</p>
          <p style={{ fontSize: 13, margin: 0 }}>{tab === 'PENDING' ? 'No pending requests right now.' : 'Nothing to show for this filter.'}</p>
        </div>
      )}

      {!isError && activeBooking && (
        <ConversationView
          activeBooking={activeBooking}
          filtered={filtered}
          listingMap={listingMap}
          messages={messages}
          bookingMessages={bookingMessages}
          draft={draft}
          messagesLoading={messagesLoading}
          messageError={messageError}
          activeId={activeId}
          isActing={updateStatus.isPending && (updateStatus.variables as any)?.id === String(activeBooking.id)}
          onSelect={setActiveId}
          onDraft={setDraft}
          onSend={sendReply}
          onAccept={() => changeStatus(String(activeBooking.id), 'CONFIRMED')}
          onDecline={() => setDeclineBooking({ id: String(activeBooking.id), guestName: activeBooking.guest?.name ?? activeBooking.guest?.username ?? 'Guest' })}
        />
      )}

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

function ConversationView({
  activeBooking,
  filtered,
  listingMap,
  messages,
  bookingMessages,
  draft,
  messagesLoading,
  messageError,
  activeId,
  isActing,
  onSelect,
  onDraft,
  onSend,
  onAccept,
  onDecline,
}: any) {
  const listing = activeBooking.listing ?? listingMap[String(activeBooking.listingId ?? activeBooking.listing?.id)] ?? {};
  const guestName = activeBooking.guest?.name ?? activeBooking.guest?.username ?? 'Guest';
  const guestEmail = activeBooking.guest?.email ?? '';
  const guestAvatar = activeBooking.guest?.avatar;
  const photo = listing?.photos?.[0]?.url || listing?.img || `https://picsum.photos/seed/host-msg-${activeBooking.id}/360/220`;
  const checkIn = String(activeBooking.checkIn ?? '').slice(0, 10);
  const checkOut = String(activeBooking.checkOut ?? '').slice(0, 10);
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
    : 1;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px minmax(0, 1fr)',
      gap: 18,
      height: 'min(650px, calc(100vh - 190px))',
      minHeight: 540,
      maxWidth: 1280,
      margin: '0 auto',
    }}>
      <aside style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: 14, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input placeholder="Search conversations" style={{ ...inp, paddingLeft: 34, marginTop: 0 }} />
          </div>
        </div>
        <div style={{ maxHeight: 'calc(100% - 73px)', overflowY: 'auto' }}>
          {filtered.map((booking: any) => {
            const currentListing = booking.listing ?? listingMap[String(booking.listingId ?? booking.listing?.id)] ?? {};
            const selected = String(booking.id) === String(activeId);
            const last = [...messages].reverse().find((message) => message.bookingId === String(booking.id));
            return (
              <button
                key={booking.id}
                onClick={() => onSelect(String(booking.id))}
                style={{
                  width: '100%', border: 'none', borderBottom: '1px solid #f3f4f6',
                  background: selected ? '#fff7f2' : 'white', padding: 14, cursor: 'pointer',
                  display: 'flex', gap: 12, textAlign: 'left', alignItems: 'center',
                }}
              >
                <img
                  src={currentListing?.photos?.[0]?.url || currentListing?.img || `https://picsum.photos/seed/host-list-${booking.id}/80/80`}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.guest?.name ?? booking.guest?.username ?? 'Guest'}
                    </span>
                    <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>{booking.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {currentListing?.title ?? 'Listing'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }}>
                    {last ? last.text : 'No messages yet'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', minHeight: 0 }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
              {guestAvatar
                ? <img src={guestAvatar} alt={guestName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#6b7280', fontWeight: 800 }}>{guestName.charAt(0).toUpperCase()}</div>}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>{guestName}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Booking {listing?.title ?? 'your listing'}
              </p>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, ...(STATUS_STYLE[activeBooking.status] ?? STATUS_STYLE.PENDING) }}>
            {activeBooking.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 270px', minHeight: 0 }}>
          <div style={{ padding: 18, overflowY: 'auto', background: '#f8f9fa' }}>
            {messagesLoading && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>Loading messages...</p>}
            {messageError && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#b91c1c' }}>{messageError}</p>}
            {!messagesLoading && bookingMessages.length === 0 && (
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
                  <FiMessageSquare size={16} color="#ff5722" /> Start the guest conversation
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Confirm arrival details, answer questions, or share anything the guest needs before check-in.
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gap: 10 }}>
              {bookingMessages.map((message: BookingMessage) => {
                const mine = message.sender?.role === 'HOST';
                return (
                  <div key={message.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '68%',
                      borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: mine ? '#ff5722' : 'white',
                      color: mine ? 'white' : '#1a1a1a',
                      padding: '10px 12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{message.text}</div>
                      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 5, textAlign: 'right' }}>
                        {new Date(message.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside style={{ borderLeft: '1px solid #f0f0f0', padding: 16, background: 'white', overflowY: 'auto' }}>
            <img src={photo} alt="" style={{ width: '100%', height: 120, borderRadius: 10, objectFit: 'cover', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{listing?.title ?? 'Listing'}</h3>
            <InfoLine Icon={FiUser} text={guestEmail ? `${guestName} - ${guestEmail}` : guestName} />
            <InfoLine Icon={FiMapPin} text={listing?.location ?? 'Location pending'} />
            <InfoLine Icon={FiCalendar} text={`${checkIn} to ${checkOut} (${nights} night${nights === 1 ? '' : 's'})`} />
            <InfoLine Icon={FiDollarSign} text={`$${Number(activeBooking.totalPrice ?? 0).toFixed(2)}`} />
            <InfoLine Icon={FiHome} text={`Booking #${String(activeBooking.id ?? '').slice(0, 8).toUpperCase()}`} />

            <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
              {activeBooking.status === 'PENDING' && (
                <>
                  <button disabled={isActing} onClick={onAccept} style={{ ...btnAccept, opacity: isActing ? 0.6 : 1 }}>
                    <FiCheck size={14} /> Accept
                  </button>
                  <button disabled={isActing} onClick={onDecline} style={{ ...btnDecline, opacity: isActing ? 0.6 : 1 }}>
                    <FiX size={14} /> Decline
                  </button>
                </>
              )}
              {activeBooking.status === 'CONFIRMED' && (
                <button disabled={isActing} onClick={onDecline} style={{ ...btnDecline, opacity: isActing ? 0.6 : 1 }}>
                  <FiX size={14} /> Cancel booking
                </button>
              )}
            </div>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8 }}>Quick messages</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {HOST_MESSAGE_TEMPLATES.map((template) => (
                  <button key={template} onClick={() => onDraft(template)}
                    style={{ border: '1px solid #e5e7eb', background: 'white', borderRadius: 8, padding: 9, fontSize: 12, color: '#374151', textAlign: 'left', cursor: 'pointer', lineHeight: 1.4 }}>
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', padding: 14, background: 'white' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Write a professional message to your guest..."
              rows={2}
              style={{ ...inp, marginTop: 0, resize: 'none', lineHeight: 1.5, minHeight: 46 }}
            />
            <button
              onClick={onSend}
              disabled={!draft.trim()}
              style={{
                background: draft.trim() ? '#ff5722' : '#f3f4f6',
                color: draft.trim() ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: 10,
                width: 46,
                height: 46,
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
              title="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
          <p style={{ margin: '7px 0 0', fontSize: 11, color: '#9ca3af' }}>
            Messages are shared with the guest in this booking conversation.
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoLine({ Icon, text }: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#6b7280', marginBottom: 7 }}>
      <Icon size={13} color="#9ca3af" />
      <span style={{ overflowWrap: 'anywhere' }}>{text}</span>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  marginTop: 4,
  boxSizing: 'border-box',
};

const iconButton: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#6b7280',
};

const btnGhost: React.CSSProperties = {
  background: 'white',
  color: '#444',
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: '8px 14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
};

const btnAccept: React.CSSProperties = {
  background: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '9px 14px',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
};

const btnDecline: React.CSSProperties = {
  background: 'white',
  color: '#b91c1c',
  border: '1px solid #fca5a5',
  borderRadius: 8,
  padding: '9px 14px',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
};
