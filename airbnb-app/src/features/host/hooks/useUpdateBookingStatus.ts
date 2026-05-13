import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.patch<{ message: string }>(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      // Invalidate all booking-related queries so the UI refreshes
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
