import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { mapApiListingToListing } from '../../listings/utils/adapters';

export function useMyListings(userId?: string) {
  return useQuery({
    queryKey: ['listings', 'mine', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/listings?limit=50&page=1');
      const rows = Array.isArray(res?.data) ? res.data : [];
      return rows
        .filter((l) => l.host?.id === userId)
        .map(mapApiListingToListing);
    },
    staleTime: 60 * 1000,
  });
}

