import { useState } from "react";
import { DocumentsSection } from "./DocumentsSection";
import { DriverProfileHeader } from "./DriverProfileHeader";
import { DriverRatingDisplay } from "./DriverRatingDisplay";
import { OnboardingReviewPanel } from "./OnboardingReviewPanel";
import { VehicleCard } from "./VehicleCard";
import { useDriverProfile } from "@shared/hooks/useDriverProfile";
import type { ViewMode } from "@shared/types/driver";

type Props = {
  driverId: string;
  viewMode: ViewMode;
  showContact?: boolean;
  onApproveOnboarding?: (notes: string) => void;
  onRejectOnboarding?: (reason: string) => void;
  onApproveDocument?: (documentType: string) => void;
  onRejectDocument?: (documentType: string, reason: string) => void;
  onSuspendDriver?: () => void;
  onReactivateDriver?: () => void;
  onUploadDocument?: (documentType: string) => void;
};

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 rounded-2xl bg-[#f4f5f2]" />
      <div className="h-20 rounded-2xl bg-[#f4f5f2]" />
      <div className="h-40 rounded-2xl bg-[#f4f5f2]" />
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
      <p className="text-sm text-red-700">{message}</p>
      <button onClick={onRetry} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
        Retry
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted px-1">{children}</p>
  );
}

export default function DriverProfilePage({
  driverId,
  viewMode,
  showContact = false,
  onApproveOnboarding,
  onRejectOnboarding,
  onApproveDocument,
  onRejectDocument,
  onSuspendDriver,
  onReactivateDriver,
  onUploadDocument,
}: Props) {
  const { data, isLoading, error, refetch } = useDriverProfile(driverId, viewMode);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const handleApprove = async (notes: string) => {
    setActionSubmitting(true);
    try { await onApproveOnboarding?.(notes); } finally { setActionSubmitting(false); }
  };

  const handleReject = async (reason: string) => {
    setActionSubmitting(true);
    try { await onRejectOnboarding?.(reason); } finally { setActionSubmitting(false); }
  };

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard message={error} onRetry={refetch} />;
  if (!data) return null;

  const { user, profile, vehicle, onboarding, documents } = data;

  if (viewMode === "admin") {
    return (
      <div className="space-y-5">
        {/* Profile header */}
        <DriverProfileHeader
          profile={profile}
          user={user}
          viewMode={viewMode}
          documents={documents}
          showContact
          onSuspend={onSuspendDriver}
          onReactivate={onReactivateDriver}
        />

        {/* Stats row */}
        <DriverRatingDisplay rating={profile.rating_avg} totalRides={profile.total_rides_completed} size="md" />

        {/* Vehicle details */}
        <div className="space-y-1.5">
          <SectionLabel>Vehicle</SectionLabel>
          <VehicleCard vehicle={vehicle} viewMode={viewMode} />
        </div>

        {/* Onboarding review — only shown when there is an onboarding record */}
        {onboarding && (
          <div className="space-y-1.5">
            <SectionLabel>Onboarding</SectionLabel>
            <OnboardingReviewPanel
              onboarding={onboarding}
              onApprove={handleApprove}
              onReject={handleReject}
              isSubmitting={actionSubmitting}
            />
          </div>
        )}

        {/* Documents */}
        <div className="space-y-1.5">
          <SectionLabel>Documents</SectionLabel>
          <DocumentsSection
            documents={documents}
            viewMode={viewMode}
            onApproveDocument={onApproveDocument}
            onRejectDocument={onRejectDocument}
          />
        </div>
      </div>
    );
  }

  // driver / rider views
  return (
    <div className="space-y-4">
      <DriverProfileHeader
        profile={profile}
        user={user}
        viewMode={viewMode}
        documents={documents}
        showContact={showContact}
      />
      {viewMode === "driver" && (
        <DriverRatingDisplay rating={profile.rating_avg} totalRides={profile.total_rides_completed} size="md" />
      )}
      {viewMode === "rider" && (
        <DriverRatingDisplay rating={profile.rating_avg} totalRides={profile.total_rides_completed} size="lg" />
      )}
      <VehicleCard vehicle={vehicle} viewMode={viewMode} />
      {viewMode === "driver" && (
        <DocumentsSection
          documents={documents}
          viewMode={viewMode}
          onUploadDocument={onUploadDocument}
        />
      )}
    </div>
  );
}
