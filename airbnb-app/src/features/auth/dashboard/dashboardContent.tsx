/**
 * Dashboard inner pages modeled after ListOn template screenshots (theme preview).
 */
import type { CSSProperties } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { Listing } from '../../listings/types';
import type { State, Action } from '../../../store/types';
import type { Dispatch } from 'react';
import {
  FiTrash2, FiPhone, FiCompass, FiStar, FiCheck, FiTrendingUp, FiTrendingDown,
  FiShoppingCart, FiFolder, FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiPhoneCall, FiVideo,
} from 'react-icons/fi';

const accent = '#fe4c51';
const border = '#eaeaea';
const card: CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  border: `1px solid ${border}`,
  padding: '20px 22px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
};
const accentBarTitle: CSSProperties = {
  borderLeft: `4px solid ${accent}`,
  paddingLeft: 14,
  margin: '0 0 18px',
  fontSize: 18,
  fontWeight: 700,
  color: '#1f1f1f',
};
const inp: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: `1px solid ${border}`,
  fontSize: 14,
  background: '#fafafa',
};
const lbl: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#333',
  marginBottom: 8,
};
const rq = (
  <>
    {' '}
    <span style={{ color: accent }}>*</span>
  </>
);

type Props = {
  primary: string;
  segments: string[];
  state: State;
  userEmail: string;
  displayName: string;
  savedListings: Listing[];
  navigate: NavigateFunction;
  dispatch: Dispatch<Action>;
};

