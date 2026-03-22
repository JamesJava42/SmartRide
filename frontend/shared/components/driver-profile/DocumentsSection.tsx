import { useState } from "react";
import { DocumentVerificationBadge } from "./DocumentVerificationBadge";
import type { DriverDocument, ViewMode } from "@shared/types/driver";

type Props = {
  documents: DriverDocument[];
  viewMode: ViewMode;
  onApproveDocument?: (documentType: string) => void;
  onRejectDocument?: (documentType: string, reason: string) => void;
  onUploadDocument?: (documentType: string) => void;
};

const DOC_LABELS: Record<DriverDocument["document_type"], string> = {
  GOVT_ID_FRONT:        "Government ID — Front",
  GOVT_ID_BACK:         "Government ID — Back",
  DRIVER_LICENSE:       "Driver's License",
  VEHICLE_REGISTRATION: "Vehicle Registration",
  INSURANCE:            "Insurance Certificate",
  PROFILE_PHOTO:        "Profile Photo",
};

const ALL_DOC_TYPES = Object.keys(DOC_LABELS) as DriverDocument["document_type"][];

function RejectModal({ onConfirm, onCancel }: { onConfirm: (r: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="mt-2 space-y-2">
      <textarea
        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 resize-none"
        rows={2}
        placeholder="Rejection reason…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          disabled={!reason.trim()}
          onClick={() => reason.trim() && onConfirm(reason.trim())}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
        >Confirm Reject</button>
        <button onClick={onCancel} className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink hover:bg-[#f7f7f5] transition">Cancel</button>
      </div>
    </div>
  );
}

export function DocumentsSection({ documents, viewMode, onApproveDocument, onRejectDocument, onUploadDocument }: Props) {
  const [rejectingType, setRejectingType] = useState<string | null>(null);

  const docMap = Object.fromEntries(documents.map((d) => [d.document_type, d]));

  return (
    <div className="rounded-2xl border border-line bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h3 className="text-sm font-semibold text-ink">Documents</h3>
      </div>
      <div className="divide-y divide-line">
        {ALL_DOC_TYPES.map((type) => {
          const doc = docMap[type];
          const canAct = doc && (doc.verification_status === "SUBMITTED" || doc.verification_status === "UNDER_REVIEW");
          const needsUpload = !doc || doc.verification_status === "REJECTED";

          return (
            <div key={type} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-ink">{DOC_LABELS[type]}</span>
                    {doc ? (
                      <DocumentVerificationBadge status={doc.verification_status} size="sm" />
                    ) : (
                      <span className="text-xs text-muted">Not uploaded</span>
                    )}
                  </div>

                  {doc?.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-accent hover:underline">
                      View file ↗
                    </a>
                  )}

                  {doc?.metadata_json && typeof doc.metadata_json === "object" && "expiry_date" in doc.metadata_json && (
                    <p className="mt-1 text-xs text-muted">Expires: {String(doc.metadata_json.expiry_date)}</p>
                  )}

                  {doc?.rejection_reason && (
                    <p className="mt-1 text-xs text-red-600">{doc.rejection_reason}</p>
                  )}

                  {viewMode === "admin" && doc?.reviewed_at && (
                    <p className="mt-1 text-xs text-muted">Reviewed {new Date(doc.reviewed_at).toLocaleDateString()}</p>
                  )}

                  {rejectingType === type && (
                    <RejectModal
                      onConfirm={(r) => { onRejectDocument?.(type, r); setRejectingType(null); }}
                      onCancel={() => setRejectingType(null)}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {viewMode === "admin" && canAct && (
                    <>
                      <button
                        onClick={() => onApproveDocument?.(type)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                      >Approve</button>
                      <button
                        onClick={() => setRejectingType(rejectingType === type ? null : type)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >Reject</button>
                    </>
                  )}
                  {viewMode === "driver" && needsUpload && (
                    <button
                      onClick={() => onUploadDocument?.(type)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#f7f7f5] transition"
                    >{doc ? "Re-upload" : "Upload"}</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
