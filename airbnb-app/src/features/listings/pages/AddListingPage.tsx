import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiMapPin, FiUser, FiImage, FiInfo, FiClock,
  FiCreditCard, FiCalendar, FiCoffee,
} from 'react-icons/fi';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';

/* ── reusable field label ── */
function Label({ text, required, optional }: { text: string; required?: boolean; optional?: boolean }) {
  return (
    <label style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, display: 'block' }}>
      {text}
      {required && <span style={{ color: '#ff5722', marginLeft: 3 }}>*</span>}
      {optional && <span style={{ color: '#999', fontWeight: 400, marginLeft: 6, fontSize: 13 }}>(optional)</span>}
    </label>
  );
}

/* ── reusable text input ── */
function Field({ placeholder = '', type = 'text', value, onChange }: {
  placeholder?: string; type?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '13px 16px',
        border: '1.5px solid #e2e8f0', borderRadius: 8,
        fontSize: 14, outline: 'none', boxSizing: 'border-box',
        color: '#1a1a1a', background: 'white',
      }}
      onFocus={e => (e.target.style.borderColor = '#ff5722')}
      onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
    />
  );
}

/* ── section header card ── */
function SectionHeader({ num, icon, title }: {
  num: string; icon: React.ReactNode; title: string; desc?: string;
}) {
  return (
    <div style={{
      background: '#f8f6f2', borderRadius: 10, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28,
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#999', minWidth: 28 }}>{num}/</span>
      <div style={{
        width: 52, height: 52, background: '#ff5722', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: 'white',
      }}>{icon}</div>
      <div>
        <h3 style={{
          margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1a1a1a',
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
        }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.5 }}>
          There are many variations of passages of Lorem Ipsum<br />available, but the majority have
        </p>
      </div>
    </div>
  );
}

/* ── white section card ── */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '28px 32px',
      marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #f0f0f0',
    }}>
      {children}
    </div>
  );
}

/* ── two-column grid ── */
function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {children}
    </div>
  );
}

