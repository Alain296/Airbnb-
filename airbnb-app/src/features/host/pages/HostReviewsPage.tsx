import { useState } from 'react';
import { HostLayout } from '../components/HostLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMyListings } from '../hooks/useMyListings';
import { useRespondToReview } from '../hooks/useRespondToReview';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  hostResponse: string | null;
  hostRespondedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  listing?: { id: string; title: string };
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

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 14 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      <span style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>{rating}/5</span>
    </span>
  );
}

function ReviewCard({
  review,
  listingId,
}: {
  review: Review;
  listingId: string;
}) {
  const [showForm, setShowForm]   = useState(false);
  const [response, setResponse]   = useState(review.hostResponse ?? '');
  const respondMutation = useRespondToReview(listingId);

  const handleSubmit = async () => {
    if (response.trim().length < 5) return;
    await respondMutation.mutateAsync({ reviewId: review.id, response });
    setShowForm(false);
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 18,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Guest info + rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#e5e7eb', overflow: 'hidden', flexShrink: 0,
        }}>
          {review.user.avatar
            ? <img src={review.user.avatar} alt={review.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700, color: '#6b7280' }}>
                {review.user.name.charAt(0).toUpperCase()}
              </div>
          }
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{review.user.name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StarRating rating={review.rating} />
        </div>
      </div>

      {/* Review comment */}
      <p style={{ margin: '0 0 12px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
        {review.comment}
      </p>

      {/* Existing host response */}
      {review.hostResponse && (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ff5722', marginBottom: 4 }}>
            🏠 Host response
            {review.hostRespondedAt && (
              <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>
                · {new Date(review.hostRespondedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
            {review.hostResponse}
          </p>
        </div>
      )}

      {/* Response form */}
      {showForm ? (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write a public response to this review…"
            rows={3}
            style={{
              width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
              padding: '10px 12px', fontSize: 13, resize: 'vertical',
              boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              disabled={response.trim().length < 5 || respondMutation.isPending}
              onClick={handleSubmit}
              style={{
                background: '#ff5722', color: 'white', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer',
                opacity: response.trim().length < 5 || respondMutation.isPending ? 0.5 : 1,
              }}
            >
              {respondMutation.isPending ? 'Posting…' : 'Post Response'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setResponse(review.hostResponse ?? ''); }}
              style={{
                background: 'white', color: '#374151', border: '1px solid #d1d5db',
                borderRadius: 8, padding: '8px 14px', fontWeight: 600,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            {respondMutation.isError && (
              <span style={{ color: '#dc2626', fontSize: 12 }}>
                {(respondMutation.error as Error).message}
              </span>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '6px 14px', fontSize: 12, fontWeight: 600,
            color: '#ff5722', cursor: 'pointer',
          }}
        >
          {review.hostResponse ? '✏️ Edit response' : '💬 Respond to review'}
        </button>
      )}
    </div>
  );
}

function ListingReviews({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: reviews = [], isLoading } = useListingReviews(listingId);

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a' }}>
        🏠 {listingTitle}
        <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af', marginLeft: 8 }}>
          ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
        </span>
      </h3>

      {isLoading && <Spinner />}

      {!isLoading && reviews.length === 0 && (
        <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>No reviews yet for this listing.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} listingId={listingId} />
        ))}
      </div>
    </div>
  );
}

export default function HostReviewsPage() {
  const { userId } = useAuth();
  const { data: listings = [], isLoading } = useMyListings(userId);

  return (
    <HostLayout title="Guest Reviews" subtitle="Read guest reviews and respond publicly to build trust with future guests.">

        {isLoading && <Spinner />}

        {!isLoading && listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>No listings yet</p>
            <p style={{ fontSize: 13, margin: 0 }}>Create a listing to start receiving reviews.</p>
          </div>
        )}

        {listings.map((listing) => (
          <ListingReviews
            key={listing.id}
            listingId={String(listing.id)}
            listingTitle={listing.title}
          />
        ))}
    </HostLayout>
  );
}
