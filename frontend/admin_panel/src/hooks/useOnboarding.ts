import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOnboardingQueue } from '../api/onboarding';
import { apiRequest } from '../api/client';

interface OnboardingFilters {
  status?: string;
  region_id?: string;
  page?: number;
  page_size?: number;
}

export function useOnboardingQueue(filters: OnboardingFilters = {}) {
  return useQuery({
    queryKey: ['onboarding', 'queue', filters],
    queryFn: () =>
      getOnboardingQueue({
        status: filters.status,
        region: filters.region_id,
        page: filters.page,
        page_size: filters.page_size,
      }),
  });
}

export function useApproveOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, review_notes }: { driverId: string; review_notes?: string }) =>
      apiRequest(`/admin/onboarding/${driverId}/approve`, { method: 'POST', body: { review_notes } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding'] }),
  });
}

export function useRejectOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, rejection_reason }: { driverId: string; rejection_reason: string }) =>
      apiRequest(`/admin/onboarding/${driverId}/reject`, { method: 'POST', body: { rejection_reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding'] }),
  });
}