export function DashboardContent({
  primary,
  segments,
  state,
  userEmail,
  displayName,
  savedListings,
  navigate,
  dispatch,
}: Props) {
  const subMulti = segments[1] ?? '';

  if (primary === 'multi-level' || primary === 'multi') {
    return (
      <div style={{ ...card, maxWidth: 720 }}>
        <h3 style={accentBarTitle}>Multi Level Menu</h3>
        <p style={{ color: '#666', marginTop: 0 }}>Nested section: {subMulti || '(choose an item)'}</p>
        <button type="button" onClick={() => navigate('/dashboard/multi-level/second')} style={{ marginRight: 8, padding: '8px 14px', borderRadius: 8, border: `1px solid ${accent}`, background: '#fff', color: accent }}>
          Level 2
        </button>
        <button type="button" onClick={() => navigate('/dashboard/multi-level/third')} style={{ padding: '8px 14px', borderRadius: 8, background: accent, color: '#fff', border: 'none' }}>
          Level 3
        </button>
      </div>
    );
  }

  if (primary === 'dashboard' || primary === '') {
    return <DashboardOverview savedCount={state.saved.length} />;
  }

  if (primary === 'add-listing') {
    return (
      <>
        <div style={{ ...card }}>
          <h3 style={accentBarTitle}>Basic informations</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Listing title{rq}</label>
            <input style={inp} placeholder="Enter listing title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Category{rq}</label>
              <select style={{ ...inp, cursor: 'pointer' }}>
                <option>Select category</option>
                <option>Apartments</option>
                <option>Eat &amp; Drink</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Tags{rq}</label>
              <input style={inp} placeholder="+ Add tag" />
            </div>
          </div>
        </div>
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={accentBarTitle}>Location</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
            <div>
              <label style={lbl}>City{rq}</label>
              <select style={{ ...inp, cursor: 'pointer' }}>
                <option>Select City</option>
                <option>New York</option>
              </select>
            </div>
            <div>
              <label style={lbl}>State{rq}</label>
              <input style={inp} placeholder="State" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Address{rq}</label>
              <input style={inp} placeholder="8706 Herrick Ave, Valley..." />
            </div>
            <div>
              <label style={lbl}>Zip-Code{rq}</label>
              <input style={inp} placeholder="3870" />
            </div>
          </div>
        </div>
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={accentBarTitle}>Gallery{rq}</h3>
          <div
            style={{
              border: `2px dashed ${border}`,
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              color: '#888',
              background: '#fdfdfd',
            }}
          >
            <p style={{ margin: 0 }}>Recommended 350 × 350 px — png, jpg, jpeg</p>
          </div>
        </div>
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={accentBarTitle}>Details</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Description{rq}</label>
            <textarea style={{ ...inp, minHeight: 120, resize: 'vertical' }} placeholder="Please enter up to 4000 characters." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
            <div>
              <label style={lbl}>Phone{rq}</label>
              <input style={inp} placeholder="(123) 456 - 789" />
            </div>
            <div>
              <label style={lbl}>Company website{rq}</label>
              <input style={inp} placeholder="https://company.com" />
            </div>
            <div>
              <label style={lbl}>Email Address{rq}</label>
              <input style={inp} placeholder="example@email.com" defaultValue={userEmail || ''} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map(s => (
              <div key={s}>
                <label style={lbl}>{s} Page (optional)</label>
                <input style={inp} placeholder={`https://${s.toLowerCase()}.com`} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={accentBarTitle}>Property amenities (optional)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {['Garden', 'Security cameras', 'Laundry', 'Internet', 'Pool', 'Jacuzzi'].map(a => (
              <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#444' }}>
                <input type="checkbox" /> {a}
              </label>
            ))}
          </div>
        </div>
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={accentBarTitle}>Schedule &amp; pricing</h3>
          <fieldset style={{ border: `1px solid ${border}`, borderRadius: 10, padding: 16 }}>
            <legend style={{ padding: '0 8px', fontWeight: 600, fontSize: 14 }}>Add schedule plan (optional)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
              <input type="date" style={inp} />
              <input type="time" style={inp} />
              <input style={inp} placeholder="Place" />
              <input style={inp} placeholder="8706 Herrick Ave, Valley..." />
            </div>
            <button type="button" style={{ marginTop: 12, background: `${accent}15`, color: accent, border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600 }}>
              + Add another schedule item
            </button>
          </fieldset>
          <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#666', borderBottom: `1px solid ${border}` }}>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>TITLE</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>DESCRIPTION</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>PRICE</th>
                <th style={{ padding: '8px 6px' }} aria-label="del" />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px 6px' }}><input placeholder="Basic" style={inp} /></td>
                <td style={{ padding: '10px 6px' }}><input placeholder="Description" style={inp} /></td>
                <td style={{ padding: '10px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>USD</span>
                  <input placeholder="99" style={{ ...inp, maxWidth: 100 }} />
                </td>
                <td style={{ padding: '10px 6px' }}><FiTrash2 color={accent} /></td>
              </tr>
            </tbody>
          </table>
          <button type="button" style={{ marginTop: 12, background: `${accent}12`, color: accent, border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>
            + Add New
          </button>
        </div>
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" style={{ background: accent, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            Publish Listing
          </button>
        </div>
      </>
    );
  }

  if (primary === 'wallet') {
    return <WalletSection />;
  }

  if (primary === 'message') {
    return <MessagesSection displayName={displayName} />;
  }

  if (primary === 'my-listings') {
    const pendingTab = segments[0] === 'pending';
    return (
      <div style={card}>
        {pendingTab && (
          <p style={{ margin: '0 0 14px', padding: '10px 14px', background: `${accent}12`, borderRadius: 8, color: '#555', fontSize: 13 }}>
            Showing <strong>pending</strong> filter (demo — all rows shown).
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ ...accentBarTitle, margin: 0 }}>My listings</h3>
          <button type="button" onClick={() => navigate('/dashboard/add-listing')} style={{ background: accent, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700 }}>
            + Add listing
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${border}`, color: '#666', textAlign: 'left' }}>
              <th style={{ padding: 10 }}>Title</th>
              <th style={{ padding: 10 }}>Location</th>
              <th style={{ padding: 10 }}>Price</th>
              <th style={{ padding: 10 }}>Rating</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.listings.slice(0, 15).map(l => (
              <tr key={l.id} style={{ borderBottom: `1px solid ${border}` }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{l.title}</td>
                <td style={{ padding: 12, color: '#666' }}>{l.location}</td>
                <td style={{ padding: 12 }}>${l.price}</td>
                <td style={{ padding: 12 }}>{l.rating}</td>
                <td style={{ padding: 12 }}>
                  <button type="button" style={{ marginRight: 8, padding: '6px 12px', borderRadius: 6, border: `1px solid ${accent}`, background: '#fff', color: accent }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (primary === 'reviews') {
    return <ReviewsSection />;
  }

  if (primary === 'bookings') {
    return <BookingsSection />;
  }

  if (primary === 'bookmark') {
    return <BookmarkSection state={state} savedListings={savedListings} dispatch={dispatch} navigate={navigate} />;
  }

  if (primary === 'edit-profile') {
    return (
      <div style={card}>
        <h3 style={accentBarTitle}>Edit profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={lbl}>Full name</label><input style={inp} placeholder="Full name" defaultValue={displayName} /></div>
          <div><label style={lbl}>Email</label><input style={inp} type="email" defaultValue={userEmail} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Bio</label><textarea style={{ ...inp, minHeight: 100 }} /></div>
        </div>
      </div>
    );
  }

  if (primary === 'setting') {
    return (
      <div style={card}>
        <h3 style={accentBarTitle}>Settings</h3>
        <p style={{ marginTop: 0, color: '#666' }}>Notifications, privacy, password change — mirrored from template dashboard.</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <input type="checkbox" /> Email alerts for new bookings
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <input type="checkbox" /> Marketing updates
        </label>
      </div>
    );
  }

  if (primary === 'support') {
    return (
      <div style={card}>
        <h3 style={accentBarTitle}>Support</h3>
        <p>Open a ticket or browse help center — modeled after template support area.</p>
        <textarea style={{ ...inp, minHeight: 120, marginTop: 12 }} placeholder="Describe your issue..." />
        <button type="button" style={{ marginTop: 12, background: accent, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 700 }}>Submit</button>
      </div>
    );
  }

  return <DashboardOverview savedCount={state.saved.length} />;
}

function DashboardOverview({ savedCount }: { savedCount: number }) {
  return (
    <>
      <div
        style={{
          ...card,
          border: 'none',
          overflow: 'hidden',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          background: 'linear-gradient(135deg,#ff7136 0%,#ffc24a 55%,#ffb347 100%)',
          alignItems: 'center',
          minHeight: 160,
          position: 'relative',
        }}
      >
        <div style={{ padding: '26px 32px', color: '#fff', zIndex: 1 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Adobe Creative Cloud</p>
          <p style={{ margin: '8px 0 16px', opacity: 0.95, maxWidth: 420, fontSize: 14 }}>
            Try the ultimate creative toolkit — banners and hero blocks match template dashboard style.
          </p>
          <button type="button" style={{ background: '#fff', color: '#ff5733', border: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 800 }}>
            Start free trial
          </button>
        </div>
        <div style={{ width: 200, height: 140, marginRight: 24, borderRadius: 12, background: 'rgba(255,255,255,0.2)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginTop: 18 }}>
        {[
          { t: 'Times Bookmarked', v: `${savedCount || '2'}:45` },
          { t: 'Progress', v: '70%' },
          { t: 'Revenue', v: '$100' },
          { t: 'Time Spent', v: '2:45' },
        ].map(x => (
          <div key={x.t} style={card}>
            <p style={{ margin: 0, fontSize: 12, color: '#898989' }}>{x.t}</p>
            <p style={{ margin: '8px 0 0', fontSize: 26, fontWeight: 800, color: '#222' }}>{x.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginTop: 16 }}>
        {[
          { t: 'Total Income', v: '$5,899 (USD)', up: true, sub: '20.9% +18.4k this week' },
          { t: 'Visitors', v: '780,192', up: true, sub: '20% +3.5k this week' },
          { t: 'Total Orders', v: '796,542', up: false, sub: '9.01% decrease compared to last week' },
        ].map(x => (
          <div key={x.t} style={card}>
            <p style={{ margin: 0, fontSize: 12, color: '#898989' }}>{x.t}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#222' }}>{x.v}</p>
              {x.up ? <FiTrendingUp color="#22c55e" size={22} /> : <FiTrendingDown color={accent} size={22} />}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: x.up ? '#22c55e' : accent }}>{x.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ ...card, marginTop: 16 }}>
        <h4 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#232323' }}>Statistics</h4>
        <div
          style={{
            height: 240,
            borderRadius: 10,
            background: `linear-gradient(180deg, ${accent}22 0%, transparent 72%)`,
            border: `1px solid ${border}`,
            position: 'relative',
          }}
        >
          <svg width="100%" height="240" preserveAspectRatio="none" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="areaG" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={accent} stopOpacity={0.45} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path fill="url(#areaG)" d="M0,200 C140,140 260,220 400,120 S640,80 960,140 L960,240 L0,240 Z" />
            <path fill="none" stroke={accent} strokeWidth={2} d="M0,200 C140,140 260,220 400,120 S640,80 960,140" />
          </svg>
        </div>
      </div>
      <RecentBookingTable />
    </>
  );
}

function RecentBookingTable() {
  const rows = [
    { name: 'Ethan Blackwood', date: '25 Oct 2023', pay: 'Paypal', status: 'Approved' },
    { name: 'Alexander Kaminski', date: '24 Oct 2023', pay: 'Payoneer', status: 'Pending' },
    { name: 'Pranoti Deshpande', date: '22 Oct 2023', pay: 'Swift', status: 'Canceled' },
  ];
  return (
    <div style={{ ...card, marginTop: 16 }}>
      <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Recent booking</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: '#666' }}>
        <span>Show 10 entries</span>
        <span>Search</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${border}`, textAlign: 'left', color: '#666' }}>
              <th style={{ padding: 10 }}>SL</th>
              <th style={{ padding: 10 }}>Logo</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Booking date</th>
              <th style={{ padding: 10 }}>Payment</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>View</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: `1px solid ${border}` }}>
                <td style={{ padding: 12 }}>{i + 1}</td>
                <td style={{ padding: 12 }}><div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee' }} /></td>
                <td style={{ padding: 12, fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: 12 }}>{r.date}</td>
                <td style={{ padding: 12 }}>{r.pay}</td>
                <td style={{ padding: 12 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 600,
                      color: r.status === 'Approved' ? '#16a34a' : r.status === 'Pending' ? '#f59e0b' : accent,
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <button type="button" style={{ background: accent, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 700 }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 12, color: '#888' }}>Showing 1 to 3 of 3 entries</p>
    </div>
  );
}

function WalletSection() {
  const cardSm: CSSProperties = { ...card, position: 'relative', overflow: 'hidden' };
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}>
        {[
          'Withdrawable balance',
          'Total earning',
          'Listing pending order',
          'Listing total order',
        ].map((t, i) => (
          <div key={t} style={cardSm}>
            <div style={{ position: 'absolute', right: -20, top: 20, width: 120, height: 120, borderRadius: '50%', background: `${accent}12` }} />
            <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{t}</p>
            <p style={{ margin: '10px 0 0', fontSize: 22, fontWeight: 800 }}>{i === 3 ? '659' : '$5,899 (USD)'}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
        <div style={card}>
          <h4 style={{ margin: '0 0 14px', fontWeight: 700 }}>Listings earning</h4>
          {['Green Mart Apartment', 'Chuijhal Hotel And Restaurant', "The Barber's Lounge"].map(n => (
            <div key={n} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${border}` }}>
              <FiShoppingCart color={accent} size={20} />
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{n}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>Price $99.00 · Fee $21.39 · Net $95.59 · #A7F455 · 05 Aug 2023</p>
              </div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h4 style={{ margin: '0 0 14px', fontWeight: 700 }}>Payout history</h4>
          {[
            { a: '$95.59', s: 'Unpaid / Period: $21.39' },
            { a: '$278.59', s: 'Paid / Period: $21.39' },
          ].map(p => (
            <div key={p.a} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${border}` }}>
              <FiFolder color={accent} size={20} />
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{p.a}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>{p.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MessagesSection({ displayName }: { displayName: string }) {
  const chats = [
    { name: 'Alexander Kaminski', msg: 'Hey, is the place still available?', time: '12:14', online: true },
    { name: 'Edwin Martins', msg: 'Thanks for the quick reply.', time: 'Yesterday', online: false },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 260px', gap: 0, background: '#fff', borderRadius: 12, border: `1px solid ${border}`, overflow: 'hidden', minHeight: 520 }}>
      <div style={{ borderRight: `1px solid ${border}`, padding: 16 }}>
        <input style={{ ...inp, marginBottom: 12 }} placeholder="People, groups and messages" />
        <div style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 12 }}>
          <span style={{ color: accent }}>Chats</span>
          <span>Online</span>
          <span>Contacts</span>
        </div>
        <p style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>RECENT CHAT</p>
        {chats.map(c => (
          <div key={c.name} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${border}` }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e5e5e5' }} />
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: c.online ? '#22c55e' : '#ccc', border: '2px solid #fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{c.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.msg}</p>
            </div>
            <span style={{ fontSize: 11, color: '#aaa' }}>{c.time}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 800 }}>Alexander Kaminski</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>Last seen 12h ago</p>
          </div>
          <div style={{ display: 'flex', gap: 14, color: '#888' }}>
            <FiPhoneCall />
            <FiVideo />
            <FiMoreVertical />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', padding: 24 }}>
          <p style={{ textAlign: 'center', maxWidth: 280 }}>This chat is empty. Be the first one to start it.</p>
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${border}`, display: 'flex', gap: 10, alignItems: 'center', background: '#fff' }}>
          <FiSmile />
          <FiPaperclip />
          <input style={{ ...inp, flex: 1 }} placeholder="Type a message here..." />
          <FiSend color={accent} size={22} />
        </div>
      </div>
      <div style={{ borderLeft: `1px solid ${border}`, padding: 16, fontSize: 13 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8e8e8', margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontWeight: 800 }}>Alexander Kaminski</p>
        </div>
        <p style={{ fontWeight: 700, margin: '16px 0 8px' }}>Auto bot / Manual</p>
        <p style={{ color: '#888' }}>User details, edit name, colors — template-style panel for {displayName}.</p>
      </div>
    </div>
  );
}

function ReviewsSection() {
  const bars = [
    { n: 5, w: 85, c: accent },
    { n: 4, w: 65, c: '#22c55e' },
    { n: 3, w: 40, c: '#f59e0b' },
    { n: 2, w: 25, c: '#3b82f6' },
    { n: 1, w: 15, c: '#991b1b' },
  ];
  return (
    <div style={card}>
      <h3 style={accentBarTitle}>Visitor reviews</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, marginBottom: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, margin: '0 auto', borderRadius: 12, border: `3px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: accent }}>
            4.3
          </div>
          <p style={{ fontSize: 13, color: '#666', marginTop: 12 }}>2,525 Ratings &amp; 293 Reviews</p>
        </div>
        <div>
          {bars.map(b => (
            <div key={b.n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ width: 18, fontWeight: 700 }}>{b.n}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#f0f0f0', overflow: 'hidden' }}>
                <div style={{ width: `${b.w}%`, height: '100%', background: b.c }} />
              </div>
              <span style={{ fontSize: 13, color: '#666', width: 36 }}>{(b.w / 10).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
      {['Ethan Blackwood', 'Gabriel North'].map(name => (
        <div key={name} style={{ borderTop: `1px solid ${border}`, paddingTop: 22, marginTop: 18 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontWeight: 800 }}>{name}</p>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>3.5/5</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>25 Oct 2023 at 12:27 pm</p>
              <p style={{ color: '#555', lineHeight: 1.6, fontSize: 14 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Template-style review body text for directory listings.
              </p>
              <button type="button" style={{ marginTop: 10, background: `${accent}12`, color: accent, border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 700 }}>
                Helpful review · 16
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingsSection() {
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <h3 style={{ ...accentBarTitle, margin: 0 }}>Booking requests</h3>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: 14 }}>Manage incoming reservations for your listings.</p>
        </div>
        <button type="button" style={{ background: accent, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 8, fontWeight: 800 }}>
          + Create new collection
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
        <span>Show 10 entries</span>
        <span>Search:</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${border}`, textAlign: 'left', color: '#666' }}>
            {['SL', 'Logo', 'Customer', 'Booking date', 'Persons', 'Price', 'Client', 'Status', 'Action'].map(h => (
              <th key={h} style={{ padding: 10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { c: 'Chuijhal Hotel And Restaurant', st: 'Approved' },
            { c: 'Green Mart Apartment', st: 'Pending' },
            { c: 'The Barber\'s Lounge', st: 'Canceled' },
          ].map((r, i) => (
            <tr key={r.c} style={{ borderBottom: `1px solid ${border}` }}>
              <td style={{ padding: 12 }}>{i + 1}</td>
              <td style={{ padding: 12 }}><div style={{ width: 40, height: 40, borderRadius: 8, background: '#eee' }} /></td>
              <td style={{ padding: 12, fontWeight: 700 }}>{r.c}</td>
              <td style={{ padding: 12 }}>20.08.2018 - 24.08.2018</td>
              <td style={{ padding: 12 }}>2 Adults</td>
              <td style={{ padding: 12 }}>$147</td>
              <td style={{ padding: 12, fontSize: 12, color: '#666' }}>client@mail.com · +1 234 567</td>
              <td style={{ padding: 12 }}>
                <span style={{ fontWeight: 700, color: r.st === 'Approved' ? '#16a34a' : r.st === 'Pending' ? '#f59e0b' : accent }}>{r.st}</span>
              </td>
              <td style={{ padding: 12 }}>
                <button type="button" style={{ background: accent, color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, marginRight: 6 }}>Approve</button>
                <FiTrash2 color={accent} style={{ verticalAlign: 'middle', cursor: 'pointer' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 12, fontSize: 12, color: '#888' }}>Showing 1 to 3 of 3 entries</p>
    </div>
  );
}

function BookmarkSection({
  state,
  savedListings,
  dispatch,
  navigate,
}: {
  state: State;
  savedListings: Listing[];
  dispatch: Dispatch<Action>;
  navigate: NavigateFunction;
}) {
  const fallbackDemo = savedListings.length === 0;
  const show = fallbackDemo ? state.listings.slice(0, 4) : savedListings;

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h3 style={{ ...accentBarTitle, margin: 0 }}>Bookmarked listings</h3>
          <p style={{ margin: '6px 0 0', color: '#666', fontSize: 14 }}>Discover exciting categories. Find what you&apos;re looking for.</p>
          {fallbackDemo && (
            <p style={{ margin: '10px 0 0', color: '#aaa', fontSize: 13 }}>Sample cards — open Listings and use the heart to save your own.</p>
          )}
        </div>
        <button type="button" style={{ background: 'none', border: 'none', color: accent, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/listings')}>
          See all →
        </button>
      </div>
      {show.length === 0 ? (
        <p style={{ color: '#888', padding: '24px 0' }}>No bookmarks yet — save listings from the listings page with the heart icon.</p>
      ) : (
        show.map(l => (
          <div key={l.id} style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: `1px solid ${border}`, position: 'relative' }}>
            <button
              type="button"
              aria-label={fallbackDemo ? 'Go to listings' : 'Remove bookmark'}
              onClick={() => {
                if (fallbackDemo) navigate('/listings');
                else dispatch({ type: 'TOGGLE_FAVORITE', payload: l.id });
              }}
              style={{ position: 'absolute', right: 0, top: 18, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FiTrash2 color={accent} />
            </button>
            <img src={l.img} alt="" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10 }} />
            <div style={{ flex: 1, paddingRight: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiStar color={accent} size={14} />
                <span style={{ fontWeight: 700 }}>{l.rating}</span>
                <span style={{ color: '#888', fontSize: 13 }}>2,391 reviews</span>
              </div>
              <p style={{ margin: '6px 0', fontWeight: 800, fontSize: 17 }}>{l.title} <FiCheck color="#22c55e" style={{ verticalAlign: 'middle' }} /></p>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{l.location}</p>
              <div style={{ marginTop: 10, display: 'flex', gap: 20, fontSize: 14 }}>
                <span style={{ color: accent, display: 'flex', alignItems: 'center', gap: 6 }}><FiPhone size={14} /> (123) 456-7890</span>
                <span style={{ color: accent, display: 'flex', alignItems: 'center', gap: 6 }}><FiCompass size={14} /> Directions</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
