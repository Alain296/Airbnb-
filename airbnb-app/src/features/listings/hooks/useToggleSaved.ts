import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Listing } from '../types';

const SAVED_KEY = 'airbnb-saved';
const SAVED_LISTINGS_KEY = 'airbnb-saved-listings';

export type SavedListingSnapshot = Pick<
  Listing,
  'id' | 'title' | 'location' | 'price' | 'img' | 'rating'
>;

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
  localStorage.setItem(SAVED_KEY, JSON.stringify([...new Set(ids)]));
}

export function readSavedListingSnapshots(): SavedListingSnapshot[] {
  try {
    const raw = localStorage.getItem(SAVED_LISTINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is SavedListingSnapshot =>
        Boolean(item?.id && item?.title && item?.location && item?.img),
      )
      .map((item) => ({
        id: String(item.id),
        title: String(item.title),
        location: String(item.location),
        price: Number(item.price) || 0,
        img: String(item.img),
        rating: Number(item.rating) || 0,
      }));
  } catch {
    return [];
  }
}

function writeSavedListingSnapshots(listings: SavedListingSnapshot[]) {
  localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(listings));
}

export function rememberSavedListing(listing: Listing) {
  const snapshots = readSavedListingSnapshots();
  const next: SavedListingSnapshot = {
    id: listing.id,
    title: listing.title,
    location: listing.location,
    price: listing.price,
    img: listing.img,
    rating: listing.rating,
  };

  writeSavedListingSnapshots([
    next,
    ...snapshots.filter((item) => item.id !== listing.id),
  ]);
}

function forgetSavedListing(id: string) {
  writeSavedListingSnapshots(readSavedListingSnapshots().filter((item) => item.id !== id));
}

function syncSavedLocal(id: string, previous = readSavedLocal()) {
  const next = previous.includes(id)
    ? previous.filter((savedId) => savedId !== id)
    : [...previous, id];

  writeSavedLocal(next);
  if (!next.includes(id)) forgetSavedListing(id);

  return { previous, next };
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
      return { id };
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['saved'] });
      const previous = queryClient.getQueryData<string[]>(['saved']) ?? readSavedLocal();
      const { next } = syncSavedLocal(id, previous);

      queryClient.setQueryData(['saved'], next);
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

