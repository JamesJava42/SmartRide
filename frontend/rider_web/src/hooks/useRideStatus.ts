import { useQuery } from "@tanstack/react-query";

import { getRideStatus } from "../api/rides";

const terminalStatuses = new Set(["RIDE_COMPLETED", "CANCELLED", "NO_DRIVERS_FOUND"]);

export function useRideStatus(rideId: string | null) {
  return useQuery({
    queryKey: ["ride-status", rideId],
    queryFn: () => getRideStatus(rideId as string),
    enabled: Boolean(rideId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && terminalStatuses.has(status) ? false : 3000;
    },
  });
}
