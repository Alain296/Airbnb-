import {
  FiMessageSquare, FiStar, FiBell, FiCreditCard, FiSettings, FiMail,
  FiCheck, FiSend, FiCalendar, FiMapPin, FiHome, FiClock, FiSearch, FiPlus,
} from 'react-icons/fi';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GuestLayout } from '../components/GuestLayout';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyBookings } from '../hooks/useMyBookings';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { api } from '../../../lib/api';

interface Props {
  title: string;
  iconName: string;
  description: string;
}

/* ── Messages page ──────────────────────────────────────────────────── */
type GuestMessage = {
  id: string;
  bookingId: string;
  sender: 'guest' | 'host' | 'system';
  text: string;
  createdAt: string;
};

type ApiMessage = GuestMessage & {
  sender?: { id: string; role?: string };
};

const MESSAGE_TEMPLATES = [
  'Hi, I am looking forward to my stay. Could you please confirm the check-in instructions?',
  'Hello, I wanted to ask if early check-in is possible for my booking.',
  'Hi, could you please share parking or access details for the property?',
];

function MessagesContent() {
  const { userId } = useAuth();
  const { data: bookings = [], isLoading, isError, error, refetch } = useMyBookings(userId);
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'CANCELLED'),
    [bookings],
  );

  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageError, setMessageError] = useState('');

  useEffect(() => {
    if (!activeId && activeBookings.length > 0) {
      setActiveId(String(activeBookings[0].id));
    }
  }, [activeBookings, activeId]);

  const activeBooking = activeBookings.find((b) => String(b.id) === activeId) ?? activeBookings[0];
  const bookingMessages = messages.filter((m) => m.bookingId === String(activeBooking?.id));

  useEffect(() => {
    if (!activeBooking) return;
    setMessagesLoading(true);
    setMessageError('');
    api.get<{ messages: ApiMessage[] }>(`/bookings/${activeBooking.id}/messages`)
      .then((res) => {
        setMessages((res.messages ?? []).map((message) => ({
          id: message.id,
          bookingId: String(message.bookingId),
          sender: message.sender?.role === 'HOST' ? 'host' : 'guest',
          text: message.text,
          createdAt: message.createdAt,
        })));
      })
      .catch((err) => setMessageError((err as Error).message))
      .finally(() => setMessagesLoading(false));
  }, [activeBooking?.id]);

  const sendMessage = async () => {
    if (!activeBooking || !draft.trim()) return;

    const text = draft.trim();
    setDraft('');
    try {
      const res = await api.post<{ message: ApiMessage }>(`/bookings/${activeBooking.id}/messages`, { text });
      const next: GuestMessage = {
        id: res.message.id,
        bookingId: String(res.message.bookingId),
        sender: 'guest',
        text: res.message.text,
        createdAt: res.message.createdAt,
      };
      setMessages((prev) => [...prev, next]);
    } catch (err) {
      setDraft(text);
      setMessageError((err as Error).message);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: 280 }}><FiClock size={36} color="#d1d5db" /></div>;
  }

  if (isError) {
    return (
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: 18 }}>
        <p style={{ margin: '0 0 6px', color: '#991b1b', fontWeight: 800 }}>Unable to load your bookings</p>
        <p style={{ margin: '0 0 12px', color: '#991b1b', fontSize: 13 }}>{(error as Error).message}</p>
        <button onClick={() => refetch()} style={btnGhost}>Retry</button>
      </div>
    );
  }

  if (activeBookings.length === 0) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 380, textAlign: 'center' }}>
        <div>
          <FiMessageSquare size={56} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>No host conversations yet</h2>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280', maxWidth: 420 }}>
            Once you book a listing, your host conversation will appear here with the booking details attached.
          </p>
        </div>
      </div>
    );
  }

  const host = activeBooking?.listing?.host;
  const listing = activeBooking?.listing;
  const photo = listing?.photos?.[0]?.url || `https://picsum.photos/seed/msg-${activeBooking?.id}/360/220`;
  const checkIn = String(activeBooking?.checkIn ?? '').slice(0, 10);
  const checkOut = String(activeBooking?.checkOut ?? '').slice(0, 10);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px minmax(0, 1fr)',
      gap: 18,
      height: 'min(620px, calc(100vh - 174px))',
      minHeight: 520,
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
          {activeBookings.map((booking) => {
            const last = [...messages].reverse().find((m) => m.bookingId === String(booking.id));
            const selected = String(booking.id) === String(activeBooking?.id);
            return (
              <button
                key={booking.id}
                onClick={() => setActiveId(String(booking.id))}
                style={{
                  width: '100%', border: 'none', borderBottom: '1px solid #f3f4f6',
                  background: selected ? '#fff7f2' : 'white', padding: 14, cursor: 'pointer',
                  display: 'flex', gap: 12, textAlign: 'left', alignItems: 'center',
                }}
              >
                <img
                  src={booking.listing?.photos?.[0]?.url || `https://picsum.photos/seed/msg-list-${booking.id}/80/80`}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.listing?.host?.name ?? 'Host'}
                    </span>
                    <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>{booking.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {booking.listing?.title ?? 'Listing'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }}>
                    {last ? last.text : 'Start the conversation'}
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
              {host?.avatar
                ? <img src={host.avatar} alt={host.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#6b7280', fontWeight: 800 }}>{(host?.name ?? 'H').charAt(0)}</div>}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1a1a1a' }}>{host?.name ?? 'Host'}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Hosting {listing?.title ?? 'your booking'}
              </p>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '5px 10px', borderRadius: 999 }}>
            {activeBooking?.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', minHeight: 0 }}>
          <div style={{ padding: 18, overflowY: 'auto', background: '#f8f9fa' }}>
            {messagesLoading && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>Loading messages...</p>}
            {messageError && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#b91c1c' }}>{messageError}</p>}
            {!messagesLoading && bookingMessages.length === 0 && (
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
                  <FiMessageSquare size={16} color="#ff5722" /> Start with a clear message
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Ask your host about arrival time, key pickup, parking, WiFi, house rules, or anything you need before check-in.
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gap: 10 }}>
              {bookingMessages.map((message) => {
                const mine = message.sender === 'guest';
                return (
                  <div key={message.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '68%', borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: mine ? '#ff5722' : 'white', color: mine ? 'white' : '#1a1a1a',
                      padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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

          <aside style={{ borderLeft: '1px solid #f0f0f0', padding: 16, background: 'white' }}>
            <img src={photo} alt="" style={{ width: '100%', height: 120, borderRadius: 10, objectFit: 'cover', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{listing?.title ?? 'Listing'}</h3>
            <InfoLine Icon={FiMapPin} text={listing?.location ?? 'Location pending'} />
            <InfoLine Icon={FiCalendar} text={`${checkIn} to ${checkOut}`} />
            <InfoLine Icon={FiHome} text={`Booking #${String(activeBooking?.id ?? '').slice(0, 8).toUpperCase()}`} />
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8 }}>Quick messages</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {MESSAGE_TEMPLATES.map((template) => (
                  <button key={template} onClick={() => setDraft(template)}
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
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Write a professional message to your host..."
              rows={2}
              style={{ ...inp, marginTop: 0, resize: 'none', lineHeight: 1.5, minHeight: 46 }}
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim()}
              style={{
                background: draft.trim() ? '#ff5722' : '#f3f4f6', color: draft.trim() ? 'white' : '#9ca3af',
                border: 'none', borderRadius: 10, width: 46, height: 46, cursor: draft.trim() ? 'pointer' : 'not-allowed',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}
              title="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
          <p style={{ margin: '7px 0 0', fontSize: 11, color: '#9ca3af' }}>
            Messages are shared with your host in this booking conversation.
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
      <span>{text}</span>
    </div>
  );
}

/* ── Reviews page ───────────────────────────────────────────────────── */
function ReviewsContent() {
  const { userId } = useAuth();
  const { data: bookings = [], isLoading } = useMyBookings(userId);
  const completed = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.checkOut) < new Date());
  const pendingReview = completed.filter((b) => !(b.listing?.reviews?.length));
  const writtenReviews = completed.filter((b) => b.listing?.reviews?.length);

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div style={reviewHero}>
        <div>
          <p style={{ margin: '0 0 8px', color: '#df7442', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0 }}>
            Guest review studio
          </p>
          <h2 style={{ margin: '0 0 8px', fontSize: 30, lineHeight: 1.15, color: '#111827', fontWeight: 950 }}>
            Share the stay details future guests care about.
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14, lineHeight: 1.6, maxWidth: 620 }}>
            Completed stays appear here with a modern review form, rating categories, and a public comment other guests can read.
          </p>
        </div>
        <div style={reviewHeroMetric}>
          <FiStar size={22} color="#f59e0b" fill="#f59e0b" />
          <strong>{pendingReview.length}</strong>
          <span>ready to review</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 260 }}><FiClock size={34} color="#d1d5db" /></div>
      ) : completed.length === 0 ? (
        <div style={reviewEmptyState}>
          <FiStar size={58} strokeWidth={1.2} color="#d1d5db" />
          <h3 style={{ margin: '14px 0 6px', fontSize: 20, fontWeight: 900, color: '#111827' }}>No completed stays yet</h3>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>After checkout, your booked stays will be ready for review here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {pendingReview.map((booking) => <ReviewWriter key={booking.id} booking={booking} />)}

          {writtenReviews.length > 0 && (
            <div style={{ marginTop: pendingReview.length ? 10 : 0 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 900, color: '#111827' }}>Reviews you have written</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {writtenReviews.map((booking) => {
                  const review = booking.listing.reviews[0];
                  return (
                    <div key={booking.id} style={writtenReviewCard}>
                      <img src={booking.listing?.photos?.[0]?.url || `https://picsum.photos/seed/${booking.id}/120/90`} alt="" style={reviewThumb} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#111827' }}>{booking.listing?.title ?? 'Listing'}</strong>
                          <RatingDots rating={review.rating} size={14} />
                        </div>
                        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>{review.comment}</p>
                      </div>
                      <span style={{ ...statusPill, background: '#dcfce7', color: '#166534' }}>Published</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewWriter({ booking }: { booking: any }) {
  const listingId = String(booking.listing?.id ?? '');
  const submitReview = useSubmitReview(listingId);
  const [ratings, setRatings] = useState({
    overall: 5,
    cleanliness: 5,
    accuracy: 5,
    checkIn: 5,
    communication: 5,
    location: 5,
    value: 5,
  });
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = comment.trim().length >= 50 && !submitReview.isPending && !!listingId;

  const setRating = (key: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submitReview.mutateAsync({ ...ratings, comment: comment.trim() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={reviewSuccessCard}>
        <FiCheck size={24} color="#16a34a" />
        <div>
          <strong style={{ display: 'block', color: '#111827', marginBottom: 4 }}>Review published</strong>
          <span style={{ color: '#6b7280', fontSize: 13 }}>Thanks for reviewing {booking.listing?.title ?? 'this stay'}.</span>
        </div>
      </div>
    );
  }

  return (
    <article style={reviewWriteCard}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', gap: 18 }}>
        <div>
          <img src={booking.listing?.photos?.[0]?.url || `https://picsum.photos/seed/review-${booking.id}/360/260`} alt="" style={{ width: '100%', height: 138, borderRadius: 14, objectFit: 'cover' }} />
          <div style={{ marginTop: 12 }}>
            <h3 style={{ margin: '0 0 5px', fontSize: 16, fontWeight: 900, color: '#111827' }}>{booking.listing?.title ?? 'Listing'}</h3>
            <InfoLine Icon={FiMapPin} text={booking.listing?.location ?? 'Location pending'} />
            <InfoLine Icon={FiCalendar} text={`${String(booking.checkIn ?? '').slice(0, 10)} to ${String(booking.checkOut ?? '').slice(0, 10)}`} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 950, color: '#111827' }}>Write your review</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Rate the stay and write a public comment for future guests.</p>
            </div>
            <span style={statusPill}>Completed stay</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
            {Object.entries(ratings).map(([key, value]) => (
              <RatingControl key={key} label={ratingLabel(key)} value={value} onChange={(next) => setRating(key as keyof typeof ratings, next)} />
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What stood out? Mention cleanliness, check-in, host communication, location, and value..."
            rows={5}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.6, marginTop: 0 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ color: comment.trim().length >= 50 ? '#166534' : '#9ca3af', fontSize: 12, fontWeight: 700 }}>
              {Math.min(comment.trim().length, 50)}/50 characters minimum
            </span>
            <button onClick={handleSubmit} disabled={!canSubmit} style={{
              background: canSubmit ? '#df7442' : '#f3f4f6',
              color: canSubmit ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 900,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <FiSend size={15} /> {submitReview.isPending ? 'Publishing...' : 'Publish review'}
            </button>
          </div>
          {submitReview.isError && <p style={{ margin: '10px 0 0', color: '#b91c1c', fontSize: 13 }}>{(submitReview.error as Error).message}</p>}
        </div>
      </div>
    </article>
  );
}

function RatingControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div style={{ border: '1px solid #eef0f3', borderRadius: 12, padding: '10px 12px', background: '#fbfbfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <span style={{ color: '#374151', fontSize: 12, fontWeight: 900 }}>{label}</span>
        <RatingDots rating={value} onChange={onChange} size={16} />
      </div>
    </div>
  );
}

function RatingDots({ rating, onChange, size = 16 }: { rating: number; onChange?: (value: number) => void; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }, (_, index) => {
        const active = index < rating;
        const star = <FiStar size={size} color={active ? '#f59e0b' : '#d1d5db'} fill={active ? '#f59e0b' : 'transparent'} />;
        return onChange ? (
          <button key={index} type="button" onClick={() => onChange(index + 1)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            {star}
          </button>
        ) : <span key={index}>{star}</span>;
      })}
    </span>
  );
}

function ratingLabel(key: string) {
  const labels: Record<string, string> = {
    overall: 'Overall',
    cleanliness: 'Cleanliness',
    accuracy: 'Accuracy',
    checkIn: 'Check-in',
    communication: 'Communication',
    location: 'Location',
    value: 'Value',
  };
  return labels[key] ?? key;
}

/* ── Notifications page ─────────────────────────────────────────────── */
function NotificationsContent() {
  const { userId } = useAuth();
  const { data: bookings = [] } = useMyBookings(userId);

  const notifications = bookings.slice(0, 5).map((b) => ({
    id: b.id,
    title: b.status === 'CONFIRMED' ? 'Booking Confirmed' : b.status === 'CANCELLED' ? 'Booking Cancelled' : 'Booking Pending',
    message: `Your booking for ${b.listing?.title ?? 'a listing'} is ${b.status.toLowerCase()}.`,
    date: String(b.checkIn ?? '').slice(0, 10),
    read: b.status === 'CANCELLED',
  }));

  return (
    <div>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FiBell size={56} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#374151' }}>No notifications</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ background: n.read ? 'white' : '#fff7f2', border: `1px solid ${n.read ? '#e5e7eb' : '#ffd5c7'}`, borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.read ? '#f3f4f6' : '#fff7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiBell size={16} color={n.read ? '#9ca3af' : '#ff5722'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: '#1a1a1a', marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: '#6b7280' }}>{n.message}</div>
                <div style={{ fontSize: 11, lineHeight: 1.35, color: '#9ca3af', marginTop: 5 }}>{n.date}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5722', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Payment Methods page ───────────────────────────────────────────── */
function PaymentsContent() {
  const [showAdd, setShowAdd] = useState(false);
  const [methods, setMethods] = useState<Array<{ id: string; brand: string; last4: string; expiryMonth: number; expiryYear: number; holderName: string; isDefault: boolean }>>([]);
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const loadMethods = () => {
    api.get<{ data: typeof methods }>('/account/payment-methods')
      .then((res) => setMethods(res.data ?? []))
      .catch((err) => setPaymentError((err as Error).message));
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const saveCard = async () => {
    setPaymentError('');
    try {
      await api.post('/account/payment-methods', { holderName, cardNumber, expiry });
      setHolderName('');
      setCardNumber('');
      setExpiry('');
      setShowAdd(false);
      loadMethods();
    } catch (err) {
      setPaymentError((err as Error).message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Manage your saved payment methods.</p>
        <button onClick={() => setShowAdd(v => !v)}
          style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + Add Card
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Add Payment Method</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Cardholder Name</label>
              <input value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="John Smith" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Card Number</label>
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" inputMode="numeric" style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Expiry</label>
                <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>CVV</label>
                <input placeholder="123" style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveCard} style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCheck size={14} /> Save Card
              </button>
              <button onClick={() => setShowAdd(false)} style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentError && <p style={{ color: '#b91c1c', fontSize: 13 }}>{paymentError}</p>}

      {methods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <FiCreditCard size={48} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#374151' }}>No payment methods saved</p>
          <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Add a card to make booking faster.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {methods.map((method) => (
            <div key={method.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <FiCreditCard size={24} color="#ff5722" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#1a1a1a' }}>{method.brand} ending in {method.last4}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{method.holderName} · Expires {String(method.expiryMonth).padStart(2, '0')}/{String(method.expiryYear).slice(-2)}</div>
              </div>
              {method.isDefault && <span style={{ fontSize: 11, fontWeight: 800, color: '#166534', background: '#dcfce7', borderRadius: 999, padding: '4px 8px' }}>Default</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Account Settings page ──────────────────────────────────────────── */
function AccountSettingsContent() {
  const { userName, userEmail, userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name,  setName]  = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('');
  const [joined, setJoined] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    api.get<{ name: string; email: string; username: string; phone: string; bio?: string; avatar?: string; role?: string; createdAt?: string }>('/account/me')
      .then((user) => {
        setName(user.name ?? '');
        setEmail(user.email ?? '');
        setUsername(user.username ?? '');
        setPhone(user.phone ?? '');
        setBio(user.bio ?? '');
        setAvatar(user.avatar ?? '');
        setRole(user.role ?? '');
        setJoined(user.createdAt ?? '');
      })
      .catch((err) => setError((err as Error).message));
  }, [userId]);

  const handleSave = async () => {
    setError('');
    try {
      await api.put('/account/me', { name, username, phone, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setError('');
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const updatedUser = await api.upload<{ avatar?: string }>(`/users/${userId}/avatar`, formData);
      setAvatar(updatedUser.avatar ?? '');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Georgia, serif', fontSize: 34, lineHeight: 1.1, color: '#1a1a1a' }}>
            Profile
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: '#6b7280' }}>Manage your personal information.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ background: 'transparent', border: 'none', color: '#555', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>×</span> Cancel
          </button>
          <button onClick={handleSave}
            style={{ background: saved ? '#16a34a' : '#df7442', color: 'white', border: 'none', borderRadius: 6, padding: '9px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <FiCheck size={14} /> {saved ? 'Saved' : 'Save changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        <aside style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: '34px 22px', textAlign: 'center', minHeight: 340 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <div style={{ position: 'relative', width: 124, height: 124, margin: '0 auto 22px' }}>
          <div style={{ width: 124, height: 124, borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', border: '5px solid white', boxShadow: '0 18px 44px rgba(31, 41, 55, 0.14)' }}>
            {avatar
              ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 42, fontWeight: 900, color: '#df7442' }}>{(name || email || 'U').charAt(0).toUpperCase()}</div>}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            title="Upload profile picture"
            style={{
              position: 'absolute', right: 4, bottom: 6, width: 38, height: 38, borderRadius: '50%',
              border: '3px solid white', background: avatarUploading ? '#9ca3af' : '#df7442', color: 'white',
              display: 'grid', placeItems: 'center', cursor: avatarUploading ? 'wait' : 'pointer',
              boxShadow: '0 8px 18px rgba(223, 116, 66, 0.35)',
            }}
          >
            <FiPlus size={18} strokeWidth={3} />
          </button>
          </div>
          <h2 style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 900, color: '#1a1a1a' }}>{name || 'Your profile'}</h2>
          <p style={{ margin: '0 0 16px', color: '#9ca3af', fontSize: 14 }}>{email}</p>
          {role && <span style={{ display: 'inline-block', padding: '4px 13px', borderRadius: 999, background: '#fff1e8', color: '#c65d2e', fontSize: 12, fontWeight: 800 }}>{role.charAt(0) + role.slice(1).toLowerCase()}</span>}
          {joined && (
            <p style={{ margin: '22px 0 0', color: '#b5aaa4', fontSize: 13 }}>
              Joined {new Date(joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          )}
        </aside>

        <section style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'grid', gap: 18 }}>
          <div>
            <label style={profileLabel}>
              Full name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={inp} />
          </div>
          <div>
            <label style={profileLabel}>
              Username
            </label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" style={inp} />
          </div>
          <div>
            <label style={profileLabel}>
              Email address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1a1a1a', fontSize: 14, marginBottom: 4 }}>
              <FiMail size={15} color="#9ca3af" /> {email}
            </div>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>Email cannot be changed here.</p>
          </div>
          <div>
            <label style={profileLabel}>
              Phone
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" style={inp} />
          </div>
          <div>
            <label style={profileLabel}>
              Bio
            </label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell hosts a little about you" rows={5} style={{ ...inp, resize: 'vertical' }} />
          </div>
        </div>
        {error && <p style={{ margin: '12px 0 0', color: '#b91c1c', fontSize: 13 }}>{error}</p>}
        </section>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
  padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none',
};

const reviewHero: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 18,
  background: 'linear-gradient(135deg, #fff7f2 0%, #ffffff 58%, #f9fafb 100%)',
  border: '1px solid #f2d8cc',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
};

const reviewHeroMetric: React.CSSProperties = {
  minWidth: 150,
  background: 'white',
  border: '1px solid #f0e1da',
  borderRadius: 12,
  padding: 16,
  display: 'grid',
  gap: 4,
  boxShadow: '0 14px 34px rgba(31, 41, 55, 0.08)',
};

const reviewWriteCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 18,
  boxShadow: '0 16px 40px rgba(31, 41, 55, 0.06)',
};

const writtenReviewCard: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const reviewSuccessCard: React.CSSProperties = {
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: 16,
  padding: 18,
  display: 'flex',
  gap: 12,
  alignItems: 'center',
};

const reviewThumb: React.CSSProperties = {
  width: 82,
  height: 62,
  borderRadius: 10,
  objectFit: 'cover',
  flexShrink: 0,
};

const statusPill: React.CSSProperties = {
  fontSize: 11,
  background: '#fff1e8',
  color: '#c65d2e',
  padding: '5px 9px',
  borderRadius: 999,
  fontWeight: 900,
  whiteSpace: 'nowrap',
};

const reviewEmptyState: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  minHeight: 360,
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
};

const profileLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.4,
  marginBottom: 7,
  color: '#6f625d',
};

const btnGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};

/* ── Router ─────────────────────────────────────────────────────────── */
const PAGE_MAP: Record<string, { title: string; subtitle: string; Content: React.FC }> = {
  '/guest/messages':      { title: 'Messages',        subtitle: 'Chat with your hosts',              Content: MessagesContent },
  '/guest/reviews':       { title: 'My Reviews',      subtitle: 'Reviews you have written',          Content: ReviewsContent },
  '/guest/notifications': { title: 'Notifications',   subtitle: 'Your latest updates',               Content: NotificationsContent },
  '/guest/payments':      { title: 'Payment Methods', subtitle: 'Manage your payment cards',         Content: PaymentsContent },
  '/guest/settings':      { title: 'Account Settings',subtitle: 'Update your profile and preferences',Content: AccountSettingsContent },
};

export default function GuestStubPage({ title, iconName: _iconName, description }: Props) {
  // Find the matching page by title
  const entry = Object.values(PAGE_MAP).find((p) => p.title === title);

  if (entry) {
    const { Content } = entry;
    return (
      <GuestLayout title={entry.title} subtitle={entry.subtitle}>
        <Content />
      </GuestLayout>
    );
  }

  // Fallback
  return (
    <GuestLayout title={title} subtitle={description}>
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
        <FiSettings size={56} strokeWidth={1} style={{ marginBottom: 16 }} />
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#374151' }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 14 }}>{description}</p>
      </div>
    </GuestLayout>
  );
}
