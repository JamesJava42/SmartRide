import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveDriverKyc,
  rejectDriverKyc,
  requestMoreInfoDriverKyc,
} from "../api/adminKyc";
import type { MoreInfoKycPayload, RejectKycPayload } from "@shared/types/kyc";

export function useKycDecision(driverUserId?: string) {
  const queryClient = useQueryClient();

  async function invalidateKycQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-queue"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-kyc-detail", driverUserId] }),
    ]);
  }

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!driverUserId) {
        throw new Error("Driver user id is required.");
      }
      return approveDriverKyc(driverUserId);
    },
    onSuccess: invalidateKycQueries,
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: RejectKycPayload) => {
      if (!driverUserId) {
        throw new Error("Driver user id is required.");
      }
      return rejectDriverKyc(driverUserId, payload);
    },
    onSuccess: invalidateKycQueries,
  });

  const requestMoreInfoMutation = useMutation({
    mutationFn: async (payload: MoreInfoKycPayload) => {
      if (!driverUserId) {
        throw new Error("Driver user id is required.");
      }
      return requestMoreInfoDriverKyc(driverUserId, payload);
    },
    onSuccess: invalidateKycQueries,
  });

  return {
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    requestMoreInfo: requestMoreInfoMutation.mutateAsync,
    isActing:
      approveMutation.isPending ||
      rejectMutation.isPending ||
      requestMoreInfoMutation.isPending,
  };
}
