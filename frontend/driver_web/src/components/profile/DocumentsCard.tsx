import { useRef, useState } from "react";

import { uploadDriverDocument } from "../../api/profile";
import type { DriverDocument } from "../../types/profile";
import { formatDate } from "../../utils/formatters";
import { SectionCard } from "../common/SectionCard";
import { StatusBadge } from "../common/StatusBadge";

const REQUIREMENTS: Record<
  string,
  {
    needsDocumentNumber: boolean;
    needsExpiry: boolean;
    needsIssuingState: boolean;
    needsIssuingCountry: boolean;
  }
> = {
  DRIVER_LICENSE: {
    needsDocumentNumber: true,
    needsExpiry: true,
    needsIssuingState: true,
    needsIssuingCountry: true,
  },
  INSURANCE: {
    needsDocumentNumber: true,
    needsExpiry: true,
    needsIssuingState: true,
    needsIssuingCountry: true,
  },
  VEHICLE_REGISTRATION: {
    needsDocumentNumber: true,
    needsExpiry: true,
    needsIssuingState: true,
    needsIssuingCountry: true,
  },
};

function toneForDocument(status: DriverDocument["status"]) {
  if (status === "VERIFIED") return "green";
  if (status === "REJECTED") return "red";
  if (status === "EXPIRED") return "amber";
  if (status === "MISSING") return "gray";
  return "amber";
}

export function DocumentsCard({
  documents,
  onUploaded,
}: {
  documents: DriverDocument[];
  onUploaded?: () => Promise<void> | void;
}) {
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentNumbers, setDocumentNumbers] = useState<Record<string, string>>({});
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});
  const [issuingStates, setIssuingStates] = useState<Record<string, string>>({});
  const [issuingCountries, setIssuingCountries] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleFileChange(document: DriverDocument, file: File | null) {
    if (!file) {
      return;
    }

    setPendingType(document.documentType);
    setError(null);

    try {
      const requirement = REQUIREMENTS[document.documentType] ?? {
        needsDocumentNumber: false,
        needsExpiry: false,
        needsIssuingState: false,
        needsIssuingCountry: false,
      };
      const documentNumber = documentNumbers[document.documentType]?.trim() ?? "";
      const expiresAt = expiryDates[document.documentType]?.trim() ?? "";
      const issuingState = issuingStates[document.documentType]?.trim() ?? "";
      const issuingCountry = issuingCountries[document.documentType]?.trim() ?? "";

      if (requirement.needsDocumentNumber && !documentNumber) {
        throw new Error("Document number is required for this document.");
      }
      if (requirement.needsExpiry && !expiresAt) {
        throw new Error("Expiry date is required for this document.");
      }
      if (requirement.needsIssuingState && !issuingState) {
        throw new Error("Issuing state is required for this document.");
      }
      if (requirement.needsIssuingCountry && !issuingCountry) {
        throw new Error("Issuing country is required for this document.");
      }

      await uploadDriverDocument(document.documentType, file, {
        documentNumber: documentNumber || undefined,
        issuingState: issuingState || undefined,
        issuingCountry: issuingCountry || undefined,
        expiresAt: expiresAt || undefined,
      });
      await onUploaded?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload document right now.");
    } finally {
      setPendingType(null);
      if (inputRefs.current[document.documentType]) {
        inputRefs.current[document.documentType]!.value = "";
      }
    }
  }

  return (
    <SectionCard
      title="Documents"
      description="Upload the required compliance files so admin can review and approve your account."
    >
      <div className="space-y-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {documents.map((document) => (
          <div key={document.documentType} className="rounded-2xl border border-line bg-[#fbfaf7] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-ink">{document.name}</p>
                  <StatusBadge label={document.status} tone={toneForDocument(document.status)} />
                </div>
                <p className="mt-2 text-sm text-muted">{document.note}</p>
                <p className="mt-2 text-xs text-muted">
                  {document.fileName ? `File: ${document.fileName}` : "No file uploaded yet."}
                </p>
                {document.documentNumber ? (
                  <p className="mt-1 text-xs text-muted">Document #: {document.documentNumber}</p>
                ) : null}
                {document.issuingState || document.issuingCountry ? (
                  <p className="mt-1 text-xs text-muted">
                    Issued by: {[document.issuingState, document.issuingCountry].filter(Boolean).join(", ")}
                  </p>
                ) : null}
                {document.expiresAt ? (
                  <p className="mt-1 text-xs text-muted">Expires: {formatDate(document.expiresAt)}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted">
                  Updated: {formatDate(document.updatedAt)}
                </p>
                {document.fileUrl ? (
                  <a
                    className="mt-2 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
                    href={document.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview uploaded file →
                  </a>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {(REQUIREMENTS[document.documentType]?.needsDocumentNumber ||
                  REQUIREMENTS[document.documentType]?.needsExpiry ||
                  REQUIREMENTS[document.documentType]?.needsIssuingState ||
                  REQUIREMENTS[document.documentType]?.needsIssuingCountry) ? (
                  <div className="flex flex-col gap-2 md:min-w-[220px]">
                    {REQUIREMENTS[document.documentType]?.needsDocumentNumber ? (
                      <input
                        type="text"
                        value={documentNumbers[document.documentType] ?? document.documentNumber ?? ""}
                        onChange={(event) =>
                          setDocumentNumbers((current) => ({ ...current, [document.documentType]: event.target.value }))
                        }
                        placeholder="Document number"
                        className="rounded-2xl border border-stone-300 px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
                      />
                    ) : null}
                    {REQUIREMENTS[document.documentType]?.needsIssuingState ? (
                      <input
                        type="text"
                        value={issuingStates[document.documentType] ?? document.issuingState ?? ""}
                        onChange={(event) =>
                          setIssuingStates((current) => ({ ...current, [document.documentType]: event.target.value }))
                        }
                        placeholder="Issuing state"
                        className="rounded-2xl border border-stone-300 px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
                      />
                    ) : null}
                    {REQUIREMENTS[document.documentType]?.needsIssuingCountry ? (
                      <input
                        type="text"
                        value={issuingCountries[document.documentType] ?? document.issuingCountry ?? ""}
                        onChange={(event) =>
                          setIssuingCountries((current) => ({ ...current, [document.documentType]: event.target.value }))
                        }
                        placeholder="Issuing country"
                        className="rounded-2xl border border-stone-300 px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
                      />
                    ) : null}
                    {REQUIREMENTS[document.documentType]?.needsExpiry ? (
                      <input
                        type="date"
                        value={expiryDates[document.documentType] ?? (document.expiresAt ? document.expiresAt.slice(0, 10) : "")}
                        onChange={(event) =>
                          setExpiryDates((current) => ({ ...current, [document.documentType]: event.target.value }))
                        }
                        className="rounded-2xl border border-stone-300 px-3 py-2 text-sm text-ink outline-none transition focus:border-accent"
                      />
                    ) : null}
                  </div>
                ) : null}
                <input
                  ref={(node) => {
                    inputRefs.current[document.documentType] = node;
                  }}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(event) => handleFileChange(document, event.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => inputRefs.current[document.documentType]?.click()}
                  disabled={pendingType === document.documentType}
                >
                  {pendingType === document.documentType ? "Uploading..." : document.fileUrl ? "Replace file" : "Upload file"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
