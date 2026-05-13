import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  FiCheck, FiUser, FiCreditCard, FiCalendar, FiClipboard,
  FiAlertCircle, FiLock, FiMapPin,
} from 'react-icons/fi';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';
import { Spinner } from '../../../shared/components/Spinner';
import { useListing } from '../../listings/hooks/useListing';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { useBlockedDates } from '../../host/hooks/useBlockedDates';
import { datesSchema, paymentSchema, personalSchema } from '../schemas/booking';
import type { DatesData, PaymentData, PersonalData } from '../schemas/booking';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { label: 'Dates',        Icon: FiCalendar },
  { label: 'Your Details', Icon: FiUser },
  { label: 'Payment',      Icon: FiCreditCard },
  { label: 'Confirm',      Icon: FiClipboard },
];

/* ── Step progress indicator ────────────────────────────────────────── */
function StepProgress({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {STEPS.map(({ label, Icon }, i) => {
        const n       = (i + 1) as Step;
        const done    = n < step;
        const current = n === step;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: done ? '#16a34a' : current ? '#ff5722' : '#f3f4f6',
                color: done || current ? 'white' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: current ? '2px solid #ff5722' : done ? '2px solid #16a34a' : '2px solid #e5e7eb',
                transition: 'all 0.2s',
              }}>
                {done ? <FiCheck size={18} strokeWidth={3} /> : <Icon size={18} />}
              </div>
              <span style={{ fontSize: 11, fontWeight: current ? 700 : 400, color: current ? '#ff5722' : done ? '#16a34a' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#16a34a' : '#e5e7eb', margin: '0 8px', marginBottom: 20, transition: 'background 0.2s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Price breakdown ────────────────────────────────────────────────── */
function PriceSummary({ listing, nights, guests }: { listing: any; nights: number; guests: number }) {
  const base       = (listing.price ?? 0) * nights;
  const extraFee   = (listing.extraGuestFee && listing.baseGuests)
    ? Math.max(0, guests - listing.baseGuests) * listing.extraGuestFee * nights : 0;
  let discount = 0, discountLabel = '';
  if (nights >= 28 && listing.monthlyDiscount) {
    discount = Math.round(base * (listing.monthlyDiscount / 100));
    discountLabel = `Monthly discount (${listing.monthlyDiscount}%)`;
  } else if (nights >= 7 && listing.weeklyDiscount) {
    discount = Math.round(base * (listing.weeklyDiscount / 100));
    discountLabel = `Weekly discount (${listing.weeklyDiscount}%)`;
  }
  const subtotal   = base + extraFee - discount;
  const serviceFee = Math.round(subtotal * 0.12);
  const taxes      = Math.round(subtotal * 0.05);
  const total      = subtotal + serviceFee + taxes;

  return (
    <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '16px 18px', fontSize: 14 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15, color: '#1a1a1a' }}>Price breakdown</div>
      <PriceRow label={`$${listing.price} x ${nights} night${nights !== 1 ? 's' : ''}`} value={`$${base}`} />
      {extraFee > 0 && <PriceRow label="Extra guest fee" value={`$${extraFee}`} />}
      {discount > 0 && <PriceRow label={discountLabel} value={`-$${discount}`} color="#16a34a" />}
      <PriceRow label="Service fee (12%)" value={`$${serviceFee}`} />
      <PriceRow label="Taxes (5%)" value={`$${taxes}`} />
      <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
        <span>Total</span>
        <span style={{ color: '#ff5722' }}>${total}</span>
      </div>
    </div>
  );
}

function PriceRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: color ?? '#374151' }}>
      <span>{label}</span><span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ── Step 1: Dates ──────────────────────────────────────────────────── */
function StepDates({ onNext, initial, listing }: { onNext: (d: DatesData) => void; initial?: DatesData; listing: any }) {
  const { data: blockedData } = useBlockedDates(String(listing.id));
  const allBlocked = useMemo(() => {
    const manual   = (blockedData?.manual ?? []).map((d: any) => d.date);
    const bookings = blockedData?.bookings ?? [];
    return new Set([...manual, ...bookings]);
  }, [blockedData]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<DatesData>({
    resolver: zodResolver(datesSchema),
    defaultValues: initial ?? { checkIn: '', checkOut: '', guests: 1 },
  });

  const checkIn  = watch('checkIn');
  const checkOut = watch('checkOut');
  const guests   = watch('guests') ?? 1;
  const nights   = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000));
  }, [checkIn, checkOut]);

  const hasConflict = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) return false;
    const cur = new Date(checkIn);
    const end = new Date(checkOut);
    while (cur < end) {
      if (allBlocked.has(cur.toISOString().slice(0, 10))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }, [checkIn, checkOut, nights, allBlocked]);

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>Select your dates</h3>
      <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>Choose your check-in and check-out dates.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Check-in" error={errors.checkIn?.message}>
          <input type="date" {...register('checkIn')} style={inputStyle} />
        </Field>
        <Field label="Check-out" error={errors.checkOut?.message}>
          <input type="date" {...register('checkOut')} style={inputStyle} />
        </Field>
      </div>

      <Field label="Number of guests" error={errors.guests?.message}>
        <input type="number" min={1} max={listing.guests ?? 16} {...register('guests', { valueAsNumber: true })} style={inputStyle} />
        <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' }}>Maximum {listing.guests ?? 16} guests</span>
      </Field>

      {listing.minNights > 1 && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiAlertCircle size={14} /> Minimum stay: {listing.minNights} nights
        </div>
      )}

      {hasConflict && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiAlertCircle size={14} /> Some dates are unavailable. Please choose different dates.
        </div>
      )}

      {nights > 0 && !hasConflict && (
        <div style={{ marginBottom: 16 }}>
          <PriceSummary listing={listing} nights={nights} guests={guests} />
        </div>
      )}

      <button type="submit" disabled={hasConflict} style={{ ...btnPrimary, opacity: hasConflict ? 0.5 : 1, cursor: hasConflict ? 'not-allowed' : 'pointer' }}>
        Continue
      </button>
    </form>
  );
}

