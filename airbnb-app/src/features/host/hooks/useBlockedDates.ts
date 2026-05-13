import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface BlockedDatesResponse {
  manual:    { id: string; date: string }[];
  bookings:  string[];
  minNights: number;
  maxNights: number | null;
}

export function useBlockedDates(listingId: string) {
  return useQuery({
    queryKey: ['blocked-dates', listingId],
    enabled:  !!listingId,
    queryFn:  () => api.get<BlockedDatesResponse>(`/listings/${listingId}/blocked-dates`),
    staleTime: 30_000,
  });
}

export function useSetBlockedDates(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dates: string[]) =>
      api.put<{ message: string; count: number }>(`/listings/${listingId}/blocked-dates`, { dates }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-dates', listingId] });
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}
