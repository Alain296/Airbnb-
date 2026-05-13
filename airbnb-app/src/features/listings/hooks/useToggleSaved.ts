import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

const SAVED_KEY = 'airbnb-saved';

function readSavedLocal(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeSavedLocal(ids: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

export function useSaved() {
  return useQuery({
    queryKey: ['saved'],
    queryFn: async () => readSavedLocal(),
    initialData: readSavedLocal(),
    staleTime: Infinity,
  });
}

export function useToggleSaved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.post(`/saved/${id}`, {});
      } catch (e) {
        // Backend currently may not expose /saved yet; keep local optimistic state.
        const msg = (e as Error).message || '';
        if (!msg.includes('404')) throw e;
      }
      return { id };
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['saved'] });
      const previous = queryClient.getQueryData<string[]>(['saved']) ?? readSavedLocal();
      const next = previous.includes(id)
        ? previous.filter((x) => x !== id)
        : [...previous, id];
      queryClient.setQueryData(['saved'], next);
      writeSavedLocal(next);
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['saved'], context.previous);
        writeSavedLocal(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}

