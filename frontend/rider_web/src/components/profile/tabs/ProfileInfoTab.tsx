import { Pencil } from "lucide-react";

import { InfoRow } from "../../common/InfoRow";
import { SectionCard } from "../../common/SectionCard";
import type { RiderProfileData } from "../../../types/riderProfile";

type ProfileInfoTabProps = {
  profile: RiderProfileData;
};

function EditButton() {
  return (
    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:bg-canvas hover:text-ink" aria-label="Edit">
      <Pencil size={14} />
    </button>
  );
}

export function ProfileInfoTab({ profile }: ProfileInfoTabProps) {
  return (
    <div className="space-y-5">
      <SectionCard title="Personal Information" subtitle="Your rider account details used across bookings and receipts.">
        <InfoRow label="Full name" value={profile.fullName} action={<EditButton />} />
        <InfoRow label="Email" value={profile.email} action={<EditButton />} />
        <InfoRow label="Phone" value={profile.phone} action={<EditButton />} />
        <InfoRow label="Address" value={profile.address} action={<EditButton />} />
        <InfoRow label="City" value={profile.city} action={<EditButton />} />
        <InfoRow label="Region" value={profile.region} action={<EditButton />} />
      </SectionCard>

      <SectionCard title="Account Details" subtitle="Important account metadata and rider identity details.">
        <InfoRow label="Member since" value={profile.memberSinceLabel} />
        <InfoRow label="Rider ID" value={profile.userId} />
        <InfoRow label="Preferred language" value={profile.preferredLanguage} />
        <InfoRow label="Emergency contact" value={profile.emergencyContact} />
      </SectionCard>
    </div>
  );
}
