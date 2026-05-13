import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useMyBookings(userId?: string) {
  return useQuery({
    queryKey: ['bookings', 'me', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get<{ data: any[]; meta: any }>(`/bookings/users/${userId}/bookings?limit=50&page=1`);
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

