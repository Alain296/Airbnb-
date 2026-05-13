import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { mapApiListingToListing } from '../utils/adapters';

export function useListing(id?: string) {
  return useQuery({
    queryKey: ['listing', id],
    enabled: !!id,
    queryFn: async () => {
      // Fetch listing with full details including photos and host
      const row = await api.get<any>(`/listings/${id}`);
      return mapApiListingToListing(row);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
