import { useQuery } from "@tanstack/react-query";

import {
  getRiderPaymentSummary,
  getRiderPreferences,
  getRiderProfile,
  getRiderSecuritySummary,
} from "../api/riderProfile";
import { useRiderSession } from "../hooks/useRiderSession";
import { StatusPill } from "../components/common/StatusPill";

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R"
  );
}

function Row({
  label,
  value,
  accent = false,
  mono = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] px-5 py-4 last:border-b-0 sm:px-6">
      <span className="text-sm font-normal text-[#6B7280]">{label}</span>
      <span className={`text-right text-sm font-bold ${accent ? "text-[#1A6B45]" : "text-[#111111]"} ${mono ? "font-mono tracking-[0.05em]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#9CA3AF]">{title}</p>
      <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">{children}</div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-8">
        <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-[#F3F4EF]" />
        <div className="mx-auto mt-6 h-8 w-40 animate-pulse rounded-full bg-[#F3F4EF]" />
        <div className="mx-auto mt-3 h-5 w-48 animate-pulse rounded-full bg-[#F3F4EF]" />
        <div className="mx-auto mt-4 h-8 w-32 animate-pulse rounded-full bg-[#EDF9F2]" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-full bg-[#F6F7F4]" />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white">
            <div className="h-14 animate-pulse border-b border-[#F3F4F6] bg-[#F8F8F6]" />
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((__, row) => (
                <div key={row} className="h-11 animate-pulse rounded-2xl bg-[#F6F7F4]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const session = useRiderSession();

  const profileQuery = useQuery({
    queryKey: ["rider-profile-page"],
    queryFn: getRiderProfile,
  });
  const preferencesQuery = useQuery({
    queryKey: ["rider-profile-preferences"],
    queryFn: getRiderPreferences,
  });
  const paymentsQuery = useQuery({
    queryKey: ["rider-profile-payments"],
    queryFn: getRiderPaymentSummary,
  });
  const securityQuery = useQuery({
    queryKey: ["rider-profile-security"],
    queryFn: getRiderSecuritySummary,
  });

  const isLoading = profileQuery.isLoading || preferencesQuery.isLoading || paymentsQuery.isLoading || securityQuery.isLoading;
  const isError = profileQuery.isError || preferencesQuery.isError || paymentsQuery.isError || securityQuery.isError;

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#F4F5F2] p-4 sm:p-5 lg:p-6">
        <LoadingState />
      </div>
    );
  }

  if (isError || !profileQuery.data || !preferencesQuery.data || !paymentsQuery.data || !securityQuery.data) {
    return (
      <div className="min-h-full bg-[#F4F5F2] p-4 sm:p-5 lg:p-6">
        <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6">
          <p className="text-sm text-[#6B7280]">Could not load your profile right now.</p>
          <button
            type="button"
            className="mt-4 rounded-2xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#111111] transition hover:bg-[#F8F8F6]"
            onClick={() => {
              void profileQuery.refetch();
              void preferencesQuery.refetch();
              void paymentsQuery.refetch();
              void securityQuery.refetch();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const preferences = preferencesQuery.data;
  const payments = paymentsQuery.data;
  const security = securityQuery.data;

  return (
    <div className="min-h-full bg-[#F4F5F2] p-4 sm:p-5 lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 sm:p-8 xl:min-h-[760px]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full border-[2.5px] border-[#1A6B45] bg-white text-[2rem] font-medium text-[#1A6B45]">
              {getInitials(profile.fullName)}
            </div>
            <h1 className="mt-6 text-[2rem] font-bold tracking-[-0.03em] text-[#111111]">{profile.fullName}</h1>
            <p className="mt-2 text-sm text-[#6B7280]">{profile.email}</p>
            <div className="mt-4">
              <StatusPill>Active rider</StatusPill>
            </div>
          </div>

          <div className="mt-12 space-y-0">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] py-4">
              <span className="text-sm text-[#6B7280]">Total rides</span>
              <span className="text-sm font-bold text-[#111111]">{profile.totalRides}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#F3F4F6] py-4">
              <span className="text-sm text-[#6B7280]">Saved places</span>
              <span className="text-sm font-bold text-[#111111]">{profile.savedPlacesCount}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#F3F4F6] py-4">
              <span className="text-sm text-[#6B7280]">Member since</span>
              <span className="text-sm font-bold text-[#111111]">{profile.memberSinceLabel}</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-[#6B7280]">Preferred payment</span>
              <span className="text-sm font-bold text-[#111111]">{profile.preferredPayment}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={session.signOut}
            className="mt-10 w-full rounded-2xl border-[1.5px] border-[#EF4444] bg-white px-4 py-3 text-[15px] font-medium text-[#EF4444] transition hover:bg-[#FEF2F2]"
          >
            Log out
          </button>
        </aside>

        <div className="space-y-5">
          <Section title="Personal Information">
            <Row label="Full name" value={profile.fullName} />
            <Row label="Email" value={profile.email} />
            <Row label="Phone" value={profile.phone} />
            <Row label="Address" value={profile.address} />
            <Row label="City" value={profile.city} />
            <Row label="Region" value={profile.region} />
          </Section>

          <Section title="Account Details">
            <Row label="Member since" value={profile.memberSinceLabel} />
            <Row label="Rider ID" value={profile.userId} mono />
            <Row label="Preferred language" value={profile.preferredLanguage} />
            <Row label="Emergency contact" value={profile.emergencyContact} />
          </Section>

          <Section title="Preferences">
            <Row label="Preferred pickup type" value={preferences.preferredPickupType} />
            <Row label="Preferred payment" value={preferences.preferredPaymentMethod} />
            <Row label="Accessibility needs" value={preferences.accessibilityNeeds} />
            <Row label="Notification preferences" value={`${preferences.notifications.rideUpdates ? "Ride updates" : "No alerts"} · ${preferences.notifications.receipts ? "Receipts" : "No receipts"}`} />
            <Row label="Saved places" value={String(preferences.savedPlacesCount)} />
          </Section>

          <Section title="Payments">
            <Row label="Default payment method" value={payments.defaultPaymentMethod} />
            <Row label="Saved methods" value={String(payments.savedMethodsCount)} />
            <Row label="Billing email" value={payments.billingEmail} />
            <Row label="Wallet balance" value={payments.walletBalance} accent />
            <Row label="Ride credits" value={payments.rideCredits} accent />
          </Section>

          <Section title="Security">
            <Row label="Password status" value={security.passwordStatus} />
            <Row label="2FA status" value={security.twoFactorStatus} />
            <Row label="Recent login" value={security.recentLogin} />
            <Row label="Recent device" value={security.recentDevice} />
          </Section>
        </div>
      </div>
    </div>
  );
}
