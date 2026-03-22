import type { DriverProfile } from "../../types/profile";
import { formatDate, titleizeStatus } from "../../utils/formatters";
import { SectionCard } from "../common/SectionCard";
import { StatusBadge } from "../common/StatusBadge";

export function ProfileInfoCard({ profile, onEdit }: { profile: DriverProfile; onEdit?: () => void }) {
  return (
    <SectionCard
      title="Personal Info"
      description="Driver identity and account basics."
      action={
        onEdit ? (
          <button
            type="button"
            className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            onClick={onEdit}
          >
            Edit details
          </button>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Full name</p>
          <p className="mt-2 text-base font-semibold text-ink">{profile.fullName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Status</p>
          <div className="mt-2">
            <StatusBadge label={titleizeStatus(profile.status)} tone={profile.isApproved ? "green" : "amber"} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Email</p>
          <p className="mt-2 text-sm text-ink">{profile.email || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Phone</p>
          <p className="mt-2 text-sm text-ink">{profile.phoneNumber}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Address</p>
          <p className="mt-2 text-sm text-ink">{profile.address ?? "No data"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Region</p>
          <p className="mt-2 text-sm text-ink">{profile.region ?? "No data"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Languages</p>
          <p className="mt-2 text-sm text-ink">{profile.languages.length ? profile.languages.join(", ") : "No data"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Joined</p>
          <p className="mt-2 text-sm text-ink">{formatDate(profile.joinedDate)}</p>
        </div>
      </div>
    </SectionCard>
  );
}
