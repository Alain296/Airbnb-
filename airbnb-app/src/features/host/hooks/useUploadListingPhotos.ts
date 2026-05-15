import { useMutation, useQueryClient } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

/**
 * Photo upload uses raw fetch with FormData — NOT api.post() —
 * because multipart/form-data must NOT have a Content-Type header set manually
 * (the browser sets it automatically with the correct boundary).
 */
export async function uploadListingPhotosRequest(listingId: string, files: File[]) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const res = await fetch(`${BASE_URL}/listings/${listingId}/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function deletePhoto(listingId: string, photoId: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/listings/${listingId}/photos/${photoId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export function useUploadListingPhotos(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadListingPhotosRequest(listingId, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
    },
  });
}

export function useDeleteListingPhoto(listingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => deletePhoto(listingId, photoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
    },
  });
}
