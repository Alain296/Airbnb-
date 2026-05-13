import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useRespondToReview(listingId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: string; response: string }) =>
      api.patch<{ message: string; review: any }>(`/reviews/${reviewId}/response`, { response }),
    onSuccess: () => {
      // Invalidate reviews for this listing so the response shows immediately
      if (listingId) qc.invalidateQueries({ queryKey: ['reviews', listingId] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
