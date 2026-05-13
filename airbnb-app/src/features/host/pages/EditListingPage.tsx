import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { HostLayout } from '../components/HostLayout';
import { Spinner } from '../../../shared/components/Spinner';
import { listingSchema, CANCELLATION_POLICIES, CANCELLATION_POLICY_LABELS } from '../schemas/listing';
import type { ListingFormData } from '../schemas/listing';
import { useUpdateListing } from '../hooks/useUpdateListing';
import { useListing } from '../../listings/hooks/useListing';
import { PhotoUploader } from '../components/PhotoUploader';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';

const AMENITY_OPTIONS = [
  'WiFi', 'Kitchen', 'Free parking', 'Air conditioning', 'Heating',
  'Washer', 'Dryer', 'TV', 'Pool', 'Hot tub', 'Gym', 'Balcony',
  'Workspace', 'Pet-friendly', 'Smoke detector', 'First aid kit',
];

export default function EditListingPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: listing, isLoading, isError } = useListing(id);
  const update = useUpdateListing(id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      amenities:          [],
      guests:             2,
      pricePerNight:      100,
      type:               'APARTMENT',
      cancellationPolicy: 'FLEXIBLE',
      isPublished:        true,
    },
  });

  // Populate form once listing data arrives
  useEffect(() => {
    if (!listing) return;
    reset({
      title:              listing.title ?? '',
      description:        (listing as any).description ?? '',
      location:           listing.location ?? '',
      pricePerNight:      listing.price ?? 100,
      weekendPrice:       (listing as any).weekendPrice ?? undefined,
      weeklyDiscount:     (listing as any).weeklyDiscount ?? undefined,
      monthlyDiscount:    (listing as any).monthlyDiscount ?? undefined,
      extraGuestFee:      (listing as any).extraGuestFee ?? undefined,
      baseGuests:         (listing as any).baseGuests ?? undefined,
      guests:             (listing as any).guests ?? 2,
      type:               ((listing as any).type ?? 'APARTMENT') as ListingFormData['type'],
      amenities:          (listing as any).amenities ?? [],
      cancellationPolicy: ((listing as any).cancellationPolicy ?? 'FLEXIBLE') as ListingFormData['cancellationPolicy'],
      isPublished:        (listing as any).isPublished ?? true,
      minNights:          (listing as any).minNights ?? 1,
      maxNights:          (listing as any).maxNights ?? undefined,
      rating:             listing.rating ?? undefined,
    });
  }, [listing, reset]);

  const selectedAmenities = watch('amenities') ?? [];
  const isPublished = watch('isPublished');

  const toggleAmenity = (amenity: string) => {
    setValue(
      'amenities',
      selectedAmenities.includes(amenity)
        ? selectedAmenities.filter((a) => a !== amenity)
        : [...selectedAmenities, amenity],
      { shouldValidate: true },
    );
  };

  const onSubmit = async (values: ListingFormData) => {
    await update.mutateAsync(values);
    navigate('/host/dashboard');
  };

  // ── Loading / error states ──────────────────────────────────────────
  if (isLoading) {
    return (
      <HostLayout title="Edit Listing">
        <div style={{ display: 'grid', placeItems: 'center', padding: '60px 0' }}>
          <Spinner />
        </div>
      </HostLayout>
    );
  }

  if (isError || !listing) {
    return (
      <HostLayout title="Edit Listing">
        <p style={{ color: '#dc2626' }}>Failed to load listing.</p>
        <button onClick={() => navigate('/host/dashboard')} style={btnGhost}>← Back to dashboard</button>
      </HostLayout>
    );
  }

  const existingPhotos: { id: string; url: string }[] =
    (listing as any).photos ?? [];

  return (
    <HostLayout title="Edit Listing" subtitle={listing.title}>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 20 }}>

          {/* ── Basic Info ──────────────────────────────────────── */}
          <Section title="Basic Information">
            <Field label="Title" err={errors.title?.message}>
              <input {...register('title')} style={inp} />
            </Field>
            <Field label="Description" err={errors.description?.message}>
              <textarea {...register('description')} style={{ ...inp, minHeight: 130, resize: 'vertical' }} />
            </Field>
            <Field label="Location" err={errors.location?.message}>
              <input {...register('location')} style={inp} />
            </Field>
          </Section>

          {/* ── Property Details ────────────────────────────────── */}
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

          {/* ── Pricing Options ─────────────────────────────────── */}
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

          {/* ── Amenities ───────────────────────────────────────── */}
          <Section title="Amenities">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {AMENITY_OPTIONS.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    style={{
                      padding: '8px 10px', borderRadius: 8,
                      border: `1.5px solid ${checked ? '#ff5722' : '#e5e7eb'}`,
                      background: checked ? '#fff7f2' : 'white',
                      color: checked ? '#ff5722' : '#374151',
                      fontWeight: checked ? 700 : 500,
                      fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {checked ? '✓ ' : ''}{amenity}
                  </button>
                );
              })}
            </div>
            <input
              placeholder="Add custom amenity and press Enter"
              style={{ ...inp, marginTop: 10 }}
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
            {selectedAmenities.filter((a) => !AMENITY_OPTIONS.includes(a)).length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {selectedAmenities.filter((a) => !AMENITY_OPTIONS.includes(a)).map((a) => (
                  <span key={a} style={{ background: '#fff7f2', border: '1px solid #ff5722', color: '#ff5722', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                    {a}
                    <button type="button" onClick={() => setValue('amenities', selectedAmenities.filter((x) => x !== a), { shouldValidate: true })} style={{ background: 'none', border: 'none', color: '#ff5722', cursor: 'pointer', marginLeft: 4, padding: 0, fontWeight: 700 }}>×</button>
                  </span>
                ))}
              </div>
            )}
            {errors.amenities && (
              <p style={{ color: '#dc2626', fontSize: 12, margin: '6px 0 0' }}>{errors.amenities.message as string}</p>
            )}
          </Section>

          {/* ── Photos ──────────────────────────────────────────── */}
          <Section title="Photos">
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666' }}>
              Manage your listing photos. Up to 5 photos · JPEG, PNG, WebP · max 5MB each.
            </p>
            <PhotoUploader listingId={id} existingPhotos={existingPhotos} />
          </Section>

          {/* ── Availability Calendar ────────────────────────────── */}
          <Section title="Availability Calendar">
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#666' }}>
              Click dates to block or unblock them. Dates booked by guests are shown in yellow and cannot be changed here.
            </p>
            <AvailabilityCalendar listingId={id} />
          </Section>

          {/* ── Cancellation Policy ─────────────────────────────── */}
          <Section title="Cancellation Policy">
            <div style={{ display: 'grid', gap: 8 }}>
              {CANCELLATION_POLICIES.map((policy) => {
                const checked = watch('cancellationPolicy') === policy;
                return (
                  <label
                    key={policy}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      border: `1.5px solid ${checked ? '#ff5722' : '#e5e7eb'}`,
                      background: checked ? '#fff7f2' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <input type="radio" value={policy} {...register('cancellationPolicy')} style={{ marginTop: 2, accentColor: '#ff5722' }} />
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
          </Section>

          {/* ── Publish Toggle ──────────────────────────────────── */}
          <Section title="Publish Settings">
            <label style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 10,
              border: `1.5px solid ${isPublished ? '#16a34a' : '#e5e7eb'}`,
              background: isPublished ? '#f0fdf4' : 'white',
              cursor: 'pointer',
            }}>
              <input type="checkbox" {...register('isPublished')} style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: isPublished ? '#16a34a' : '#374151' }}>
                  {isPublished ? '✓ Published — visible to guests' : 'Draft — hidden from guests'}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {isPublished
                    ? 'Uncheck to hide this listing from search results.'
                    : 'Check to make this listing visible to guests.'}
                </div>
              </div>
            </label>
          </Section>

          {/* ── Error / Submit ──────────────────────────────────── */}
          {update.isError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ margin: 0, color: '#991b1b', fontSize: 13 }}>{(update.error as Error).message}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={update.isPending}
              style={{ ...btnPrimary, opacity: update.isPending ? 0.6 : 1, cursor: update.isPending ? 'not-allowed' : 'pointer' }}
            >
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/host/dashboard')} style={btnGhost}>
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
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 4 }}>{label}</label>
      {children}
      {err && <p style={{ color: '#dc2626', margin: '4px 0 0', fontSize: 12 }}>{err}</p>}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
  padding: '10px 12px', fontSize: 14, marginTop: 2, boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  background: '#ff5722', color: 'white', border: 'none',
  borderRadius: 8, padding: '11px 24px', fontWeight: 700, fontSize: 14,
};
const btnGhost: React.CSSProperties = {
  background: 'white', color: '#374151', border: '1px solid #d1d5db',
  borderRadius: 8, padding: '11px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
};
