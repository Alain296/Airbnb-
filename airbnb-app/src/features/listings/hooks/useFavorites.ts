import toast from 'react-hot-toast';
import { useStore } from '../../../store/StoreContext';
import type { Listing } from '../types';
import { rememberSavedListing, useSaved, useToggleSaved } from './useToggleSaved';

interface UseFavoritesReturn {
  toggle: (id: string, title: string, listing?: Listing) => void;
  isSaved: (id: string) => boolean;
  count: number;
}

export function useFavorites(): UseFavoritesReturn {
  const { state, dispatch } = useStore();
  const { data: savedIds = [] } = useSaved();
  const toggleSaved = useToggleSaved();

  const isSaved = (id: string): boolean => savedIds.includes(id);

  const toggle = (id: string, title: string, listing?: Listing): void => {
    const saving = !isSaved(id);
    if (saving && listing) rememberSavedListing(listing);
    toggleSaved.mutate(id);

    // keep existing dashboard/store behavior in sync during migration
    dispatch({ type: 'TOGGLE_FAVORITE', payload: id });

    if (saving) {
      toast.success(`Saved: ${title}`);
    } else {
      toast(`Removed: ${title}`);
    }
  };

  return { toggle, isSaved, count: savedIds.length || state.saved.length };
}
