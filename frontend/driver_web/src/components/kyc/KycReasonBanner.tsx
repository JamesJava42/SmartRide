import type { KycOverallStatus } from "@shared/types/kyc";

export function KycReasonBanner({
  status,
  rejectionReason,
  needsMoreInfoReason,
}: {
  status: KycOverallStatus;
  rejectionReason?: string | null;
  needsMoreInfoReason?: string | null;
}) {
  if (status === "rejected" && rejectionReason) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <p className="font-semibold">KYC rejected</p>
        <p className="mt-1">{rejectionReason}</p>
      </div>
    );
  }

  if (status === "needs_more_info" && needsMoreInfoReason) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p className="font-semibold">More information requested</p>
        <p className="mt-1">{needsMoreInfoReason}</p>
      </div>
    );
  }

  return null;
}
