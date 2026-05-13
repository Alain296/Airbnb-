import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [users, listings, bookings] = await Promise.all([
        api.get<any>('/users/stats'),
        api.get<any>('/listings/stats'),
        api.get<any>('/bookings/stats'),
      ]);
      return { users, listings, bookings };
    },
    staleTime: 60 * 1000,
  });
}

