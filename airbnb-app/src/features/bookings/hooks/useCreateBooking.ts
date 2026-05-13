import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export type CreateBookingPayload = {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      api.post<{ message: string; booking: any }>('/bookings', payload),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId] });
    },
  });
}

