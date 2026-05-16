import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome, FiGrid, FiAnchor, FiCoffee, FiTruck, FiBox,
  FiMapPin, FiUsers, FiUser, FiWifi, FiTv, FiWind,
  FiDroplet, FiCamera, FiUploadCloud, FiX, FiChevronLeft,
  FiDollarSign, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { api, API_BASE_URL } from '../../../lib/api';
import { Navbar } from '../../../shared/components/Navbar';

/* ── Types ──────────────────────────────────────────────────────────── */
interface WizardData {
  propertyType: string;
  placeType: string;
  location: string;
  address: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  photos: File[];
  photoPreviews: string[];
  title: string;
  description: string;
  pricePerNight: number;
}

/* ── Constants ──────────────────────────────────────────────────────── */
const PROPERTY_TYPES = [
  { value: 'HOUSE',     label: 'House',            Icon: FiHome },
  { value: 'APARTMENT', label: 'Apartment',        Icon: FiGrid },
  { value: 'BARN',      label: 'Barn',             Icon: FiBox },
  { value: 'BNB',       label: 'Bed & breakfast',  Icon: FiCoffee },
  { value: 'BOAT',      label: 'Boat',             Icon: FiAnchor },
  { value: 'CABIN',     label: 'Cabin',            Icon: FiHome },
  { value: 'CAMPER',    label: 'Camper / RV',      Icon: FiTruck },
  { value: 'CASTLE',    label: 'Castle',           Icon: FiGrid },
  { value: 'CAVE',      label: 'Cave',             Icon: FiMapPin },
  { value: 'CONTAINER', label: 'Container',        Icon: FiBox },
  { value: 'VILLA',     label: 'Villa',            Icon: FiHome },
  { value: 'STUDIO',    label: 'Studio',           Icon: FiGrid },
];

const TYPE_MAP: Record<string, string> = {
  HOUSE: 'HOUSE', APARTMENT: 'APARTMENT', VILLA: 'VILLA',
  CABIN: 'CABIN', STUDIO: 'STUDIO',
  BARN: 'HOUSE', BNB: 'HOUSE', BOAT: 'HOUSE',
  CAMPER: 'HOUSE', CASTLE: 'HOUSE', CAVE: 'HOUSE', CONTAINER: 'HOUSE',
};

const PLACE_TYPES = [
  {
    value: 'entire',
    label: 'An entire place',
    sub: 'Guests have the whole place to themselves.',
    Icon: FiHome,
  },
  {
    value: 'room',
    label: 'A room',
    sub: 'Guests have their own room in a home, plus access to shared spaces.',
    Icon: FiUser,
  },
  {
    value: 'shared',
    label: 'A shared room in a hostel',
    sub: 'Guests sleep in a shared room in a professionally managed hostel with staff onsite 24/7.',
    Icon: FiUsers,
  },
];

const AMENITY_OPTIONS = [
  { value: 'WiFi',           label: 'Wifi',                     Icon: FiWifi },
  { value: 'TV',             label: 'TV',                       Icon: FiTv },
  { value: 'Kitchen',        label: 'Kitchen',                  Icon: FiCoffee },
  { value: 'Washer',         label: 'Washer',                   Icon: FiDroplet },
  { value: 'Free parking',   label: 'Free parking on premises', Icon: FiTruck },
  { value: 'Air conditioning', label: 'Air conditioning',       Icon: FiWind },
  { value: 'Workspace',      label: 'Dedicated workspace',      Icon: FiGrid },
  { value: 'Pool',           label: 'Pool',                     Icon: FiDroplet },
  { value: 'Hot tub',        label: 'Hot tub',                  Icon: FiDroplet },
  { value: 'Gym',            label: 'Gym',                      Icon: FiUser },
  { value: 'Balcony',        label: 'Balcony',                  Icon: FiHome },
  { value: 'Pet-friendly',   label: 'Pet-friendly',             Icon: FiUsers },
];

