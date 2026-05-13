import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<{ message: string }>(`/bookings/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['bookings', 'me'] });
      const previousEntries = queryClient.getQueriesData<any[]>({ queryKey: ['bookings', 'me'] });
      previousEntries.forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        queryClient.setQueryData(
          key,
          data.filter((b) => b.id !== id),
        );
      });
      return { previousEntries };
    },
    onError: (_error, _id, context) => {
      context?.previousEntries?.forEach(([key, data]: [unknown, unknown]) => {
        queryClient.setQueryData(key as any, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

