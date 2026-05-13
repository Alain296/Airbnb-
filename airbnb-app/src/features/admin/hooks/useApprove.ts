import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/listings/${id}`, { rating: 5 }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['listings', 'pending'] });
      const prev = qc.getQueryData<any[]>(['listings', 'pending']) ?? [];
      qc.setQueryData<any[]>(['listings', 'pending'], prev.filter((l) => String(l.id) !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['listings', 'pending'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['listings', 'pending'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

