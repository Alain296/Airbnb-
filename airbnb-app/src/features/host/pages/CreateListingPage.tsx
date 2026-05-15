import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { HostLayout } from '../components/HostLayout';
import { listingSchema, CANCELLATION_POLICIES, CANCELLATION_POLICY_LABELS } from '../schemas/listing';
import type { ListingFormData } from '../schemas/listing';
import { useCreateListing } from '../hooks/useCreateListing';
import { uploadListingPhotosRequest } from '../hooks/useUploadListingPhotos';
import { api } from '../../../lib/api';

const AMENITY_OPTIONS = [
  'WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'Heating',
  'Washer', 'Dryer', 'TV', 'Pool', 'Hot tub', 'Gym', 'Balcony',
  'Workspace', 'Pet-friendly', 'Smoke detector', 'First aid kit',
];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const create = useCreateListing();

  // Photo state — files chosen before the listing exists
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');

  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      amenities:          [],
      guests:             2,
      pricePerNight:      100,
      type:               'APARTMENT',
      cancellationPolicy: 'FLEXIBLE',
      isPublished:        false,
    },
  });

  const selectedAmenities = watch('amenities') ?? [];
  const title = watch('title') ?? '';
  const location = watch('location') ?? '';
  const type = watch('type') ?? 'APARTMENT';
  const guests = watch('guests') ?? 2;
  const pricePerNight = watch('pricePerNight') ?? 100;

  const generateListingDescription = async () => {
    setDescriptionError('');

    if (!title.trim() || !location.trim() || !type || !guests || !pricePerNight) {
      setDescriptionError('Add the title, location, property type, guests, and price first.');
      return '';
    }

    setGeneratingDescription(true);
    try {
      const res = await api.post<{ description: string }>('/ai/generate-description', {
        title,
        location,
        type,
        guests,
        pricePerNight,
        amenities: selectedAmenities,
        tone: 'friendly',
      });

      setValue('description', res.description, { shouldValidate: true, shouldDirty: true });
      return res.description;
    } catch (err) {
      const message = (err as Error).message || 'Could not generate a description right now.';
      setDescriptionError(message);
      return '';
    } finally {
      setGeneratingDescription(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const current = selectedAmenities;
    setValue(
      'amenities',
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
      { shouldValidate: true },
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const files = Array.from(e.target.files ?? []);
    const valid: File[] = [];

    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setPhotoError('Only JPEG, PNG, and WebP images are allowed.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Each photo must be under 5MB.');
        continue;
      }
      valid.push(file);
    }

    const canAdd = 5 - pendingPhotos.length;
    const toAdd = valid.slice(0, canAdd);
    if (valid.length > canAdd) {
      setPhotoError(`Maximum 5 photos allowed. Only ${canAdd} more can be added.`);
    }

    setPendingPhotos((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]!);
    setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ListingFormData) => {
    let payload = values;
    if (!String(values.description ?? '').trim()) {
      const generatedDescription = await generateListingDescription();
      if (!generatedDescription) return;
      payload = { ...values, description: generatedDescription };
    }

    // 1. Create the listing
    const res = await create.mutateAsync(payload);
    const newId: string = (res as any)?.listing?.id ?? '';

    // 2. Upload photos if any were selected
    if (newId && pendingPhotos.length > 0) {
      setUploadingPhotos(true);
      try {
        await uploadListingPhotosRequest(newId, pendingPhotos);
      } catch {
        // Photos failed but listing was created — navigate anyway
      } finally {
        setUploadingPhotos(false);
      }
    }

    navigate('/host/dashboard');
  };

  return (
    <HostLayout title="Create Listing" subtitle="Submit your property for admin review before guests can see it.">

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'grid', gap: 20 }}
        >
          {/* ── Section: Basic Info ─────────────────────────────── */}
          <Section title="Basic Information">
            <Field label="Title" err={errors.title?.message}>
              <input {...register('title')} placeholder="e.g. Cozy beachfront apartment in Cape Town" style={inp} />
            </Field>
            <Field label="Description" err={errors.description?.message || descriptionError}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#666' }}>
                  Generate it from the property details, or edit it after generation.
                </span>
                <button
                  type="button"
                  onClick={generateListingDescription}
                  disabled={generatingDescription}
                  style={{
                    ...btnGhost,
                    padding: '8px 12px',
                    fontSize: 12,
                    opacity: generatingDescription ? 0.65 : 1,
                    cursor: generatingDescription ? 'wait' : 'pointer',
                  }}
                >
                  {generatingDescription ? 'Generating...' : 'Generate description'}
                </button>
              </div>
              <textarea
                {...register('description')}
                placeholder="Describe your property — what makes it special, nearby attractions, house rules..."
                style={{ ...inp, minHeight: 130, resize: 'vertical' }}
              />
            </Field>
            <Field label="Location" err={errors.location?.message}>
              <input {...register('location')} placeholder="e.g. Cape Town, South Africa" style={inp} />
            </Field>
          </Section>

          {/* ── Section: Property Details ───────────────────────── */}
          <Section title="Property Details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Price per night ($)" err={errors.pricePerNight?.message}>
                <input type="number" min={10} {...register('pricePerNight', { valueAsNumber: true })} style={inp} />
              </Field>
              <Field label="Max guests" err={errors.guests?.message}>
                <input type="number" min={1} max={16} {...register('guests', { valueAsNumber: true })} style={inp} />
              </Field>
              <Field label="Property type" err={errors.type?.message}>
                <select {...register('type')} style={inp}>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CABIN">Cabin</option>
                  <option value="CONDO">Condo</option>
                  <option value="STUDIO">Studio</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Section: Pricing Options ────────────────────────── */}
          <Section title="Pricing Options">
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>
              Optional — leave blank to use base price for all nights.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Weekend price / night ($)" err={errors.weekendPrice?.message}>
                <input type="number" min={10} placeholder="e.g. 150" {...register('weekendPrice', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })} style={inp} />
              </Field>
              <Field label="Base guests (included in price)" err={errors.baseGuests?.message}>
                <input type="number" min={1} placeholder="e.g. 2" {...register('baseGuests', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })} style={inp} />
              </Field>
              <Field label="Extra guest fee / night ($)" err={errors.extraGuestFee?.message}>
                <input type="number" min={0} placeholder="e.g. 20" {...register('extraGuestFee', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })} style={inp} />
              </Field>
              <Field label="Weekly discount (%)" err={errors.weeklyDiscount?.message}>
                <input type="number" min={0} max={100} placeholder="e.g. 10" {...register('weeklyDiscount', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })} style={inp} />
              </Field>
              <Field label="Monthly discount (%)" err={errors.monthlyDiscount?.message}>
                <input type="number" min={0} max={100} placeholder="e.g. 20" {...register('monthlyDiscount', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })} style={inp} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Minimum nights" err={errors.minNights?.message}>
                <input type="number" min={1} {...register('minNights', { valueAsNumber: true })} style={inp} />
              </Field>
              <Field label="Maximum nights (optional)" err={errors.maxNights?.message}>
                <input type="number" min={1} placeholder="No limit" {...register('maxNights', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })} style={inp} />
              </Field>
            </div>
          </Section>

          {/* ── Section: Amenities ──────────────────────────────── */}
          <Section title="Amenities">
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#666' }}>
              Select all that apply. At least one required.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {AMENITY_OPTIONS.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1.5px solid ${checked ? '#ff5722' : '#e5e7eb'}`,
                      background: checked ? '#fff7f2' : 'white',
                      color: checked ? '#ff5722' : '#374151',
                      fontWeight: checked ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {checked ? '✓ ' : ''}{amenity}
                  </button>
                );
              })}
            </div>
            {/* Custom amenity input */}
            <div style={{ marginTop: 10 }}>
              <input
                placeholder="Add custom amenity and press Enter"
                style={{ ...inp, marginTop: 0 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !selectedAmenities.includes(val)) {
                      setValue('amenities', [...selectedAmenities, val], { shouldValidate: true });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
            {/* Show custom amenities */}
            {selectedAmenities.filter((a) => !AMENITY_OPTIONS.includes(a)).length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {selectedAmenities
                  .filter((a) => !AMENITY_OPTIONS.includes(a))
                  .map((a) => (
                    <span
                      key={a}
                      style={{ background: '#fff7f2', border: '1px solid #ff5722', color: '#ff5722', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => setValue('amenities', selectedAmenities.filter((x) => x !== a), { shouldValidate: true })}
                        style={{ background: 'none', border: 'none', color: '#ff5722', cursor: 'pointer', marginLeft: 4, padding: 0, fontWeight: 700 }}
                      >×</button>
                    </span>
                  ))}
              </div>
            )}
            {errors.amenities && (
              <p style={{ color: '#dc2626', fontSize: 12, margin: '6px 0 0' }}>
                {errors.amenities.message as string}
              </p>
            )}
          </Section>

          {/* ── Section: Photos ─────────────────────────────────── */}
          <Section title="Photos">
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#666' }}>
              Add up to 5 photos. JPEG, PNG, or WebP · max 5MB each.
              Photos will be uploaded after the listing is created.
            </p>

            {photoPreviews.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {photoPreviews.map((src, i) => (
                  <div key={src} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      style={{ width: 110, height: 78, objectFit: 'cover', borderRadius: 8, border: '2px dashed #ff5722' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: -7, right: -7,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#6b7280', color: 'white',
                        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {photoError && <p style={{ color: '#dc2626', fontSize: 12, margin: '0 0 8px' }}>{photoError}</p>}

            {pendingPhotos.length < 5 && (
              <label style={{ ...btnGhost, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                📷 Choose Photos ({pendingPhotos.length}/5)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </Section>

          {/* ── Section: Cancellation Policy ────────────────────── */}
          <Section title="Cancellation Policy">
            <div style={{ display: 'grid', gap: 8 }}>
              {CANCELLATION_POLICIES.map((policy) => {
                const checked = watch('cancellationPolicy') === policy;
                return (
                  <label
                    key={policy}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `1.5px solid ${checked ? '#ff5722' : '#e5e7eb'}`,
                      background: checked ? '#fff7f2' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      value={policy}
                      {...register('cancellationPolicy')}
                      style={{ marginTop: 2, accentColor: '#ff5722' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: checked ? '#ff5722' : '#1a1a1a' }}>
                        {policy.charAt(0) + policy.slice(1).toLowerCase().replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        {CANCELLATION_POLICY_LABELS[policy]}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.cancellationPolicy && (
              <p style={{ color: '#dc2626', fontSize: 12, margin: '6px 0 0' }}>
                {errors.cancellationPolicy.message}
              </p>
            )}
          </Section>

          {/* ── Section: Approval Status ─────────────────────────── */}
          <Section title="Approval Status">
            <div style={{ padding: '14px 16px', borderRadius: 10, border: '1.5px solid #fbbf24', background: '#fffbeb' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>
                Pending admin review
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                After you submit, an admin must approve and publish this listing before guests can find or book it.
              </div>
            </div>
          </Section>

          {/* ── Submit ──────────────────────────────────────────── */}
          {create.isError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: 13 }}>
                {(create.error as Error).message}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={create.isPending || uploadingPhotos}
              style={{
                ...btnPrimary,
                opacity: create.isPending || uploadingPhotos ? 0.6 : 1,
                cursor: create.isPending || uploadingPhotos ? 'not-allowed' : 'pointer',
              }}
            >
              {create.isPending
                ? 'Creating listing...'
                : uploadingPhotos
                  ? 'Uploading photos...'
                  : 'Submit for Review'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/host/dashboard')}
              style={btnGhost}
            >
              Cancel
            </button>
          </div>
        </form>
    </HostLayout>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 20px 16px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1a1a1a', borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children, err }: { label: string; children: React.ReactNode; err?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 4 }}>
        {label}
      </label>
      {children}
      {err && <p style={{ color: '#dc2626', margin: '4px 0 0', fontSize: 12 }}>{err}</p>}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  marginTop: 2,
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  background: '#ff5722',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '11px 24px',
  fontWeight: 700,
  fontSize: 14,
};

const btnGhost: React.CSSProperties = {
  background: 'white',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  padding: '11px 20px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};
