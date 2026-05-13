import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface ListingReview {
  id:             string;
  rating:         number;
  comment:        string;
  hostResponse:   string | null;
  createdAt:      string;
  user: { id: string; name: string; avatar: string | null };
}

export function useListingReviews(listingId?: string) {
  return useQuery({
    queryKey: ['reviews', listingId],
    enabled:  !!listingId,
    queryFn:  async () => {
      const res = await api.get<{ data: ListingReview[] }>(
        `/listings/${listingId}/reviews?limit=10&page=1`,
      );
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 60_000,
  });
}
