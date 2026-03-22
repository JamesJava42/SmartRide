import { DriverRatingDisplay } from "./DriverRatingDisplay";
import { DriverStatusBadge } from "./DriverStatusBadge";
import type { DriverDocument, DriverProfile, DriverUser, ViewMode } from "@shared/types/driver";

type Props = {
  profile: DriverProfile;
  user: DriverUser;
  viewMode: ViewMode;
  documents?: DriverDocument[];
  showContact?: boolean;
  onSuspend?: () => void;
  onReactivate?: () => void;
};

function Avatar({ profile, photoUrl }: { profile: DriverProfile; photoUrl: string | null }) {
  if (photoUrl) {
    return <img src={photoUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-line" />;
  }
  const initials = [profile.first_name[0], profile.last_name?.[0]].filter(Boolean).join("").toUpperCase();
  return (
    <div className="h-16 w-16 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center">
      <span className="text-xl font-bold text-accent">{initials || "D"}</span>
    </div>
  );
}

export function DriverProfileHeader({ profile, user, viewMode, documents = [], showContact = true, onSuspend, onReactivate }: Props) {
  const photoDoc = documents.find((d) => d.document_type === "PROFILE_PHOTO" && d.verification_status === "APPROVED");
  const showPhone = viewMode !== "rider" || showContact;

  const handleCopy = () => navigator.clipboard.writeText(profile.phone_number);

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar profile={profile} photoUrl={photoDoc?.file_url ?? null} />
          {profile.is_online && (
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {profile.first_name} {profile.last_name ?? ""}
              </h2>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <DriverStatusBadge status={profile.status} size="sm" />
                {viewMode === "admin" && !user.is_active && (
                  <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">Account Disabled</span>
                )}
              </div>
            </div>

            {viewMode === "admin" && (
              <div className="flex gap-2">
                {profile.status === "ACTIVE" && onSuspend && (
                  <button onClick={onSuspend} className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                    Suspend
                  </button>
                )}
                {profile.status === "SUSPENDED" && onReactivate && (
                  <button onClick={onReactivate} className="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition">
                    Reactivate
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-2">
            <DriverRatingDisplay rating={profile.rating_avg} totalRides={profile.total_rides_completed} size="sm" />
          </div>

          {showPhone && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted">{profile.phone_number}</span>
              {viewMode === "admin" && (
                <button onClick={handleCopy} className="text-xs text-accent hover:underline" title="Copy">
                  Copy
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
