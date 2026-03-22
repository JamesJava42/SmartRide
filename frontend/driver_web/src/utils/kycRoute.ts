import type { KycOverallStatus } from "@shared/types/kyc";

export function getKycRedirectPath(status: KycOverallStatus): string | null {
  if (status === "approved") {
    return null;
  }

  if (status === "submitted" || status === "under_review") {
    return "/kyc/review-pending";
  }

  return "/kyc/status";
}
