import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import type { Region } from '../types/admin';

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => apiRequest<{ data: Region[] }>('/admin/regions').then(r => r.data ?? []),
    staleTime: Infinity,
  });
}
