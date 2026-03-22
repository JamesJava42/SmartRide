import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import type { DashboardSummary } from '../types/admin';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => apiRequest<{ data: DashboardSummary }>('/admin/dashboard/summary').then(r => r.data),
    refetchInterval: 30_000,
  });
}