const TOTAL_STEPS = 7;
const accent = '#ff5722';

/* ── Upload helper ──────────────────────────────────────────────────── */
async function uploadPhotos(listingId: string, files: File[]) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  files.forEach((f) => formData.append('photos', f));
  const res = await fetch(`${API_BASE_URL}/listings/${listingId}/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Photo upload failed');
  return res.json();
}

/* ── Component ──────────────────────────────────────────────────────── */
export default function BecomeHostPage() {
  const navigate = useNavigate();
  const { userId, isAuthenticated, loginWithToken, userEmail, userName } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<WizardData>({
    propertyType: '',
    placeType: '',
    location: '',
    address: '',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    photos: [],
    photoPreviews: [],
    title: '',
    description: '',
    pricePerNight: 50,
  });

  if (!isAuthenticated) {
    return (
      <div style={pageWrap}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', gap: 16 }}>
          <FiHome size={52} color={accent} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Sign in to become a host</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>You need to be logged in to list your property.</p>
          <button onClick={() => navigate('/login')} style={btnPrimary}>Sign In</button>
        </div>
      </div>
    );
  }

  const set = (patch: Partial<WizardData>) => setData((d) => ({ ...d, ...patch }));

  const canNext = (): boolean => {
    if (step === 1) return !!data.propertyType;
    if (step === 2) return !!data.placeType;
    if (step === 3) return data.location.trim().length >= 2;
    if (step === 4) return true;
    if (step === 5) return data.amenities.length >= 1;
    if (step === 6) return data.photos.length >= 3;
    if (step === 7) return data.title.trim().length >= 10 && data.pricePerNight >= 10;
    return true;
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
    const canAdd = 10 - data.photos.length;
    const toAdd = valid.slice(0, canAdd);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    set({ photos: [...data.photos, ...toAdd], photoPreviews: [...data.photoPreviews, ...previews] });
    e.target.value = '';
  };

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(data.photoPreviews[i]!);
    set({
      photos: data.photos.filter((_, idx) => idx !== i),
      photoPreviews: data.photoPreviews.filter((_, idx) => idx !== i),
    });
  };

  const toggleAmenity = (val: string) => {
    set({
      amenities: data.amenities.includes(val)
        ? data.amenities.filter((a) => a !== val)
        : [...data.amenities, val],
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const hostRes = await api.post<{ token: string; user: { id: string; email: string; name?: string; role: 'HOST' } }>('/auth/become-host', {});
      const newToken = hostRes.token;

      const description =
        data.description.trim() ||
        `${data.placeType === 'entire' ? 'Entire' : data.placeType === 'room' ? 'Private room in' : 'Shared room in'} ${data.propertyType.toLowerCase()} in ${data.location}. Accommodates ${data.guests} guests.`;

      const listingPayload = {
        title: data.title.trim(),
        description,
        location: data.location.trim() + (data.address ? `, ${data.address.trim()}` : ''),
        pricePerNight: data.pricePerNight,
        guests: data.guests,
        type: TYPE_MAP[data.propertyType] ?? 'HOUSE',
        amenities: data.amenities,
        cancellationPolicy: 'FLEXIBLE',
        isPublished: true,
        minNights: 1,
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('airbnb-role', 'HOST');

      const res = await api.post<{ listing: { id: string } }>('/listings', listingPayload);
      const listingId = (res as any)?.listing?.id ?? '';

      if (listingId && data.photos.length > 0) {
        await uploadPhotos(listingId, data.photos);
      }

      loginWithToken({ token: newToken, userId, role: 'HOST', email: userEmail, name: userName });
      navigate('/host/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={pageWrap}>
      <Navbar />

      {/* Progress bar */}
      <div style={{ height: 3, background: '#e5e7eb', position: 'sticky', top: 64, zIndex: 10 }}>
        <div style={{ height: '100%', background: accent, width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 120px' }}>

        {/* Step 1 — Property type */}
        {step === 1 && (
          <StepWrapper title="Which of these best describes your place?">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {PROPERTY_TYPES.map(({ value, label, Icon }) => {
                const active = data.propertyType === value;
                return (
                  <button key={value} type="button" onClick={() => set({ propertyType: value })}
                    style={{ ...typeCard, border: `2px solid ${active ? accent : '#e5e7eb'}`, background: active ? '#fff7f2' : 'white' }}>
                    <Icon size={28} color={active ? accent : '#374151'} style={{ marginBottom: 10 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: active ? accent : '#1a1a1a' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </StepWrapper>
        )}

        {/* Step 2 — Place type */}
        {step === 2 && (
          <StepWrapper title="What type of place will guests have?">
            <div style={{ display: 'grid', gap: 12 }}>
              {PLACE_TYPES.map(({ value, label, sub, Icon }) => {
                const active = data.placeType === value;
                return (
                  <button key={value} type="button" onClick={() => set({ placeType: value })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderRadius: 14, border: `2px solid ${active ? accent : '#e5e7eb'}`, background: active ? '#fff7f2' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: active ? accent : '#1a1a1a', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{sub}</div>
                    </div>
                    <Icon size={28} color={active ? accent : '#9ca3af'} style={{ marginLeft: 16, flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </StepWrapper>
        )}

        {/* Step 3 — Location */}
        {step === 3 && (
          <StepWrapper title="Where is your place located?" subtitle="Your address is only shared with guests after they book.">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>City / Region *</label>
                <div style={{ position: 'relative' }}>
                  <FiMapPin size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input value={data.location} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. Kigali, Rwanda" style={{ ...inputStyle, paddingLeft: 40 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Full Address <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                <input value={data.address} onChange={(e) => set({ address: e.target.value })} placeholder="Street address" style={inputStyle} />
              </div>
            </div>
          </StepWrapper>
        )}

        {/* Step 4 — Basics */}
        {step === 4 && (
          <StepWrapper title="Share some basics about your place" subtitle="You'll add more details later, like bed types.">
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
              {([
                { label: 'Guests',    key: 'guests',    min: 1, max: 30 },
                { label: 'Bedrooms',  key: 'bedrooms',  min: 0, max: 20 },
                { label: 'Beds',      key: 'beds',      min: 1, max: 30 },
                { label: 'Bathrooms', key: 'bathrooms', min: 1, max: 20 },
              ] as const).map((item, idx, arr) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button type="button"
                      onClick={() => set({ [item.key]: Math.max(item.min, (data as any)[item.key] - 1) } as any)}
                      disabled={(data as any)[item.key] <= item.min}
                      style={{ ...counterBtn, opacity: (data as any)[item.key] <= item.min ? 0.35 : 1 }}>
                      &minus;
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{(data as any)[item.key]}</span>
                    <button type="button"
                      onClick={() => set({ [item.key]: Math.min(item.max, (data as any)[item.key] + 1) } as any)}
                      disabled={(data as any)[item.key] >= item.max}
                      style={{ ...counterBtn, opacity: (data as any)[item.key] >= item.max ? 0.35 : 1 }}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 5 — Amenities */}
        {step === 5 && (
          <StepWrapper title="Tell guests what your place has to offer" subtitle="You can add more amenities after you publish your listing.">
            <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 14 }}>What about these guest favorites?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {AMENITY_OPTIONS.map(({ value, label, Icon }) => {
                const selected = data.amenities.includes(value);
                return (
                  <button key={value} type="button" onClick={() => toggleAmenity(value)}
                    style={{ ...typeCard, border: `2px solid ${selected ? accent : '#e5e7eb'}`, background: selected ? '#fff7f2' : 'white' }}>
                    <Icon size={24} color={selected ? accent : '#374151'} style={{ marginBottom: 8 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: selected ? accent : '#374151' }}>{label}</span>
                  </button>
                );
              })}
            </div>
            {data.amenities.length === 0 && (
              <p style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>Please select at least one amenity.</p>
            )}
          </StepWrapper>
        )}

        {/* Step 6 — Photos */}
        {step === 6 && (
          <StepWrapper title="Add some photos of your place" subtitle="You'll need at least 3 photos to get started. You can always add more later.">
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed #d1d5db', borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: 'white', marginBottom: 16 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; }}
            >
              <FiUploadCloud size={40} color="#9ca3af" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: 15, color: '#374151', marginBottom: 4 }}>Click to upload photos</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>PNG, JPG up to 10MB each</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePhotoAdd} />

            {data.photoPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {data.photoPreviews.map((src, i) => (
                  <div key={src} style={{ position: 'relative' }}>
                    <img src={src} alt="" style={{ width: 100, height: 72, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e5e7eb' }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#374151', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {data.photos.length < 3 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCamera size={14} color="#dc2626" />
                <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
                  Please add at least {3 - data.photos.length} more photo{3 - data.photos.length !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </StepWrapper>
        )}

        {/* Step 7 — Title, description, price */}
        {step === 7 && (
          <StepWrapper title="Now, let's give your place a title" subtitle="Short titles work best. You can always change it later.">
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={labelStyle}>Listing title *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={data.title}
                    onChange={(e) => set({ title: e.target.value.slice(0, 60) })}
                    placeholder="e.g. Cozy apartment in Kigali city center"
                    style={inputStyle}
                    maxLength={60}
                  />
                  <span style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 12, color: '#9ca3af' }}>{data.title.length}/60</span>
                </div>
                {data.title.length > 0 && data.title.length < 10 && (
                  <p style={{ color: '#dc2626', fontSize: 12, margin: '4px 0 0' }}>Title must be at least 10 characters.</p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Description <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                <textarea
                  value={data.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Tell guests what makes your place special..."
                  style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Price per night (USD) *</label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign size={16} color="#374151" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="number"
                    min={10}
                    value={data.pricePerNight}
                    onChange={(e) => set({ pricePerNight: Math.max(10, Number(e.target.value)) })}
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}>
                <FiAlertCircle size={16} color="#991b1b" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, color: '#991b1b', fontSize: 13 }}>{error}</p>
              </div>
            )}
          </StepWrapper>
        )}
      </div>

      {/* Bottom navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button
          type="button"
          onClick={() => step > 1 ? setStep((s) => s - 1) : navigate('/')}
          style={{ background: 'none', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0' }}
        >
          {step > 1 && <FiChevronLeft size={18} />}
          {step === 1 ? 'Exit' : 'Back'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>{step} / {TOTAL_STEPS}</span>
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              style={{ ...btnDark, opacity: canNext() ? 1 : 0.45, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!canNext() || submitting}
              style={{ ...btnPrimary, opacity: canNext() && !submitting ? 1 : 0.45, cursor: canNext() && !submitting ? 'pointer' : 'not-allowed' }}>
              {submitting ? 'Publishing...' : 'Publish listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */
function StepWrapper({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>{title}</h1>
      {subtitle && <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280' }}>{subtitle}</p>}
      {!subtitle && <div style={{ marginBottom: 28 }} />}
      {children}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const pageWrap: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f8f9fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #d1d5db',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 15,
  boxSizing: 'border-box',
  outline: 'none',
  background: 'white',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: 14,
  color: '#374151',
  marginBottom: 8,
};

const typeCard: React.CSSProperties = {
  padding: '22px 16px',
  borderRadius: 14,
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  transition: 'border-color 0.15s',
};

const counterBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1.5px solid #d1d5db',
  background: 'white',
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
};

const btnPrimary: React.CSSProperties = {
  background: '#ff5722',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  padding: '12px 28px',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
};

const btnDark: React.CSSProperties = {
  background: '#1a1a1a',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  padding: '12px 28px',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
};
