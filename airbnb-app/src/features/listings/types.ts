export interface Listing {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  weekendPrice?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  extraGuestFee?: number;
  baseGuests?: number;
  guests?: number;
  type?: string;
  amenities?: string[];
  rating: number;
  superhost: boolean;
  available: boolean;
  availableFrom: string;
  img: string;
  images?: string[];
  profileImg: string;
  hostName: string;
  hostId?: string;
  hostBio?: string;
  cancellationPolicy?: string;
  minNights?: number;
  maxNights?: number;
  isPublished?: boolean;
  category:
    | 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN' | 'CONDO' | 'STUDIO' | 'OTHER'
    | 'eat-drink' | 'coaching' | 'apartments' | 'services' | 'classifieds' | 'fitness' | 'events' | 'other';
  lat?: number;
  lng?: number;
}
