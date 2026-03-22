import { useQuery } from '@tanstack/react-query';

import { getUnmatchedRidesReport } from '../api/rides';

export function useUnmatchedRidesReport() {
  return useQuery({
    queryKey: ['rides', 'unmatched-report'],
    queryFn: getUnmatchedRidesReport,
    refetchInterval: 15_000,
  });
}
