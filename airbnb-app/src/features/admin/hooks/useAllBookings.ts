import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export type BookingFilters = {
  status: 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  page: number;
  from?: string;
  to?: string;
};

export function useAllBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', 'all', filters],
    queryFn: async () => {
      const res = await api.get<{ data: any[]; meta: any }>(`/bookings?limit=12&page=${filters.page}`);
      let rows = res.data ?? [];
      if (filters.status !== 'all') rows = rows.filter((b) => b.status === filters.status);
      if (filters.from) rows = rows.filter((b) => new Date(b.checkIn) >= new Date(filters.from!));
      if (filters.to) rows = rows.filter((b) => new Date(b.checkOut) <= new Date(filters.to!));
      return { data: rows, meta: res.meta };
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

