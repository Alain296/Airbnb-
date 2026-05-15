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
  if (t === 'APARTMENT' || t === 'HOUSE' || t === 'VILLA' || t === 'CABIN' || t === 'CONDO' || t === 'STUDIO') {
    return t;
  }
  return 'OTHER';
};

export function mapApiListingToListing(item: ApiListing): Listing {
  const realPhotos = (item.photos?.map((p) => p.url).filter(Boolean) as string[]) ?? [];
  const primary = realPhotos[0] || '/liston-v2.3/assets/images/header/lg-01.jpg';

  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    location: item.location,
    price: item.pricePerNight,
    weekendPrice: item.weekendPrice,
    weeklyDiscount: item.weeklyDiscount,
    monthlyDiscount: item.monthlyDiscount,
    extraGuestFee: item.extraGuestFee,
    baseGuests: item.baseGuests,
    guests: item.guests,
    type: item.type,
    amenities: item.amenities ?? [],
    rating: typeof item.rating === 'number' ? item.rating : 4.7,
    superhost: (item.rating ?? 0) >= 4.8,
    available: item.isPublished !== false,
    availableFrom: item.createdAt ?? new Date().toISOString(),
    img: primary,
    images: realPhotos,
    profileImg: item.host?.avatar || '/liston-v2.3/assets/images/avatar/01.jpg',
    hostName: item.host?.name || 'Host',
    hostId: item.host?.id,
    hostBio: item.host?.bio ?? undefined,
    cancellationPolicy: item.cancellationPolicy,
    minNights: item.minNights,
    maxNights: item.maxNights,
    isPublished: item.isPublished,
    category: categoryFromType(item.type),
  };
}
