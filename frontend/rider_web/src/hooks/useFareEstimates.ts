import { useQuery } from "@tanstack/react-query";

import { getFareEstimates } from "../api/rides";

export function useFareEstimates(params: {
  pickup_lat: number | null;
  pickup_lng: number | null;
  pickup_address: string | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  dropoff_address: string | null;
  seats: number;
  enabled?: boolean;
}) {
  const enabled = Boolean(
    params.pickup_lat != null &&
      params.pickup_lng != null &&
      params.pickup_address &&
      params.dropoff_lat != null &&
      params.dropoff_lng != null &&
      params.dropoff_address &&
      params.enabled,
  );

  return useQuery({
    queryKey: ["fare-estimates", params],
    queryFn: () =>
      getFareEstimates({
        pickup_lat: params.pickup_lat as number,
        pickup_lng: params.pickup_lng as number,
        pickup_address: params.pickup_address as string,
        dropoff_lat: params.dropoff_lat as number,
        dropoff_lng: params.dropoff_lng as number,
        dropoff_address: params.dropoff_address as string,
        seats: params.seats,
      }),
    enabled,
  });
}
