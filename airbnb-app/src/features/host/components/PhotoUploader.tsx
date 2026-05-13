import { useRef, useState } from 'react';
import { useUploadListingPhotos, useDeleteListingPhoto } from '../hooks/useUploadListingPhotos';

interface ExistingPhoto {
  id: string;
  url: string;
}

interface Props {
  listingId: string;
  existingPhotos?: ExistingPhoto[];
}

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;

export function PhotoUploader({ listingId, existingPhotos = [] }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; previewUrl: string }[]>([]);
  const [fileError, setFileError] = useState('');

  const uploadMutation = useUploadListingPhotos(listingId);
  const deleteMutation = useDeleteListingPhoto(listingId);

  const totalCount = existingPhotos.length + previews.length;
  const remaining = MAX_PHOTOS - existingPhotos.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    // Validate each file
    const valid: File[] = [];
    for (const file of selected) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setFileError('Only JPEG, PNG, and WebP images are allowed.');
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setFileError(`Each photo must be under ${MAX_SIZE_MB}MB.`);
        continue;
      }
      valid.push(file);
    }

    // Respect the 5-photo cap
    const canAdd = Math.max(0, remaining - previews.length);
    const toAdd = valid.slice(0, canAdd);

    if (valid.length > canAdd) {
      setFileError(`You can only add ${canAdd} more photo${canAdd !== 1 ? 's' : ''} (max ${MAX_PHOTOS} total).`);
    }

    const newPreviews = toAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]!.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (!previews.length) return;
    await uploadMutation.mutateAsync(previews.map((p) => p.file));
    // Clean up object URLs
    previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPreviews([]);
  };

  return (
    <div>
      {/* Existing photos from the server */}
      {existingPhotos.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px', fontWeight: 600 }}>
            Uploaded photos ({existingPhotos.length}/{MAX_PHOTOS})
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {existingPhotos.map((photo) => (
              <div key={photo.id} style={{ position: 'relative' }}>
                <img
                  src={photo.url}
                  alt="Listing photo"
                  style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <button
                  type="button"
                  title="Delete photo"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(photo.id)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#ef4444', color: 'white',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New photo previews (not yet uploaded) */}
      {previews.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px', fontWeight: 600 }}>
            Ready to upload ({previews.length})
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {previews.map((p, i) => (
              <div key={p.previewUrl} style={{ position: 'relative' }}>
                <img
                  src={p.previewUrl}
                  alt="Preview"
                  style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px dashed #ff5722' }}
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#6b7280', color: 'white',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {fileError && (
        <p style={{ color: '#dc2626', fontSize: 12, margin: '0 0 8px' }}>{fileError}</p>
      )}

      {/* Upload mutation error */}
      {uploadMutation.isError && (
        <p style={{ color: '#dc2626', fontSize: 12, margin: '0 0 8px' }}>
          Upload failed: {(uploadMutation.error as Error).message}
        </p>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* File picker — hidden, triggered by button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {totalCount < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={btnGhost}
          >
            📷 Choose Photos
          </button>
        )}

        {previews.length > 0 && (
          <button
            type="button"
            disabled={uploadMutation.isPending}
            onClick={handleUpload}
            style={{
              ...btnUpload,
              opacity: uploadMutation.isPending ? 0.6 : 1,
              cursor: uploadMutation.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {uploadMutation.isPending
              ? 'Uploading...'
              : `Upload ${previews.length} photo${previews.length > 1 ? 's' : ''}`}
          </button>
        )}

        {uploadMutation.isSuccess && (
          <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
            ✓ Photos uploaded
          </span>
        )}

        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {totalCount}/{MAX_PHOTOS} photos · JPEG, PNG, WebP · max {MAX_SIZE_MB}MB each
        </span>
      </div>
    </div>
  );
}

const btnGhost: React.CSSProperties = {
  background: 'white',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '8px 14px',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};

const btnUpload: React.CSSProperties = {
  background: '#ff5722',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontWeight: 700,
  fontSize: 13,
};
