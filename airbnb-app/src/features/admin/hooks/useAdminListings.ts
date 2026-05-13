import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useAdminListings() {
  return useQuery({
    queryKey: ['admin', 'listings'],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>('/listings?limit=100&page=1');
      return res.data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useToggleListingPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      api.put<any>(`/listings/${id}`, { isPublished }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'listings'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useAdminDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'listings'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
