import { z } from 'zod';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export const datesSchema = z.object({
  checkIn:  z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests:   z.number({ invalid_type_error: 'Guests is required' }).min(1).max(16),
}).refine((d) => d.checkIn >= tomorrow(), {
  message: 'Check-in must be at least tomorrow',
  path: ['checkIn'],
}).refine((d) => d.checkOut > d.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

export const personalSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone number required'),
});

export const paymentSchema = z.object({
  card:   z.string().regex(/^\d{16}$/, '16-digit card number required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv:    z.string().regex(/^\d{3,4}$/, '3 or 4-digit CVV required'),
});

// Sub-ratings for review (FR-055)
export const reviewSchema = z.object({
  overall:       z.number().int().min(1).max(5),
  cleanliness:   z.number().int().min(1).max(5),
  accuracy:      z.number().int().min(1).max(5),
  checkIn:       z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  location:      z.number().int().min(1).max(5),
  value:         z.number().int().min(1).max(5),
  comment:       z.string().min(50, 'Review must be at least 50 characters').max(1000),
});

export type DatesData    = z.infer<typeof datesSchema>;
export type PersonalData = z.infer<typeof personalSchema>;
export type PaymentData  = z.infer<typeof paymentSchema>;
export type ReviewData   = z.infer<typeof reviewSchema>;
