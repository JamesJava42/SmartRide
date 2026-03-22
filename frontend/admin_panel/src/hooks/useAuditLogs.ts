import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import type { AuditLog, PaginatedResponse } from '../types/admin';

interface AuditFilters {
  region_id?: string;
  action_type?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export function useAuditLogs(filters: AuditFilters = {}) {
  const params = new URLSearchParams();
  if (filters.region_id) params.set('region_id', filters.region_id);
  if (filters.action_type) params.set('action_type', filters.action_type);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.page_size) params.set('page_size', String(filters.page_size));
  const qs = params.toString();

  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => apiRequest<{ data: PaginatedResponse<AuditLog> }>(`/admin/audit-logs${qs ? '?' + qs : ''}`).then(r => r.data),
    refetchInterval: 60_000,
  });
}
