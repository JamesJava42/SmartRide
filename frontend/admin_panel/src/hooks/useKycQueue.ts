import { useQuery } from "@tanstack/react-query";
import { getAdminKycQueue } from "../api/adminKyc";

export function useKycQueue() {
  return useQuery({
    queryKey: ["admin-kyc-queue"],
    queryFn: getAdminKycQueue,
  });
}
