import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAdminStats } from '../hooks/useAdminStats';

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useAdminStats();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue'>('overview');

  return (
    <AdminLayout title="Admin Control Panel" subtitle={"Platform overview · " + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => refetch()} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          ↻ Refresh
        </button>
      </div>

        {/* ── Error state ─────────────────────────────────────────── */}
        {isError && (
          <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 4px', color: '#fca5a5', fontWeight: 700 }}>Failed to load statistics</p>
              <p style={{ margin: 0, color: '#f87171', fontSize: 13 }}>{(error as Error).message}</p>
            </div>
            <button onClick={() => refetch()} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Retry
            </button>
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'grid', placeItems: 'center', padding: '60px 0' }}>
            <Spinner />
            <p style={{ color: '#94a3b8', marginTop: 16 }}>Loading platform data…</p>
          </div>
        )}

        {data && (
          <>
            {/* ── KPI Cards ───────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <KpiCard
                icon="👥" label="Total Users"
                value={String(data.users.totalUsers ?? 0)}
                sub={`+${data.users.recentSignups ?? 0} this month`}
                color="#3b82f6" bg="#1e3a5f"
              />
              <KpiCard
                icon="🏠" label="Total Listings"
                value={String(data.listings.totalListings ?? 0)}
                sub={`Avg $${Number(data.listings.averagePrice ?? 0).toFixed(0)}/night`}
                color="#8b5cf6" bg="#2e1065"
              />
              <KpiCard
                icon="📅" label="Total Bookings"
                value={String(data.bookings.totalBookings ?? 0)}
                sub={`${data.bookings.bookingsThisMonth ?? 0} this month`}
                color="#f59e0b" bg="#451a03"
              />
              <KpiCard
                icon="💰" label="Total Revenue"
                value={`$${Number(data.bookings.revenue?.total ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                sub={`$${Number(data.bookings.revenue?.thisMonth ?? 0).toLocaleString()} this month`}
                color="#10b981" bg="#022c22"
              />
            </div>

            {/* ── Tabs ────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1e293b', borderRadius: 10, padding: 4, width: 'fit-content' }}>
              {(['overview', 'users', 'revenue'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#ff5722' : 'transparent',
                    color: activeTab === tab ? 'white' : '#94a3b8',
                    border: 'none', borderRadius: 8, padding: '8px 20px',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

                {/* Bookings by status */}
                <DarkCard title="📊 Bookings by Status">
                  {(data.bookings.byStatus ?? []).map((s: any) => {
                    const colors: Record<string, string> = { CONFIRMED: '#10b981', PENDING: '#f59e0b', CANCELLED: '#ef4444' };
                    const total = data.bookings.totalBookings || 1;
                    const pct = Math.round((s.count / total) * 100);
                    return (
                      <div key={s.status} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{s.status}</span>
                          <span style={{ fontSize: 13, color: colors[s.status] ?? '#94a3b8', fontWeight: 700 }}>{s.count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: colors[s.status] ?? '#94a3b8', borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </DarkCard>

                {/* Users by role */}
                <DarkCard title="👥 Users by Role">
                  {(data.users.byRole ?? []).map((r: any) => {
                    const colors: Record<string, string> = { ADMIN: '#f59e0b', HOST: '#3b82f6', GUEST: '#10b981' };
                    const total = data.users.totalUsers || 1;
                    const pct = Math.round((r.count / total) * 100);
                    return (
                      <div key={r.role} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{r.role}</span>
                          <span style={{ fontSize: 13, color: colors[r.role] ?? '#94a3b8', fontWeight: 700 }}>{r.count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: colors[r.role] ?? '#94a3b8', borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <MiniStat label="Active Hosts"   value={String(data.users.activeHosts ?? 0)}  color="#3b82f6" />
                    <MiniStat label="Active Guests"  value={String(data.users.activeGuests ?? 0)} color="#10b981" />
                  </div>
                </DarkCard>

                {/* Listings by type */}
                <DarkCard title="🏠 Listings by Type">
                  {(data.listings.byType ?? []).slice(0, 6).map((t: any) => {
                    const total = data.listings.totalListings || 1;
                    const pct = Math.round((t.count / total) * 100);
                    return (
                      <div key={t.type} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{t.type}</span>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>{t.count}</span>
                        </div>
                        <div style={{ height: 5, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#8b5cf6', borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #334155' }}>
                    <MiniStat label="Avg Price/Night" value={`$${Number(data.listings.averagePrice ?? 0).toFixed(0)}`} color="#8b5cf6" />
                  </div>
                </DarkCard>
              </div>
            )}

            {/* ── Users Tab ───────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <DarkCard title="🏆 Top Hosts by Listings">
                  {(data.users.topHosts ?? []).length === 0 && (
                    <p style={{ color: '#64748b', fontSize: 13 }}>No hosts yet.</p>
                  )}
                  {(data.users.topHosts ?? []).map((h: any, i: number) => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7c2f', width: 24 }}>
                        {i + 1}
                      </span>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#334155', overflow: 'hidden', flexShrink: 0 }}>
                        {h.avatar
                          ? <img src={h.avatar} alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#94a3b8' }}>{h.name?.charAt(0)}</div>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{h.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{h._count?.listings ?? 0} listings</div>
                      </div>
                      <span style={{ fontSize: 12, background: '#1e3a5f', color: '#60a5fa', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
                        HOST
                      </span>
                    </div>
                  ))}
                </DarkCard>

                <DarkCard title="📈 Monthly User Growth">
                  {(data.users.monthlyGrowth ?? []).slice(-6).map((m: any) => (
                    <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#64748b', width: 60, flexShrink: 0 }}>{m.month}</span>
                      <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (m.newUsers / Math.max(...(data.users.monthlyGrowth ?? []).map((x: any) => x.newUsers), 1)) * 100)}%`,
                          height: '100%', background: '#3b82f6', borderRadius: 4,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#94a3b8', width: 24, textAlign: 'right' }}>{m.newUsers}</span>
                    </div>
                  ))}
                </DarkCard>
              </div>
            )}

            {/* ── Revenue Tab ─────────────────────────────────────── */}
            {activeTab === 'revenue' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <DarkCard title="💰 Revenue Summary">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <MiniStatLarge label="Total Revenue"   value={`$${Number(data.bookings.revenue?.total ?? 0).toLocaleString()}`}    color="#10b981" />
                    <MiniStatLarge label="This Month"      value={`$${Number(data.bookings.revenue?.thisMonth ?? 0).toLocaleString()}`} color="#3b82f6" />
                    <MiniStatLarge label="Avg per Booking" value={`$${Number(data.bookings.revenue?.average ?? 0).toFixed(0)}`}         color="#f59e0b" />
                    <MiniStatLarge label="Bookings/Month"  value={String(data.bookings.bookingsThisMonth ?? 0)}                         color="#8b5cf6" />
                  </div>
                </DarkCard>

                <DarkCard title="📊 Monthly Revenue Trend">
                  {(data.bookings.monthlyTrends ?? []).slice(-6).map((m: any) => {
                    const maxRev = Math.max(...(data.bookings.monthlyTrends ?? []).map((x: any) => x.revenue), 1);
                    return (
                      <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: '#64748b', width: 60, flexShrink: 0 }}>{m.month}</span>
                        <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${(m.revenue / maxRev) * 100}%`, height: '100%', background: '#10b981', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8', width: 60, textAlign: 'right' }}>${Number(m.revenue).toFixed(0)}</span>
                      </div>
                    );
                  })}
                </DarkCard>
              </div>
            )}

            {/* ── Management Tools ────────────────────────────────── */}
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Management Tools
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <ToolCard
                icon="👥" title="User Management"
                desc="View, edit roles, suspend or delete accounts"
                badge={`${data.users.totalUsers ?? 0} users`}
                badgeColor="#3b82f6"
                onClick={() => navigate('/admin/users')}
              />
              <ToolCard
                icon="🏠" title="Listing Management"
                desc="Publish, unpublish or remove listings"
                badge={`${data.listings.totalListings ?? 0} listings`}
                badgeColor="#8b5cf6"
                onClick={() => navigate('/admin/listings')}
              />
              <ToolCard
                icon="📅" title="All Bookings"
                desc="View, confirm or cancel reservations"
                badge={`${data.bookings.totalBookings ?? 0} bookings`}
                badgeColor="#f59e0b"
                onClick={() => navigate('/admin/bookings')}
              />
              <ToolCard
                icon="🛡️" title="Moderation Queue"
                desc="Review and approve pending content"
                badge="Review"
                badgeColor="#ef4444"
                onClick={() => navigate('/admin/moderation')}
              />
            </div>
          </>
        )}
    </AdminLayout>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function KpiCard({ icon, label, value, sub, color, bg }: {
  icon: string; label: string; value: string; sub: string; color: string; bg: string;
}) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', fontSize: 22 }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>
    </div>
  );
}

function DarkCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: '20px 22px' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
      {children}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function MiniStatLarge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function ToolCard({ icon, title, desc, badge, badgeColor, onClick }: {
  icon: string; title: string; desc: string; badge: string; badgeColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 14,
        padding: '20px 18px', cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s', width: '100%',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff5722'; e.currentTarget.style.background = '#1a2535'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>{desc}</div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `${badgeColor}22`, color: badgeColor }}>
        {badge}
      </span>
    </button>
  );
}
