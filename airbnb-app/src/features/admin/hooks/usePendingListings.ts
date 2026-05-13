import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { mapApiListingToListing } from '../../listings/utils/adapters';

export function usePendingListings() {
  return useQuery({
    queryKey: ['listings', 'pending'],
    queryFn: async () => {
      // Backend currently has no pending status on Listing model.
      // We treat all listings as moderation candidates.
      const res = await api.get<{ data: any[] }>('/listings?limit=100&page=1');
      return (res.data ?? []).map(mapApiListingToListing);
    },
    staleTime: 30 * 1000,
  });
}

