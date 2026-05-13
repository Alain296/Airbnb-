import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  FiFileText, FiEdit2, FiX, FiStar, FiMapPin, FiCalendar,
  FiDollarSign, FiAlertCircle,
} from 'react-icons/fi';
import { GuestLayout } from '../components/GuestLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyBookings } from '../hooks/useMyBookings';
import { useCancelBooking } from '../hooks/useCancelBooking';
import { useModifyBooking } from '../hooks/useModifyBooking';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { datesSchema, reviewSchema } from '../schemas/booking';
import type { DatesData, ReviewData } from '../schemas/booking';

/* ── Status badge colours ───────────────────────────────────────────── */
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  PENDING:   { background: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { background: '#dcfce7', color: '#166534' },
  CANCELLED: { background: '#fee2e2', color: '#991b1b' },
};

/* ── Cancellation policy refund rules ───────────────────────────────── */
const REFUND_RULES: Record<string, string> = {
  FLEXIBLE:       'Full refund if cancelled 1 day before check-in.',
  MODERATE:       'Full refund if cancelled 5 days before check-in.',
  STRICT:         '50% refund if cancelled at least 7 days before check-in.',
  NON_REFUNDABLE: 'No refund on cancellation.',
  LONG_TERM:      '30-day notice required for a full refund.',
};

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

