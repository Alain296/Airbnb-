import { FiMessageSquare, FiStar, FiBell, FiCreditCard, FiSettings, FiUser, FiMail, FiPhone, FiCheck } from 'react-icons/fi';
import { useState } from 'react';
import { GuestLayout } from '../components/GuestLayout';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyBookings } from '../hooks/useMyBookings';

interface Props {
  title: string;
  iconName: string;
  description: string;
}

/* ── Messages page ──────────────────────────────────────────────────── */
function MessagesContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
      <FiMessageSquare size={56} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 16 }} />
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>Messages</h2>
      <p style={{ margin: '0 0 6px', fontSize: 15, color: '#6b7280', maxWidth: 400 }}>
        Chat with your hosts about your bookings.
      </p>
      <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
        Messaging will be available once you have an active booking.
      </p>
    </div>
  );
}

/* ── Reviews page ───────────────────────────────────────────────────── */
function ReviewsContent() {
  const { userId } = useAuth();
  const { data: bookings = [] } = useMyBookings(userId);
  const reviewed = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.checkOut) < new Date());

  return (
    <div>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>
        Reviews you can write are for completed stays.
      </p>
      {reviewed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FiStar size={56} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#374151' }}>No reviews yet</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>Complete a stay to write your first review.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {reviewed.map((b) => (
            <div key={b.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={b.listing?.photos?.[0]?.url || `https://picsum.photos/seed/${b.id}/80/60`} alt=""
                style={{ width: 72, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.listing?.title ?? 'Listing'}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{String(b.checkIn ?? '').slice(0, 10)} to {String(b.checkOut ?? '').slice(0, 10)}</div>
              </div>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>Completed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
        <div style={{ display: 'grid', gap: 10 }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ background: n.read ? 'white' : '#fff7f2', border: `1px solid ${n.read ? '#e5e7eb' : '#ffd5c7'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.read ? '#f3f4f6' : '#fff7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiBell size={16} color={n.read ? '#9ca3af' : '#ff5722'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{n.message}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{n.date}</div>
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
              <input placeholder="John Smith" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Card Number</label>
              <input placeholder="1234 5678 9012 3456" inputMode="numeric" style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Expiry</label>
                <input placeholder="MM/YY" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>CVV</label>
                <input placeholder="123" style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCheck size={14} /> Save Card
              </button>
              <button onClick={() => setShowAdd(false)} style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <FiCreditCard size={48} strokeWidth={1} color="#d1d5db" style={{ marginBottom: 12 }} />
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#374151' }}>No payment methods saved</p>
        <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Add a card to make booking faster.</p>
      </div>
    </div>
  );
}

/* ── Account Settings page ──────────────────────────────────────────── */
function AccountSettingsContent() {
  const { userName, userEmail } = useAuth();
  const [name,  setName]  = useState(userName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiUser size={18} color="#ff5722" /> Personal Information
        </h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              <FiUser size={13} /> Full Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={inp} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              <FiMail size={13} /> Email Address
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={inp} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              <FiPhone size={13} /> Phone Number
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" style={inp} />
          </div>
        </div>
        <button onClick={handleSave}
          style={{ marginTop: 16, background: saved ? '#16a34a' : '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}>
          {saved ? <><FiCheck size={14} /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiSettings size={18} color="#ff5722" /> Preferences
        </h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            'Email me about booking confirmations',
            'Email me about promotions and offers',
            'Send me booking reminders',
          ].map((pref) => (
            <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
              <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: '#ff5722' }} />
              {pref}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
  padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none',
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
