import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  FiWifi, FiTv, FiWind, FiSun, FiDroplet, FiTruck, FiMonitor,
  FiActivity, FiUmbrella, FiHome, FiMapPin, FiAward, FiHeart,
  FiMoon, FiFileText, FiUser, FiMessageSquare, FiStar, FiAlertCircle,
} from 'react-icons/fi';
import { useListing } from '../hooks/useListing';
import { useListingReviews } from '../hooks/useListingReviews';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../../auth/hooks/useAuth';
import { Navbar } from '../../../shared/components/Navbar';
import { Footer } from '../../../shared/components/Footer';
import { Spinner } from '../../../shared/components/Spinner';
import { api } from '../../../lib/api';

const CANCELLATION_RULES: Record<string, string> = {
  FLEXIBLE:       'Full refund if cancelled 1 day before check-in.',
  MODERATE:       'Full refund if cancelled 5 days before check-in.',
  STRICT:         '50% refund if cancelled at least 7 days before check-in.',
  NON_REFUNDABLE: 'No refund on cancellation.',
  LONG_TERM:      '30-day notice required for a full refund.',
};

const AMENITY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'WiFi': FiWifi,
  'Kitchen': FiHome,
  'Free parking': FiTruck,
  'Air conditioning': FiWind,
  'Heating': FiSun,
  'Washer': FiDroplet,
  'Dryer': FiWind,
  'TV': FiTv,
  'Pool': FiDroplet,
  'Hot tub': FiDroplet,
  'Gym': FiActivity,
  'Balcony': FiUmbrella,
  'Workspace': FiMonitor,
  'Pet-friendly': FiHeart,
  'Smoke detector': FiHome,
  'First aid kit': FiActivity,
  'Beach Access': FiUmbrella,
  'Ocean Views': FiUmbrella,
  'Mountain Views': FiUmbrella,
  'Fireplace': FiSun,
  'Garden': FiUmbrella,
};

