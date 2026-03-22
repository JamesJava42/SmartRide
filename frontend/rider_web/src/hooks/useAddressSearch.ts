import { useQuery } from "@tanstack/react-query";

import { searchAddress } from "../api/geocoder";
import { useDebounce } from "./useDebounce";

export function useAddressSearch(query: string, enabled: boolean) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(query, 300);
  const trimmedDebouncedQuery = debouncedQuery.trim();
  const isDebouncing = enabled && trimmedQuery.length >= 2 && trimmedQuery !== trimmedDebouncedQuery;
  const searchQuery = useQuery({
    queryKey: ["address-search", debouncedQuery],
    queryFn: () => searchAddress(debouncedQuery),
    enabled: enabled && trimmedDebouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  return {
    results: isDebouncing ? [] : (searchQuery.data ?? []),
    isLoading: isDebouncing || searchQuery.isLoading || searchQuery.isFetching,
    isDebouncing,
    isError: searchQuery.isError,
    refetch: searchQuery.refetch,
  };
}
