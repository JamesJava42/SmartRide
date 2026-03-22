import { SectionCard } from "../../common/SectionCard";
import { InfoRow } from "../../common/InfoRow";
import type { RiderPreferences } from "../../../types/riderProfile";

type PreferencesTabProps = {
  preferences: RiderPreferences;
  onToggleNotification: (key: keyof RiderPreferences["notifications"]) => void;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${checked ? "bg-[#1A6B45]" : "bg-[#D1D5DB]"}`}
      aria-pressed={checked}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function PreferencesTab({ preferences, onToggleNotification }: PreferencesTabProps) {
  return (
    <div className="space-y-5">
      <SectionCard title="Ride Preferences" subtitle="Your default rider preferences and comfort settings.">
        <InfoRow label="Preferred pickup type" value={preferences.preferredPickupType} />
        <InfoRow label="Preferred payment method" value={preferences.preferredPaymentMethod} />
        <InfoRow label="Accessibility needs" value={preferences.accessibilityNeeds} />
        <InfoRow label="Saved places count" value={preferences.savedPlacesCount} />
      </SectionCard>

      <SectionCard title="Notification Preferences" subtitle="Control how RideConnect keeps you informed.">
        <InfoRow label="Ride updates" value={<Toggle checked={preferences.notifications.rideUpdates} onChange={() => onToggleNotification("rideUpdates")} />} stackedOnMobile={false} />
        <InfoRow label="Promotions" value={<Toggle checked={preferences.notifications.promos} onChange={() => onToggleNotification("promos")} />} stackedOnMobile={false} />
        <InfoRow label="Receipts" value={<Toggle checked={preferences.notifications.receipts} onChange={() => onToggleNotification("receipts")} />} stackedOnMobile={false} />
      </SectionCard>
    </div>
  );
}
