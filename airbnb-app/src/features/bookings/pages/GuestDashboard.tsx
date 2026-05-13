import { useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiCheckCircle, FiDollarSign, FiCalendar,
  FiSearch, FiMessageSquare, FiStar, FiCreditCard,
  FiSettings, FiGrid, FiMap,
} from 'react-icons/fi';
import { GuestLayout } from '../components/GuestLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyBookings } from '../hooks/useMyBookings';
import { Chatbox } from '../../../shared/components/Chatbox';

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING:   { background: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { background: '#dcfce7', color: '#166534' },
  CANCELLED: { background: '#fee2e2', color: '#991b1b' },
};

export default function GuestDashboard() {
  const { userId, userName, userEmail } = useAuth();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useMyBookings(userId);

  const displayName = userName || userEmail?.split('@')[0] || 'Guest';
  const confirmed   = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalSpent  = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((s, b) => s + Number(b.totalPrice ?? 0), 0);
  const upcoming    = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.checkIn) > new Date(),
  );
  const past        = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.checkOut) < new Date(),
  );

  return (
    <GuestLayout
      title={"Welcome back, " + displayName + "!"}
      subtitle="Here's what's happening with your trips"
    >
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ff5722 0%, #ff8a50 60%, #ffb347 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'white', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ zIndex: 1 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>
            Ready for your next adventure?
          </h2>
          <p style={{ margin: '0 0 16px', opacity: 0.9, fontSize: 14 }}>
            Discover amazing places and book your perfect stay.
          </p>
          <button
            onClick={() => navigate('/listings')}
            style={{ background: 'white', color: '#ff5722', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            Explore Listings
          </button>
        </div>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard Icon={FiCalendar} label="Upcoming Trips"  value={String(upcoming.length)} color="#3b82f6" bg="#eff6ff" />
        <StatCard Icon={FiCheckCircle} label="Confirmed"        value={String(confirmed)}       color="#16a34a" bg="#f0fdf4" />
        <StatCard Icon={FiDollarSign} label="Total Spent"      value={"$" + totalSpent.toFixed(0)} color="#8b5cf6" bg="#faf5ff" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Upcoming trips */}
        <div style={card}>
          <SectionHeader title="Upcoming Trips" action="View all" onAction={() => navigate('/bookings')} />
          {isLoading && <Spinner />}
          {!isLoading && upcoming.length === 0 && (
            <EmptyState Icon={FiMapPin} text="No upcoming trips" sub="Find your next destination" action="Browse Listings" onAction={() => navigate('/listings')} />
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            {upcoming.slice(0, 3).map((b) => <TripCard key={b.id} booking={b} />)}
          </div>
        </div>

        {/* Recent bookings */}
        <div style={card}>
          <SectionHeader title="Recent Bookings" action="View all" onAction={() => navigate('/bookings')} />
          {isLoading && <Spinner />}
          {!isLoading && bookings.length === 0 && (
            <EmptyState Icon={FiCalendar} text="No bookings yet" sub="Start exploring listings" />
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.listing?.title ?? 'Listing'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{String(b.checkIn ?? '').slice(0, 10)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, ...(STATUS_STYLE[b.status] ?? STATUS_STYLE.PENDING) }}>
                    {b.status}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ff5722' }}>${Number(b.totalPrice ?? 0).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={card}>
          <SectionHeader title="Quick Actions" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ActionBtn Icon={FiSearch} label="Browse Listings"   sub="Find your next stay"    onClick={() => navigate('/listings')} />
            <ActionBtn Icon={FiCalendar} label="My Trips"          sub="Manage reservations"    onClick={() => navigate('/bookings')} />
            <ActionBtn Icon={FiMessageSquare} label="Messages"          sub="Chat with hosts"        onClick={() => navigate('/guest/messages')} />
            <ActionBtn Icon={FiStar} label="My Reviews"        sub="Your feedback"          onClick={() => navigate('/guest/reviews')} />
            <ActionBtn Icon={FiCreditCard} label="Payment Methods"   sub="Manage cards"           onClick={() => navigate('/guest/payments')} />
            <ActionBtn Icon={FiSettings} label="Account Settings"  sub="Update profile"         onClick={() => navigate('/guest/settings')} />
            <ActionBtn Icon={FiGrid} label="Become a Host"     sub="List your property"     onClick={() => navigate('/become-a-host')} />
          </div>
        </div>

        {/* Past trips */}
        <div style={card}>
          <SectionHeader title="Past Trips" action={past.length + " total"} />
          {past.length === 0 && (
            <EmptyState Icon={FiMap} text="No past trips yet" sub="Your completed stays will appear here" />
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {past.slice(0, 4).map((b) => <TripCard key={b.id} booking={b} past />)}
          </div>
        </div>
      </div>
      <Chatbox />
    </GuestLayout>
  );
}

function StatCard({ Icon, label, value, color, bg }: { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{title}</h3>
      {action && <button onClick={onAction} style={{ background: 'none', border: 'none', color: '#ff5722', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}>{action} →</button>}
    </div>
  );
}

function EmptyState({ Icon, text, sub, action, onAction }: { Icon: React.ComponentType<{ size?: number; color?: string }>; text: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af' }}>
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
        <Icon size={40} color="#9ca3af" />
      </div>
      <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#374151' }}>{text}</p>
      {sub && <p style={{ margin: '0 0 12px', fontSize: 13 }}>{sub}</p>}
      {action && onAction && (
        <button onClick={onAction} style={{ background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          {action}
        </button>
      )}
    </div>
  );
}

function TripCard({ booking: b, past }: { booking: any; past?: boolean }) {
  const photo    = b.listing?.photos?.[0]?.url || ("https://picsum.photos/seed/" + b.id + "/200/130");
  const checkIn  = String(b.checkIn  ?? '').slice(0, 10);
  const checkOut = String(b.checkOut ?? '').slice(0, 10);
  const nights   = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
    : 1;
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', opacity: past ? 0.75 : 1 }}>
      <img src={photo} alt="" style={{ width: 72, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/seed/" + b.id + "/200/130"; }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {b.listing?.title ?? 'Listing'}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{checkIn} to {checkOut} · {nights} night{nights !== 1 ? 's' : ''}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ff5722' }}>${Number(b.totalPrice ?? 0).toFixed(0)}</div>
      </div>
    </div>
  );
}

function ActionBtn({ Icon, label, sub, onClick }: { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ background: '#f8f9fa', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 12px', cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff5722'; e.currentTarget.style.background = '#fff7f2'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#f8f9fa'; }}
    >
      <div style={{ marginBottom: 6 }}>
        <Icon size={24} color="#374151" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
    </button>
  );
}

const card: React.CSSProperties = {
  background: 'white', border: '1px solid #f0f0f0', borderRadius: 14,
  padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};
