import { useMemo, useState } from 'react';
import { FiEdit3, FiHome, FiMessageSquare, FiStar, FiTrendingUp } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { HostLayout } from '../components/HostLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyListings } from '../hooks/useMyListings';
import { useRespondToReview } from '../hooks/useRespondToReview';
import { api } from '../../../lib/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  hostResponse: string | null;
  hostRespondedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

function useListingReviews(listingId: string) {
  return useQuery({
    queryKey: ['reviews', listingId],
    enabled: !!listingId,
    queryFn: async () => {
      const res = await api.get<{ data: Review[] }>(`/listings/${listingId}/reviews?limit=50`);
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 30_000,
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <FiStar
          key={index}
          size={14}
          fill={index < rating ? '#f59e0b' : 'transparent'}
          color={index < rating ? '#f59e0b' : '#d1d5db'}
        />
      ))}
      <span style={{ marginLeft: 6, color: '#6b7280', fontSize: 12, fontWeight: 800 }}>{rating}.0</span>
    </span>
  );
}

function ReviewCard({ review, listingId }: { review: Review; listingId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [response, setResponse] = useState(review.hostResponse ?? '');
  const respondMutation = useRespondToReview(listingId);
  const initials = review.user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const handleSubmit = async () => {
    if (response.trim().length < 5) return;
    await respondMutation.mutateAsync({ reviewId: review.id, response });
    setShowForm(false);
  };

  return (
    <article style={reviewCard}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={avatarStyle}>
          {review.user.avatar
            ? <img src={review.user.avatar} alt={review.user.name} style={coverImage} />
            : <span>{initials || 'G'}</span>}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ margin: 0, color: '#111827', fontSize: 15, fontWeight: 900 }}>{review.user.name}</h4>
              <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>
                {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Stars rating={review.rating} />
          </div>

          <p style={{ margin: '14px 0', color: '#374151', fontSize: 14, lineHeight: 1.7 }}>
            {review.comment}
          </p>

          {review.hostResponse && (
            <div style={responseBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c65d2e', fontSize: 12, fontWeight: 900, marginBottom: 6 }}>
                <FiMessageSquare size={14} /> Public host response
                {review.hostRespondedAt && (
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>
                    {new Date(review.hostRespondedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, color: '#4b5563', fontSize: 13, lineHeight: 1.6 }}>{review.hostResponse}</p>
            </div>
          )}

          {showForm ? (
            <div style={{ marginTop: 14 }}>
              <textarea
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Write a warm public response..."
                rows={3}
                style={textareaStyle}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" disabled={response.trim().length < 5 || respondMutation.isPending} onClick={handleSubmit} style={primaryButton(response.trim().length >= 5 && !respondMutation.isPending)}>
                  {respondMutation.isPending ? 'Posting...' : 'Post response'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setResponse(review.hostResponse ?? ''); }} style={secondaryButton}>
                  Cancel
                </button>
                {respondMutation.isError && <span style={{ color: '#b91c1c', fontSize: 12 }}>{(respondMutation.error as Error).message}</span>}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowForm(true)} style={linkButton}>
              <FiEdit3 size={14} /> {review.hostResponse ? 'Edit response' : 'Respond to review'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function ListingReviews({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: reviews = [], isLoading } = useListingReviews(listingId);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const unanswered = reviews.filter((review) => !review.hostResponse).length;

  return (
    <section style={listingPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={listingIcon}><FiHome size={18} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#111827' }}>{listingTitle}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
              {reviews.length} review{reviews.length === 1 ? '' : 's'} gathered from guest stays
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={pillStyle}>{average ? average.toFixed(1) : 'New'} rating</span>
          <span style={pillStyle}>{unanswered} awaiting reply</span>
        </div>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && reviews.length === 0 && (
        <div style={emptyListing}>
          <FiMessageSquare size={30} color="#d1d5db" />
          <div>
            <strong style={{ display: 'block', color: '#374151', marginBottom: 4 }}>No guest reviews yet</strong>
            <span style={{ color: '#9ca3af', fontSize: 13 }}>Reviews and response tools will appear here after completed stays.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {reviews.map((review) => <ReviewCard key={review.id} review={review} listingId={listingId} />)}
      </div>
    </section>
  );
}

export default function HostReviewsPage() {
  const { userId } = useAuth();
  const { data: listings = [], isLoading } = useMyListings(userId);

  const summary = useMemo(() => ({
    listings: listings.length,
  }), [listings.length]);

  return (
    <HostLayout title="Guest Reviews" subtitle="Read guest feedback, track reputation, and respond publicly from one polished workspace.">
      <div style={heroPanel}>
        <div>
          <p style={eyebrow}>Review center</p>
          <h2 style={{ margin: '0 0 8px', fontSize: 28, lineHeight: 1.15, color: '#111827', fontWeight: 950 }}>
            Build trust with thoughtful public replies.
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14, lineHeight: 1.6, maxWidth: 620 }}>
            Each listing has its own review stream, response tools, and quick status indicators so you can see what needs attention.
          </p>
        </div>
        <div style={heroMetric}>
          <FiTrendingUp size={22} color="#df7442" />
          <strong>{summary.listings}</strong>
          <span>active listing{summary.listings === 1 ? '' : 's'}</span>
        </div>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && listings.length === 0 && (
        <div style={emptyState}>
          <FiHome size={54} strokeWidth={1.2} color="#d1d5db" />
          <h3 style={{ margin: '14px 0 6px', color: '#111827', fontSize: 20, fontWeight: 900 }}>No listings yet</h3>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 14 }}>Create a listing to start receiving guest reviews.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 18 }}>
        {listings.map((listing) => (
          <ListingReviews key={listing.id} listingId={String(listing.id)} listingTitle={listing.title} />
        ))}
      </div>
    </HostLayout>
  );
}

const heroPanel: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 18,
  alignItems: 'center',
  background: 'linear-gradient(135deg, #fff7f2 0%, #ffffff 58%, #f9fafb 100%)',
  border: '1px solid #f2d8cc',
  borderRadius: 16,
  padding: 24,
  marginBottom: 22,
};

const eyebrow: React.CSSProperties = {
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: 0,
  color: '#df7442',
  fontSize: 12,
  fontWeight: 900,
};

const heroMetric: React.CSSProperties = {
  minWidth: 150,
  background: 'white',
  border: '1px solid #f0e1da',
  borderRadius: 12,
  padding: 16,
  display: 'grid',
  gap: 4,
  boxShadow: '0 14px 34px rgba(31, 41, 55, 0.08)',
};

const listingPanel: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 18,
  boxShadow: '0 16px 40px rgba(31, 41, 55, 0.06)',
};

const listingIcon: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: '#fff1e8',
  color: '#df7442',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
};

const pillStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 999,
  color: '#4b5563',
  background: '#f9fafb',
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 800,
};

const reviewCard: React.CSSProperties = {
  border: '1px solid #eef0f3',
  borderRadius: 14,
  padding: 16,
  background: '#ffffff',
};

const avatarStyle: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: '50%',
  background: '#f3f4f6',
  color: '#df7442',
  display: 'grid',
  placeItems: 'center',
  fontSize: 14,
  fontWeight: 900,
  overflow: 'hidden',
  flexShrink: 0,
};

const coverImage: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const responseBox: React.CSSProperties = {
  background: '#fff7f2',
  border: '1px solid #ffd8c7',
  borderRadius: 12,
  padding: '12px 14px',
  marginBottom: 14,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  padding: '11px 12px',
  fontSize: 14,
  resize: 'vertical',
  boxSizing: 'border-box',
  marginBottom: 10,
  outline: 'none',
};

const primaryButton = (enabled: boolean): React.CSSProperties => ({
  background: '#df7442',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  padding: '9px 16px',
  fontWeight: 900,
  fontSize: 13,
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.5,
});

const secondaryButton: React.CSSProperties = {
  background: 'white',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  padding: '9px 14px',
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
};

const linkButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  background: 'white',
  border: '1px solid #ffd8c7',
  borderRadius: 10,
  padding: '8px 12px',
  color: '#c65d2e',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
};

const emptyListing: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  alignItems: 'center',
  border: '1px dashed #e5e7eb',
  borderRadius: 14,
  padding: 18,
  background: '#fbfbfc',
};

const emptyState: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  minHeight: 320,
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  marginTop: 16,
};
