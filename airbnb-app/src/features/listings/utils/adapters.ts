import type { Listing } from '../types';

type ApiListing = {
  id: string;
  title: string;
  description?: string;
  location: string;
  pricePerNight: number;
  weekendPrice?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  extraGuestFee?: number;
  baseGuests?: number;
  guests?: number;
  type?: string;
  amenities?: string[];
  rating?: number | null;
  cancellationPolicy?: string;
  minNights?: number;
  maxNights?: number;
  isPublished?: boolean;
  host?: { id?: string; name?: string; avatar?: string | null; bio?: string | null };
  photos?: Array<{ id?: string; url?: string }>;
  createdAt?: string;
};

const categoryFromType = (type?: string): Listing['category'] => {
  const t = (type ?? '').toUpperCase();
  if (t === 'APARTMENT' || t === 'HOUSE' || t === 'VILLA' || t === 'CONDO' || t === 'STUDIO') return 'apartments';
  if (t === 'CABIN') return 'other';
  return 'other';
};

export function mapApiListingToListing(item: ApiListing): Listing {
  const primary = item.photos?.[0]?.url || `https://picsum.photos/seed/${item.id}/900/600`;

  // Build gallery — use real photos first, then fill with placeholders up to 5
  const realPhotos = (item.photos?.map(p => p.url).filter(Boolean) as string[]) ?? [];
  const placeholders = [
    `https://picsum.photos/seed/${item.id}-1/1200/800`,
    `https://picsum.photos/seed/${item.id}-2/1200/800`,
    `https://picsum.photos/seed/${item.id}-3/1200/800`,
    `https://picsum.photos/seed/${item.id}-4/1200/800`,
  ];
  const images = realPhotos.length >= 4
    ? realPhotos
    : [...realPhotos, ...placeholders].slice(0, Math.max(4, realPhotos.length));

  return {
    id:                 String(item.id),
    title:              item.title,
    description:        item.description,
    location:           item.location,
    price:              item.pricePerNight,
    weekendPrice:       item.weekendPrice,
    weeklyDiscount:     item.weeklyDiscount,
    monthlyDiscount:    item.monthlyDiscount,
    extraGuestFee:      item.extraGuestFee,
    baseGuests:         item.baseGuests,
    guests:             item.guests,
    type:               item.type,
    amenities:          item.amenities ?? [],
    rating:             typeof item.rating === 'number' ? item.rating : 4.7,
    superhost:          (item.rating ?? 0) >= 4.8,
    available:          item.isPublished !== false,
    availableFrom:      item.createdAt ?? new Date().toISOString(),
    img:                primary,
    images,
    profileImg:         item.host?.avatar || `https://i.pravatar.cc/100?u=host-${item.id}`,
    hostName:           item.host?.name || 'Host',
    hostId:             item.host?.id,
    hostBio:            item.host?.bio ?? undefined,
    cancellationPolicy: item.cancellationPolicy,
    minNights:          item.minNights,
    maxNights:          item.maxNights,
    isPublished:        item.isPublished,
    category:           categoryFromType(item.type),
  };
}
