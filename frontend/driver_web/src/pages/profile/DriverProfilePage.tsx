import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getDriverKycStatus } from "../../api/kyc";
import { getDriverProfile } from "../../api/driverDashboard";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { useDriverSession } from "../../hooks/useDriverSession";
import styles from "./DriverProfilePage.module.css";

function getInitials(fullName?: string | null) {
  if (!fullName) return "...";
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMemberSince(value?: string | null) {
  if (!value) return "Mar 2026";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Mar 2026";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatExpiryMonth(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function daysUntil(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((date.getTime() - Date.now()) / 86400000);
}

function KycStatusBadge({ status }: { status?: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    approved: { label: "✓ Approved", bg: "#EDF9F2", color: "#1A6B45" },
    under_review: { label: "Under review", bg: "#FEF3C7", color: "#92400E" },
    submitted: { label: "Under review", bg: "#FEF3C7", color: "#92400E" },
    needs_more_info: { label: "Under review", bg: "#FEF3C7", color: "#92400E" },
    rejected: { label: "Rejected", bg: "#FEE2E2", color: "#991B1B" },
    draft: { label: "Incomplete", bg: "#F3F4F6", color: "#6B7280" },
  };
  const c = config[status ?? "draft"] ?? config.draft;
  return (
    <span
      className={styles.statusBadge}
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function VehicleTypeBadge({ type }: { type?: string | null }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    ECONOMY: { label: "Economy", bg: "#EDF9F2", color: "#1A6B45" },
    COMFORT: { label: "Comfort", bg: "#EFF6FF", color: "#1E40AF" },
    PREMIUM: { label: "Premium", bg: "#FEF3C7", color: "#92400E" },
    XL: { label: "XL", bg: "#F5F3FF", color: "#7C3AED" },
  };
  const c = config[(type ?? "ECONOMY").toUpperCase()] ?? config.ECONOMY;
  return (
    <span
      className={styles.statusBadge}
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.infoSection}>
      <p className={styles.sectionLabel}>{title}</p>
      <div className={styles.infoCard}>{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`${styles.infoRow} ${isLast ? styles.infoRowLast : ""}`}>
      <span className={styles.infoLabel}>{label}</span>
      {value}
    </div>
  );
}

function IdentitySkeleton() {
  return (
    <div className={styles.identityCol}>
      <div className={styles.avatarSkeleton} />
      <div className={styles.nameSkeleton} />
      <div className={styles.emailSkeleton} />
      <div className={styles.badgeSkeleton} />
      <div className={styles.statsBlock}>
        <div className={styles.statSkeleton} />
        <div className={styles.statSkeleton} />
        <div className={styles.statSkeleton} />
      </div>
      <div className={styles.buttonSkeleton} />
    </div>
  );
}

function InfoSkeleton() {
  return (
    <div className={styles.infoCol}>
      {[0, 1, 2].map((section) => (
        <div key={section} className={styles.infoSection}>
          <div className={styles.sectionSkeleton} />
          <div className={styles.infoCard}>
            <div className={styles.rowSkeleton} />
            <div className={styles.rowSkeleton} />
            <div className={styles.rowSkeleton} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const auth = useDriverSession();

  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["driver-profile"],
    queryFn: getDriverProfile,
  });
  const { data: kyc, isLoading: kycLoading, isError: kycError, refetch: refetchKyc } = useQuery({
    queryKey: ["driver-kyc-status"],
    queryFn: getDriverKycStatus,
  });

  const initials = getInitials(profile?.full_name);

  const insuranceDocument = useMemo(
    () => kyc?.documents.find((document) => document.documentType === "insurance"),
    [kyc?.documents],
  );

  const insuranceExpiryText = formatExpiryMonth(insuranceDocument?.expiryDate);
  const expiryDays = daysUntil(insuranceDocument?.expiryDate);

  let insuranceClassName = styles.infoValue;
  let insuranceSuffix = "";
  if (expiryDays !== null && expiryDays < 0) {
    insuranceClassName = styles.redText;
    insuranceSuffix = " ⚠";
  } else if (expiryDays !== null && expiryDays <= 60) {
    insuranceClassName = styles.amberText;
    insuranceSuffix = " ⚠";
  }

  const handleLogout = () => {
    localStorage.removeItem("rc_driver_token");
    auth.signOut();
    navigate("/driver/login");
  };

  if (profileLoading || kycLoading) {
    return (
      <DriverLayout>
        <div className={styles.profilePage}>
          <IdentitySkeleton />
          <InfoSkeleton />
        </div>
      </DriverLayout>
    );
  }

  if (profileError || kycError || !profile || !kyc) {
    return (
      <DriverLayout>
        <div className={styles.errorState}>
          <p>Could not load profile. Try again.</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => {
              void Promise.all([refetchProfile(), refetchKyc()]);
            }}
          >
            Retry
          </button>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className={styles.profilePage}>
        <div className={styles.identityCol}>
          <div className={styles.avatarCircle}>{initials}</div>

          <div className={styles.identityText}>
            <h2 className={styles.driverName}>{profile.full_name ?? "—"}</h2>
            <p className={styles.driverEmail}>{profile.email ?? "—"}</p>
            <div className={styles.approvedBadge}>
              <span className={styles.badgeDot} />
              Approved driver
            </div>
          </div>

          <div className={styles.statsBlock}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Rating</span>
              <span className={styles.statValue}>{profile.rating_avg.toFixed(1)} ★</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Total rides</span>
              <span className={styles.statValue}>{profile.total_rides_completed}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Member since</span>
              <span className={styles.statValue}>{formatMemberSince(profile.created_at)}</span>
            </div>
          </div>

          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className={styles.infoCol}>
          <InfoSection title="Personal information">
            <InfoRow label="Full name" value={<span className={styles.infoValue}>{profile.full_name}</span>} />
            <InfoRow label="Email" value={<span className={styles.infoValue}>{profile.email}</span>} />
            <InfoRow label="Phone" value={<span className={styles.infoValue}>{profile.phone_number}</span>} />
            <InfoRow label="City" value={<span className={styles.infoValue}>Long Beach, CA</span>} isLast />
          </InfoSection>

          <InfoSection title="Verification & compliance">
            <InfoRow label="KYC status" value={<KycStatusBadge status={kyc.overallStatus} />} />
            <InfoRow
              label="Insurance expires"
              value={
                <span className={insuranceClassName}>
                  {insuranceExpiryText ? `${insuranceExpiryText}${insuranceSuffix}` : "—"}
                </span>
              }
            />
            <InfoRow
              label="View all documents"
              value={
                <button type="button" className={styles.infoLink} onClick={() => navigate("/kyc/status")}>
                  View →
                </button>
              }
              isLast
            />
          </InfoSection>

          <InfoSection title="Vehicle">
            {profile.vehicle ? (
              <>
                <InfoRow
                  label="Vehicle"
                  value={
                    <span className={styles.infoValue}>
                      {profile.vehicle.year} {profile.vehicle.make} {profile.vehicle.model}
                    </span>
                  }
                />
                <InfoRow
                  label="Plate"
                  value={<span className={styles.infoValueMono}>{profile.vehicle.plate_number}</span>}
                />
                <InfoRow
                  label="Type"
                  value={<VehicleTypeBadge type={profile.vehicle.vehicle_type} />}
                  isLast
                />
              </>
            ) : (
              <InfoRow
                label="No vehicle registered"
                value={
                  <button type="button" className={styles.infoLink} onClick={() => navigate("/profile/vehicle")}>
                    Add vehicle →
                  </button>
                }
                isLast
              />
            )}
          </InfoSection>
        </div>
      </div>
    </DriverLayout>
  );
}