/* ── Step 2: Personal details ───────────────────────────────────────── */
function StepPersonal({ onNext, onBack, initial }: { onNext: (d: PersonalData) => void; onBack: () => void; initial?: PersonalData }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues: initial ?? { name: '', email: '', phone: '' },
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>Your details</h3>
      <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>We'll use this to confirm your booking.</p>
      <Field label="Full name" error={errors.name?.message}>
        <input {...register('name')} placeholder="John Smith" style={inputStyle} />
      </Field>
      <Field label="Email address" error={errors.email?.message}>
        <input type="email" {...register('email')} placeholder="john@example.com" style={inputStyle} />
      </Field>
      <Field label="Phone number" error={errors.phone?.message}>
        <input {...register('phone')} placeholder="+1 555 000 0000" style={inputStyle} />
      </Field>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" style={btnGhost} onClick={onBack}>Back</button>
        <button type="submit" style={btnPrimary}>Continue</button>
      </div>
    </form>
  );
}

/* ── Step 3: Payment ────────────────────────────────────────────────── */
function StepPayment({ onNext, onBack, initial }: { onNext: (d: PaymentData) => void; onBack: () => void; initial?: PaymentData }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initial ?? { card: '', expiry: '', cvv: '' },
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>Payment details</h3>
      <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>Your payment information is secure and encrypted.</p>

      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#166534' }}>
        <FiLock size={14} /> Demo mode — no real charges will be made.
      </div>

      <Field label="Cardholder name" error={undefined}>
        <input placeholder="John Smith" style={inputStyle} />
      </Field>
      <Field label="Card number" error={errors.card?.message}>
        <input {...register('card')} placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={16} style={inputStyle} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Expiry (MM/YY)" error={errors.expiry?.message}>
          <input {...register('expiry')} placeholder="12/26" style={inputStyle} />
        </Field>
        <Field label="CVV" error={errors.cvv?.message}>
          <input {...register('cvv')} placeholder="123" inputMode="numeric" maxLength={4} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" style={btnGhost} onClick={onBack}>Back</button>
        <button type="submit" style={btnPrimary}>Continue</button>
      </div>
    </form>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function NewBookingPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(listingId);
  const createBooking = useCreateBooking();

  // Read pre-filled dates from URL params (passed from listing detail page)
  const preCheckIn  = searchParams.get('checkIn')  ?? '';
  const preCheckOut = searchParams.get('checkOut') ?? '';
  const preGuests   = Number(searchParams.get('guests') ?? 1);

  // If dates are pre-filled, start at step 2
  const initialStep: Step = (preCheckIn && preCheckOut) ? 2 : 1;

  const [step,         setStep]         = useState<Step>(initialStep);
  const [datesData,    setDatesData]    = useState<DatesData | null>(
    preCheckIn && preCheckOut ? { checkIn: preCheckIn, checkOut: preCheckOut, guests: preGuests } : null,
  );
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [paymentData,  setPaymentData]  = useState<PaymentData | null>(null);

  const nights = useMemo(() => {
    if (!datesData) return 0;
    return Math.max(1, Math.ceil(
      (new Date(datesData.checkOut).getTime() - new Date(datesData.checkIn).getTime()) / (1000 * 60 * 60 * 24),
    ));
  }, [datesData]);

  if (isLoading || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', placeItems: 'center' }}><Spinner /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

        {/* Listing summary */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, background: 'white', borderRadius: 14, padding: 16, border: '1px solid #e5e7eb' }}>
          <img src={listing.img} alt={listing.title}
            style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/80/60`; }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>{listing.title}</div>
            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiMapPin size={12} /> {listing.location}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ff5722', marginTop: 4 }}>${listing.price}/night</div>
          </div>
        </div>

        {/* Step progress */}
        <StepProgress step={step} />

        {/* Step content */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 28 }}>
          {step === 1 && (
            <StepDates listing={listing} initial={datesData ?? undefined}
              onNext={(data) => { setDatesData(data); setStep(2); }} />
          )}
          {step === 2 && (
            <StepPersonal initial={personalData ?? undefined}
              onBack={() => setStep(1)}
              onNext={(data) => { setPersonalData(data); setStep(3); }} />
          )}
          {step === 3 && (
            <StepPayment initial={paymentData ?? undefined}
              onBack={() => setStep(2)}
              onNext={(data) => { setPaymentData(data); setStep(4); }} />
          )}
          {step === 4 && datesData && personalData && paymentData && (
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>Review and confirm</h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>Please review your booking details before confirming.</p>

              <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                {[
                  ['Listing',   listing.title],
                  ['Location',  listing.location],
                  ['Check-in',  datesData.checkIn],
                  ['Check-out', datesData.checkOut],
                  ['Nights',    String(nights)],
                  ['Guests',    String(datesData.guests)],
                  ['Name',      personalData.name],
                  ['Email',     personalData.email],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                    <span style={{ color: '#6b7280' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <PriceSummary listing={listing} nights={nights} guests={datesData.guests} />
              </div>

              {listing.cancellationPolicy && (
                <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    Cancellation: {listing.cancellationPolicy}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {listing.cancellationPolicy === 'FLEXIBLE' && 'Full refund if cancelled 1 day before check-in.'}
                    {listing.cancellationPolicy === 'MODERATE' && 'Full refund if cancelled 5 days before check-in.'}
                    {listing.cancellationPolicy === 'STRICT' && '50% refund if cancelled at least 7 days before check-in.'}
                    {listing.cancellationPolicy === 'NON_REFUNDABLE' && 'No refund on cancellation.'}
                    {listing.cancellationPolicy === 'LONG_TERM' && '30-day notice required for a full refund.'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStep(3)} style={btnGhost}>Back</button>
                <button
                  onClick={async () => {
                    try {
                      await createBooking.mutateAsync({
                        listingId: String(listing.id),
                        checkIn:   new Date(datesData.checkIn).toISOString(),
                        checkOut:  new Date(datesData.checkOut).toISOString(),
                        guests:    datesData.guests,
                      });
                      toast.success('Booking confirmed!');
                      navigate('/bookings');
                    } catch (e) {
                      toast.error((e as Error).message || 'Failed to create booking');
                    }
                  }}
                  disabled={createBooking.isPending}
                  style={{ ...btnPrimary, opacity: createBooking.isPending ? 0.6 : 1, cursor: createBooking.isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <FiCheck size={16} />
                  {createBooking.isPending ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
      {error && <p style={{ margin: '6px 0 0', color: '#dc2626', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><FiAlertCircle size={12} /> {error}</p>}
    </div>
  );
}

const inputStyle: CSSProperties = { width: '100%', borderRadius: 10, border: '1px solid #d1d5db', padding: '12px 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' };
const btnPrimary: CSSProperties = { background: '#ff5722', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnGhost: CSSProperties = { background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, padding: '12px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' };
