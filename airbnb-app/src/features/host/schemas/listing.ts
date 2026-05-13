import { z } from 'zod';

export const CANCELLATION_POLICIES = [
  'FLEXIBLE',
  'MODERATE',
  'STRICT',
  'NON_REFUNDABLE',
  'LONG_TERM',
] as const;

export const CANCELLATION_POLICY_LABELS: Record<typeof CANCELLATION_POLICIES[number], string> = {
  FLEXIBLE:       'Flexible — Full refund 1 day prior to arrival',
  MODERATE:       'Moderate — Full refund 5 days prior to arrival',
  STRICT:         'Strict — 50% refund up to 1 week prior to arrival',
  NON_REFUNDABLE: 'Non-Refundable — No refund on cancellation',
  LONG_TERM:      'Long Term — 30-day notice required',
};

export const listingSchema = z.object({
  title:              z.string().min(10, 'Title must be at least 10 characters'),
  description:        z.string().min(50, 'Description must be at least 50 characters'),
  location:           z.string().min(2, 'Location is required'),
  pricePerNight:      z.number().min(10, 'Price must be at least $10'),
  weekendPrice:       z.number().min(10).optional(),
  weeklyDiscount:     z.number().min(0).max(100).optional(),
  monthlyDiscount:    z.number().min(0).max(100).optional(),
  extraGuestFee:      z.number().min(0).optional(),
  baseGuests:         z.number().int().min(1).optional(),
  guests:             z.number().int().min(1).max(16),
  type:               z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CABIN', 'CONDO', 'STUDIO']),
  amenities:          z.array(z.string()).min(1, 'At least one amenity is required'),
  cancellationPolicy: z.enum(CANCELLATION_POLICIES).default('FLEXIBLE'),
  isPublished:        z.boolean().default(true),
  minNights:          z.number().int().min(1).default(1),
  maxNights:          z.number().int().min(1).optional(),
  rating:             z.number().min(0).max(5).optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;
