import { SectionCard } from "../common/SectionCard";
import type { KycDocumentType, KycOverallStatus } from "@shared/types/kyc";

export function KycSubmitPanel({
  overallStatus,
  missingDocuments,
  onSubmit,
  isSubmitting,
}: {
  overallStatus: KycOverallStatus;
  missingDocuments: KycDocumentType[];
  onSubmit: () => void | Promise<void>;
  isSubmitting: boolean;
}) {
  const canSubmit =
    (overallStatus === "draft" || overallStatus === "needs_more_info") &&
    missingDocuments.length === 0;

  const helperText =
    overallStatus !== "draft" && overallStatus !== "needs_more_info"
      ? "KYC can only be submitted from Draft or Needs More Info."
      : missingDocuments.length > 0
        ? "Upload all required documents before submitting for review."
        : "Your KYC package is ready for admin review.";

  return (
    <SectionCard title="Submit for Review" description={helperText}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Once submitted, your documents move into the admin review queue.</p>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void onSubmit()}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit KYC"}
        </button>
      </div>
    </SectionCard>
  );
}
