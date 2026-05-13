import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface ModifyBookingPayload {
  checkIn:  string;
  checkOut: string;
  guests:   number;
}

export function useModifyBooking(bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ModifyBookingPayload) =>
      api.patch<{ message: string; booking: any }>(`/bookings/${bookingId}/modify`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
