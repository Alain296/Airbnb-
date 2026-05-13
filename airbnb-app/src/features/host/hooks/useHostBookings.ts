import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useHostBookings(hostListingIds: string[]) {
  return useQuery({
    queryKey: ['bookings', 'host', hostListingIds.sort().join(',')],
    enabled: hostListingIds.length > 0,
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/bookings?limit=50&page=1');
      const rows = Array.isArray(res?.data) ? res.data : [];
      const set = new Set(hostListingIds);
      return rows.filter((b) => set.has(String(b.listingId ?? b.listing?.id)));
    },
    staleTime: 60 * 1000,
  });
}

