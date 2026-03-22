import { useQuery } from "@tanstack/react-query";
import { getAdminDriverKycDetail } from "../api/adminKyc";

export function useKycDetail(driverUserId?: string) {
  return useQuery({
    queryKey: ["admin-kyc-detail", driverUserId],
    queryFn: () => getAdminDriverKycDetail(driverUserId as string),
    enabled: Boolean(driverUserId),
  });
}
