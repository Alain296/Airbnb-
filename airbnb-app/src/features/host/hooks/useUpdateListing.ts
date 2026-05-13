import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { ListingFormData } from '../schemas/listing';

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ListingFormData>) => api.put<{ listing: any }>(`/listings/${id}`, payload),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ['listing', id] });
      const prev = qc.getQueryData<any>(['listing', id]);
      if (prev) qc.setQueryData(['listing', id], { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['listing', id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['listing', id] });
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
    },
  });
}

