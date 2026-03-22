import { StatusBadge } from "../common/StatusBadge";
import type { KycOverallStatus } from "@shared/types/kyc";

const statusConfig: Record<KycOverallStatus, { label: string; tone: "green" | "gray" | "blue" | "amber" | "red" }> = {
  draft: { label: "Draft", tone: "gray" },
  submitted: { label: "Submitted", tone: "blue" },
  under_review: { label: "Under Review", tone: "blue" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  needs_more_info: { label: "Needs More Info", tone: "amber" },
  expired: { label: "Expired", tone: "red" },
  suspended: { label: "Suspended", tone: "red" },
};

export function KycStatusBadge({ status }: { status: KycOverallStatus }) {
  const config = statusConfig[status];
  return <StatusBadge label={config.label} tone={config.tone} />;
}