/* ── main page ── */
export default function AddListingPage() {
  const navigate = useNavigate();

  // Section 01 — Basic Info
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState('');
  const [tags,     setTags]     = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Section 02 — Location
  const [city,    setCity]    = useState('');
  const [address, setAddress] = useState('');
  const [state,   setState]   = useState('');
  const [zip,     setZip]     = useState('');

  // Section 04 — Details
  const [description, setDescription] = useState('');
  const [phone,       setPhone]       = useState('');
  const [website,     setWebsite]     = useState('');
  const [email,       setEmail]       = useState('');
  const [facebook,    setFacebook]    = useState('');
  const [twitter,     setTwitter]     = useState('');
  const [instagram,   setInstagram]   = useState('');
  const [linkedin,    setLinkedin]    = useState('');
  const [amenities,   setAmenities]   = useState<string[]>([]);

  // Section 06 — Pricing
  const [pricingRows, setPricingRows] = useState([{ title: '', desc: '', price: '' }]);

  // Section 05 — Restaurant menu
  const [menuOpen, setMenuOpen]   = useState(false);
  const [menuRows, setMenuRows]   = useState([{ title: '', desc: '', mealType: '' }]);

  // Section 05 — Opening hours
  const [hoursOpen, setHoursOpen] = useState(false);
  const [openingHours, setOpeningHours] = useState([
    { day: 'Monday',    open: '', close: '' },
    { day: 'Tuesday',   open: '', close: '' },
    { day: 'Wednesday', open: '', close: '' },
    { day: 'Thursday',  open: '', close: '' },
    { day: 'Friday',    open: '', close: '' },
    { day: 'Saturday',  open: '', close: '' },
    { day: 'Sunday',    open: '', close: '' },
  ]);

  // Section 05 — Schedule
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleRows, setScheduleRows] = useState([{ date: '', time: '', place: '', address: '' }]);

  const amenityList = ['Garden', 'Security cameras', 'Laundry', 'Internet', 'Pool',
    'Video surveillance', 'Laundry room', 'Jacuzzi', 'Security cameras'];

  const toggleAmenity = (a: string) =>
    setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const addTag = () => {
    if (tagInput.trim()) { setTags(p => [...p, tagInput.trim()]); setTagInput(''); }
  };

  const addPricingRow = () =>
    setPricingRows(p => [...p, { title: '', desc: '', price: '' }]);

  const removePricingRow = (i: number) =>
    setPricingRows(p => p.filter((_, idx) => idx !== i));

  const addScheduleRow = () =>
    setScheduleRows(p => [...p, { date: '', time: '', place: '', address: '' }]);

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f3ef',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <Navbar />

      {/* ── Hero banner ── */}
      <div style={{
        background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=1400&h=300&fit=crop) center/cover',
        padding: '56px 24px',
        textAlign: 'center',
        color: 'white',
      }}>
        <p style={{ margin: '0 0 6px', fontSize: 16, color: '#ff5722',
          fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Listing</p>
        <h1 style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 800 }}>Add Listing</h1>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: '#ddd' }}>
          Discover exciting categories.{' '}
          <span style={{ color: '#ff5722', fontWeight: 600 }}>Find what you're looking for.</span>
        </p>

        {/* Search bar */}
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: 'white', borderRadius: 40,
          display: 'flex', alignItems: 'center',
          padding: '6px 6px 6px 20px', gap: 8,
        }}>
          <span style={{ color: '#999', fontSize: 18, display: 'flex', alignItems: 'center' }}>
            <FiSearch size={18} />
          </span>
          <input placeholder="What are you looking for?" style={{
            flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#333',
          }} />
          <div style={{ width: 1, height: 28, background: '#e2e8f0' }} />
          <span style={{ color: '#999', fontSize: 16, marginLeft: 8, display: 'flex', alignItems: 'center' }}>
            <FiMapPin size={16} />
          </span>
          <select style={{ border: 'none', outline: 'none', fontSize: 14,
            color: '#333', background: 'transparent', padding: '0 8px' }}>
            <option>Location</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
          </select>
          <button style={{
            background: '#ff5722', color: 'white', border: 'none',
            borderRadius: 30, padding: '12px 24px', fontWeight: 600,
            cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap',
          }}>
            Search places
          </button>
        </div>
      </div>

      {/* ── Form body ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── 01 Basic Information ── */}
        <Section>
          <SectionHeader num="01" icon={<FiUser size={22} />} title="Basic Informations" />
          <Grid2>
            <div>
              <Label text="Listing Title" required />
              <Field value={title} onChange={setTitle} />
            </div>
            <div>
              <Label text="Category" required />
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '13px 16px',
                  border: '1.5px solid #e2e8f0', borderRadius: 8,
                  fontSize: 14, outline: 'none', background: 'white',
                  color: category ? '#1a1a1a' : '#999', cursor: 'pointer' }}>
                <option value="">Category</option>
                <option value="eat-drink">Eat &amp; Drink</option>
                <option value="coaching">Coaching</option>
                <option value="apartments">Apartments</option>
                <option value="services">Services</option>
                <option value="classifieds">Classifieds</option>
                <option value="fitness">Fitness</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
          </Grid2>

          <div style={{ marginTop: 20 }}>
            <Label text="Tags" required />
            <div style={{
              border: '1.5px solid #e2e8f0', borderRadius: 8,
              padding: '10px 14px', display: 'flex', flexWrap: 'wrap',
              gap: 8, alignItems: 'center', background: 'white',
            }}>
              {tags.map((tag, i) => (
                <span key={i} style={{
                  background: '#fff3f0', color: '#ff5722', padding: '4px 10px',
                  borderRadius: 20, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {tag}
                  <button onClick={() => setTags(p => p.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ff5722', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="+ Add tag"
                style={{ border: 'none', outline: 'none', fontSize: 14,
                  color: '#333', minWidth: 100, flex: 1 }}
              />
            </div>
          </div>
        </Section>

        {/* ── 02 Location ── */}
        <Section>
          <SectionHeader num="02" icon={<FiMapPin size={22} />} title="Location" />
          <Grid2>
            <div>
              <Label text="City" required />
              <select value={city} onChange={e => setCity(e.target.value)}
                style={{ width: '100%', padding: '13px 16px',
                  border: '1.5px solid #e2e8f0', borderRadius: 8,
                  fontSize: 14, outline: 'none', background: 'white',
                  color: city ? '#1a1a1a' : '#999', cursor: 'pointer' }}>
                <option value="">Select City</option>
                <option>New York</option>
                <option>Los Angeles</option>
                <option>Chicago</option>
                <option>Miami</option>
                <option>San Francisco</option>
                <option>Boston</option>
                <option>Seattle</option>
              </select>
            </div>
            <div>
              <Label text="Address" required />
              <Field value={address} onChange={setAddress} placeholder="8706 Herrick Ave, Valley..." />
            </div>
          </Grid2>
          <Grid2>
            <div style={{ marginTop: 20 }}>
              <Label text="State" required />
              <Field value={state} onChange={setState} placeholder="State" />
            </div>
            <div style={{ marginTop: 20 }}>
              <Label text="Zip-Code" required />
              <Field value={zip} onChange={setZip} placeholder="3870" />
            </div>
          </Grid2>
        </Section>

        {/* ── 03 Gallery ── */}
        <Section>
          <SectionHeader num="03" icon={<FiImage size={22} />} title="Gallery" />
          <Label text="Gallery" required />
          <div style={{
            border: '2px dashed #ff5722', borderRadius: 10,
            padding: '48px 24px', textAlign: 'center',
            cursor: 'pointer', background: '#fff9f8',
          }}>
            <div style={{ fontSize: 36, color: '#ff5722', marginBottom: 12 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="#ff5722" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
              Click to upload or drag and drop
            </p>
          </div>
          <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            Recommended to 350 x 350 px (png, jpg, jpeg).
          </p>
        </Section>

        {/* ── 04 Details ── */}
        <Section>
          <SectionHeader num="04" icon={<FiInfo size={22} />} title="Details" />

          <div style={{ marginBottom: 20 }}>
            <Label text="Description" required />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Please enter up to 4000 characters."
              maxLength={4000}
              rows={6}
              style={{
                width: '100%', padding: '13px 16px',
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a1a1a',
              }}
              onFocus={e => (e.target.style.borderColor = '#ff5722')}
              onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Phone / Website / Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <Label text="Phone" required />
              <Field value={phone} onChange={setPhone} placeholder="(123) 456 - 789" type="tel" />
            </div>
            <div>
              <Label text="Company website" required />
              <Field value={website} onChange={setWebsite} placeholder="https://company.com" />
            </div>
            <div>
              <Label text="Email Address" required />
              <Field value={email} onChange={setEmail} placeholder="example@email.com" type="email" />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '24px 0' }} />

          {/* Social links */}
          <Grid2>
            <div>
              <Label text="Facebook Page" optional />
              <Field value={facebook} onChange={setFacebook} placeholder="https://facebook.com" />
            </div>
            <div>
              <Label text="Twitter profile" optional />
              <Field value={twitter} onChange={setTwitter} placeholder="https://twitter.com" />
            </div>
          </Grid2>
          <Grid2>
            <div style={{ marginTop: 20 }}>
              <Label text="Instagram profile" optional />
              <Field value={instagram} onChange={setInstagram} placeholder="https://instagram.com" />
            </div>
            <div style={{ marginTop: 20 }}>
              <Label text="Linkedin page" optional />
              <Field value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com" />
            </div>
          </Grid2>

          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '24px 0' }} />

          {/* Amenities */}
          <div>
            <Label text="Property amenities" optional />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
              {amenityList.map((a, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center',
                  gap: 8, cursor: 'pointer', fontSize: 14, color: '#333' }}>
                  <div
                    onClick={() => toggleAmenity(a)}
                    style={{
                      width: 18, height: 18,
                      border: `2px solid ${amenities.includes(a) ? '#ff5722' : '#d1d5db'}`,
                      borderRadius: 4, background: amenities.includes(a) ? '#ff5722' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    {amenities.includes(a) &&
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>✓</span>}
                  </div>
                  {a}
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 05 Opening Hours ── */}
        <Section>
          <SectionHeader num="05" icon={<FiClock size={22} />} title="Opening Hours" />

          {/* Schedule plan collapsible */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, marginBottom: 12 }}>
            <button
              onClick={() => setScheduleOpen(p => !p)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '16px 20px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiCalendar size={18} color="#ff5722" />
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Add schedule plan</span>
                <span style={{ fontSize: 13, color: '#999' }}>(optional)</span>
              </div>
              <span style={{ fontSize: 18, color: '#666',
                transform: scheduleOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s' }}>⌃</span>
            </button>

            {scheduleOpen && (
              <div style={{ padding: '0 20px 20px' }}>
                {scheduleRows.map((row, i) => (
                  <div key={i} style={{ display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div>
                      <Label text="Date" />
                      <input type="date" value={row.date}
                        onChange={e => setScheduleRows(p => p.map((r, idx) =>
                          idx === i ? { ...r, date: e.target.value } : r))}
                        style={{ width: '100%', padding: '11px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <Label text="Time" />
                      <input type="datetime-local" value={row.time}
                        onChange={e => setScheduleRows(p => p.map((r, idx) =>
                          idx === i ? { ...r, time: e.target.value } : r))}
                        style={{ width: '100%', padding: '11px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <Label text="Place" />
                      <input value={row.place} placeholder="Place"
                        onChange={e => setScheduleRows(p => p.map((r, idx) =>
                          idx === i ? { ...r, place: e.target.value } : r))}
                        style={{ width: '100%', padding: '11px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <Label text="Address" />
                      <input value={row.address} placeholder="8706 Herrick Ave, Valley."
                        onChange={e => setScheduleRows(p => p.map((r, idx) =>
                          idx === i ? { ...r, address: e.target.value } : r))}
                        style={{ width: '100%', padding: '11px 12px',
                          border: '1.5px solid #e2e8f0', borderRadius: 8,
                          fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                ))}
                <button onClick={addScheduleRow}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: 8,
                    padding: '10px 20px', fontSize: 14, cursor: 'pointer',
                    color: '#444', fontWeight: 500, display: 'flex',
                    alignItems: 'center', gap: 6, margin: '8px auto 0' }}>
                  + Add another schedule item
                </button>
              </div>
            )}
          </div>

          {/* ── Restaurant Menu collapsible ── */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, marginBottom: 12 }}>
            <button
              onClick={() => setMenuOpen(p => !p)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '16px 20px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiCoffee size={18} color="#ff5722" />
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Add restaurant menu</span>
                <span style={{ fontSize: 13, color: '#999' }}>(optional)</span>
              </div>
              <span style={{ fontSize: 18, color: '#666',
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s' }}>⌃</span>
            </button>

            {menuOpen && (
              <div style={{ padding: '0 20px 20px' }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 16, marginBottom: 8 }}>
                  {['Title', 'Description', 'Meal Type'].map(h => (
                    <span key={h} style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{h}</span>
                  ))}
                </div>

                {menuRows.map((row, i) => (
                  <div key={i} style={{ display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                    {/* Title — date input as per screenshot */}
                    <input type="date" value={row.title}
                      onChange={e => setMenuRows(p => p.map((r, idx) =>
                        idx === i ? { ...r, title: e.target.value } : r))}
                      style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0',
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', width: '100%' }} />
                    {/* Description */}
                    <input value={row.desc}
                      onChange={e => setMenuRows(p => p.map((r, idx) =>
                        idx === i ? { ...r, desc: e.target.value } : r))}
                      style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0',
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', width: '100%' }} />
                    {/* Meal Type dropdown */}
                    <select value={row.mealType}
                      onChange={e => setMenuRows(p => p.map((r, idx) =>
                        idx === i ? { ...r, mealType: e.target.value } : r))}
                      style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0',
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        background: 'white', cursor: 'pointer',
                        color: row.mealType ? '#1a1a1a' : '#999', width: '100%' }}>
                      <option value="">Select meal type</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="brunch">Brunch</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                ))}

                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <button
                    onClick={() => setMenuRows(p => [...p, { title: '', desc: '', mealType: '' }])}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: 8,
                      padding: '10px 20px', fontSize: 14, cursor: 'pointer',
                      color: '#444', fontWeight: 500 }}>
                    + Add another meal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Opening Hours collapsible ── */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, marginBottom: 12 }}>
            <button
              onClick={() => setHoursOpen(p => !p)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '16px 20px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiClock size={18} color="#ff5722" />
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Add opening hours</span>
                <span style={{ fontSize: 13, color: '#999' }}>(optional)</span>
              </div>
              <span style={{ fontSize: 18, color: '#666',
                transform: hoursOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s' }}>⌃</span>
            </button>

            {hoursOpen && (
              <div style={{ padding: '0 20px 20px' }}>
                {openingHours.map((row, i) => (
                  <div key={row.day} style={{
                    display: 'grid', gridTemplateColumns: '120px 1fr 1fr',
                    gap: 16, alignItems: 'center', marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                      {row.day}
                    </span>
                    <input
                      value={row.open}
                      onChange={e => setOpeningHours(p => p.map((r, idx) =>
                        idx === i ? { ...r, open: e.target.value } : r))}
                      placeholder="Open"
                      style={{ padding: '12px 16px', border: '1.5px solid #e2e8f0',
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', width: '100%' }}
                      onFocus={e => (e.target.style.borderColor = '#ff5722')}
                      onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                    />
                    <input
                      value={row.close}
                      onChange={e => setOpeningHours(p => p.map((r, idx) =>
                        idx === i ? { ...r, close: e.target.value } : r))}
                      placeholder="Close"
                      style={{ padding: '12px 16px', border: '1.5px solid #e2e8f0',
                        borderRadius: 8, fontSize: 14, outline: 'none',
                        boxSizing: 'border-box', width: '100%' }}
                      onFocus={e => (e.target.style.borderColor = '#ff5722')}
                      onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── 06 Pricing Plan ── */}
        <Section>
          <SectionHeader num="06" icon={<FiCreditCard size={22} />} title="Add Pricing plan" />

          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 52px',
            gap: 16, marginBottom: 12 }}>
            {['Title', 'Description', 'Price', 'Status'].map(h => (
              <span key={h} style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{h}</span>
            ))}
          </div>

          {pricingRows.map((row, i) => (
            <div key={i} style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 52px', gap: 16, marginBottom: 12 }}>
              <input value={row.title}
                onChange={e => setPricingRows(p => p.map((r, idx) =>
                  idx === i ? { ...r, title: e.target.value } : r))}
                style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <input value={row.desc}
                onChange={e => setPricingRows(p => p.map((r, idx) =>
                  idx === i ? { ...r, desc: e.target.value } : r))}
                style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <input value={row.price} placeholder="USD"
                onChange={e => setPricingRows(p => p.map((r, idx) =>
                  idx === i ? { ...r, price: e.target.value } : r))}
                style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <button onClick={() => removePricingRow(i)}
                style={{ background: '#ff5722', border: 'none', borderRadius: 8,
                  width: 44, height: 44, cursor: 'pointer', color: 'white',
                  fontSize: 16, display: 'flex', alignItems: 'center',
                  justifyContent: 'center' }}>
                🗑
              </button>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button onClick={addPricingRow}
              style={{ background: '#f3f4f6', border: 'none', borderRadius: 8,
                padding: '10px 24px', fontSize: 14, cursor: 'pointer',
                color: '#444', fontWeight: 500 }}>
              + Add New
            </button>
          </div>
        </Section>

        {/* ── Submit ── */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#ff5722', color: 'white', border: 'none',
              borderRadius: 30, padding: '16px 48px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            Submit for approval →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

