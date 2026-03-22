import { SectionCard } from "../common/SectionCard";
import { StatusBadge } from "../common/StatusBadge";
import type { KycDocumentItem } from "@shared/types/kyc";

type KycDocumentReviewCardProps = {
  document: KycDocumentItem;
};

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="font-medium text-muted">{label}</span>
      <span className="text-ink">{value || "Not available"}</span>
    </div>
  );
}

export function KycDocumentReviewCard({ document }: KycDocumentReviewCardProps) {
  return (
    <SectionCard
      title={formatLabel(document.documentType)}
      action={<StatusBadge status={document.documentStatus} label={formatLabel(document.documentStatus)} />}
    >
      <div className="space-y-3">
        <DetailRow label="File name" value={document.fileName} />
        <DetailRow label="Uploaded at" value={formatDate(document.uploadedAt)} />
        <DetailRow label="Expiry date" value={document.expiryDate} />
        <DetailRow label="Reviewed at" value={formatDate(document.reviewedAt)} />
        <DetailRow label="Reviewed by" value={document.reviewedBy} />
        <DetailRow label="Rejection reason" value={document.rejectionReason} />
        <DetailRow label="Notes" value={document.notes} />
      </div>
    </SectionCard>
  );
}