/* ── Cancel booking modal ───────────────────────────────────────────── */
function CancelModal({ booking, onClose, onConfirm }: { booking: any; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  const policy = booking.listing?.cancellationPolicy ?? 'FLEXIBLE';
  const refundMsg = REFUND_RULES[policy] ?? '';

  const PRESET_REASONS = [
    'My plans have changed.',
    'I found a better option.',
    'Personal emergency.',
    'Travel restrictions apply.',
    'Other reason (see below)',
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Cancel Booking</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FiX size={22} /></button>
        </div>

        {/* Refund policy */}
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <FiAlertCircle size={16} color="#854d0e" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#854d0e', marginBottom: 2 }}>Cancellation Policy: {policy}</div>
            <div style={{ fontSize: 13, color: '#854d0e' }}>{refundMsg}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#374151' }}>Reason for cancellation</label>
          <div style={{ display: 'grid', gap: 8 }}>
            {PRESET_REASONS.map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${reason === r ? '#ff5722' : '#e5e7eb'}`, background: reason === r ? '#fff7f2' : 'white' }}>
                <input type="radio" name="cancel-reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: '#ff5722' }} />
                <span style={{ fontSize: 13, color: reason === r ? '#ff5722' : '#374151', fontWeight: reason === r ? 600 : 400 }}>{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#374151' }}>Additional details (optional)</label>
          <textarea placeholder="Tell us more about why you're cancelling..." rows={3}
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            onChange={(e) => { if (!PRESET_REASONS.slice(0, 4).includes(reason)) setReason(e.target.value); }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14, cursor: !reason.trim() ? 'not-allowed' : 'pointer', opacity: !reason.trim() ? 0.5 : 1 }}
          >
            Confirm Cancellation
          </button>
          <button onClick={onClose} style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '12px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Keep Booking
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Star picker ────────────────────────────────────────────────────── */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 22, color: n <= value ? '#f59e0b' : '#d1d5db',
            padding: '0 2px',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ── Review form ────────────────────────────────────────────────────── */
const SUB_RATINGS: { key: keyof ReviewData; label: string }[] = [
  { key: 'cleanliness',   label: 'Cleanliness' },
  { key: 'accuracy',      label: 'Accuracy' },
  { key: 'checkIn',       label: 'Check-in' },
  { key: 'communication', label: 'Communication' },
  { key: 'location',      label: 'Location' },
  { key: 'value',         label: 'Value' },
];

function ReviewForm({ listingId, bookingId, onClose }: { listingId: string; bookingId: string; onClose: () => void }) {
  const submitReview = useSubmitReview(listingId);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall: 5, cleanliness: 5, accuracy: 5,
      checkIn: 5, communication: 5, location: 5, value: 5,
      comment: '',
    },
  });

  const onSubmit = async (data: ReviewData) => {
    try {
      await submitReview.mutateAsync(data);
      toast.success('Review submitted!');
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Write a Review</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Overall rating */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              Overall Rating *
            </label>
            <StarPicker value={watch('overall')} onChange={(v) => setValue('overall', v, { shouldValidate: true })} />
            {errors.overall && <p style={{ color: '#dc2626', fontSize: 12, margin: '4px 0 0' }}>{errors.overall.message}</p>}
          </div>

          {/* Sub-ratings (FR-055) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {SUB_RATINGS.map(({ key, label }) => (
              <div key={key}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                  {label}
                </label>
                <StarPicker
                  value={watch(key) as number}
                  onChange={(v) => setValue(key, v, { shouldValidate: true })}
                />
              </div>
            ))}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              Your Review * <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(min 50 characters)</span>
            </label>
            <textarea
              {...register('comment')}
              rows={4}
              placeholder="Share your experience — what did you love? What could be improved?"
              style={{
                width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
                padding: '10px 12px', fontSize: 14, resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {errors.comment
                ? <p style={{ color: '#dc2626', fontSize: 12, margin: 0 }}>{errors.comment.message}</p>
                : <span />}
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{watch('comment')?.length ?? 0}/1000</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={submitReview.isPending}
              style={{
                flex: 1, background: '#ff5722', color: 'white', border: 'none',
                borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14,
                cursor: submitReview.isPending ? 'not-allowed' : 'pointer',
                opacity: submitReview.isPending ? 0.6 : 1,
              }}
            >
              {submitReview.isPending ? 'Submitting…' : 'Submit Review'}
            </button>
            <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Modify booking modal ───────────────────────────────────────────── */
function ModifyModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const modify = useModifyBooking(String(booking.id));
  const { register, handleSubmit, formState: { errors } } = useForm<DatesData>({
    resolver: zodResolver(datesSchema),
    defaultValues: {
      checkIn:  String(booking.checkIn ?? '').slice(0, 10),
      checkOut: String(booking.checkOut ?? '').slice(0, 10),
      guests:   1,
    },
  });

  const onSubmit = async (data: DatesData) => {
    try {
      await modify.mutateAsync(data);
      toast.success('Booking updated!');
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Modify Booking</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Check-in</label>
            <input type="date" {...register('checkIn')} style={inp} />
            {errors.checkIn && <p style={errStyle}>{errors.checkIn.message}</p>}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Check-out</label>
            <input type="date" {...register('checkOut')} style={inp} />
            {errors.checkOut && <p style={errStyle}>{errors.checkOut.message}</p>}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Guests</label>
            <input type="number" min={1} max={16} {...register('guests', { valueAsNumber: true })} style={inp} />
            {errors.guests && <p style={errStyle}>{errors.guests.message}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={modify.isPending}
              style={{
                flex: 1, background: '#ff5722', color: 'white', border: 'none',
                borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14,
                cursor: modify.isPending ? 'not-allowed' : 'pointer',
                opacity: modify.isPending ? 0.6 : 1,
              }}
            >
              {modify.isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Booking receipt modal ──────────────────────────────────────────── */
function ReceiptModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const checkIn  = String(booking.checkIn  ?? '').slice(0, 10);
  const checkOut = String(booking.checkOut ?? '').slice(0, 10);
  const nights   = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
    : 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Booking Receipt</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {/* Booking reference */}
        <div style={{ background: '#fff7f2', border: '1px solid #ffd5c7', borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>BOOKING REFERENCE</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#ff5722', letterSpacing: 1 }}>
            #{String(booking.id).slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
          <Row label="Listing"    value={booking.listing?.title ?? 'Listing'} />
          <Row label="Location"   value={booking.listing?.location ?? '—'} />
          <Row label="Check-in"   value={checkIn} />
          <Row label="Check-out"  value={checkOut} />
          <Row label="Nights"     value={String(nights)} />
          <Row label="Status"     value={booking.status} />
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
            <span>Total paid</span>
            <span style={{ color: '#ff5722' }}>${Number(booking.totalPrice ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Cancellation policy */}
        {booking.listing?.cancellationPolicy && (
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
              Cancellation Policy: {booking.listing.cancellationPolicy}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {REFUND_RULES[booking.listing.cancellationPolicy] ?? ''}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{ width: '100%', background: '#ff5722', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{value}</span>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function MyBookingsPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading, isError, error, refetch } = useMyBookings(userId);
  const cancelMutation = useCancelBooking();

  const [tab,           setTab]           = useState<FilterTab>('ALL');
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [modifyBooking, setModifyBooking] = useState<any | null>(null);
  const [receiptBooking,setReceiptBooking]= useState<any | null>(null);
  const [cancelBooking, setCancelBooking] = useState<any | null>(null);

  const filtered = tab === 'ALL' ? bookings : bookings.filter((b) => b.status === tab);

  const counts = {
    ALL:       bookings.length,
    PENDING:   bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  // A booking is reviewable if it's CONFIRMED and checkout is in the past
  const isReviewable = (b: any) => {
    if (b.status !== 'CONFIRMED') return false;
    const checkout = new Date(b.checkOut);
    return checkout < new Date();
  };

  return (
    <GuestLayout title="My Bookings" subtitle="Manage your reservations and reviews.">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
          {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                padding: '10px 16px', fontWeight: tab === t ? 700 : 500,
                fontSize: 14, color: tab === t ? '#ff5722' : '#555',
                borderBottom: tab === t ? '2px solid #ff5722' : '2px solid transparent',
                marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {t}
              <span style={{
                background: tab === t ? '#ff5722' : '#e5e7eb',
                color: tab === t ? 'white' : '#555',
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                padding: '1px 7px', minWidth: 20, textAlign: 'center',
              }}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {/* States */}
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
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>No {tab !== 'ALL' ? tab.toLowerCase() : ''} bookings</p>
            <p style={{ fontSize: 13, margin: '0 0 20px' }}>
              {tab === 'ALL' ? "You haven't made any bookings yet." : `No ${tab.toLowerCase()} bookings to show.`}
            </p>
            {tab === 'ALL' && (
              <button onClick={() => navigate('/listings')} style={btnPrimary}>
                Browse Listings
              </button>
            )}
          </div>
        )}

        {/* Booking cards */}
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map((b) => {
            const photo    = b.listing?.photos?.[0]?.url || `https://picsum.photos/seed/bk-${b.id}/360/220`;
            const checkIn  = String(b.checkIn  ?? '').slice(0, 10);
            const checkOut = String(b.checkOut ?? '').slice(0, 10);
            const nights   = checkIn && checkOut
              ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
              : '—';
            const canCancel  = b.status !== 'CANCELLED';
            const canModify  = b.status === 'PENDING' || b.status === 'CONFIRMED';
            const canReview  = isReviewable(b);
            const isCancelling = cancelMutation.isPending && cancelMutation.variables === String(b.id);

            return (
              <div
                key={b.id}
                style={{
                  background: 'white', border: '1px solid #e5e7eb',
                  borderRadius: 14, padding: 18,
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Photo */}
                <img
                  src={photo}
                  alt={b.listing?.title ?? 'Listing'}
                  style={{ width: 150, height: 100, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/bk-${b.id}/360/220`; }}
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {b.listing?.title ?? 'Listing'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiMapPin size={12} /> {b.listing?.location ?? '—'}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#555', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={12} /> {checkIn} to {checkOut} ({nights} night{nights !== 1 ? 's' : ''})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDollarSign size={12} /> <strong>${Number(b.totalPrice ?? 0).toFixed(2)}</strong></span>
                  </div>

                  {/* Status + cancellation policy */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 10px',
                      borderRadius: 999, ...(STATUS_STYLE[b.status] ?? STATUS_STYLE.PENDING),
                    }}>
                      {b.status}
                    </span>
                    {b.listing?.cancellationPolicy && b.status !== 'CANCELLED' && (
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {b.listing.cancellationPolicy} policy
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  {/* Receipt */}
                  <button onClick={() => setReceiptBooking(b)} style={btnSmallGhost}>
                    <FiFileText size={13} /> Receipt
                  </button>

                  {/* Modify */}
                  {canModify && (
                    <button onClick={() => setModifyBooking(b)} style={btnSmallGhost}>
                      <FiEdit2 size={13} /> Modify
                    </button>
                  )}

                  {/* Cancel */}
                  {canCancel && (
                    <button
                      disabled={isCancelling}
                      onClick={() => setCancelBooking(b)}
                      style={{ ...btnSmallDanger, opacity: isCancelling ? 0.6 : 1, cursor: isCancelling ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiX size={13} /> {isCancelling ? '...' : 'Cancel'}
                    </button>
                  )}

                  {/* Review */}
                  {canReview && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      style={{ ...btnSmallPrimary, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <FiStar size={13} /> Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      {/* Modals */}
      {reviewBooking && (
        <ReviewForm
          listingId={String(reviewBooking.listing?.id ?? reviewBooking.listingId)}
          bookingId={String(reviewBooking.id)}
          onClose={() => setReviewBooking(null)}
        />
      )}
      {modifyBooking && (
        <ModifyModal booking={modifyBooking} onClose={() => setModifyBooking(null)} />
      )}
      {receiptBooking && (
        <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />
      )}
      {cancelBooking && (
        <CancelModal
          booking={cancelBooking}
          onClose={() => setCancelBooking(null)}
          onConfirm={(reason) => {
            cancelMutation.mutate(String(cancelBooking.id), {
              onSuccess: () => { toast.success('Booking cancelled'); setCancelBooking(null); },
              onError: (e) => toast.error((e as Error).message),
            });
          }}
        />
      )}
    </GuestLayout>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const btnPrimary: React.CSSProperties = {
  background: '#ff5722', color: 'white', border: 'none',
  borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
};
const btnSmallGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '7px 12px', fontWeight: 600, fontSize: 12, cursor: 'pointer',
  minWidth: 90,
};
const btnSmallPrimary: React.CSSProperties = {
  background: '#ff5722', color: 'white', border: 'none',
  borderRadius: 8, padding: '7px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer',
  minWidth: 90,
};
const btnSmallDanger: React.CSSProperties = {
  background: 'white', color: '#b91c1c', border: '1px solid #fca5a5',
  borderRadius: 8, padding: '7px 12px', fontWeight: 700, fontSize: 12,
  minWidth: 90,
};
const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
  padding: '10px 12px', fontSize: 14, marginTop: 4, boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontWeight: 600, fontSize: 13, color: '#374151',
};
const errStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: 12, margin: '4px 0 0',
};
