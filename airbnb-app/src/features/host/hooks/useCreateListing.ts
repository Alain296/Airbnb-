import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { ListingFormData } from '../schemas/listing';

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ListingFormData) => api.post<{ listing: any }>('/listings', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

