import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { mapApiListingToListing } from '../utils/adapters';

type ListingsApiResponse = {
  data: any[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useListings(limit = 50) {
  return useQuery({
    queryKey: ['listings', { limit }],
    queryFn: async () => {
      const res = await api.get<ListingsApiResponse>(`/listings?limit=${limit}&page=1`);
      const rows = Array.isArray(res?.data) ? res.data : [];
      return rows.map(mapApiListingToListing);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
