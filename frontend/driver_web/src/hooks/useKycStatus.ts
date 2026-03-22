import { useQuery } from "@tanstack/react-query";

import { getDriverKycStatus } from "../api/kyc";

export function useKycStatus() {
  return useQuery({
    queryKey: ["driver-kyc-status"],
    queryFn: getDriverKycStatus,
  });
}