function StarRating({ rating, count, interactive, onRate }: { rating: number; count?: number; interactive?: boolean; onRate?: (rating: number) => void }) {
  const [hover, setHover] = useState(0);
  
  if (interactive && onRate) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRate(star)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: 4,
              borderRadius: 4,
              transition: 'transform 0.15s',
              transform: (hover || rating) >= star ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <FiStar
              size={40}
              fill={(hover || rating) >= star ? '#f59e0b' : 'none'}
              color={(hover || rating) >= star ? '#f59e0b' : '#d1d5db'}
              strokeWidth={2}
              style={{ transition: 'all 0.15s', display: 'block' }}
            />
          </button>
        ))}
      </div>
    );
  }
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={16}
          fill={star <= Math.round(rating) ? '#f59e0b' : 'none'}
          color={star <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
        />
      ))}
      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{rating.toFixed(1)}</span>
      {count !== undefined && <span style={{ fontSize: 13, color: '#6b7280' }}>({count} review{count !== 1 ? 's' : ''})</span>}
    </span>
  );
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggle, isSaved } = useFavorites();
  const { isAuthenticated, role } = useAuth();

  const { data: listing, isLoading, isError, error, refetch } = useListing(id ?? '');
  const { data: reviews = [], refetch: refetchReviews, isError: reviewsError } = useListingReviews(id);

  const [activeImg, setActiveImg] = useState(0);
  const [checkIn,   setCheckIn]   = useState(dayjs().add(3, 'day').format('YYYY-MM-DD'));
  const [checkOut,  setCheckOut]  = useState(dayjs().add(6, 'day').format('YYYY-MM-DD'));
  const [guests,    setGuests]    = useState(1);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const nights = useMemo(() =>
    Math.max(1, dayjs(checkOut).diff(dayjs(checkIn), 'day') || 1),
    [checkIn, checkOut],
  );

  const pricing = useMemo(() => {
    if (!listing) return { base: 0, discount: 0, discountLabel: '', serviceFee: 0, taxes: 0, total: 0 };
    const base = listing.price * nights;
    let discount = 0, discountLabel = '';
    if (nights >= 28 && listing.monthlyDiscount) {
      discount = Math.round(base * (listing.monthlyDiscount / 100));
      discountLabel = `Monthly discount (${listing.monthlyDiscount}%)`;
    } else if (nights >= 7 && listing.weeklyDiscount) {
      discount = Math.round(base * (listing.weeklyDiscount / 100));
      discountLabel = `Weekly discount (${listing.weeklyDiscount}%)`;
    }
    const extraFee = (listing.extraGuestFee && listing.baseGuests)
      ? Math.max(0, guests - listing.baseGuests) * listing.extraGuestFee * nights : 0;
    const subtotal   = base + extraFee - discount;
    const serviceFee = Math.round(subtotal * 0.12);
    const taxes      = Math.round(subtotal * 0.05);
    return { base, discount, discountLabel, serviceFee, taxes, total: subtotal + serviceFee + taxes };
  }, [listing, nights, guests]);

  const saved   = listing ? isSaved(listing.id) : false;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : (listing?.rating ?? 4.7);

  const handleSubmitReview = async () => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a rating from 1 to 5 stars');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setReviewError('Please write a review (at least 10 characters)');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      await api.post(`/listings/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      // Reset form
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      
      // Refresh reviews
      await refetchReviews();
      await refetch(); // Refresh listing to update average rating
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navbar />
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 64px)' }}><Spinner /></div>
      <Footer />
    </div>
  );

  if (isError || !listing) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navbar />
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 64px)', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <FiHome size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h2 style={{ margin: '0 0 8px' }}>Listing not found</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>{(error as Error)?.message ?? 'This listing does not exist.'}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => refetch()} style={btnPrimary}>Retry</button>
            <button onClick={() => navigate(-1)} style={btnGhost}>← Go Back</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  const gallery = (listing.images && listing.images.length >= 4)
    ? listing.images
    : [
        listing.img,
        `https://picsum.photos/seed/${listing.id}-a/1200/800`,
        `https://picsum.photos/seed/${listing.id}-b/1200/800`,
        `https://picsum.photos/seed/${listing.id}-c/1200/800`,
        `https://picsum.photos/seed/${listing.id}-d/1200/800`,
      ];

  const amenities = listing.amenities ?? [];
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px' }}>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: '#1a1a1a' }}>{listing.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <StarRating rating={avgRating} count={reviews.length} />
            <span style={{ color: '#6b7280', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiMapPin size={14} /> {listing.location}
            </span>
            {listing.superhost && (
              <span style={{ background: '#fff7f2', color: '#ff5722', border: '1px solid #ffd5c7', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiAward size={12} /> Superhost
              </span>
            )}
            {listing.type && <span style={{ background: '#f3f4f6', color: '#374151', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{listing.type}</span>}
          </div>
        </div>

        {/* Photo gallery — 1 large + 2x2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, borderRadius: 16, overflow: 'hidden', height: 460 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <img
              src={gallery[activeImg] ?? gallery[0]}
              alt={listing.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/900/600`; }}
            />
            <button
              onClick={() => toggle(listing.id, listing.title)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              <FiHeart size={20} fill={saved ? '#ff5722' : 'none'} color={saved ? '#ff5722' : '#374151'} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => setActiveImg(i)}>
                <img
                  src={gallery[i] ?? `https://picsum.photos/seed/${listing.id}-${i}/600/400`}
                  alt={`Photo ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', outline: activeImg === i ? '3px solid #ff5722' : 'none', outlineOffset: -3 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}-${i}/600/400`; }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {gallery.map((src, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              style={{ flexShrink: 0, width: 80, height: 56, borderRadius: 8, overflow: 'hidden', border: activeImg === i ? '2.5px solid #ff5722' : '2px solid #e5e7eb', padding: 0, cursor: 'pointer', background: 'none' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}-t${i}/160/112`; }} />
            </button>
          ))}
        </div>

        {/* Main content + booking card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 24, padding: '20px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 24, flexWrap: 'wrap' }}>
              {listing.guests      && <QuickStat Icon={FiUser} label={`Up to ${listing.guests} guests`} />}
              {listing.type        && <QuickStat Icon={FiHome} label={listing.type.charAt(0) + listing.type.slice(1).toLowerCase()} />}
              {listing.minNights   && <QuickStat Icon={FiMoon} label={`${listing.minNights} night min`} />}
              {listing.cancellationPolicy && <QuickStat Icon={FiFileText} label={listing.cancellationPolicy.replace('_', ' ')} />}
            </div>

            {/* Host */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
              <img src={listing.profileImg} alt={listing.hostName}
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/56?u=${listing.hostId}`; }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Hosted by {listing.hostName}</div>
                {listing.superhost && (
                  <div style={{ fontSize: 13, color: '#ff5722', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiAward size={13} /> Superhost
                  </div>
                )}
                {listing.hostBio && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{listing.hostBio}</div>}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={sectionTitle}>About this place</h2>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={sectionTitle}>What this place offers</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {visibleAmenities.map((a) => {
                    const IconComponent = AMENITY_ICONS[a] || FiHome;
                    return (
                      <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                        <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconComponent size={18} color="#374151" />
                        </div>
                        {a}
                      </div>
                    );
                  })}
                </div>
                {amenities.length > 8 && (
                  <button onClick={() => setShowAllAmenities(v => !v)}
                    style={{ marginTop: 14, background: 'white', border: '1px solid #374151', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            {/* Map */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={sectionTitle}>Where you'll be</h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiMapPin size={14} /> {listing.location}
              </p>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <iframe title="map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&z=14&output=embed&markers=color:red%7C${encodeURIComponent(listing.location)}`}
                  style={{ border: 0, width: '100%', height: 320, display: 'block' }}
                  loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>

            {/* Cancellation policy */}
            {listing.cancellationPolicy && (
              <div style={{ marginBottom: 28, background: '#f8f9fa', borderRadius: 12, padding: '18px 20px' }}>
                <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Cancellation policy</h2>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  {listing.cancellationPolicy.charAt(0) + listing.cancellationPolicy.slice(1).toLowerCase().replace('_', ' ')}
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{CANCELLATION_RULES[listing.cancellationPolicy] ?? ''}</p>
              </div>
            )}

            {/* Reviews */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ ...sectionTitle, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StarRating rating={avgRating} count={reviews.length} />
                </h2>
                {isAuthenticated && role === 'GUEST' && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={{ 
                      background: 'linear-gradient(135deg, #ff5722 0%, #ff8a50 100%)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 10, 
                      padding: '12px 24px', 
                      fontWeight: 700, 
                      fontSize: 15, 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 87, 34, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 87, 34, 0.3)';
                    }}
                  >
                    <FiStar size={16} /> Write a Review
                  </button>
                )}
              </div>

              {/* Review submission form */}
              {showReviewForm && isAuthenticated && role === 'GUEST' && (
                <div style={{ 
                  background: 'linear-gradient(135deg, #fff7f2 0%, #ffe8dc 100%)', 
                  border: '2px solid #ff5722', 
                  borderRadius: 16, 
                  padding: '28px 32px', 
                  marginBottom: 24,
                  boxShadow: '0 4px 12px rgba(255, 87, 34, 0.15)',
                }}>
                  <h3 style={{ 
                    margin: '0 0 24px', 
                    fontSize: 20, 
                    fontWeight: 800, 
                    color: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <FiStar size={22} color="#ff5722" />
                    Share your experience
                  </h3>
                  
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 15, 
                      fontWeight: 700, 
                      marginBottom: 12, 
                      color: '#374151' 
                    }}>
                      Click the stars to rate this listing *
                    </label>
                    <div style={{ 
                      background: 'white', 
                      borderRadius: 12, 
                      padding: '20px', 
                      display: 'inline-flex',
                      border: '2px solid #e5e7eb',
                    }}>
                      <StarRating rating={reviewRating} interactive onRate={setReviewRating} />
                    </div>
                    {reviewRating > 0 && (
                      <div style={{ 
                        marginTop: 8, 
                        fontSize: 14, 
                        color: '#16a34a', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <FiStar size={14} fill="#16a34a" color="#16a34a" />
                        You selected {reviewRating} star{reviewRating !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: 15, 
                      fontWeight: 700, 
                      marginBottom: 12, 
                      color: '#374151' 
                    }}>
                      Write your review * (minimum 10 characters)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us about your stay... What did you love? What could be improved?"
                      style={{ 
                        width: '100%', 
                        minHeight: 140, 
                        border: '2px solid #d1d5db', 
                        borderRadius: 12, 
                        padding: '16px 18px', 
                        fontSize: 15, 
                        fontFamily: 'inherit', 
                        resize: 'vertical', 
                        boxSizing: 'border-box',
                        lineHeight: 1.6,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff5722'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      maxLength={1000}
                    />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginTop: 8,
                    }}>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>
                        {reviewComment.length}/1000 characters
                      </div>
                      {reviewComment.length >= 10 && (
                        <div style={{ 
                          fontSize: 13, 
                          color: '#16a34a', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          ✓ Looks good!
                        </div>
                      )}
                    </div>
                  </div>

                  {reviewError && (
                    <div style={{ 
                      background: '#fee2e2', 
                      border: '2px solid #ef4444', 
                      borderRadius: 10, 
                      padding: '14px 16px', 
                      marginBottom: 16, 
                      fontSize: 14, 
                      color: '#991b1b',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <FiAlertCircle size={18} color="#991b1b" />
                      {reviewError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      style={{ 
                        background: submittingReview ? '#9ca3af' : '#ff5722', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 10, 
                        padding: '14px 32px', 
                        fontWeight: 700, 
                        fontSize: 16, 
                        cursor: submittingReview ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: submittingReview ? 'none' : '0 2px 8px rgba(255, 87, 34, 0.3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {submittingReview ? (
                        <>
                          <div style={{ 
                            width: 16, 
                            height: 16, 
                            border: '2px solid white', 
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiStar size={16} />
                          Submit Review
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(0);
                        setReviewComment('');
                        setReviewError('');
                      }}
                      disabled={submittingReview}
                      style={{ 
                        background: 'white', 
                        color: '#374151', 
                        border: '2px solid #d1d5db', 
                        borderRadius: 10, 
                        padding: '14px 24px', 
                        fontWeight: 600, 
                        fontSize: 16, 
                        cursor: submittingReview ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {reviews.length === 0 && !reviewsError && <p style={{ color: '#9ca3af', fontSize: 14 }}>No reviews yet. Be the first to review!</p>}
              {reviewsError && <p style={{ color: '#ef4444', fontSize: 14 }}>Unable to load reviews. Please try again later.</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {reviews.slice(0, 6).map((r) => (
                  <div key={r.id} style={{ background: '#f8f9fa', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                        {r.user.avatar
                          ? <img src={r.user.avatar} alt={r.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#6b7280' }}>{r.user.name.charAt(0)}</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiStar size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>{r.rating}/5</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{r.comment}</p>
                    {r.hostResponse && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#ff5722', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiMessageSquare size={11} /> Host response:
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{r.hostResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Booking card */}
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 800 }}>${listing.price}</span>
                <span style={{ fontSize: 15, color: '#6b7280' }}>/ night</span>
              </div>
              <div style={{ marginBottom: 16 }}><StarRating rating={avgRating} count={reviews.length} /></div>

              {/* Date + guests */}
              <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 14px', marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
                Select your dates on the next page after clicking Reserve.
              </div>

              {/* CTA */}
              {isAuthenticated && role === 'GUEST' ? (
                <button onClick={() => navigate(`/bookings/new/${listing.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
                  style={{ ...btnPrimary, width: '100%', padding: '14px', fontSize: 16, marginBottom: 12 }}>
                  Reserve
                </button>
              ) : isAuthenticated ? (
                <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 14px', marginBottom: 12, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                  Only guests can make bookings.
                </div>
              ) : (
                <button onClick={() => navigate('/login')}
                  style={{ ...btnPrimary, width: '100%', padding: '14px', fontSize: 16, marginBottom: 12 }}>
                  Log in to Reserve
                </button>
              )}

              <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', margin: '0 0 16px' }}>You won't be charged yet</p>

              {/* Price breakdown */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                <PriceRow label={`$${listing.price} × ${nights} night${nights > 1 ? 's' : ''}`} value={`$${listing.price * nights}`} />
                {pricing.discount > 0 && <PriceRow label={pricing.discountLabel} value={`-$${pricing.discount}`} color="#16a34a" />}
                <PriceRow label="Service fee (12%)" value={`$${pricing.serviceFee}`} />
                <PriceRow label="Taxes (5%)"        value={`$${pricing.taxes}`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 8, borderTop: '1px solid #e5e7eb', fontWeight: 800, fontSize: 16 }}>
                  <span>Total</span>
                  <span style={{ color: '#ff5722' }}>${pricing.total}</span>
                </div>
              </div>

              <button onClick={() => toggle(listing.id, listing.title)}
                style={{ ...btnGhost, width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>
            </div>

            {/* Host contact */}
            <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '16px 18px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={listing.profileImg} alt={listing.hostName}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/48?u=${listing.hostId}`; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{listing.hostName}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Host</div>
              </div>
              <button onClick={() => isAuthenticated ? navigate('/guest/messages') : navigate('/login')}
                style={{ background: 'white', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function QuickStat({ Icon, label }: { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
      <Icon size={18} color="#374151" />
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function PriceRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: color ?? '#374151' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 16px' };
const btnPrimary: React.CSSProperties = { background: '#ff5722', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, padding: '11px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' };
