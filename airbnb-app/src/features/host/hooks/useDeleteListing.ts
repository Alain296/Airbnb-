import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/listings/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['listings', 'mine'] });
      const prev = qc.getQueryData<any[]>(['listings', 'mine']) ?? [];
      qc.setQueryData<any[]>(['listings', 'mine'], prev.filter((l) => String(l.id) !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['listings', 'mine'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

