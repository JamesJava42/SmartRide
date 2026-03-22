import { useId, useRef } from "react";

import { SectionCard } from "../common/SectionCard";
import { StatusBadge } from "../common/StatusBadge";
import type { KycDocumentItem, KycDocumentType } from "@shared/types/kyc";

const documentLabels: Record<KycDocumentType, string> = {
  government_id: "Government ID",
  driver_license: "Driver License",
  insurance: "Insurance",
  vehicle_registration: "Vehicle Registration",
};

const statusTone: Record<KycDocumentItem["documentStatus"], "green" | "gray" | "blue" | "amber" | "red"> = {
  missing: "gray",
  uploaded: "blue",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  expired: "red",
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export function KycDocumentCard({
  document,
  onUpload,
  isUploading,
}: {
  document: KycDocumentItem;
  onUpload: (documentType: KycDocumentType, file: File) => void | Promise<void>;
  isUploading?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const actionLabel = document.documentStatus === "missing" ? "Upload" : "Re-upload";

  return (
    <SectionCard
      title={documentLabels[document.documentType]}
      description={document.fileName ?? "No document uploaded yet."}
      action={
        <button
          type="button"
          className="rounded-2xl border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:bg-[#f7f5ef] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : actionLabel}
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={document.documentStatus.replace(/_/g, " ")} tone={statusTone[document.documentStatus]} />
          {document.uploadedAt ? <span className="text-sm text-muted">Uploaded {formatDate(document.uploadedAt)}</span> : null}
          {document.expiryDate ? <span className="text-sm text-muted">Expires {formatDate(document.expiryDate)}</span> : null}
        </div>
        {document.rejectionReason ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {document.rejectionReason}
          </div>
        ) : null}
        {document.notes ? <p className="text-sm text-muted">{document.notes}</p> : null}
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onUpload(document.documentType, file);
          }
          event.currentTarget.value = "";
        }}
      />
    </SectionCard>
  );
}
