import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { ReviewData } from '../schemas/booking';

export function useSubmitReview(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewData) =>
      api.post<{ message: string; review: any }>(`/listings/${listingId}/reviews`, {
        // API only stores overall rating + comment — sub-ratings stored client-side for now
        rating:  data.overall,
        comment: data.comment,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', listingId] });
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
